import { extractErrorDetails } from 'coreutilsts';
import log from 'loglevel';
import typia from 'typia';
import { TemplateProcessingError } from './errors/errors';
import { parseJsonTemplateToModel, resolveValue } from './parsing';
import { ResolvingContextImpl } from './parsing/resolver/resolving-context';
import { analyzeParams, replaceParamsWithUserDefined, TemplateParam, UserProvidedParam } from './preparation';
import { CloudFormationTemplate } from './types/cloudformation-model';
import { ParsingResult } from './types/template-evaluator';

/**
 * Parses a CloudFormation template from its JSON string form into a model.
 * Then it analyzes the template for missing parameters.
 *
 * @param template - The template string to parse. Can be undefined or null.
 * @returns An object representing the result of the parse operation.
 */
export function parseCloudFormationTemplate(template?: string | null): ParsingResult {
    log.trace('Starting CloudFormation template parsing.', template);

    try {
        const parsedTemplate: CloudFormationTemplate = parseJsonTemplateToModel(template);
        log.trace('Successfully parsed CloudFormation template.', template);

        const missingParams: TemplateParam[] = analyzeParams(parsedTemplate);
        log.trace(`Template analyzed. Number of missing parameters: ${String(missingParams.length)}`);

        return {
            hasErrors: false,
            parsedTemplate,
            paramsToReview: missingParams,
        };
    } catch (error: unknown) {
        const errorMsg = extractErrorDetails(error);
        log.warn('Error while parsing template:', error);
        return {
            hasErrors: true,
            errorMsg,
        };
    }
}

/**
 * Applies user-provided parameters on a successfully parsed CloudFormation template.
 * It replaces defined template parameters with the provided values and resolves the final template.
 *
 * @param parseResult - The result object from the template parsing step.
 * @param userParameters - An array of parameters provided by the user.
 * @returns A fully processed and type-validated CloudFormation template.
 * @throws TemplateProcessingError if the parsing result is invalid or incomplete.
 */
export function applyUserParameters(
    parseResult: ParsingResult,
    userParameters: UserProvidedParam[],
): CloudFormationTemplate {
    const { hasErrors, parsedTemplate, paramsToReview } = parseResult;

    if (hasErrors || !parsedTemplate || !paramsToReview) {
        throw new TemplateProcessingError(
            'Parsing result is invalid: the template contains errors or is missing required data.',
        );
    }

    const [resolvedMapping, stats] = replaceParamsWithUserDefined(paramsToReview, userParameters);
    log.trace('User parameters applied. Replacement stats:', stats);

    const context = new ResolvingContextImpl(parsedTemplate, resolvedMapping);
    const resolvedTemplate = resolveValue(parsedTemplate, context);

    // Ensure the resolved template complies with the CloudFormationTemplate type.
    const finalTemplate = typia.assert<CloudFormationTemplate>(resolvedTemplate);
    log.trace('Template resolved and type-asserted successfully.');

    return finalTemplate;
}
