import { PseudoParam } from '../../../src/parsing';
import { ResolvingContextImpl } from '../../../src/parsing/resolver/resolving-context';
import { CloudFormationTemplate } from '../../../src/parsing/types/cloudformation-model';
import { ResolvingContext } from '../../../src/parsing/types/resolving-types';
import { ParserUtils, ResourceUtils, ResultParamMap } from '../../../src/parsing/types/util-service-types';

describe('ResolvingContextImpl', () => {
    let originalTemplate: CloudFormationTemplate;
    let params: ResultParamMap;
    let context: ResolvingContext;
    let mockParserUtils: jest.Mocked<ParserUtils>;
    let mockResourceUtils: jest.Mocked<ResourceUtils>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Create minimal valid template.
        originalTemplate = { Resources: {} };

        // Provide required pseudo parameters.
        params = {
            [PseudoParam.AccountId]: '123456789012',
            [PseudoParam.Partition]: 'aws',
            [PseudoParam.Region]: 'us-east-1',
            [PseudoParam.StackName]: 'teststack',
        };

        // Create mocks for injected dependencies.
        mockParserUtils = {
            buildTemplateParam: jest.fn(),
            analyzeParams: jest.fn(),
            replaceParamsWithUserDefined: jest.fn(),
            generateStubOnType: jest.fn(),
            validateParamsList: jest.fn(),
        };

        mockResourceUtils = {
            generateAZs: jest.fn().mockReturnValue(['us-east-1a', 'us-east-1b']),
            generateAlphaNumeric: jest.fn(),
            shortUuid: jest.fn(),
            fullUuid: jest.fn(),
            generateGenericId: jest.fn(),
            generatePrefixedId: jest.fn(),
            generateNameId: jest.fn(),
            resolveString: jest.fn(),
            resolveStringWithDefault: jest.fn(),
        };

        // Instantiate context.
        context = new ResolvingContextImpl(mockParserUtils, mockResourceUtils, originalTemplate, params);
    });

    describe('constructor', () => {
        test('calls validateParamsList with provided params', () => {
            expect(mockParserUtils.validateParamsList).toHaveBeenCalledWith(params);
        });

        test('initializes lookupMapPreProcessed as a shallow copy of params', () => {
            expect(context.lookupMapPreProcessed).toEqual(params);
            // Ensure that modifications to original params do not affect the context's map.
            params['newParam'] = 'newValue';
            expect(context.lookupMapPreProcessed).not.toHaveProperty('newParam');
        });
    });

    describe('addName and getCurrentPath', () => {
        test('addName pushes names and getCurrentPath returns a dot-delimited string', () => {
            context.addName('first');
            context.addName('second');
            expect(context.getCurrentPath()).toBe('first.second');
        });
    });

    describe('popName', () => {
        test('popName returns the last added name and updates the current path', () => {
            context.addName('alpha');
            context.addName('beta');
            const popped = context.popName();
            expect(popped).toBe('beta');
            expect(context.getCurrentPath()).toBe('alpha');
        });

        test('popName returns an empty string when no names exist', () => {
            const popped = context.popName();
            expect(popped).toBe('');
            expect(context.getCurrentPath()).toBe('');
        });
    });

    describe('hasParameterName and getParameter', () => {
        test('hasParameterName returns true when parameter exists in pre-processed map', () => {
            expect(context.hasParameterName(PseudoParam.AccountId)).toBe(true);
        });

        test('hasParameterName returns true when parameter exists in dynamic map', () => {
            context.addParameter('dynamicParam', 'dynValue');
            expect(context.hasParameterName('dynamicParam')).toBe(true);
        });

        test('getParameter retrieves value from pre-processed map', () => {
            expect(context.getParameter(PseudoParam.AccountId)).toBe('123456789012');
        });

        test('getParameter retrieves value from dynamic map', () => {
            context.addParameter('dynamicParam', 'dynValue');
            expect(context.getParameter('dynamicParam')).toBe('dynValue');
        });

        test('getParameter throws an error when parameter does not exist', () => {
            expect(() => context.getParameter('nonexistent')).toThrow('nonexistent');
        });
    });

    describe('addParameter', () => {
        test('adds a new parameter to the dynamic lookup map', () => {
            context.addParameter('newParam', 'newValue');
            expect(context.lookupMapDynamic).toHaveProperty('newParam', 'newValue');
        });

        test('throws an error when adding a parameter that already exists', () => {
            // Already exists in pre-processed.
            expect(() => context.addParameter(PseudoParam.AccountId, 'value')).toThrow(PseudoParam.AccountId);
            // Already exists in dynamic.
            context.addParameter('dupParam', 'value');
            expect(() => context.addParameter('dupParam', 'anotherValue')).toThrow('dupParam');
        });
    });

    describe('addGeneratedId and isIdExists', () => {
        test('addGeneratedId adds an ID and isIdExists confirms its presence', () => {
            context.addGeneratedId('id1');
            expect(context.isIdExists('id1')).toBe(true);
        });

        test('isIdExists returns false for an ID that was not added', () => {
            expect(context.isIdExists('nonexistent')).toBe(false);
        });
    });

    describe('getAZs', () => {
        test('getAZs returns AZs for a specified region', () => {
            const azs = context.getAZs('us-east-1');
            expect(mockResourceUtils.generateAZs).toHaveBeenCalledWith('us-east-1');
            expect(azs).toEqual(['us-east-1a', 'us-east-1b']);
        });

        test('getAZs defaults to the context region when no region is provided', () => {
            const azs = context.getAZs();
            // Context's region is retrieved from pre-processed params.
            expect(mockResourceUtils.generateAZs).toHaveBeenCalledWith('us-east-1');
            expect(azs).toEqual(['us-east-1a', 'us-east-1b']);
        });
    });

    describe('getAccountId, getPartition, getRegion, getStackName', () => {
        test('getAccountId returns the account ID from parameters', () => {
            expect(context.getAccountId()).toBe('123456789012');
        });

        test('getPartition returns the partition from parameters', () => {
            expect(context.getPartition()).toBe('aws');
        });

        test('getRegion returns the region from parameters', () => {
            expect(context.getRegion()).toBe('us-east-1');
        });

        test('getStackName returns the stack name from parameters', () => {
            expect(context.getStackName()).toBe('teststack');
        });
    });
});
