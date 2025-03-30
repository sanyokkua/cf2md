import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnSelectIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnSelectIntrinsic', () => {
    let intrinsic: FnSelectIntrinsic;
    let mockIntrinsicUtils: jest.Mocked<IntrinsicUtils>;
    let mockContext: jest.Mocked<ResolvingContext>;
    let mockResolveValue: jest.Mock<any, any>;

    beforeEach(() => {
        mockIntrinsicUtils = {
            validateIntrinsic: jest.fn(),
            isIntrinsic: jest.fn(),
            getIntrinsicKey: jest.fn(),
        } as jest.Mocked<IntrinsicUtils>;

        mockContext = {
            hasParameterName: jest.fn(),
            getParameter: jest.fn(),
            addParameter: jest.fn(),
            resolveValue: jest.fn(),
            originalTemplate: {},
        } as unknown as jest.Mocked<ResolvingContext>;

        mockResolveValue = jest.fn();

        intrinsic = new FnSelectIntrinsic(mockIntrinsicUtils);

        jest.clearAllMocks();
    });

    it('should validate the intrinsic object', () => {
        const selectObject = { 'Fn::Select': ['0', ['a', 'b']] };
        mockResolveValue.mockReturnValueOnce(0);
        mockResolveValue.mockReturnValueOnce(['a', 'b']);
        intrinsic.resolveValue(selectObject, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(selectObject, CfIntrinsicFunctions.Fn_Select);
    });

    it('should throw an error if the Fn::Select value is not an array', () => {
        const selectObject = { 'Fn::Select': 'not-an-array' };
        expect(() => intrinsic.resolveValue(selectObject, mockContext, mockResolveValue)).toThrow('Expected 2 items in Fn::Select array');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(selectObject, CfIntrinsicFunctions.Fn_Select);
    });

    it('should throw an error if the Fn::Select array does not have exactly 2 elements', () => {
        const selectObjectShort = { 'Fn::Select': ['0'] };
        expect(() => intrinsic.resolveValue(selectObjectShort, mockContext, mockResolveValue)).toThrow('Expected 2 items in Fn::Select array');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(selectObjectShort, CfIntrinsicFunctions.Fn_Select);

        const selectObjectLong = { 'Fn::Select': ['0', ['a'], 'extra'] };
        expect(() => intrinsic.resolveValue(selectObjectLong, mockContext, mockResolveValue)).toThrow('Expected 2 items in Fn::Select array');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(selectObjectLong, CfIntrinsicFunctions.Fn_Select);
    });

    it('should resolve the index and select the correct element', () => {
        const selectObject = { 'Fn::Select': ['1', ['a', 'b', 'c']] };
        mockResolveValue.mockReturnValueOnce('1').mockReturnValueOnce(['a', 'b', 'c']);

        const result = intrinsic.resolveValue(selectObject, mockContext, mockResolveValue);

        expect(mockResolveValue).toHaveBeenCalledWith('1', mockContext);
        expect(mockResolveValue).toHaveBeenCalledWith(['a', 'b', 'c'], mockContext);
        expect(result).toBe('b');
    });

    it('should resolve the index and values when they are not pre-resolved', () => {
        const indexObject = { Ref: 'Index' };
        const valuesObject = { 'Fn::GetAtt': ['List', 'Output'] };
        const selectObject = { 'Fn::Select': [indexObject, valuesObject] };

        mockResolveValue.mockReturnValueOnce(2).mockReturnValueOnce(['x', 'y', 'z']);

        const result = intrinsic.resolveValue(selectObject, mockContext, mockResolveValue);

        expect(mockResolveValue).toHaveBeenCalledWith(indexObject, mockContext);
        expect(mockResolveValue).toHaveBeenCalledWith(valuesObject, mockContext);
        expect(result).toBe('z');
    });

    it('should parse the index as a number even if it is a string', () => {
        const selectObject = { 'Fn::Select': ['0', ['a', 'b']] };
        mockResolveValue.mockReturnValueOnce('0').mockReturnValueOnce(['a', 'b']);

        const result = intrinsic.resolveValue(selectObject, mockContext, mockResolveValue);
        expect(result).toBe('a');
    });

    it('should throw an error if the resolved index cannot be parsed as a number', () => {
        const selectObject = { 'Fn::Select': ['invalid', ['a', 'b']] };
        mockResolveValue.mockReturnValueOnce('invalid');

        expect(() => intrinsic.resolveValue(selectObject, mockContext, mockResolveValue)).toThrow(
            'Index for Fn::Select could not be parsed as a number: "invalid"',
        );
        expect(mockResolveValue).toHaveBeenCalledWith('invalid', mockContext);
    });

    it('should throw an error if the resolved values is not an array', () => {
        const selectObject = { 'Fn::Select': ['0', 'not-an-array'] };
        mockResolveValue.mockReturnValueOnce('0').mockReturnValueOnce('not-an-array');

        expect(() => intrinsic.resolveValue(selectObject, mockContext, mockResolveValue)).toThrow(
            'Expected the second argument of Fn::Select to resolve to an array',
        );
        expect(mockResolveValue).toHaveBeenCalledWith('0', mockContext);
        expect(mockResolveValue).toHaveBeenCalledWith('not-an-array', mockContext);
    });

    it('should throw an error if the index is negative', () => {
        const selectObject = { 'Fn::Select': ['-1', ['a', 'b']] };
        mockResolveValue.mockReturnValueOnce('-1').mockReturnValueOnce(['a', 'b']);

        expect(() => intrinsic.resolveValue(selectObject, mockContext, mockResolveValue)).toThrow('Index is out of bounds in Fn::Select');
        expect(mockResolveValue).toHaveBeenCalledWith('-1', mockContext);
        expect(mockResolveValue).toHaveBeenCalledWith(['a', 'b'], mockContext);
    });

    it('should throw an error if the index is out of bounds (greater than or equal to length)', () => {
        const selectObject = { 'Fn::Select': ['2', ['a', 'b']] };
        mockResolveValue.mockReturnValueOnce('2').mockReturnValueOnce(['a', 'b']);

        expect(() => intrinsic.resolveValue(selectObject, mockContext, mockResolveValue)).toThrow('Index is out of bounds in Fn::Select');
        expect(mockResolveValue).toHaveBeenCalledWith('2', mockContext);
        expect(mockResolveValue).toHaveBeenCalledWith(['a', 'b'], mockContext);
    });

    it('should handle an array with different data types', () => {
        const selectObject = { 'Fn::Select': ['1', ['hello', 123, true]] };
        mockResolveValue.mockReturnValueOnce('1').mockReturnValueOnce(['hello', 123, true]);

        const result = intrinsic.resolveValue(selectObject, mockContext, mockResolveValue);
        expect(result).toBe(123);
    });
});
