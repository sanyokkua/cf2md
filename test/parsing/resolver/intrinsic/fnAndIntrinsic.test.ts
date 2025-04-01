import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnAndIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { CloudFormationTemplate } from '../../../../src/parsing/types/cloudformation-model';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnAndIntrinsic', () => {
    let intrinsic: FnAndIntrinsic;
    let mockIntrinsicUtils: jest.Mocked<IntrinsicUtils>;
    let mockContext: jest.Mocked<ResolvingContext>;
    let mockResolveValue: jest.Mock<any, any>;
    let originalTemplate: CloudFormationTemplate;

    beforeEach(() => {
        mockIntrinsicUtils = {
            validateIntrinsic: jest.fn(),
            isIntrinsic: jest.fn(),
        } as unknown as jest.Mocked<IntrinsicUtils>;

        originalTemplate = {
            Conditions: {
                ConditionTrue: { Type: 'Condition' },
                ConditionFalse: { Type: 'Condition' },
                NonBooleanCondition: { Type: 'Condition' },
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
        intrinsic = new FnAndIntrinsic(mockIntrinsicUtils);
    });

    it('should call validateIntrinsic with correct parameters', () => {
        const andObject = { 'Fn::And': [true, false] };
        intrinsic.resolveValue(andObject, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(andObject, CfIntrinsicFunctions.Fn_And);
    });

    it('should return true when all conditions are true', () => {
        const andObject = { 'Fn::And': [true, true] };
        const result = intrinsic.resolveValue(andObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
    });

    it('should return false when at least one condition is false', () => {
        const andObject = { 'Fn::And': [true, false] };
        const result = intrinsic.resolveValue(andObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
    });

    it('should handle string literal true conditions', () => {
        const andObject = { 'Fn::And': ['true', 'True', 'TRUE'] };
        const result = intrinsic.resolveValue(andObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
    });

    it('should handle string literal false conditions and short-circuit', () => {
        const andObject = { 'Fn::And': [true, 'false', true] };
        const result = intrinsic.resolveValue(andObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
    });

    it('should resolve conditions from the Conditions section and return true', () => {
        const andObject = { 'Fn::And': ['ConditionTrue', 'ConditionTrue'] };
        mockResolveValue.mockReturnValue(true);
        const result = intrinsic.resolveValue(andObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, originalTemplate.Conditions!['ConditionTrue'], mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, originalTemplate.Conditions!['ConditionTrue'], mockContext);
    });

    it('should resolve conditions from the Conditions section and return false', () => {
        const andObject = { 'Fn::And': ['ConditionTrue', 'ConditionFalse'] };
        mockResolveValue.mockImplementation((conditionName: any) => {
            return conditionName === originalTemplate.Conditions!['ConditionTrue'];
        });
        const result = intrinsic.resolveValue(andObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, originalTemplate.Conditions!['ConditionTrue'], mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, originalTemplate.Conditions!['ConditionFalse'], mockContext);
    });

    it('should resolve nested intrinsics and return true', () => {
        const nestedIntrinsic = { 'Fn::Equals': [1, 1] };
        const andObject = { 'Fn::And': [nestedIntrinsic, nestedIntrinsic] };
        mockResolveValue.mockReturnValue(true);
        const result = intrinsic.resolveValue(andObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, nestedIntrinsic, mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, nestedIntrinsic, mockContext);
    });

    it('should resolve nested intrinsics and return false', () => {
        const nestedIntrinsicTrue = { 'Fn::Equals': [1, 1] };
        const nestedIntrinsicFalse = { 'Fn::Equals': [1, 2] };
        const andObject = { 'Fn::And': [nestedIntrinsicTrue, nestedIntrinsicFalse] };
        mockResolveValue.mockImplementation((intrinsicObject: any) => {
            return intrinsicObject === nestedIntrinsicTrue;
        });
        const result = intrinsic.resolveValue(andObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, nestedIntrinsicTrue, mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, nestedIntrinsicFalse, mockContext);
    });

    it('should handle a mix of condition types resolving to true', () => {
        const nestedIntrinsic = { 'Fn::Equals': [1, 1] };
        const andObject = { 'Fn::And': [true, 'true', 'ConditionTrue', nestedIntrinsic] };
        mockResolveValue.mockReturnValue(true);
        const result = intrinsic.resolveValue(andObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, originalTemplate.Conditions!['ConditionTrue'], mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, nestedIntrinsic, mockContext);
    });

    it('should handle a mix of condition types resolving to false', () => {
        const nestedIntrinsic = { 'Fn::Equals': [1, 1] };
        const andObject = { 'Fn::And': [true, 'true', nestedIntrinsic, 'ConditionFalse'] };
        mockResolveValue.mockImplementation((condition: any) => {
            return condition !== originalTemplate.Conditions!['ConditionFalse'];
        });
        const result = intrinsic.resolveValue(andObject, mockContext, mockResolveValue);
        expect(result).toBe(false);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, nestedIntrinsic, mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, originalTemplate.Conditions!['ConditionFalse'], mockContext);
    });

    it('should throw an error if the input object is not a valid intrinsic', () => {
        const invalidObject = { NotFnAnd: [true, false] };
        mockIntrinsicUtils.validateIntrinsic.mockImplementation(() => {
            throw new Error('ErrMsg');
        });
        expect(() => intrinsic.resolveValue(invalidObject, mockContext, mockResolveValue)).toThrow('ErrMsg');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(invalidObject, CfIntrinsicFunctions.Fn_And);
    });

    it('should throw an error if the value of Fn::And is not an array', () => {
        const invalidObject = { 'Fn::And': 'not an array' };
        expect(() => intrinsic.resolveValue(invalidObject, mockContext, mockResolveValue)).toThrow('fnAnd: Fn::And requires an array of conditions.');
    });

    it('should throw an error if a condition resolves to a non-boolean value', () => {
        const andObject = { 'Fn::And': [true, { Ref: 'SomeResource' }] };
        mockResolveValue.mockReturnValue('not a boolean');
        expect(() => intrinsic.resolveValue(andObject, mockContext, mockResolveValue)).toThrow('fnAnd: Resolved condition is not a boolean.');
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'SomeResource' }, mockContext);
    });

    it('should throw an error if a string condition is not "true", "false", or a condition name and does not resolve to a boolean', () => {
        const andObject = { 'Fn::And': ['invalid-condition'] };
        mockResolveValue.mockReturnValue('not a boolean');
        expect(() => intrinsic.resolveValue(andObject, mockContext, mockResolveValue)).toThrow(
            'fnAnd: Resolved nested intrinsic condition is not a boolean.',
        );
        expect(mockResolveValue).toHaveBeenCalledWith('invalid-condition', mockContext);
    });

    it('should handle the case where a string condition is not "true", "false", or a condition name and resolves to a boolean', () => {
        const andObject = { 'Fn::And': ['custom-condition'] };
        mockResolveValue.mockReturnValue(true);
        const result = intrinsic.resolveValue(andObject, mockContext, mockResolveValue);
        expect(result).toBe(true);
        expect(mockResolveValue).toHaveBeenCalledWith('custom-condition', mockContext);
    });

    it('should throw an error if a condition from the Conditions section resolves to a non-boolean value', () => {
        const andObject = { 'Fn::And': ['NonBooleanCondition'] };
        mockResolveValue.mockReturnValue('not a boolean');
        expect(() => intrinsic.resolveValue(andObject, mockContext, mockResolveValue)).toThrow(
            'fnAnd: Resolved condition from template "NonBooleanCondition" is not a boolean.',
        );
        expect(mockResolveValue).toHaveBeenCalledWith(originalTemplate.Conditions!['NonBooleanCondition'], mockContext);
    });
});
