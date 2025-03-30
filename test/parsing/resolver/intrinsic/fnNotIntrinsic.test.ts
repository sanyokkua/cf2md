import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnNotIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnNotIntrinsic', () => {
    let intrinsic: FnNotIntrinsic;
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
            originalTemplate: {
                Conditions: {},
            },
        } as unknown as jest.Mocked<ResolvingContext>;

        mockResolveValue = jest.fn();

        intrinsic = new FnNotIntrinsic(mockIntrinsicUtils);

        jest.clearAllMocks();
        mockContext.originalTemplate.Conditions = {}; // Reset conditions before each test
    });

    it('should validate the intrinsic object', () => {
        const notObject = { 'Fn::Not': [true] };
        intrinsic.resolveValue(notObject, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(notObject, CfIntrinsicFunctions.Fn_Not);
    });

    it('should return the negation of a direct boolean true', () => {
        const notObject = { 'Fn::Not': [true] };
        const result = intrinsic.resolveValue(notObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should return the negation of a direct boolean false', () => {
        const notObject = { 'Fn::Not': [false] };
        const result = intrinsic.resolveValue(notObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should return the negation of a literal string "true"', () => {
        const notObject = { 'Fn::Not': ['true'] };
        const result = intrinsic.resolveValue(notObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should return the negation of a literal string "false"', () => {
        const notObject = { 'Fn::Not': ['false'] };
        const result = intrinsic.resolveValue(notObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should return the negation of a literal string "True"', () => {
        const notObject = { 'Fn::Not': ['True'] };
        const result = intrinsic.resolveValue(notObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should return the negation of a literal string "False"', () => {
        const notObject = { 'Fn::Not': ['False'] };
        const result = intrinsic.resolveValue(notObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should resolve a condition reference to false and return true', () => {
        const notObject = { 'Fn::Not': ['MyCondition'] };
        mockContext.originalTemplate.Conditions = { MyCondition: true };
        mockResolveValue.mockReturnValue(true);
        const result = intrinsic.resolveValue(notObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledWith(true, mockContext);
    });

    it('should resolve a condition reference to true and return false', () => {
        const notObject = { 'Fn::Not': ['MyCondition'] };
        mockContext.originalTemplate.Conditions = { MyCondition: false };
        mockResolveValue.mockReturnValue(false);
        const result = intrinsic.resolveValue(notObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledWith(false, mockContext);
    });

    it('should throw an error if a resolved condition reference is not a boolean', () => {
        const notObject = { 'Fn::Not': ['MyCondition'] };
        mockContext.originalTemplate.Conditions = { MyCondition: 'not-a-boolean' };
        mockResolveValue.mockReturnValue('not-a-boolean');
        expect(() => intrinsic.resolveValue(notObject, mockContext, mockResolveValue)).toThrow('fnNot: Resolved condition is not a boolean.');
        expect(mockResolveValue).toHaveBeenCalledWith('not-a-boolean', mockContext);
    });

    it('should handle a nested intrinsic resolving to false and return true', () => {
        const nestedIntrinsic = { 'Fn::Equals': [1, 2] };
        const notObject = { 'Fn::Not': [nestedIntrinsic] };
        mockIntrinsicUtils.isIntrinsic.mockReturnValueOnce(true);
        mockResolveValue.mockReturnValueOnce(false);
        const result = intrinsic.resolveValue(notObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledWith(nestedIntrinsic, mockContext);
    });

    it('should handle a nested intrinsic resolving to true and return false', () => {
        const nestedIntrinsic = { 'Fn::Equals': [1, 1] };
        const notObject = { 'Fn::Not': [nestedIntrinsic] };
        mockIntrinsicUtils.isIntrinsic.mockReturnValueOnce(true);
        mockResolveValue.mockReturnValueOnce(true);
        const result = intrinsic.resolveValue(notObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledWith(nestedIntrinsic, mockContext);
    });

    it('should throw an error if a nested intrinsic does not resolve to a boolean', () => {
        const nestedIntrinsic = { 'Fn::Ref': 'SomeResource' };
        const notObject = { 'Fn::Not': [nestedIntrinsic] };
        mockIntrinsicUtils.isIntrinsic.mockReturnValueOnce(true);
        mockResolveValue.mockReturnValueOnce('not-a-boolean');
        expect(() => intrinsic.resolveValue(notObject, mockContext, mockResolveValue)).toThrow(
            'fnNot: Resolved nested intrinsic did not yield a boolean.',
        );
        expect(mockResolveValue).toHaveBeenCalledWith(nestedIntrinsic, mockContext);
    });

    it('should throw an error for an incorrect type if the condition is not a boolean, string, or a condition reference/intrinsic', () => {
        const notObject = { 'Fn::Not': [123] };
        mockIntrinsicUtils.isIntrinsic.mockReturnValue(false);
        expect(() => intrinsic.resolveValue(notObject, mockContext, mockResolveValue)).toThrow(
            'fnNot: Incorrect type for Fn::Not. Cannot resolve the condition value.',
        );
    });

    it('should handle condition reference not found in Conditions section', () => {
        const notObject = { 'Fn::Not': ['NonExistentCondition'] };
        expect(() => intrinsic.resolveValue(notObject, mockContext, mockResolveValue)).toThrow(
            'fnNot: Incorrect type for Fn::Not. Cannot resolve the condition value.',
        );
    });
});
