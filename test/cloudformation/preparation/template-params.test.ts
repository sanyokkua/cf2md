import log from 'loglevel';
import { DefaultPseudoParamValues } from '../../../src/cloudformation/constants';
import {
    analyzeParams,
    buildTemplateParam,
    replaceParamsWithUserDefined,
    validateParamsList,
} from '../../../src/cloudformation/preparation/template-params';
import { generateStubOnType } from '../../../src/cloudformation/preparation/utils/stub-utils';
import { CloudFormationTemplate } from '../../../src/cloudformation/types/cloudformation-model';

jest.mock('../../../src/cloudformation/preparation/utils/stub-utils', () => ({
    generateStubOnType: jest.fn(),
}));

function expectedPseudoParams() {
    return Object.entries(DefaultPseudoParamValues).map(([key, value]) => ({
        paramKey: key,
        paramType: 'MOCK_PARAM',
        paramValue: value,
        isRequired: false,
        generatedStub: value,
    }));
}

describe('template-params', () => {
    describe('buildTemplateParam', () => {
        it('should construct a TemplateParam object correctly', () => {
            const result = buildTemplateParam('MyKey', 'String', 'MyValue', false, 'StubValue');
            expect(result).toEqual({
                paramKey: 'MyKey',
                paramType: 'String',
                paramValue: 'MyValue',
                isRequired: false,
                generatedStub: 'StubValue',
            });
        });
    });

    describe('analyzeParams', () => {
        let traceSpy: jest.SpyInstance;

        beforeEach(() => {
            traceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
            // Clear any existing calls on the stub generator mock before each test.
            (generateStubOnType as jest.Mock).mockClear();
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should return only pseudo parameters if no CloudFormation Parameters are provided', () => {
            // A CloudFormation template with no Parameters property.
            const cft: CloudFormationTemplate = {} as CloudFormationTemplate;
            const result = analyzeParams(cft);
            const pseudo = expectedPseudoParams();
            expect(result).toEqual(pseudo);

            // Verify that a trace log mentioning the absence of Parameters was logged.
            expect(traceSpy).toHaveBeenCalledWith(
                'analyzeParams: No CloudFormation Parameters found; returning only pseudo parameters.',
            );
        });

        it('should process CloudFormation parameters with default, allowed values, and missing default', () => {
            // Prepare a template that has three parameters:
            // * Param1 has a Default value → use default.
            // * Param2 has AllowedValues and no Default → use first allowed value.
            // * Param3 has neither Default nor AllowedValues → generate a stub.
            const cft: CloudFormationTemplate = {
                Resources: {},
                Parameters: {
                    Param1: { Type: 'String', Default: 'default1' },
                    Param2: { Type: 'Number', AllowedValues: [42, 43] },
                    Param3: { Type: 'String' },
                },
            };

            // For Param3, simulate generating a stub.
            (generateStubOnType as jest.Mock).mockReturnValueOnce('stubForString');

            const result = analyzeParams(cft);

            // Build expected pseudo parameters.
            const pseudoParams = expectedPseudoParams();
            // Expected template parameters in order:
            const expectedTemplateParams = [
                // Branch: default provided.
                {
                    paramKey: 'Param1',
                    paramType: 'String',
                    paramValue: 'default1',
                    isRequired: false,
                    generatedStub: 'default1',
                },
                // Branch: allowed values used.
                {
                    paramKey: 'Param2',
                    paramType: 'Number',
                    paramValue: 42, // first allowed value
                    isRequired: false,
                    generatedStub: 42,
                },
                // Branch: missing default and allowed values; generate stub.
                {
                    paramKey: 'Param3',
                    paramType: 'String',
                    paramValue: null,
                    isRequired: true,
                    generatedStub: 'stubForString',
                },
            ];

            // The result should combine pseudo parameters (first) with these template ones.
            expect(result).toEqual([...pseudoParams, ...expectedTemplateParams]);

            // Verify log calls (a couple of trace messages should have been logged)
            expect(traceSpy).toHaveBeenCalledWith('analyzeParams: Processing CloudFormation template parameters.');
            expect(traceSpy).toHaveBeenCalledWith('Parameter "Param1" has a default value. Using default.');
            expect(traceSpy).toHaveBeenCalledWith('Parameter "Param2" has allowed values. Using first allowed value.');
            expect(traceSpy).toHaveBeenCalledWith(
                'Parameter "Param3" is required and missing a default. Generating stub.',
            );
            expect(generateStubOnType).toHaveBeenCalledWith('String');
        });
    });

    describe('replaceParamsWithUserDefined', () => {
        let traceSpy: jest.SpyInstance;
        let warnSpy: jest.SpyInstance;
        let infoSpy: jest.SpyInstance;

        beforeEach(() => {
            traceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
            warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
            infoSpy = jest.spyOn(log, 'info').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should merge user provided parameters with template parameters correctly', () => {
            // Create a set of template parameters covering all scenarios.
            const templateParams = [
                {
                    paramKey: 'A',
                    paramType: 'String',
                    paramValue: 'defaultA',
                    isRequired: false,
                    generatedStub: 'stubA',
                },
                {
                    // Missing default but has a generated stub.
                    paramKey: 'B',
                    paramType: 'String',
                    paramValue: null,
                    isRequired: true,
                    generatedStub: 'stubB',
                },
                {
                    // Missing both default and stub → remains null.
                    paramKey: 'C',
                    paramType: 'String',
                    paramValue: null,
                    isRequired: true,
                    generatedStub: null,
                },
                {
                    // Has a default but will be overridden by the user.
                    paramKey: 'D',
                    paramType: 'String',
                    paramValue: 'defaultD',
                    isRequired: false,
                    generatedStub: 'stubD',
                },
            ];

            // User-provided parameters:
            // * Key "A" overrides existing template param.
            // * Key "X" does not exist in the template → should be added.
            const userParams = [
                { paramKey: 'A', paramValue: 'userA' },
                { paramKey: 'X', paramValue: 'userX' },
            ];

            // Call the merge function.
            const [merged, mergeStats] = replaceParamsWithUserDefined(templateParams, userParams);

            // Expected merging behavior:
            // - For "A": user value overrides → "userA".
            // - For "B": no override, but generatedStub exists → "stubB".
            // - For "C": neither default nor stub → remains null and is flagged missing.
            // - For "D": no override, use default "defaultD".
            // - The user-only parameter "X" is added.
            const expectedMerged = {
                A: 'userA',
                B: 'stubB',
                C: null,
                D: 'defaultD',
                X: 'userX',
            };

            expect(merged).toEqual(expectedMerged);

            // Total parameters processed: 4 (from template) + 1 (user-only) = 5.
            expect(mergeStats.totalParamsProcessed).toBe(5);
            // overriddenParams should list "A" (template override) and "X" (user-only).
            expect(mergeStats.overriddenParams.sort()).toEqual(['A', 'X'].sort());
            expect(mergeStats.changedCount).toBe(2);
            // Missing required parameter "C" should be in the missing list.
            expect(mergeStats.missingRequiredParams).toEqual(['C']);

            // Verify that logs were called appropriately.
            expect(traceSpy).toHaveBeenCalledWith(
                'Starting merge of default/template and user parameters.',
                templateParams,
                userParams,
            );
            expect(warnSpy).toHaveBeenCalledWith('Missing required parameter value for key "C"');
            expect(infoSpy).toHaveBeenCalledWith(
                expect.stringContaining('Merge completed. Total parameters processed:'),
            );
        });
    });

    describe('validateParamsList', () => {
        it('should not throw an error when all parameter values are provided', () => {
            const validParams = {
                'A': 'value',
                'B': 123,
                'C': true,
                'AWS::AccountId': '1234567890',
                'AWS::NotificationARNs': [],
                'AWS::NoValue': '',
                'AWS::Partition': 'aws',
                'AWS::Region': 'us-east-1',
                'AWS::StackName': 'test',
                'AWS::StackId': 'test-id',
                'AWS::URLSuffix': 'aws.com',
            };
            expect(() => validateParamsList(validParams)).not.toThrow();
        });

        it('should throw an error with the missing keys when any parameter value is null or undefined', () => {
            const invalidParams = {
                A: null,
                B: 'valueB',
                C: undefined,
                D: 0, // a valid value (0 is not undefined or null)
                E: '', // a valid value ("" is not undefined or null)
            };

            expect(() => validateParamsList(invalidParams)).toThrow(Error);

            try {
                validateParamsList(invalidParams);
            } catch (e) {
                const errorMessage = (e as Error).message;
                expect(errorMessage).toContain('A');
                expect(errorMessage).toContain('C');
                // Ensure that only the keys with null/undefined are mentioned.
                expect(errorMessage).not.toContain('B');
                expect(errorMessage).not.toContain('D');
            }
        });

        it('should not throw an error for a parameter map with pseudo params only', () => {
            const emptyUserParams = {
                'AWS::AccountId': '1234567890',
                'AWS::NotificationARNs': [],
                'AWS::NoValue': '',
                'AWS::Partition': 'aws',
                'AWS::Region': 'us-east-1',
                'AWS::StackName': 'test',
                'AWS::StackId': 'test-id',
                'AWS::URLSuffix': 'aws.com',
            };
            expect(() => validateParamsList(emptyUserParams)).not.toThrow();
        });

        it('should throw an error for an empty parameter map', () => {
            const emptyParams = {};
            try {
                validateParamsList(emptyParams);
            } catch (e) {
                const errorMessage = (e as Error).message;
                expect(errorMessage).toContain('AWS::AccountId');
                expect(errorMessage).toContain('AWS::NotificationARNs');
                expect(errorMessage).toContain('AWS::NoValue');
                expect(errorMessage).toContain('AWS::Partition');
                expect(errorMessage).toContain('AWS::Region');
                expect(errorMessage).toContain('AWS::StackName');
                expect(errorMessage).toContain('AWS::StackId');
                expect(errorMessage).toContain('AWS::URLSuffix');
            }
        });
    });
});
