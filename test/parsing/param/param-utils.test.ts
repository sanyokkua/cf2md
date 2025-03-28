import { PseudoParam, TemplateParam, UserProvidedParam } from '../../../src/parsing';
import { ParserUtilsImpl } from '../../../src/parsing/param/param-utils';
import { CloudFormationTemplate } from '../../../src/parsing/types/cloudformation-model';
import { RandomUtils, ResultParamMap } from '../../../src/parsing/types/util-service-types';

describe('ParserUtilsImpl', () => {
    let parserUtils: ParserUtilsImpl;
    let mockRandomUtils: jest.Mocked<RandomUtils>;

    beforeEach(() => {
        mockRandomUtils = {
            randomInteger: jest.fn().mockReturnValue(42),
            randomString: jest.fn().mockReturnValue('randomStr'),
            randomArray: jest.fn().mockImplementation((generator: () => any, _min: number, _max: number) => {
                return [generator(), generator(), generator()];
            }),
            fullUuid: jest.fn().mockReturnValue('test-uuid'),
            shortUuid: jest.fn().mockReturnValue('test-uuid'),
        };

        parserUtils = new ParserUtilsImpl(mockRandomUtils);
    });

    describe('buildTemplateParam', () => {
        test('should create a TemplateParam object with provided values', () => {
            const result = parserUtils.buildTemplateParam('key1', 'String', 'value1', true, 'stub1');
            expect(result).toEqual({
                paramKey: 'key1',
                paramType: 'String',
                paramValue: 'value1',
                isRequired: true,
                generatedStub: 'stub1',
            });
        });
    });

    describe('analyzeParams', () => {
        test('returns only pseudo parameters when no Parameters are provided', () => {
            const cft: CloudFormationTemplate = { Parameters: undefined, Resources: {} };
            const result = parserUtils.analyzeParams(cft);

            expect(result.find((param) => param.paramKey === PseudoParam.AccountId)).toBeDefined();
            expect(result.find((param) => param.paramKey === PseudoParam.NotificationARNs)).toBeDefined();
            expect(result.find((param) => param.paramKey === PseudoParam.NoValue)).toBeDefined();
            expect(result.find((param) => param.paramKey === PseudoParam.Partition)).toBeDefined();
            expect(result.find((param) => param.paramKey === PseudoParam.Region)).toBeDefined();
            expect(result.find((param) => param.paramKey === PseudoParam.StackId)).toBeDefined();
            expect(result.find((param) => param.paramKey === PseudoParam.StackName)).toBeDefined();
            expect(result.find((param) => param.paramKey === PseudoParam.URLSuffix)).toBeDefined();
        });

        test('processes template parameters with a default value', () => {
            const cft: CloudFormationTemplate = {
                Parameters: {
                    Param1: { Type: 'String', Default: 'defVal', AllowedValues: undefined },
                },
                Resources: {},
            };
            const result = parserUtils.analyzeParams(cft);
            const param = result.find((p) => p.paramKey === 'Param1');
            expect(param).toBeDefined();
            expect(param?.paramValue).toBe('defVal');
            expect(param?.isRequired).toBe(false);

            expect(result.find((param) => param.paramKey === PseudoParam.AccountId)).toBeDefined();
            expect(result.find((param) => param.paramKey === PseudoParam.NotificationARNs)).toBeDefined();
            expect(result.find((param) => param.paramKey === PseudoParam.NoValue)).toBeDefined();
            expect(result.find((param) => param.paramKey === PseudoParam.Partition)).toBeDefined();
            expect(result.find((param) => param.paramKey === PseudoParam.Region)).toBeDefined();
            expect(result.find((param) => param.paramKey === PseudoParam.StackId)).toBeDefined();
            expect(result.find((param) => param.paramKey === PseudoParam.StackName)).toBeDefined();
            expect(result.find((param) => param.paramKey === PseudoParam.URLSuffix)).toBeDefined();
        });

        test('processes template parameters with allowed values', () => {
            const cft: CloudFormationTemplate = {
                Parameters: {
                    Param2: { Type: 'String', Default: undefined, AllowedValues: ['allowedVal', 'other'] },
                },
                Resources: {},
            };
            const result = parserUtils.analyzeParams(cft);
            const param = result.find((p) => p.paramKey === 'Param2');
            expect(param).toBeDefined();
            expect(param?.paramValue).toBe('allowedVal');
            expect(param?.isRequired).toBe(false);
        });

        test('processes required template parameters missing default by generating a stub', () => {
            const cft: CloudFormationTemplate = {
                Parameters: {
                    Param3: { Type: 'String', Default: undefined, AllowedValues: undefined },
                },
                Resources: {},
            };
            const result = parserUtils.analyzeParams(cft);
            const param = result.find((p) => p.paramKey === 'Param3');
            expect(param).toBeDefined();
            expect(param?.paramValue).toBeNull();
            expect(param?.isRequired).toBe(true);
            // For "String", the generated stub is created by randomString mock ("randomStr")
            expect(param?.generatedStub).toBe('randomStr');
        });
    });

    describe('replaceParamsWithUserDefined', () => {
        test('merges template parameters with user provided parameters and updates pseudo params', () => {
            const templateParams: TemplateParam[] = [
                { paramKey: 'ParamA', paramType: 'String', paramValue: 'defaultA', isRequired: false, generatedStub: 'stubA' },
                { paramKey: PseudoParam.AccountId, paramType: 'String', paramValue: null, isRequired: true, generatedStub: '123456789012' },
                { paramKey: PseudoParam.Region, paramType: 'String', paramValue: null, isRequired: true, generatedStub: 'us-west-1' },
                { paramKey: PseudoParam.StackName, paramType: 'String', paramValue: null, isRequired: true, generatedStub: 'teststack' },
            ];
            const userParams: UserProvidedParam[] = [
                { paramKey: 'ParamA', paramValue: 'userA' },
                { paramKey: 'ExtraParam', paramValue: 'extra' },
            ];

            const [merged, mergeStats] = parserUtils.replaceParamsWithUserDefined(templateParams, userParams);

            // User value overrides template default.
            expect(merged['ParamA']).toBe('userA');
            // Pseudo parameter not overridden remains.
            expect(merged[PseudoParam.AccountId]).toBe('123456789012');
            // Extra user parameter is added.
            expect(merged['ExtraParam']).toBe('extra');
            // Verify that StackId is generated using fullUuid (mock returns "test-uuid")
            expect(merged[PseudoParam.StackId]).toMatch(new RegExp(`^arn:.*:cloudformation:.*:.*:stack/${merged[PseudoParam.StackName]}/test-uuid$`));

            expect(mergeStats.totalParamsProcessed).toBeGreaterThan(0);
            expect(mergeStats.overriddenParams).toEqual(expect.arrayContaining(['ParamA', 'ExtraParam']));
        });
    });

    describe('validateParamsList', () => {
        test('does not throw an error when all required parameters are present', () => {
            const params: ResultParamMap = {
                [PseudoParam.AccountId]: '123456789012',
                [PseudoParam.Region]: 'us-west-1',
                [PseudoParam.StackName]: 'teststack',
                [PseudoParam.NotificationARNs]: ['arn:aws:cloudformation'],
                [PseudoParam.NoValue]: 'someValue',
                [PseudoParam.Partition]: 'aws',
                [PseudoParam.StackId]: 'arn:aws:cloudformation:region:account:stack/teststack/unique-stack-i',
                [PseudoParam.URLSuffix]: 'amazonaws.com',
                Param1: 'value1',
            };
            expect(() => parserUtils.validateParamsList(params)).not.toThrow();
        });

        test('throws an error when required parameters are missing', () => {
            const params: ResultParamMap = {
                Param1: 'value1',
            };
            expect(() => parserUtils.validateParamsList(params)).toThrow(/Missing required parameters/);
        });
    });

    describe('generateStubOnType', () => {
        test("generates stub for 'String' type", () => {
            const result = parserUtils.generateStubOnType('String');
            expect(result).toBe('randomStr');
            expect(mockRandomUtils.randomString).toHaveBeenCalledWith(3, 10);
        });

        test("generates stub for 'Number' and 'Integer' types", () => {
            const resultNumber = parserUtils.generateStubOnType('Number');
            const resultInteger = parserUtils.generateStubOnType('Integer');
            expect(resultNumber).toBe(42);
            expect(resultInteger).toBe(42);
            expect(mockRandomUtils.randomInteger).toHaveBeenCalledTimes(2);
        });

        test("generates stub for 'List<Number>' type", () => {
            const result = parserUtils.generateStubOnType('List<Number>');
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(3);
            expect(mockRandomUtils.randomArray).toHaveBeenCalledWith(expect.any(Function), 1, 10);
        });

        test("generates stub for 'CommaDelimitedList' type", () => {
            const result = parserUtils.generateStubOnType('CommaDelimitedList');
            expect(typeof result).toBe('string');
            expect(result).toContain(',');
        });

        test('generates stub for AWS-specific parameter types', () => {
            const result = parserUtils.generateStubOnType('AWS::EC2::KeyPair::KeyName');
            expect(typeof result).toBe('string');
            expect(result).toMatch(/^Stub/);
            expect(mockRandomUtils.randomString).toHaveBeenCalledWith(4, 8);
        });

        test('generates stub for List<String> type', () => {
            const result = parserUtils.generateStubOnType('List<String>');
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(3);
            expect(mockRandomUtils.randomArray).toHaveBeenCalledWith(expect.any(Function), 1, 10);
        });

        test('generates stub for unrecognized type', () => {
            const result = parserUtils.generateStubOnType('UnknownType');
            expect(result).toBe('StubValue');
        });
    });
});
