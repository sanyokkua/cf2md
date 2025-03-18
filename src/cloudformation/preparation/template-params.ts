import log from 'loglevel';
import { DefaultPseudoParamValues } from '../constants';
import { CloudFormationTemplate } from '../types/cloudformation-model';
import { MergeStatistics, ResultParamMap, TemplateParam, UserProvidedParam } from './types/types';
import { generateStubOnType } from './utils/stub-utils';

/**
 * Constructs a TemplateParam object.
 *
 * @param key - The parameter key.
 * @param type - The parameter type.
 * @param value - The default or provided value.
 * @param isRequired - Flag to indicate if the parameter is required.
 * @param stub - The generated stub for the parameter.
 * @returns The constructed TemplateParam object.
 */
export function buildTemplateParam(
    key: string,
    type: string,
    value: unknown,
    isRequired: boolean,
    stub: unknown,
): TemplateParam {
    return {
        paramKey: key,
        paramType: type,
        paramValue: value,
        isRequired,
        generatedStub: stub,
    };
}

/**
 * Analyzes a CloudFormation template and extracts parameter definitions.
 *
 * This function processes pseudo parameters, actual CFN parameters, and assigns default values,
 * allowed values, or generated stubs as necessary.
 *
 * @param {CloudFormationTemplate} cft - The CloudFormation template.
 * @returns {TemplateParam[]} Array of TemplateParam objects extracted from the template.
 */
export function analyzeParams(cft: CloudFormationTemplate): TemplateParam[] {
    // Generate pseudo parameters.
    const pseudoParams = Object.entries(DefaultPseudoParamValues).map(([name, value]) => {
        log.trace(`Adding pseudo parameter "${name}"`);
        return buildTemplateParam(name, 'MOCK_PARAM', value, false, value);
    });

    if (!cft.Parameters) {
        log.trace('analyzeParams: No CloudFormation Parameters found; returning only pseudo parameters.');
        return pseudoParams;
    }

    log.trace('analyzeParams: Processing CloudFormation template parameters.');
    const templateParams = Object.entries(cft.Parameters).map(([paramKey, paramDef]) => {
        const { Type, Default, AllowedValues } = paramDef;

        if (Default != null) {
            log.trace(`Parameter "${paramKey}" has a default value. Using default.`);
            return buildTemplateParam(paramKey, Type, Default, false, Default);
        } else if (Array.isArray(AllowedValues) && AllowedValues.length > 0) {
            log.trace(`Parameter "${paramKey}" has allowed values. Using first allowed value.`);
            const firstAllowedValue = AllowedValues[0];
            return buildTemplateParam(paramKey, Type, firstAllowedValue, false, firstAllowedValue);
        } else {
            log.trace(`Parameter "${paramKey}" is required and missing a default. Generating stub.`);
            const stub = generateStubOnType(Type);
            return buildTemplateParam(paramKey, Type, null, true, stub);
        }
    });

    log.trace('analyzeParams: Successfully processed all parameters.');
    // Return the combined list.
    return [...pseudoParams, ...templateParams];
}

/**
 * Merges template parameters with user-specified overrides.
 *
 * For each parameter defined in the template, if a user value is provided it takes precedence.
 * This function also collects merge statistics for reporting.
 *
 * @param {TemplateParam[]} templateParams - The parameters extracted from the template.
 * @param {UserProvidedParam[]} userParams - The user-supplied parameters.
 * @returns {[ResultParamMap, MergeStatistics]} A tuple containing the merged parameter map and merge statistics.
 */
export function replaceParamsWithUserDefined(
    templateParams: TemplateParam[],
    userParams: UserProvidedParam[],
): [ResultParamMap, MergeStatistics] {
    log.trace('Starting merge of default/template and user parameters.', templateParams, userParams);

    // Create a lookup map for user parameters.
    const userMap = new Map<string, unknown>();
    userParams.forEach((param) => {
        userMap.set(param.paramKey, param.paramValue);
        log.trace(`Collected user parameter: key="${param.paramKey}", value=`, param.paramValue);
    });

    const merged: ResultParamMap = {};

    // Statistics counters.
    let totalParamsProcessed = 0;
    const overriddenParams: string[] = [];
    const missingRequiredParams: string[] = [];

    // Process each parameter from the template.
    templateParams.forEach((templateParam) => {
        totalParamsProcessed++;
        const { paramKey, paramValue, generatedStub } = templateParam;
        let finalValue: unknown;

        if (userMap.has(paramKey)) {
            // User value overrides any template-provided default/stub.
            finalValue = userMap.get(paramKey);
            overriddenParams.push(paramKey);
            log.trace(
                `Parameter "${paramKey}" overridden by user. Template value: ${String(paramValue)}, User value: ${String(finalValue)}`,
            );
        } else if (paramValue !== undefined && paramValue !== null) {
            // Use the template default.
            finalValue = paramValue;
            log.trace(`Parameter "${paramKey}" using template default:`, paramValue);
        } else if (generatedStub !== undefined && generatedStub !== null) {
            // Use a generated stub.
            finalValue = generatedStub;
            log.trace(`Parameter "${paramKey}" missing default. Using generated stub:`, generatedStub);
        } else {
            // None provided: flag this parameter.
            finalValue = paramValue;
            missingRequiredParams.push(paramKey);
            log.warn(`Missing required parameter value for key "${paramKey}"`);
        }

        merged[paramKey] = finalValue;
    });

    // Add any user-only parameters (i.e. keys not defined in the template).
    userMap.forEach((value, userKey) => {
        if (!merged[userKey]) {
            totalParamsProcessed++;
            merged[userKey] = value;
            overriddenParams.push(userKey); // count as overridden for logging consistency
            log.trace(`User-only parameter "${userKey}" added with value: ${String(value)}`);
        }
    });

    // Build merge statistics.
    const mergeStats: MergeStatistics = {
        totalParamsProcessed,
        overriddenParams,
        changedCount: overriddenParams.length,
        missingRequiredParams,
    };

    // Log final statistics at info level.
    log.info(`Merge completed. Total parameters processed: ${String(mergeStats.totalParamsProcessed)}`);
    log.info(`Overridden parameters: ${mergeStats.overriddenParams.join(', ')}`);
    if (mergeStats.missingRequiredParams.length > 0) {
        log.warn(`Missing required parameters: ${mergeStats.missingRequiredParams.join(', ')}`);
    }
    log.info('Merge statistics:', mergeStats);

    return [merged, mergeStats];
}

/**
 * Validates that there are no missing required parameter values in the merged map.
 *
 * @param {ResultParamMap} paramsMap - The map of parameter keys to their resolved values.
 * @throws {Error} Throws an error if any parameter value is null or undefined.
 */
export function validateParamsList(paramsMap: ResultParamMap): void {
    const missingParams: string[] = [];

    for (const paramsMapKey in paramsMap) {
        if (paramsMap[paramsMapKey] === undefined || paramsMap[paramsMapKey] === null) {
            missingParams.push(paramsMapKey);
        }
    }

    for (const paramKey in DefaultPseudoParamValues) {
        if (paramsMap[paramKey] === undefined || paramsMap[paramKey] === null) {
            missingParams.push(paramKey);
        }
    }

    if (missingParams.length > 0) {
        throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
    }
}
