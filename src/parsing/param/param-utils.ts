import log from 'loglevel';
import { PseudoParam } from '../enums/cf-enums';
import { CloudFormationTemplate } from '../types/cloudformation-model';
import { TemplateParam, UserProvidedParam } from '../types/parsing-types';
import { MergeStatistics, ParserUtils, RandomUtils, ResultParamMap } from '../types/util-service-types';

const PSEUDO_PARAM_LIST_STUBS: readonly TemplateParam[] = [
    { paramKey: PseudoParam.AccountId, paramType: 'String', paramValue: null, isRequired: true, generatedStub: '123456789012' },
    {
        paramKey: PseudoParam.NotificationARNs,
        paramType: 'List<String>',
        paramValue: null,
        isRequired: true,
        generatedStub: ['arn:aws:cloudformation'],
    },
    { paramKey: PseudoParam.NoValue, paramType: 'String', paramValue: null, isRequired: true, generatedStub: undefined },
    { paramKey: PseudoParam.Partition, paramType: 'String', paramValue: null, isRequired: true, generatedStub: 'aws' },
    { paramKey: PseudoParam.Region, paramType: 'String', paramValue: null, isRequired: true, generatedStub: 'us-west-1' },
    { paramKey: PseudoParam.StackName, paramType: 'String', paramValue: null, isRequired: true, generatedStub: 'teststack' },
    {
        paramKey: PseudoParam.StackId,
        paramType: 'String',
        paramValue: null,
        isRequired: true,
        generatedStub: 'arn:aws:cloudformation:us-west-1:123456789012:stack/teststack/unique-stack-i',
    },
    { paramKey: PseudoParam.URLSuffix, paramType: 'String', paramValue: null, isRequired: true, generatedStub: 'amazonaws.com' },
];

export class ParserUtilsImpl implements ParserUtils {
    constructor(private readonly randomUtils: RandomUtils) {
        log.trace('[ParserUtilsImpl.constructor] Entering with arguments:', { randomUtils });
        log.trace('[ParserUtilsImpl.constructor] Exiting');
    }

    buildTemplateParam(key: string, type: string, value: unknown, isRequired: boolean, stub: unknown): TemplateParam {
        log.trace('[ParserUtilsImpl.buildTemplateParam] Entering with arguments:', { key, type, value, isRequired, stub });
        const templateParam: TemplateParam = {
            paramKey: key,
            paramType: type,
            paramValue: value,
            isRequired,
            generatedStub: stub,
        };
        log.trace('[ParserUtilsImpl.buildTemplateParam] Exiting with result:', templateParam);
        return templateParam;
    }

    analyzeParams(cft: CloudFormationTemplate): TemplateParam[] {
        log.trace('[ParserUtilsImpl.analyzeParams] Entering with arguments:', { cft });
        if (!cft.Parameters) {
            log.trace('[ParserUtilsImpl.analyzeParams] No CloudFormation Parameters found; returning only pseudo parameters.');
            const result = PSEUDO_PARAM_LIST_STUBS as TemplateParam[];
            log.trace('[ParserUtilsImpl.analyzeParams] Exiting with result:', result);
            return result;
        }

        log.trace('[ParserUtilsImpl.analyzeParams] Processing CloudFormation template parameters.');
        const templateParams = Object.entries(cft.Parameters).map(([paramKey, paramDef]) => {
            log.debug(`[ParserUtilsImpl.analyzeParams] Processing parameter: ${paramKey}`);
            const { Type, Default, AllowedValues } = paramDef;

            if (Default != null) {
                log.trace(`[ParserUtilsImpl.analyzeParams] Parameter "${paramKey}" has a default value. Using default.`);
                return this.buildTemplateParam(paramKey, Type, Default, false, Default);
            } else if (Array.isArray(AllowedValues) && AllowedValues.length > 0) {
                log.trace(`[ParserUtilsImpl.analyzeParams] Parameter "${paramKey}" has allowed values. Using first allowed value.`);
                const firstAllowedValue = AllowedValues[0];
                return this.buildTemplateParam(paramKey, Type, firstAllowedValue, false, firstAllowedValue);
            } else {
                log.trace(`[ParserUtilsImpl.analyzeParams] Parameter "${paramKey}" is required and missing a default. Generating stub.`);
                const stub = this.generateStubOnType(Type);
                return this.buildTemplateParam(paramKey, Type, null, true, stub);
            }
        });

        const result = [...(PSEUDO_PARAM_LIST_STUBS as TemplateParam[]), ...templateParams];
        log.trace('[ParserUtilsImpl.analyzeParams] Successfully processed all parameters. Exiting with result:', result);
        return result;
    }

