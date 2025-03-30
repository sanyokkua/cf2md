import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnEqualsIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnEqualsIntrinsic', () => {
    let intrinsic: FnEqualsIntrinsic;
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
        mockResolveValue.mockImplementation((val) => val);
        intrinsic = new FnEqualsIntrinsic(mockIntrinsicUtils);
    });

    it('should call validateIntrinsic with correct parameters', () => {
        const equalsObject = { 'Fn::Equals': ['a', 'a'] };
        intrinsic.resolveValue(equalsObject, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(equalsObject, CfIntrinsicFunctions.Fn_Equals);
    });

    it('should return true for strictly equal pre-resolved values', () => {
        const equalsObject = { 'Fn::Equals': ['a', 'a'] };
        const result = intrinsic.resolveValue(equalsObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
    });

    it('should return false for strictly not equal pre-resolved values', () => {
        const equalsObject = { 'Fn::Equals': ['a', 'b'] };
        const result = intrinsic.resolveValue(equalsObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
    });

    it('should return true for strictly equal resolved values', () => {
        const equalsObject = { 'Fn::Equals': [{ Ref: 'Val1' }, { Ref: 'Val2' }] };
        mockResolveValue.mockReturnValue('resolved-value');
        const result = intrinsic.resolveValue(equalsObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, { Ref: 'Val1' }, mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, { Ref: 'Val2' }, mockContext);
    });

    it('should return false for strictly not equal resolved values', () => {
        const equalsObject = { 'Fn::Equals': [{ Ref: 'Val1' }, { Ref: 'Val2' }] };
        mockResolveValue.mockReturnValueOnce('resolved-value-1').mockReturnValueOnce('resolved-value-2');
        const result = intrinsic.resolveValue(equalsObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, { Ref: 'Val1' }, mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, { Ref: 'Val2' }, mockContext);
    });

    it('should return true for deeply equal pre-resolved objects', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { b: { c: 2 }, a: 1 };
        const equalsObject = { 'Fn::Equals': [obj1, obj2] };
        const result = intrinsic.resolveValue(equalsObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
    });

    it('should return false for deeply not equal pre-resolved objects', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { a: 1, b: { c: 3 } };
        const equalsObject = { 'Fn::Equals': [obj1, obj2] };
        const result = intrinsic.resolveValue(equalsObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
    });

    it('should return true for deeply equal resolved objects', () => {
        const obj1 = { a: 1 };
        const obj2 = { a: 1 };
        const equalsObject = { 'Fn::Equals': [{ Ref: 'Obj1' }, { Ref: 'Obj2' }] };
        mockResolveValue.mockReturnValueOnce(obj1).mockReturnValueOnce(obj2);
        const result = intrinsic.resolveValue(equalsObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, { Ref: 'Obj1' }, mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, { Ref: 'Obj2' }, mockContext);
    });

    it('should return false for deeply not equal resolved objects', () => {
        const obj1 = { a: 1 };
        const obj2 = { b: 2 };
        const equalsObject = { 'Fn::Equals': [{ Ref: 'Obj1' }, { Ref: 'Obj2' }] };
        mockResolveValue.mockReturnValueOnce(obj1).mockReturnValueOnce(obj2);
        const result = intrinsic.resolveValue(equalsObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, { Ref: 'Obj1' }, mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, { Ref: 'Obj2' }, mockContext);
    });

    it('should handle mixed resolved and pre-resolved values (equal)', () => {
        const equalsObject = { 'Fn::Equals': ['pre-resolved', { Ref: 'Val' }] };
        mockResolveValue.mockReturnValue('pre-resolved');
        const result = intrinsic.resolveValue(equalsObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'Val' }, mockContext);
    });

    it('should handle mixed resolved and pre-resolved values (not equal)', () => {
        const equalsObject = { 'Fn::Equals': ['pre-resolved', { Ref: 'Val' }] };
        mockResolveValue.mockReturnValueOnce('pre-resolved');
        mockResolveValue.mockReturnValueOnce('different');
        const result = intrinsic.resolveValue(equalsObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'Val' }, mockContext);
    });

    it('should throw an error if the input object is not a valid intrinsic', () => {
        const invalidObject = { NotFnEquals: ['a', 'a'] };
        mockIntrinsicUtils.validateIntrinsic.mockImplementation(() => {
            throw new Error('Error');
        });
        expect(() => intrinsic.resolveValue(invalidObject, mockContext, mockResolveValue)).toThrow('Error');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(invalidObject, CfIntrinsicFunctions.Fn_Equals);
    });

    it('should throw an error if the value of Fn::Equals is not an array', () => {
        const invalidObject = { 'Fn::Equals': 'not an array' };
        expect(() => intrinsic.resolveValue(invalidObject, mockContext, mockResolveValue)).toThrow('fnEquals: Fn::Equals requires an array.');
    });

    it('should call resolveValue for both elements in the array', () => {
        const equalsObject = { 'Fn::Equals': [{ Ref: 'Val1' }, { GetAtt: 'Resource.Attr' }] };
        intrinsic.resolveValue(equalsObject, mockContext, mockResolveValue);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'Val1' }, mockContext);
        expect(mockResolveValue).toHaveBeenCalledWith({ GetAtt: 'Resource.Attr' }, mockContext);
    });

    it('should handle null and undefined pre-resolved values', () => {
        const equalsNull = { 'Fn::Equals': [null, null] };
        expect(intrinsic.resolveValue(equalsNull, mockContext, mockResolveValue)).toBe(true);

        const equalsUndefined = { 'Fn::Equals': [undefined, undefined] };
        expect(intrinsic.resolveValue(equalsUndefined, mockContext, mockResolveValue)).toBe(true);

        const equalsNullUndefined = { 'Fn::Equals': [null, undefined] };
        expect(intrinsic.resolveValue(equalsNullUndefined, mockContext, mockResolveValue)).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledTimes(6);
    });

    it('should handle null and undefined resolved values', () => {
        const equalsNull = { 'Fn::Equals': [{ Ref: 'NullVal' }, { Ref: 'AnotherNull' }] };
        mockResolveValue.mockReturnValue(null);
        expect(intrinsic.resolveValue(equalsNull, mockContext, mockResolveValue)).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);

        const equalsUndefined = { 'Fn::Equals': [{ Ref: 'UndefVal' }, { Ref: 'AnotherUndef' }] };
        mockResolveValue.mockReturnValue(undefined);
        expect(intrinsic.resolveValue(equalsUndefined, mockContext, mockResolveValue)).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(4); // Called twice in previous test

        mockResolveValue.mockReset();
        const equalsNullUndefined = { 'Fn::Equals': [{ Ref: 'NullVal' }, { Ref: 'UndefVal' }] };
        mockResolveValue.mockReturnValueOnce(null).mockReturnValueOnce(undefined);
        expect(intrinsic.resolveValue(equalsNullUndefined, mockContext, mockResolveValue)).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
    });

    it('should handle comparing object with primitive (not equal)', () => {
        const equalsObjectPrimitive = { 'Fn::Equals': [{ a: 1 }, 1] };
        expect(intrinsic.resolveValue(equalsObjectPrimitive, mockContext, mockResolveValue)).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);

        const equalsPrimitiveObject = { 'Fn::Equals': [1, { a: 1 }] };
        expect(intrinsic.resolveValue(equalsPrimitiveObject, mockContext, mockResolveValue)).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledTimes(4);
    });

    describe('deepEqual method', () => {
        it('should return true for deeply equal arrays', () => {
            expect(intrinsic.deepEqual([1, 2], [1, 2])).toBe(true);
        });

        it('should return false for arrays of different lengths', () => {
            expect(intrinsic.deepEqual([1, 2], [1])).toBe(false);
        });

        it('should return true for deeply equal nested arrays', () => {
            expect(intrinsic.deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
        });

        it('should return false for deeply not equal nested arrays', () => {
            expect(intrinsic.deepEqual([1, [2, 3]], [1, [2, 4]])).toBe(false);
        });

        it('should return true for deeply equal Dates', () => {
            const date1 = new Date('2023-01-01T00:00:00.000Z');
            const date2 = new Date('2023-01-01T00:00:00.000Z');
            expect(intrinsic.deepEqual(date1, date2)).toBe(true);
        });

        it('should return false for deeply not equal Dates', () => {
            const date1 = new Date('2023-01-01T00:00:00.000Z');
            const date2 = new Date('2023-01-02T00:00:00.000Z');
            expect(intrinsic.deepEqual(date1, date2)).toBe(false);
        });

        it('should return true for deeply equal RegExps', () => {
            const regex1 = /abc/g;
            const regex2 = /abc/g;
            expect(intrinsic.deepEqual(regex1, regex2)).toBe(true);
        });

        it('should return false for deeply not equal RegExps', () => {
            const regex1 = /abc/g;
            const regex2 = /abd/g;
            expect(intrinsic.deepEqual(regex1, regex2)).toBe(false);
        });

        it('should return false for two nulls', () => {
            expect(intrinsic.deepEqual(null, null)).toBe(false);
        });

        it('should return false for two different types', () => {
            expect(intrinsic.deepEqual(1, '1')).toBe(false);
        });

        it('should return false for two different objects', () => {
            expect(intrinsic.deepEqual({ a: 1, b: 2 }, { a: 1, b: 2, c: 3 })).toBe(false);
        });
    });
});
