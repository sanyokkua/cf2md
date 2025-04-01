import { Base64 } from 'js-base64';
import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnBase64Intrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnBase64Intrinsic', () => {
    let intrinsic: FnBase64Intrinsic;
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
            originalTemplate: {},
            hasParameterName: jest.fn(),
            getParameter: jest.fn(),
            addParameter: jest.fn(),
        } as unknown as jest.Mocked<ResolvingContext>;

        mockResolveValue = jest.fn();
        intrinsic = new FnBase64Intrinsic(mockIntrinsicUtils);
    });

    it('should call validateIntrinsic with correct parameters', () => {
        const base64Object = { 'Fn::Base64': 'test-string' };
        intrinsic.resolveValue(base64Object, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(base64Object, CfIntrinsicFunctions.Fn_Base64);
    });

    it('should base64 encode a pre-resolved string value', () => {
        const base64Object = { 'Fn::Base64': 'test-string' };
        const result = intrinsic.resolveValue(base64Object, mockContext, mockResolveValue);
        expect(result).toBe(Base64.encode('test-string'));
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should call resolveValue and base64 encode the resolved string', () => {
        const unresolvedObject = { 'Fn::Base64': { Ref: 'SomeValue' } };
        mockResolveValue.mockReturnValue('resolved-string');
        const result = intrinsic.resolveValue(unresolvedObject, mockContext, mockResolveValue);
        expect(result).toBe(Base64.encode('resolved-string'));
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'SomeValue' }, mockContext);
    });

    it('should throw an error if the resolved value is not a string', () => {
        const unresolvedObject = { 'Fn::Base64': { Ref: 'SomeValue' } };
        mockResolveValue.mockReturnValue(123);
        expect(() => intrinsic.resolveValue(unresolvedObject, mockContext, mockResolveValue)).toThrow(
            'Expected a string value for Fn::Base64 after resolution',
        );
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'SomeValue' }, mockContext);
    });

    it('should throw an error if the input object is not a valid intrinsic', () => {
        const invalidObject = { NotFnBase64: 'test-string' };
        mockIntrinsicUtils.validateIntrinsic.mockImplementation(() => {
            throw new Error('ErrMsg');
        });
        expect(() => intrinsic.resolveValue(invalidObject, mockContext, mockResolveValue)).toThrow('ErrMsg');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(invalidObject, CfIntrinsicFunctions.Fn_Base64);
    });

    it('should handle empty string input', () => {
        const base64Object = { 'Fn::Base64': '' };
        const result = intrinsic.resolveValue(base64Object, mockContext, mockResolveValue);
        expect(result).toBe(Base64.encode(''));
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should handle input that needs resolution to an empty string', () => {
        const unresolvedObject = { 'Fn::Base64': { Ref: 'EmptyValue' } };
        mockResolveValue.mockReturnValue('');
        const result = intrinsic.resolveValue(unresolvedObject, mockContext, mockResolveValue);
        expect(result).toBe(Base64.encode(''));
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'EmptyValue' }, mockContext);
    });

    it('should handle special characters in the pre-resolved string', () => {
        const base64Object = { 'Fn::Base64': 'test with spaces and !@#$%' };
        const result = intrinsic.resolveValue(base64Object, mockContext, mockResolveValue);
        expect(result).toBe(Base64.encode('test with spaces and !@#$%'));
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should handle special characters in the resolved string', () => {
        const unresolvedObject = { 'Fn::Base64': { Ref: 'SpecialChars' } };
        mockResolveValue.mockReturnValue('resolved with spaces and ^&*()_+');
        const result = intrinsic.resolveValue(unresolvedObject, mockContext, mockResolveValue);
        expect(result).toBe(Base64.encode('resolved with spaces and ^&*()_+'));
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'SpecialChars' }, mockContext);
    });
});
