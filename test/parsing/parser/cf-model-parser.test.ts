import { StringUtils } from '../../../src/common';
import { CfModelParserImpl } from '../../../src/parsing/parser/cf-model-parser';
import { CloudFormationTemplate, S3BucketResource } from '../../../src/parsing/types/cloudformation-model';
import { ResourceIntrinsic, ResourceIntrinsicResolver } from '../../../src/parsing/types/intrinsic-types';
import { ParserService, ParsingResult, TemplateParam, UserProvidedParam } from '../../../src/parsing/types/parsing-types';
import { ValueResolver } from '../../../src/parsing/types/resolving-types';
import { ParserUtils, ResourceUtils } from '../../../src/parsing/types/util-service-types';

// Mocks for external dependencies
const createMockStringUtils = (): jest.Mocked<StringUtils> => ({
    isBlankString: jest.fn(),
    // @ts-ignore
    isValidNotBlankString: jest.fn(),
    parseTemplateString: jest.fn(),
    replaceTemplateVariables: jest.fn(),
});

const createMockParserUtils = (): jest.Mocked<ParserUtils> => ({
    buildTemplateParam: jest.fn(),
    analyzeParams: jest.fn(),
    replaceParamsWithUserDefined: jest.fn(),
    generateStubOnType: jest.fn(),
    validateParamsList: jest.fn(),
});

const createMockValueResolver = (): jest.Mocked<ValueResolver> => ({
    resolveValue: jest.fn(),
});

const createMockResourceUtils = (): jest.Mocked<ResourceUtils> => ({
    generateAZs: jest.fn(),
    generateAlphaNumeric: jest.fn(),
    shortUuid: jest.fn(),
    fullUuid: jest.fn(),
    generateGenericId: jest.fn(),
    generatePrefixedId: jest.fn(),
    generateNameId: jest.fn(),
    resolveString: jest.fn(),
    resolveStringWithDefault: jest.fn(),
});

const createMockResourceIntrinsicResolver = (): jest.Mocked<ResourceIntrinsicResolver> => ({
    getResourceIntrinsic: jest.fn(),
});