    replaceParamsWithUserDefined(templateParams: TemplateParam[], userParams: UserProvidedParam[]): [ResultParamMap, MergeStatistics] {
        log.trace('[ParserUtilsImpl.replaceParamsWithUserDefined] Entering with arguments:', { templateParams, userParams });

        const userMap = new Map<string, unknown>();
        userParams.forEach((param) => {
            userMap.set(param.paramKey, param.paramValue);
            log.trace(`[ParserUtilsImpl.replaceParamsWithUserDefined] Collected user parameter: key="${param.paramKey}", value=`, param.paramValue);
        });

        const merged: ResultParamMap = {};

        let totalParamsProcessed = 0;
        const overriddenParams: string[] = [];
        const missingRequiredParams: string[] = [];

        templateParams.forEach((templateParam) => {
            totalParamsProcessed++;
            const { paramKey, paramValue, generatedStub } = templateParam;
            let finalValue: unknown;

            if (userMap.has(paramKey)) {
                finalValue = userMap.get(paramKey);
                overriddenParams.push(paramKey);
                log.trace(
                    `[ParserUtilsImpl.replaceParamsWithUserDefined] Parameter "${paramKey}" overridden by user. Template value: ${String(paramValue)}, User value: ${String(finalValue)}`,
                );
            } else if (paramValue !== undefined && paramValue !== null) {
                finalValue = paramValue;
                log.trace(`[ParserUtilsImpl.replaceParamsWithUserDefined] Parameter "${paramKey}" using template default:`, paramValue);
            } else if (generatedStub !== undefined && generatedStub !== null) {
                finalValue = generatedStub;
                log.trace(
                    `[ParserUtilsImpl.replaceParamsWithUserDefined] Parameter "${paramKey}" missing default. Using generated stub:`,
                    generatedStub,
                );
            } else {
                finalValue = paramValue;
                missingRequiredParams.push(paramKey);
                log.warn(`[ParserUtilsImpl.replaceParamsWithUserDefined] Missing required parameter value for key "${paramKey}"`);
            }

            merged[paramKey] = finalValue;
        });

        userMap.forEach((value, userKey) => {
            if (!(userKey in merged)) {
                totalParamsProcessed++;
                merged[userKey] = value;
                overriddenParams.push(userKey);
                log.trace(`[ParserUtilsImpl.replaceParamsWithUserDefined] User-only parameter "${userKey}" added with value: ${String(value)}`);
            }
        });

        // Generate StackID based on the params
        // 'arn:${partition}:cloudformation:${region}:${accountId}:stack/${stackName}/unique-stack-i'
        const partition = merged[PseudoParam.Partition] as string;
        const region = merged[PseudoParam.Region] as string;
        const accountId = merged[PseudoParam.AccountId] as string;
        const stackName = merged[PseudoParam.StackName] as string;
        log.debug('[ParserUtilsImpl.replaceParamsWithUserDefined] Generating StackId with:', { partition, region, accountId, stackName });
        const randomUid = this.randomUtils.fullUuid();
        merged[PseudoParam.StackId] = `arn:${partition}:cloudformation:${region}:${accountId}:stack/${stackName}/${randomUid}`;
        log.debug('[ParserUtilsImpl.replaceParamsWithUserDefined] Generated StackId:', merged[PseudoParam.StackId]);

        const mergeStats: MergeStatistics = {
            totalParamsProcessed,
            overriddenParams,
            changedCount: overriddenParams.length,
            missingRequiredParams,
        };

        log.info(
            `[ParserUtilsImpl.replaceParamsWithUserDefined] Merge completed. Total parameters processed: ${String(mergeStats.totalParamsProcessed)}`,
        );
        log.info(`[ParserUtilsImpl.replaceParamsWithUserDefined] Overridden parameters: ${mergeStats.overriddenParams.join(', ')}`);
        log.info('[ParserUtilsImpl.replaceParamsWithUserDefined] Merge statistics:', mergeStats);

        const result: [ResultParamMap, MergeStatistics] = [merged, mergeStats];
        log.trace('[ParserUtilsImpl.replaceParamsWithUserDefined] Exiting with result:', result);
        return result;
    }

