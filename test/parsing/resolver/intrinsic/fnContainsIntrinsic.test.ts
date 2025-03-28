import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnContainsIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnContainsIntrinsic', () => {
    let intrinsic: FnContainsIntrinsic;
    let mockIntrinsicUtils: jest.Mocked<IntrinsicUtils>;
    let mockContext: jest.Mocked<ResolvingContext>;
    let mockResolveValue: jest.Mock<any, any>;

    beforeEach(() => {
        jest.resetAllMocks();
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
        mockResolveValue.mockImplementation((arg, _obj: any) => arg);
        intrinsic = new FnContainsIntrinsic(mockIntrinsicUtils);
    });

    it('should call validateIntrinsic with correct parameters', () => {
        const containsObject = { 'Fn::Contains': [['a', 'b'], 'a'] };
        intrinsic.resolveValue(containsObject, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(containsObject, CfIntrinsicFunctions.Fn_Contains);
    });

    it('should return true if the list contains the search value (pre-resolved, strict equality)', () => {
        const containsObject = { 'Fn::Contains': [['a', 'b'], 'a'] };
        const result = intrinsic.resolveValue(containsObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, ['a', 'b'], mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, 'a', mockContext);
    });

    it('should return false if the list does not contain the search value (pre-resolved, strict equality)', () => {
        const containsObject = { 'Fn::Contains': [['a', 'b'], 'c'] };
        const result = intrinsic.resolveValue(containsObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, ['a', 'b'], mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, 'c', mockContext);
    });

    it('should return true if the list contains the search value (resolved list, strict equality)', () => {
        const containsObject = { 'Fn::Contains': [{ Ref: 'List' }, 'a'] };
        mockResolveValue.mockImplementation((arg) => {
            if (arg === containsObject['Fn::Contains'][0]) {
                return ['a', 'b'];
            }
            return arg;
        });
        const result = intrinsic.resolveValue(containsObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, { Ref: 'List' }, mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, 'a', mockContext);
    });

    it('should return true if the list contains the search value (resolved search value, strict equality)', () => {
        const containsObject = { 'Fn::Contains': [['a', 'b'], { Ref: 'Search' }] };
        mockResolveValue.mockImplementation((arg) => {
            if (arg === containsObject['Fn::Contains'][1]) {
                return 'a';
            }
            return arg;
        });
        const result = intrinsic.resolveValue(containsObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, ['a', 'b'], mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, { Ref: 'Search' }, mockContext);
    });

    it('should return true if the list contains the search value (both resolved, strict equality)', () => {
        const containsObject = { 'Fn::Contains': [{ Ref: 'List' }, { Ref: 'Search' }] };
        mockResolveValue.mockImplementation((arg) => {
            if (arg === containsObject['Fn::Contains'][0]) {
                return ['a', 'b'];
            }
            if (arg === containsObject['Fn::Contains'][1]) {
                return 'b';
            }
            return arg;
        });
        const result = intrinsic.resolveValue(containsObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, { Ref: 'List' }, mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, { Ref: 'Search' }, mockContext);
    });

    it('should return true if the list contains the search object (pre-resolved, deep equality)', () => {
        const list = [{ key: 'value' }, { key: 'other' }];
        const search = { key: 'value' };
        const containsObject = { 'Fn::Contains': [list, search] };
        const result = intrinsic.resolveValue(containsObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
    });

    it('should return true if the list contains the search object (resolved list, deep equality)', () => {
        const search = { key: 'value' };
        const containsObject = { 'Fn::Contains': [{ Ref: 'List' }, search] };
        mockResolveValue.mockImplementation((arg) => {
            if (arg === containsObject['Fn::Contains'][0]) {
                return [{ key: 'value' }, { key: 'other' }];
            }
            return arg;
        });
        const result = intrinsic.resolveValue(containsObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'List' }, mockContext);
    });

    it('should return true if the list contains the search object (resolved search object, deep equality)', () => {
        const list = [{ key: 'value' }, { key: 'other' }];
        const containsObject = { 'Fn::Contains': [list, { Ref: 'Search' }] };
        mockResolveValue.mockImplementation((arg) => {
            if (arg === containsObject['Fn::Contains'][1]) {
                return { key: 'value' };
            }
            return arg;
        });
        const result = intrinsic.resolveValue(containsObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'Search' }, mockContext);
    });

    it('should return false if the list does not contain the search object (pre-resolved, deep equality)', () => {
        const list = [{ key: 'value' }, { key: 'other' }];
        const search = { key: 'different' };
        const containsObject = { 'Fn::Contains': [list, search] };
        const result = intrinsic.resolveValue(containsObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
    });

    it('should throw an error if the input object is not a valid intrinsic', () => {
        const invalidObject = { NotFnContains: [['a'], 'a'] };
        mockIntrinsicUtils.validateIntrinsic.mockImplementation(() => {
            throw new Error('ErrMsg');
        });
        expect(() => intrinsic.resolveValue(invalidObject, mockContext, mockResolveValue)).toThrow('ErrMsg');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(invalidObject, CfIntrinsicFunctions.Fn_Contains);
    });

    it('should throw an error if the value of Fn::Contains is not an array', () => {
        const invalidObject = { 'Fn::Contains': 'not an array' };
        expect(() => intrinsic.resolveValue(invalidObject, mockContext, mockResolveValue)).toThrow('fnContains: Fn::Contains requires an array.');
    });

    it('should throw an error if the first parameter does not resolve to an array', () => {
        const containsObject = { 'Fn::Contains': [{ Ref: 'NotList' }, 'a'] };
        mockResolveValue.mockReturnValue('not an array');
        expect(() => intrinsic.resolveValue(containsObject, mockContext, mockResolveValue)).toThrow(
            'fnContains: The first parameter must resolve to an array.',
        );
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'NotList' }, mockContext);
    });

    it('should handle empty list and return false', () => {
        const containsObject = { 'Fn::Contains': [[], 'a'] };
        const result = intrinsic.resolveValue(containsObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
    });

    it('should handle empty search value and return true if empty string is in the list', () => {
        const containsObject = { 'Fn::Contains': [['', 'b'], ''] };
        const result = intrinsic.resolveValue(containsObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
    });

    it('should handle null and undefined values in the list', () => {
        const containsObjectWithNull = { 'Fn::Contains': [[null, 'a'], null] };
        const resultWithNull = intrinsic.resolveValue(containsObjectWithNull, mockContext, mockResolveValue);
        expect(resultWithNull).toBe(true);

        const containsObjectWithUndefined = { 'Fn::Contains': [[undefined, 'a'], undefined] };
        const resultWithUndefined = intrinsic.resolveValue(containsObjectWithUndefined, mockContext, mockResolveValue);
        expect(resultWithUndefined).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(4);
    });
});