describe('CfModelParserImpl', () => {
    let parser: ParserService;
    let mockStringUtils: jest.Mocked<StringUtils>;
    let mockParserUtils: jest.Mocked<ParserUtils>;
    let mockValueResolver: jest.Mocked<ValueResolver>;
    let mockResourceUtils: jest.Mocked<ResourceUtils>;
    let mockResourceIntrinsicResolver: jest.Mocked<ResourceIntrinsicResolver>;

    beforeEach(() => {
        mockStringUtils = createMockStringUtils();
        mockParserUtils = createMockParserUtils();
        mockValueResolver = createMockValueResolver();
        mockResourceUtils = createMockResourceUtils();
        mockResourceIntrinsicResolver = createMockResourceIntrinsicResolver();

        // Instantiate our class-under-test with mocked dependencies.
        parser = new CfModelParserImpl(mockStringUtils, mockParserUtils, mockValueResolver, mockResourceUtils, mockResourceIntrinsicResolver);

        // Reset mocks between tests.
        jest.clearAllMocks();
    });

    describe('parseTemplateJsonString', () => {
        test('returns valid ParsingResult when given a valid non-blank template string', () => {
            // Arrange
            const templateObj: CloudFormationTemplate = { Resources: {} };
            const templateStr = JSON.stringify(templateObj);
            // Simulate valid template string.
            mockStringUtils.isValidNotBlankString.mockReturnValue(true);
            // Simulate typia assertion by letting the JSON string parse correctly.
            // (We don't mock typia here; assume it works as expected.)
            // Stub analyzeParams to return an empty missing params array.
            (mockParserUtils.analyzeParams as jest.Mock).mockReturnValue([]);

            // Act
            const result = parser.parseTemplateJsonString(templateStr);

            // Assert
            expect(mockStringUtils.isValidNotBlankString).toHaveBeenCalledWith(templateStr);
            expect(result.hasErrors).toBe(false);
            expect(result.parsedTemplate).toEqual(templateObj);
            expect(result.paramsToReview).toEqual([]);
        });

        test('returns error ParsingResult when given an invalid template string', () => {
            // Arrange
            const badTemplate = '   '; // blank or invalid string
            mockStringUtils.isValidNotBlankString.mockReturnValue(false);

            // Act
            const result = parser.parseTemplateJsonString(badTemplate);

            // Assert
            expect(mockStringUtils.isValidNotBlankString).toHaveBeenCalledWith(badTemplate);
            expect(result.hasErrors).toBe(true);
            // extractErrorDetails is used on the thrown error. We check that errorMsg is a non-empty string.
            expect(result.errorMsg).toBeDefined();
            expect(typeof result.errorMsg).toBe('string');
        });
    });

    describe('resolveValuesInTemplate', () => {
        const dummyParsedTemplate: CloudFormationTemplate = {
            Resources: {
                MyResource: { Type: 'AWS::S3::Bucket', Properties: {} } as S3BucketResource,
            },
        };
        const dummyParamsToReview: TemplateParam[] = [
            { paramKey: 'Param1', paramType: 'String', paramValue: 'default', isRequired: false, generatedStub: 'stubVal' },
        ];
        const dummyUserParams: UserProvidedParam[] = [{ paramKey: 'Param1', paramValue: 'userVal' }];

        test('returns resolved CloudFormationTemplate when parse result is valid', () => {
            // Arrange
            const parseResult: ParsingResult = {
                hasErrors: false,
                parsedTemplate: dummyParsedTemplate,
                paramsToReview: dummyParamsToReview,
            };

            // Stub replaceParamsWithUserDefined to return a resolved mapping and dummy stats.
            const dummyMapping = { Param1: 'userVal' };
            const dummyStats = { totalParamsProcessed: 1, overriddenParams: ['Param1'], changedCount: 1, missingRequiredParams: [] };
            (mockParserUtils.replaceParamsWithUserDefined as jest.Mock).mockReturnValue([dummyMapping, dummyStats]);

            // Stub resolverUtils.resolveValue to return a modified template.
            // For testing, simulate that the resolved template is the same as parsedTemplate.
            mockValueResolver.resolveValue.mockReturnValue(dummyParsedTemplate);

            // Prepare a mock for ResourceIntrinsicResolver: for any resource type, return an intrinsic resolver.
            const mockIntrinsic: jest.Mocked<ResourceIntrinsic> = {
                refFunc: jest.fn(),
                getAttFunc: jest.fn(),
                idGenFunc: jest.fn().mockReturnValue('generated-id'),
                arnGenFunc: jest.fn().mockReturnValue('generated-arn'),
            };
            mockResourceIntrinsicResolver.getResourceIntrinsic.mockReturnValue(mockIntrinsic);

            // Act
            const finalTemplate = parser.resolveValuesInTemplate(parseResult, dummyUserParams);

            // Assert
            expect(mockParserUtils.replaceParamsWithUserDefined).toHaveBeenCalledWith(dummyParamsToReview, dummyUserParams);
            expect(mockValueResolver.resolveValue).toHaveBeenCalled();
            // Check that the resource has _id and _arn assigned via assignIdentifiers.
            expect(finalTemplate.Resources.MyResource._id).toBe('generated-id');
            expect(finalTemplate.Resources.MyResource._arn).toBe('generated-arn');
        });

        test('throws an error when the parse result is invalid', () => {
            // Arrange: simulate a parse result with errors.
            const invalidResult: ParsingResult = { hasErrors: true, errorMsg: 'Error details' };

            // Act & Assert
            expect(() => parser.resolveValuesInTemplate(invalidResult, dummyUserParams)).toThrow(
                'Parsing result is invalid: the template contains errors or is missing required data.',
            );
        });
    });
});
