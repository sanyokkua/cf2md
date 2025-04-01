import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnOrIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnOrIntrinsic', () => {
    let intrinsic: FnOrIntrinsic;
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
            originalTemplate: {
                Conditions: {},
            },
        } as unknown as jest.Mocked<ResolvingContext>;

        mockResolveValue = jest.fn();

        intrinsic = new FnOrIntrinsic(mockIntrinsicUtils);

        jest.clearAllMocks();
        mockContext.originalTemplate.Conditions = {}; // Reset conditions before each test
    });

    it('should validate the intrinsic object', () => {
        const orObject = { 'Fn::Or': [true, false] };
        intrinsic.resolveValue(orObject, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(orObject, CfIntrinsicFunctions.Fn_Or);
    });

    it('should throw an error if the Fn::Or value is not an array', () => {
        const orObject = { 'Fn::Or': 'not-an-array' };
        expect(() => intrinsic.resolveValue(orObject, mockContext, mockResolveValue)).toThrow('fnOr: Fn::Or requires an array of conditions.');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(orObject, CfIntrinsicFunctions.Fn_Or);
    });

    it('should return true if at least one condition is a boolean true', () => {
        const orObject = { 'Fn::Or': [false, true, false] };
        const result = intrinsic.resolveValue(orObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should return false if all conditions are boolean false', () => {
        const orObject = { 'Fn::Or': [false, false, false] };
        const result = intrinsic.resolveValue(orObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should return true if at least one condition is a literal string "true"', () => {
        const orObject = { 'Fn::Or': ['false', 'true', 'false'] };
        const result = intrinsic.resolveValue(orObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should return false if all conditions are literal string "false"', () => {
        const orObject = { 'Fn::Or': ['false', 'false', 'false'] };
        const result = intrinsic.resolveValue(orObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should return true if a condition reference resolves to true', () => {
        const orObject = { 'Fn::Or': ['ConditionFalse', 'ConditionTrue'] };
        mockContext.originalTemplate.Conditions = {
            ConditionFalse: false,
            ConditionTrue: true,
        };
        mockResolveValue.mockReturnValueOnce(false).mockReturnValueOnce(true);
        const result = intrinsic.resolveValue(orObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledWith(false, mockContext);
        expect(mockResolveValue).toHaveBeenCalledWith(true, mockContext);
    });

    it('should return false if all condition references resolve to false', () => {
        const orObject = { 'Fn::Or': ['ConditionFalse1', 'ConditionFalse2'] };
        mockContext.originalTemplate.Conditions = {
            ConditionFalse1: false,
            ConditionFalse2: false,
        };
        mockResolveValue.mockReturnValueOnce(false).mockReturnValueOnce(false);
        const result = intrinsic.resolveValue(orObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledWith(false, mockContext);
        expect(mockResolveValue).toHaveBeenCalledWith(false, mockContext);
    });

    it('should handle a condition reference not found in Conditions section as a nested intrinsic', () => {
        const orObject = { 'Fn::Or': ['NonExistentCondition'] };
        mockResolveValue.mockReturnValueOnce(true);
        const result = intrinsic.resolveValue(orObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledWith('NonExistentCondition', mockContext);
    });

    it('should return true if a nested intrinsic resolves to true', () => {
        const nestedIntrinsic = { 'Fn::Equals': [1, 1] };
        const orObject = { 'Fn::Or': [nestedIntrinsic] };
        mockResolveValue.mockReturnValueOnce(true);
        const result = intrinsic.resolveValue(orObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledWith(nestedIntrinsic, mockContext);
    });

    it('should return false if a nested intrinsic resolves to false and no other conditions are true', () => {
        const nestedIntrinsic = { 'Fn::Equals': [1, 2] };
        const orObject = { 'Fn::Or': [nestedIntrinsic] };
        mockResolveValue.mockReturnValueOnce(false);
        const result = intrinsic.resolveValue(orObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledWith(nestedIntrinsic, mockContext);
    });

    it('should throw an error if a resolved condition is not a boolean', () => {
        const orObject = { 'Fn::Or': ['ConditionWithError'] };
        mockContext.originalTemplate.Conditions = { ConditionWithError: 'not-a-boolean' };
        mockResolveValue.mockReturnValueOnce('not-a-boolean');
        expect(() => intrinsic.resolveValue(orObject, mockContext, mockResolveValue)).toThrow('fnOr: Resolved condition is not a boolean.');
        expect(mockResolveValue).toHaveBeenCalledWith('not-a-boolean', mockContext);
    });

    it('should short-circuit and return true as soon as a condition evaluates to true (boolean)', () => {
        const orObject = { 'Fn::Or': [false, true, { Ref: 'SomeResource' }] };
        const result = intrinsic.resolveValue(orObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should short-circuit and return true as soon as a condition evaluates to true (literal string)', () => {
        const orObject = { 'Fn::Or': ['false', 'true', { Ref: 'SomeResource' }] };
        const result = intrinsic.resolveValue(orObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should short-circuit and return true as soon as a condition reference resolves to true', () => {
        const orObject = { 'Fn::Or': ['ConditionFalse', 'ConditionTrue', { Ref: 'SomeResource' }] };
        mockContext.originalTemplate.Conditions = {
            ConditionFalse: false,
            ConditionTrue: true,
        };
        mockResolveValue.mockReturnValueOnce(false).mockReturnValueOnce(true);
        const result = intrinsic.resolveValue(orObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledWith(false, mockContext);
        expect(mockResolveValue).toHaveBeenCalledWith(true, mockContext);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
    });

    it('should short-circuit and return true as soon as a nested intrinsic resolves to true', () => {
        const nestedIntrinsicTrue = { 'Fn::Equals': [1, 1] };
        const nestedIntrinsicFalse = { 'Fn::Equals': [1, 2] };
        const orObject = { 'Fn::Or': [nestedIntrinsicFalse, nestedIntrinsicTrue, { Ref: 'SomeResource' }] };
        mockResolveValue.mockReturnValueOnce(false).mockReturnValueOnce(true);
        const result = intrinsic.resolveValue(orObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledWith(nestedIntrinsicFalse, mockContext);
        expect(mockResolveValue).toHaveBeenCalledWith(nestedIntrinsicTrue, mockContext);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
    });

    it('should handle an empty array of conditions and return false', () => {
        const orObject = { 'Fn::Or': [] };
        const result = intrinsic.resolveValue(orObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).not.toHaveBeenCalled();
    });
});
