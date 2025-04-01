import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnImportValueIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnImportValueIntrinsic', () => {
    let intrinsic: FnImportValueIntrinsic;
    let mockIntrinsicUtils: jest.Mocked<IntrinsicUtils>;
    let mockContext: jest.Mocked<ResolvingContext>;
    let mockResolveValue: jest.Mock<any, any>;

    beforeEach(() => {
        mockIntrinsicUtils = {
            validateIntrinsic: jest.fn(),
            isIntrinsic: jest.fn(),
            deepEqual: jest.fn(),
        } as unknown as jest.Mocked<IntrinsicUtils>;

        mockContext = {
            hasParameterName: jest.fn(),
            getParameter: jest.fn(),
            addParameter: jest.fn(),
            resolveValue: jest.fn(),
            originalTemplate: {},
        } as unknown as jest.Mocked<ResolvingContext>;

        mockResolveValue = jest.fn();

        intrinsic = new FnImportValueIntrinsic(mockIntrinsicUtils);

        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    it('should resolve a string value directly', () => {
        const importValueObject = { 'Fn::ImportValue': 'stringValue' };
        const result = intrinsic.resolveValue(importValueObject, mockContext, mockResolveValue);

        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(importValueObject, CfIntrinsicFunctions.Fn_ImportValue);
        expect(mockResolveValue).not.toHaveBeenCalled();
        expect(result).toBe('stringValue');
    });

    it('should resolve a value using the resolver function and return the string result', () => {
        const importValueObject = { 'Fn::ImportValue': { Ref: 'SomeOutput' } };
        const resolvedString = 'resolvedStringValue';
        mockResolveValue.mockReturnValue(resolvedString);

        const result = intrinsic.resolveValue(importValueObject, mockContext, mockResolveValue);

        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(importValueObject, CfIntrinsicFunctions.Fn_ImportValue);
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'SomeOutput' }, mockContext);
        expect(result).toBe(resolvedString);
    });

    it('should throw an error if the resolved value is not a string', () => {
        const importValueObject = { 'Fn::ImportValue': { Ref: 'SomeOutput' } };
        const resolvedNonString = 123;
        mockResolveValue.mockReturnValue(resolvedNonString);

        expect(() => intrinsic.resolveValue(importValueObject, mockContext, mockResolveValue)).toThrow('Resolved value is not a string');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(importValueObject, CfIntrinsicFunctions.Fn_ImportValue);
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'SomeOutput' }, mockContext);
    });

    it('should call validateIntrinsic with the correct parameters', () => {
        const importValueObject = { 'Fn::ImportValue': 'test' };
        intrinsic.resolveValue(importValueObject, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(importValueObject, CfIntrinsicFunctions.Fn_ImportValue);
    });

    it('should not call resolveValue if the value is already a string', () => {
        const importValueObject = { 'Fn::ImportValue': 'directString' };
        intrinsic.resolveValue(importValueObject, mockContext, mockResolveValue);
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should handle a different type of resolvable object', () => {
        const importValueObject = { 'Fn::ImportValue': { 'Fn::GetAtt': ['Resource', 'Attribute'] } };
        const resolvedValue = 'attributeValue';
        mockResolveValue.mockReturnValue(resolvedValue);

        intrinsic.resolveValue(importValueObject, mockContext, mockResolveValue);

        expect(mockResolveValue).toHaveBeenCalledWith({ 'Fn::GetAtt': ['Resource', 'Attribute'] }, mockContext);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(importValueObject, CfIntrinsicFunctions.Fn_ImportValue);
    });
});
