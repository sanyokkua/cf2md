import log from 'loglevel';
import { PseudoParam } from '../enums/cf-enums';
import { CloudFormationTemplate } from '../types/cloudformation-model';
import { TemplateParam, UserProvidedParam } from '../types/parsing-types';
import { MergeStatistics, ParserUtils, RandomUtils, ResultParamMap } from '../types/util-service-types';

const PseudoParamListStubs: readonly TemplateParam[] = [
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
    constructor(private readonly randomUtils: RandomUtils) {}

    buildTemplateParam(key: string, type: string, value: unknown, isRequired: boolean, stub: unknown): TemplateParam {
        return {
            paramKey: key,
            paramType: type,
            paramValue: value,
            isRequired,
            generatedStub: stub,
        };
    }

    analyzeParams(cft: CloudFormationTemplate): TemplateParam[] {
        if (!cft.Parameters) {
            log.trace('analyzeParams: No CloudFormation Parameters found; returning only pseudo parameters.');
            return PseudoParamListStubs as TemplateParam[];
        }

        log.trace('analyzeParams: Processing CloudFormation template parameters.');
        const templateParams = Object.entries(cft.Parameters).map(([paramKey, paramDef]) => {
            const { Type, Default, AllowedValues } = paramDef;

            if (Default != null) {
                log.trace(`Parameter "${paramKey}" has a default value. Using default.`);
                return this.buildTemplateParam(paramKey, Type, Default, false, Default);
            } else if (Array.isArray(AllowedValues) && AllowedValues.length > 0) {
                log.trace(`Parameter "${paramKey}" has allowed values. Using first allowed value.`);
                const firstAllowedValue = AllowedValues[0];
                return this.buildTemplateParam(paramKey, Type, firstAllowedValue, false, firstAllowedValue);
            } else {
                log.trace(`Parameter "${paramKey}" is required and missing a default. Generating stub.`);
                const stub = this.generateStubOnType(Type);
                return this.buildTemplateParam(paramKey, Type, null, true, stub);
            }
        });

        log.trace('analyzeParams: Successfully processed all parameters.');
        return [...(PseudoParamListStubs as TemplateParam[]), ...templateParams];
    }

    replaceParamsWithUserDefined(templateParams: TemplateParam[], userParams: UserProvidedParam[]): [ResultParamMap, MergeStatistics] {
        log.trace('Starting merge of default/template and user parameters.', templateParams, userParams);

        const userMap = new Map<string, unknown>();
        userParams.forEach((param) => {
            userMap.set(param.paramKey, param.paramValue);
            log.trace(`Collected user parameter: key="${param.paramKey}", value=`, param.paramValue);
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
                log.trace(`Parameter "${paramKey}" overridden by user. Template value: ${String(paramValue)}, User value: ${String(finalValue)}`);
            } else if (paramValue !== undefined && paramValue !== null) {
                finalValue = paramValue;
                log.trace(`Parameter "${paramKey}" using template default:`, paramValue);
            } else if (generatedStub !== undefined && generatedStub !== null) {
                finalValue = generatedStub;
                log.trace(`Parameter "${paramKey}" missing default. Using generated stub:`, generatedStub);
            } else {
                finalValue = paramValue;
                missingRequiredParams.push(paramKey);
                log.warn(`Missing required parameter value for key "${paramKey}"`);
            }

            merged[paramKey] = finalValue;
        });

        userMap.forEach((value, userKey) => {
            if (!(userKey in merged)) {
                totalParamsProcessed++;
                merged[userKey] = value;
                overriddenParams.push(userKey);
                log.trace(`User-only parameter "${userKey}" added with value: ${String(value)}`);
            }
        });

        // Generate StackID based on the params
        // 'arn:${partition}:cloudformation:${region}:${accountId}:stack/${stackName}/unique-stack-i'
        const partition = merged[PseudoParam.Partition] as string;
        const region = merged[PseudoParam.Region] as string;
        const accountId = merged[PseudoParam.AccountId] as string;
        const stackName = merged[PseudoParam.StackName] as string;
        const randomUid = this.randomUtils.fullUuid();
        merged[PseudoParam.StackId] = `arn:${partition}:cloudformation:${region}:${accountId}:stack/${stackName}/${randomUid}`;

        const mergeStats: MergeStatistics = {
            totalParamsProcessed,
            overriddenParams,
            changedCount: overriddenParams.length,
            missingRequiredParams,
        };

        log.info(`Merge completed. Total parameters processed: ${String(mergeStats.totalParamsProcessed)}`);
        log.info(`Overridden parameters: ${mergeStats.overriddenParams.join(', ')}`);
        log.info('Merge statistics:', mergeStats);

        return [merged, mergeStats];
    }

    validateParamsList(paramsMap: ResultParamMap): void {
        const missingParams: string[] = [];

        Object.entries(paramsMap).forEach(([key, value]) => {
            if (value === undefined || value === null) {
                missingParams.push(key);
            }
        });

        PseudoParamListStubs.forEach((param) => {
            if (paramsMap[param.paramKey] === undefined || paramsMap[param.paramKey] === null) {
                missingParams.push(param.paramKey);
            }
        });

        if (missingParams.length > 0) {
            throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
        }
    }

    generateStubOnType(paramType: string): unknown {
        const integerGenerator = () => this.randomUtils.randomInteger(0, 100);
        const stringGenerator = () => this.randomUtils.randomString(3, 10);

        switch (paramType) {
            case 'String':
                return this.randomUtils.randomString(3, 10);
            case 'Number':
            case 'Integer':
                return this.randomUtils.randomInteger(0, 100);
            case 'List<Number>':
                return this.randomUtils.randomArray<number>(integerGenerator, 1, 10);
            case 'CommaDelimitedList':
                return this.randomUtils.randomArray<string>(stringGenerator, 1, 10).join(',');
            default:
                if (paramType.startsWith('List<') && paramType.endsWith('>')) {
                    const innerType = paramType.slice(5, -1);
                    if (innerType === 'Integer') {
                        return this.randomUtils.randomArray<number>(integerGenerator, 1, 10);
                    }
                    return this.randomUtils.randomArray<string>(stringGenerator, 1, 10);
                }
                if (paramType.startsWith('AWS::')) {
                    return `Stub${this.randomUtils.randomString(4, 8)}`;
                }
                return 'StubValue';
        }
    }
}
