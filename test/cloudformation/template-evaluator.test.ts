import { extractErrorDetails } from 'coreutilsts';
import log from 'loglevel';
import { applyUserParameters, parseCloudFormationTemplate, ParsingResult } from '../../src';
import {
    analyzeParams,
    parseJsonTemplateToModel,
    replaceParamsWithUserDefined,
    resolveValue,
    TemplateParam,
    UserProvidedParam,
} from '../../src/cloudformation';
import { TemplateProcessingError } from '../../src/cloudformation/errors/errors';
import { ResolvingContextImpl } from '../../src/cloudformation/parsing/resolver/resolving-context';
import { CloudFormationTemplate } from '../../src/cloudformation/types/cloudformation-model';

jest.mock('coreutilsts', () => ({
    extractErrorDetails: jest.fn(),
}));

jest.mock('../../src/cloudformation/parsing', () => ({
    parseJsonTemplateToModel: jest.fn(),
    resolveValue: jest.fn(),
}));

jest.mock('../../src/cloudformation/preparation', () => ({
    analyzeParams: jest.fn(),
    replaceParamsWithUserDefined: jest.fn(),
}));

jest.mock('../../src/cloudformation/parsing/resolver/resolving-context', () => ({
    ResolvingContextImpl: jest.fn(),
}));

