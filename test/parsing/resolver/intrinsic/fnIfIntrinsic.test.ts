import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnIfIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnIfIntrinsic', () => {
    let intrinsic: FnIfIntrinsic;
    let mockIntrinsicUtils: jest.Mocked<IntrinsicUtils>;
    let mockContext: jest.Mocked<ResolvingContext>;
    let mockResolveValue: jest.Mock<any, any>;

    beforeEach(() => {
        mockIntrinsicUtils = {
            validateIntrinsic: jest.fn(),
            isIntrinsic: jest.fn(),
        } as unknown as jest.Mocked<IntrinsicUtils>;

        mockContext = {
            originalTemplate: {},
            hasParameterName: jest.fn(),
            getParameter: jest.fn(),
            addParameter: jest.fn(),
        } as unknown as jest.Mocked<ResolvingContext>;

        mockResolveValue = jest.fn();
        mockResolveValue.mockImplementation((arg) => arg);
        intrinsic = new FnIfIntrinsic(mockIntrinsicUtils);
    });

    it('should call validateIntrinsic with correct parameters', () => {
        const ifObject = { 'Fn::If': [true, 'true-value', 'false-value'] };
        intrinsic.resolveValue(ifObject, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(ifObject, CfIntrinsicFunctions.Fn_If);
    });

    it('should resolve and return the true value when the condition is true (pre-resolved)', () => {
        const ifObject = { 'Fn::If': [true, 'true-value', 'false-value'] };
        mockResolveValue.mockReturnValueOnce(true);
        const result = intrinsic.resolveValue(ifObject, mockContext, mockResolveValue);
        expect(result).toBe('true-value');
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
    });

    it('should resolve and return the false value when the condition is false (pre-resolved)', () => {
        const ifObject = { 'Fn::If': [false, 'true-value', 'false-value'] };
        const result = intrinsic.resolveValue(ifObject, mockContext, mockResolveValue);
        expect(result).toBe('false-value');
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
    });

    it('should resolve the condition and return the true value when it resolves to true', () => {
        const ifObject = { 'Fn::If': [{ Ref: 'Condition' }, 'true-value', 'false-value'] };
        mockResolveValue.mockReturnValueOnce(true);
        const result = intrinsic.resolveValue(ifObject, mockContext, mockResolveValue);
        expect(result).toBe('true-value');
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'Condition' }, mockContext);
    });

    it('should resolve the condition and return the false value when it resolves to false', () => {
        const ifObject = { 'Fn::If': [{ Ref: 'Condition' }, 'true-value', 'false-value'] };
        mockResolveValue.mockReturnValueOnce(false);
        const result = intrinsic.resolveValue(ifObject, mockContext, mockResolveValue);
        expect(result).toBe('false-value');
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'Condition' }, mockContext);
    });

    it('should resolve the true value when the condition is true and the true value needs resolution', () => {
        const ifObject = { 'Fn::If': [true, { Ref: 'TrueValue' }, 'false-value'] };
        mockResolveValue.mockReturnValueOnce(true);
        mockResolveValue.mockReturnValueOnce('resolved-true');
        const result = intrinsic.resolveValue(ifObject, mockContext, mockResolveValue);
        expect(result).toBe('resolved-true');
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'TrueValue' }, mockContext);
    });

    it('should resolve the false value when the condition is false and the false value needs resolution', () => {
        const ifObject = { 'Fn::If': [false, 'true-value', { Ref: 'FalseValue' }] };
        mockResolveValue.mockReturnValueOnce(false);
        mockResolveValue.mockReturnValueOnce('resolved-false');
        const result = intrinsic.resolveValue(ifObject, mockContext, mockResolveValue);
        expect(result).toBe('resolved-false');
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'FalseValue' }, mockContext);
    });

    it('should throw an error if the input object is not a valid intrinsic', () => {
        const invalidObject = { NotFnIf: [true, 'a', 'b'] };
        mockIntrinsicUtils.validateIntrinsic.mockImplementation(() => {
            throw new Error('Err');
        });
        expect(() => intrinsic.resolveValue(invalidObject, mockContext, mockResolveValue)).toThrow('Err');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(invalidObject, CfIntrinsicFunctions.Fn_If);
    });

    it('should throw an error if the value of Fn::If is not an array', () => {
        const invalidObject = { 'Fn::If': 'not an array' };
        expect(() => intrinsic.resolveValue(invalidObject, mockContext, mockResolveValue)).toThrow('fnIf: Fn::If requires an array.');
    });

    it('should throw an error if the array within Fn::If does not have exactly 3 elements', () => {
        const invalidObject1 = { 'Fn::If': { val: true, val2: 'a' } };
        expect(() => intrinsic.resolveValue(invalidObject1, mockContext, mockResolveValue)).toThrow('fnIf: Fn::If requires an array.');
        const invalidObject2 = { 'Fn::If': true };
        expect(() => intrinsic.resolveValue(invalidObject2, mockContext, mockResolveValue)).toThrow('fnIf: Fn::If requires an array.');
    });

    it('should throw an error if the resolved condition is not a boolean', () => {
        const ifObject = { 'Fn::If': [{ Ref: 'Condition' }, 'true-value', 'false-value'] };
        mockResolveValue.mockReturnValueOnce('not-a-boolean');
        expect(() => intrinsic.resolveValue(ifObject, mockContext, mockResolveValue)).toThrow('fnIf: The condition must resolve to a boolean.');
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'Condition' }, mockContext);
    });

    it('should handle different data types in the true and false branches', () => {
        const ifObjectTrue = { 'Fn::If': [true, 123, 'string'] };
        expect(intrinsic.resolveValue(ifObjectTrue, mockContext, mockResolveValue)).toBe(123);

        const ifObjectFalse = { 'Fn::If': [false, 123, 'string'] };
        expect(intrinsic.resolveValue(ifObjectFalse, mockContext, mockResolveValue)).toBe('string');
    });
});
