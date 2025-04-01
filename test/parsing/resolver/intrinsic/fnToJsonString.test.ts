import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnToJsonStringIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnToJsonStringIntrinsic', () => {
    let intrinsic: FnToJsonStringIntrinsic;
    let mockIntrinsicUtils: jest.Mocked<IntrinsicUtils>;
    let mockContext: jest.Mocked<ResolvingContext>;
    let mockResolveValue: jest.Mock<any, any>;

    beforeEach(() => {
        mockIntrinsicUtils = {
            validateIntrinsic: jest.fn(),
            isIntrinsic: jest.fn(),
            getIntrinsicKey: jest.fn(),
            deepEqual: jest.fn(),
        } as jest.Mocked<IntrinsicUtils>;

        mockContext = {
            hasParameterName: jest.fn(),
            getParameter: jest.fn(),
            addParameter: jest.fn(),
            resolveValue: jest.fn(),
            originalTemplate: {},
        } as unknown as jest.Mocked<ResolvingContext>;

        mockResolveValue = jest.fn();

        intrinsic = new FnToJsonStringIntrinsic(mockIntrinsicUtils);

        jest.clearAllMocks();
    });

    it('should validate the intrinsic object', () => {
        const toJsonStringObject = { 'Fn::ToJsonString': { Key: 'Value' } };
        mockResolveValue.mockReturnValueOnce('Value');
        intrinsic.resolveValue(toJsonStringObject, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(toJsonStringObject, CfIntrinsicFunctions.Fn_ToJsonString);
    });

    it('should return the string value directly if it is already a string', () => {
        const toJsonStringObject = { 'Fn::ToJsonString': 'already a string' };
        const result = intrinsic.resolveValue(toJsonStringObject, mockContext, mockResolveValue);
        expect(result).toBe('already a string');
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should return the resolved value directly if it is a string', () => {
        const toJsonStringObject = { 'Fn::ToJsonString': { Ref: 'SomeValue' } };
        mockResolveValue.mockReturnValue('resolved string');
        const result = intrinsic.resolveValue(toJsonStringObject, mockContext, mockResolveValue);
        expect(result).toBe('resolved string');
        expect(mockResolveValue).toHaveBeenCalledWith(toJsonStringObject['Fn::ToJsonString'], mockContext);
    });

    it('should convert a resolved object to a JSON string', () => {
        const objToConvert = { Key: 'Value', Number: 123, Boolean: true };
        const toJsonStringObject = { 'Fn::ToJsonString': { Ref: 'SomeObject' } };
        mockResolveValue.mockReturnValue(objToConvert);
        const result = intrinsic.resolveValue(toJsonStringObject, mockContext, mockResolveValue);
        expect(result).toBe(JSON.stringify(objToConvert));
        expect(mockResolveValue).toHaveBeenCalledWith(toJsonStringObject['Fn::ToJsonString'], mockContext);
    });

    it('should convert a resolved array to a JSON string', () => {
        const arrayToConvert = ['item1', 2, false];
        const toJsonStringObject = { 'Fn::ToJsonString': { Ref: 'SomeArray' } };
        mockResolveValue.mockReturnValue(arrayToConvert);
        const result = intrinsic.resolveValue(toJsonStringObject, mockContext, mockResolveValue);
        expect(result).toBe(JSON.stringify(arrayToConvert));
        expect(mockResolveValue).toHaveBeenCalledWith(toJsonStringObject['Fn::ToJsonString'], mockContext);
    });

    it('should convert a nested object to a JSON string', () => {
        const nestedObj = { Outer: { Inner: 'value' } };
        const toJsonStringObject = { 'Fn::ToJsonString': nestedObj };
        mockResolveValue.mockReturnValueOnce(nestedObj);

        const result = intrinsic.resolveValue(toJsonStringObject, mockContext, mockResolveValue);
        expect(result).toBe(JSON.stringify(nestedObj));
        expect(mockResolveValue).toHaveBeenCalledWith(nestedObj, mockContext);
    });

    it('should throw an error if the resolved object is null', () => {
        const toJsonStringObject = { 'Fn::ToJsonString': { Ref: 'NullValue' } };
        mockResolveValue.mockReturnValue(null);
        expect(() => intrinsic.resolveValue(toJsonStringObject, mockContext, mockResolveValue)).toThrow(
            'Failed to convert object to JSON string. Unsupported type: null',
        );
        expect(mockResolveValue).toHaveBeenCalledWith(toJsonStringObject['Fn::ToJsonString'], mockContext);
    });

    it('should throw an error if the resolved object is undefined', () => {
        const toJsonStringObject = { 'Fn::ToJsonString': { Ref: 'UndefinedValue' } };
        mockResolveValue.mockReturnValue(undefined);
        expect(() => intrinsic.resolveValue(toJsonStringObject, mockContext, mockResolveValue)).toThrow(
            'Failed to convert object to JSON string. Unsupported type: undefined',
        );
        expect(mockResolveValue).toHaveBeenCalledWith(toJsonStringObject['Fn::ToJsonString'], mockContext);
    });

    it('should throw an error if the resolved object is a number', () => {
        const toJsonStringObject = { 'Fn::ToJsonString': { Ref: 'NumberValue' } };
        mockResolveValue.mockReturnValue(123);
        expect(() => intrinsic.resolveValue(toJsonStringObject, mockContext, mockResolveValue)).toThrow(
            'Failed to convert object to JSON string. Unsupported type: number',
        );
        expect(mockResolveValue).toHaveBeenCalledWith(toJsonStringObject['Fn::ToJsonString'], mockContext);
    });

    it('should throw an error if the resolved object is a boolean', () => {
        const toJsonStringObject = { 'Fn::ToJsonString': { Ref: 'BooleanValue' } };
        mockResolveValue.mockReturnValue(true);
        expect(() => intrinsic.resolveValue(toJsonStringObject, mockContext, mockResolveValue)).toThrow(
            'Failed to convert object to JSON string. Unsupported type: boolean',
        );
        expect(mockResolveValue).toHaveBeenCalledWith(toJsonStringObject['Fn::ToJsonString'], mockContext);
    });
});