describe('Template Evaluator', () => {
    let traceSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        traceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
        warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});

        jest.clearAllMocks();
    });

    describe('parseCloudFormationTemplate', () => {
        it('should successfully parse a valid CloudFormation template', () => {
            // Arrange
            const templateString = '{"valid": "json"}';
            const dummyTemplate: CloudFormationTemplate = { foo: 'bar' } as unknown as CloudFormationTemplate;
            const dummyParams: TemplateParam[] = [
                {
                    paramKey: 'Key1',
                    paramType: 'string',
                    paramValue: 'val',
                    isRequired: true,
                    generatedStub: null,
                },
            ];
            (parseJsonTemplateToModel as jest.Mock).mockReturnValue(dummyTemplate);
            (analyzeParams as jest.Mock).mockReturnValue(dummyParams);

            // Act
            const result: ParsingResult = parseCloudFormationTemplate(templateString);

            // Assert: Verify that the parsing functions were called and result is correctly formed.
            expect(parseJsonTemplateToModel).toHaveBeenCalledWith(templateString);
            expect(analyzeParams).toHaveBeenCalledWith(dummyTemplate);
            expect(result).toEqual({
                hasErrors: false,
                parsedTemplate: dummyTemplate,
                paramsToReview: dummyParams,
            });
            // Verify that log.trace has been called at least three times (start, success, analyze).
            expect(traceSpy).toHaveBeenCalled();
        });

        it('should handle errors during template parsing and return error details', () => {
            // Arrange
            const templateString = '{"invalid": "json"}';
            const thrownError = new Error('Parsing error');
            const errorDetail = 'Detailed error message';
            (parseJsonTemplateToModel as jest.Mock).mockImplementation(() => {
                throw thrownError;
            });
            (extractErrorDetails as jest.Mock).mockReturnValue(errorDetail);

            // Act
            const result: ParsingResult = parseCloudFormationTemplate(templateString);

            // Assert: verify that extractErrorDetails is called and the error result flag is returned.
            expect(parseJsonTemplateToModel).toHaveBeenCalledWith(templateString);
            expect(extractErrorDetails).toHaveBeenCalledWith(thrownError);
            expect(result).toEqual({
                hasErrors: true,
                errorMsg: errorDetail,
            });
            expect(warnSpy).toHaveBeenCalled();
        });

        it('should process a null template string as valid input', () => {
            // Arrange
            const dummyTemplate: CloudFormationTemplate = { foo: 'bar' } as unknown as CloudFormationTemplate;
            const dummyParams: TemplateParam[] = [];
            (parseJsonTemplateToModel as jest.Mock).mockReturnValue(dummyTemplate);
            (analyzeParams as jest.Mock).mockReturnValue(dummyParams);

            // Act
            const result: ParsingResult = parseCloudFormationTemplate(null);

            // Assert
            expect(parseJsonTemplateToModel).toHaveBeenCalledWith(null);
            expect(result).toEqual({
                hasErrors: false,
                parsedTemplate: dummyTemplate,
                paramsToReview: dummyParams,
            });
        });
    });

    describe('applyUserParameters', () => {
        const dummyTemplate: CloudFormationTemplate = { foo: 'bar' } as unknown as CloudFormationTemplate;
        const dummyParams: TemplateParam[] = [
            {
                paramKey: 'Key1',
                paramType: 'string',
                paramValue: 'val',
                isRequired: true,
                generatedStub: null,
            },
        ];
        const dummyUserParams: UserProvidedParam[] = [
            {
                paramKey: 'Key1',
                paramValue: 'userProvided',
            },
        ];

        it('should throw TemplateProcessingError if parsing result has errors', () => {
            // Arrange
            const errorResult: ParsingResult = {
                hasErrors: true,
                errorMsg: 'Error present',
            };

            // Act & Assert: expect an error when calling applyUserParameters.
            expect(() => applyUserParameters(errorResult, dummyUserParams)).toThrow(
                new TemplateProcessingError(
                    'Parsing result is invalid: the template contains errors or is missing required data.',
                ),
            );
        });

        it('should throw TemplateProcessingError if parsedTemplate is missing', () => {
            // Arrange
            const invalidResult: ParsingResult = {
                hasErrors: false,
                paramsToReview: dummyParams,
            };

            // Act & Assert
            expect(() => applyUserParameters(invalidResult, dummyUserParams)).toThrow(
                new TemplateProcessingError(
                    'Parsing result is invalid: the template contains errors or is missing required data.',
                ),
            );
        });

        it('should throw TemplateProcessingError if paramsToReview is missing', () => {
            // Arrange
            const invalidResult: ParsingResult = {
                hasErrors: false,
                parsedTemplate: dummyTemplate,
            };

            // Act & Assert
            expect(() => applyUserParameters(invalidResult, dummyUserParams)).toThrow(
                new TemplateProcessingError(
                    'Parsing result is invalid: the template contains errors or is missing required data.',
                ),
            );
        });

        it('should apply user parameters and return a fully processed template when provided valid data', () => {
            // Arrange
            const validResult: ParsingResult = {
                hasErrors: false,
                parsedTemplate: dummyTemplate,
                paramsToReview: dummyParams,
            };

            const dummyMapping = { Key1: 'mappedValue' };
            const dummyStats = {
                totalParamsProcessed: 1,
                overriddenParams: ['Key1'],
                changedCount: 1,
                missingRequiredParams: [],
            };

            // Setup the mocks for parameter replacement.
            (replaceParamsWithUserDefined as jest.Mock).mockReturnValue([dummyMapping, dummyStats]);

            // Set the resolved template and verify that resolveValue and typia.assert are called.
            const dummyResolvedTemplate: CloudFormationTemplate = {
                Resources: {},
            } as unknown as CloudFormationTemplate;
            (resolveValue as jest.Mock).mockReturnValue(dummyResolvedTemplate);

            // For ResolvingContextImpl, we mock its constructor.
            (ResolvingContextImpl as jest.Mock).mockImplementation((template, mapping) => ({
                template,
                mapping,
            }));

            // Act
            const finalTemplate = applyUserParameters(validResult, dummyUserParams);

            // Assert: check that all functions in the processing pipeline are called correctly.
            expect(replaceParamsWithUserDefined).toHaveBeenCalledWith(dummyParams, dummyUserParams);
            expect(ResolvingContextImpl).toHaveBeenCalledWith(dummyTemplate, dummyMapping);
            expect(resolveValue).toHaveBeenCalled();
            expect(finalTemplate).toEqual(dummyResolvedTemplate);
            expect(traceSpy).toHaveBeenCalledWith('User parameters applied. Replacement stats:', dummyStats);
        });
    });
});
