import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnFindInMapIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { CloudFormationTemplate } from '../../../../src/parsing/types/cloudformation-model';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnFindInMapIntrinsic', () => {
    let intrinsic: FnFindInMapIntrinsic;
    let mockIntrinsicUtils: jest.Mocked<IntrinsicUtils>;
    let mockContext: jest.Mocked<ResolvingContext>;
    let mockResolveValue: jest.Mock<any, any>;
    let originalTemplate: CloudFormationTemplate;

    beforeEach(() => {
        mockIntrinsicUtils = {
            validateIntrinsic: jest.fn(),
            isIntrinsic: jest.fn(),
            deepEqual: jest.fn(),
        } as unknown as jest.Mocked<IntrinsicUtils>;

        originalTemplate = {
            Mappings: {
                RegionMap: {
                    'us-east-1': { AMI: 'ami-12345' },
                    'us-west-2': { AMI: 'ami-67890' },
                },
                InstanceTypeMap: {
                    t2micro: { CPU: '1', Memory: '1GB' },
                },
            },
            Resources: {},
        };

        mockContext = {
            originalTemplate: originalTemplate,
            hasParameterName: jest.fn(),
            getParameter: jest.fn(),
            addParameter: jest.fn(),
        } as unknown as jest.Mocked<ResolvingContext>;

        mockResolveValue = jest.fn();
        mockResolveValue.mockImplementation((val) => val);
        intrinsic = new FnFindInMapIntrinsic(mockIntrinsicUtils);
    });

    it('should call validateIntrinsic with correct parameters', () => {
        const findInMapObject = { 'Fn::FindInMap': ['RegionMap', 'us-east-1', 'AMI'] };
        intrinsic.resolveValue(findInMapObject, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(findInMapObject, CfIntrinsicFunctions.Fn_FindInMap);
    });

    it('should resolve a value from the Mappings section with pre-resolved keys', () => {
        const findInMapObject = { 'Fn::FindInMap': ['RegionMap', 'us-east-1', 'AMI'] };
        const result = intrinsic.resolveValue(findInMapObject, mockContext, mockResolveValue);
        expect(result).toBe('ami-12345');
        expect(mockResolveValue).toHaveBeenCalledTimes(3);
    });

    it('should resolve a value from the Mappings section with resolved keys', () => {
        const findInMapObject = {
            'Fn::FindInMap': [{ Ref: 'MapName' }, { Ref: 'TopKey' }, { Ref: 'SecondKey' }],
        };
        mockResolveValue.mockReturnValueOnce('RegionMap').mockReturnValueOnce('us-west-2').mockReturnValueOnce('AMI');
        const result = intrinsic.resolveValue(findInMapObject, mockContext, mockResolveValue);
        expect(result).toBe('ami-67890');
        expect(mockResolveValue).toHaveBeenCalledTimes(3);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, { Ref: 'MapName' }, mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, { Ref: 'TopKey' }, mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(3, { Ref: 'SecondKey' }, mockContext);
    });

    it('should throw an error if the input object is not a valid intrinsic', () => {
        const invalidObject = { NotFnFindInMap: ['RegionMap', 'us-east-1', 'AMI'] };
        mockIntrinsicUtils.validateIntrinsic.mockImplementation(() => {
            throw new Error('Err');
        });
        expect(() => intrinsic.resolveValue(invalidObject, mockContext, mockResolveValue)).toThrow('Err');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(invalidObject, CfIntrinsicFunctions.Fn_FindInMap);
    });

    it('should throw an error if the value of Fn::FindInMap is not an array', () => {
        const invalidObject = { 'Fn::FindInMap': 'not an array' };
        expect(() => intrinsic.resolveValue(invalidObject, mockContext, mockResolveValue)).toThrow('Expected 3 items in Fn::FindInMap array');
    });

    it('should throw an error if the array within Fn::FindInMap does not have exactly 3 elements', () => {
        const invalidObject1 = { 'Fn::FindInMap': ['RegionMap', 'us-east-1'] };
        expect(() => intrinsic.resolveValue(invalidObject1, mockContext, mockResolveValue)).toThrow('Expected 3 items in Fn::FindInMap array');
        const invalidObject2 = { 'Fn::FindInMap': ['RegionMap', 'us-east-1', 'AMI', 'Extra'] };
        expect(() => intrinsic.resolveValue(invalidObject2, mockContext, mockResolveValue)).toThrow('Expected 3 items in Fn::FindInMap array');
    });

    it('should throw an error if the resolved map name is not a string', () => {
        const findInMapObject = { 'Fn::FindInMap': [{ Ref: 'MapName' }, 'us-east-1', 'AMI'] };
        mockResolveValue.mockReturnValueOnce(123);
        expect(() => intrinsic.resolveValue(findInMapObject, mockContext, mockResolveValue)).toThrow('Expected mapname to be a string');
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'MapName' }, mockContext);
    });

    it('should throw an error if the resolved top-level key is not a string', () => {
        const findInMapObject = { 'Fn::FindInMap': ['RegionMap', { Ref: 'TopKey' }, 'AMI'] };
        mockResolveValue.mockReturnValueOnce('RegionMap').mockReturnValueOnce(456);
        expect(() => intrinsic.resolveValue(findInMapObject, mockContext, mockResolveValue)).toThrow('Expected top-level key to be a string');
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'TopKey' }, mockContext);
    });

    it('should throw an error if the resolved second-level key is not a string', () => {
        const findInMapObject = { 'Fn::FindInMap': ['RegionMap', 'us-east-1', { Ref: 'SecondKey' }] };
        mockResolveValue.mockReturnValueOnce('RegionMap').mockReturnValueOnce('us-east-1').mockReturnValueOnce(true);
        expect(() => intrinsic.resolveValue(findInMapObject, mockContext, mockResolveValue)).toThrow('Expected second-level key to be a string');
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'SecondKey' }, mockContext);
    });

    it('should throw an error if the Mappings section is missing in the template', () => {
        const findInMapObject = { 'Fn::FindInMap': ['MissingMap', 'Key1', 'Key2'] };
        const contextWithoutMappings = { ...mockContext, originalTemplate: { Resources: {} } };
        expect(() => intrinsic.resolveValue(findInMapObject, contextWithoutMappings, mockResolveValue)).toThrow(
            'Template Mappings are missing. Fn::FindInMap cannot search for a value',
        );
    });

    it('should throw an error if the specified map is not found', () => {
        const findInMapObject = { 'Fn::FindInMap': ['MissingMap', 'Key1', 'Key2'] };
        expect(() => intrinsic.resolveValue(findInMapObject, mockContext, mockResolveValue)).toThrow('Mapping with name "MissingMap" not found');
    });

    it('should throw an error if the top-level key is not found in the map', () => {
        const findInMapObject = { 'Fn::FindInMap': ['RegionMap', 'missing-key', 'AMI'] };
        expect(() => intrinsic.resolveValue(findInMapObject, mockContext, mockResolveValue)).toThrow(
            'Mapping for key "missing-key" not found in mapping "RegionMap"',
        );
    });

    it('should throw an error if the second-level key is not found in the top-level mapping', () => {
        const findInMapObject = { 'Fn::FindInMap': ['RegionMap', 'us-east-1', 'MissingAMI'] };
        expect(() => intrinsic.resolveValue(findInMapObject, mockContext, mockResolveValue)).toThrow(
            'Value for key "MissingAMI" not found in mapping "RegionMap" at top-level key "us-east-1"',
        );
    });

    it('should handle a map with different data types', () => {
        const templateWithDifferentTypes: CloudFormationTemplate = {
            Mappings: {
                DataTypeMap: {
                    StringKey: { Value: 'stringValue' },
                    NumberKey: { Value: 123 },
                    BooleanKey: { Value: true },
                },
            },
            Resources: {},
        };
        const contextWithDifferentTypes = { ...mockContext, originalTemplate: templateWithDifferentTypes };
        const findString = { 'Fn::FindInMap': ['DataTypeMap', 'StringKey', 'Value'] };
        expect(intrinsic.resolveValue(findString, contextWithDifferentTypes, mockResolveValue)).toBe('stringValue');

        const findNumber = { 'Fn::FindInMap': ['DataTypeMap', 'NumberKey', 'Value'] };
        expect(intrinsic.resolveValue(findNumber, contextWithDifferentTypes, mockResolveValue)).toBe(123);

        const findBoolean = { 'Fn::FindInMap': ['DataTypeMap', 'BooleanKey', 'Value'] };
        expect(intrinsic.resolveValue(findBoolean, contextWithDifferentTypes, mockResolveValue)).toBe(true);
    });
});