    validateParamsList(paramsMap: ResultParamMap): void {
        log.trace('[ParserUtilsImpl.validateParamsList] Entering with arguments:', { paramsMap });
        const missingParams: string[] = [];

        Object.entries(paramsMap).forEach(([key, value]) => {
            log.debug(`[ParserUtilsImpl.validateParamsList] Checking parameter "${key}" with value:`, value);
            if (value === undefined || value === null) {
                missingParams.push(key);
            }
        });

        PSEUDO_PARAM_LIST_STUBS.forEach((param) => {
            log.debug(
                `[ParserUtilsImpl.validateParamsList] Checking pseudo parameter "${param.paramKey}" in paramsMap. Value:`,
                paramsMap[param.paramKey],
            );
            if (paramsMap[param.paramKey] === undefined || paramsMap[param.paramKey] === null) {
                missingParams.push(param.paramKey);
            }
        });

        if (missingParams.length > 0) {
            log.error(`[ParserUtilsImpl.validateParamsList] Missing required parameters: ${missingParams.join(', ')}`);
            throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
        }
        log.trace('[ParserUtilsImpl.validateParamsList] Exiting');
    }

    generateStubOnType(paramType: string): unknown {
        log.trace('[ParserUtilsImpl.generateStubOnType] Entering with arguments:', { paramType });
        const integerGenerator = () => this.randomUtils.randomInteger(0, 100);
        const stringGenerator = () => this.randomUtils.randomString(3, 10);

        log.debug(`[ParserUtilsImpl.generateStubOnType] Generating stub for type: ${paramType}`);
        let stubValue: unknown;
        switch (paramType) {
            case 'String':
                stubValue = this.randomUtils.randomString(3, 10);
                break;
            case 'Number':
            case 'Integer':
                stubValue = this.randomUtils.randomInteger(0, 100);
                break;
            case 'List<Number>':
                stubValue = this.randomUtils.randomArray<number>(integerGenerator, 1, 10);
                break;
            case 'CommaDelimitedList':
                stubValue = this.randomUtils.randomArray<string>(stringGenerator, 1, 10).join(',');
                break;
            default:
                if (paramType.startsWith('List<') && paramType.endsWith('>')) {
                    const innerType = paramType.slice(5, -1);
                    if (innerType === 'Integer') {
                        stubValue = this.randomUtils.randomArray<number>(integerGenerator, 1, 10);
                    } else {
                        stubValue = this.randomUtils.randomArray<string>(stringGenerator, 1, 10);
                    }
                } else if (paramType.startsWith('AWS::')) {
                    stubValue = `Stub${this.randomUtils.randomString(4, 8)}`;
                } else {
                    log.warn(`[ParserUtilsImpl.generateStubOnType] No specific generator found for type: ${paramType}. Using default 'StubValue'.`);
                    stubValue = 'StubValue';
                }
                break;
        }
        log.debug(`[ParserUtilsImpl.generateStubOnType] Generated stub value for type "${paramType}":`, stubValue);
        log.trace('[ParserUtilsImpl.generateStubOnType] Exiting with result:', stubValue);
        return stubValue;
    }
}
