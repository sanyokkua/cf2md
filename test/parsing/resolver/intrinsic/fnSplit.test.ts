import { StringUtils } from '../../../../src/common';
import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnSplitIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnSplitIntrinsic', () => {
    let intrinsic: FnSplitIntrinsic;
    let mockIntrinsicUtils: jest.Mocked<IntrinsicUtils>;
    let mockStringUtils: jest.Mocked<StringUtils>;
    let mockContext: jest.Mocked<ResolvingContext>;
    let mockResolveValue: jest.Mock<any, any>;

    beforeEach(() => {
        mockIntrinsicUtils = {
            validateIntrinsic: jest.fn(),
            isIntrinsic: jest.fn(),
            getIntrinsicKey: jest.fn(),
        } as jest.Mocked<IntrinsicUtils>;

        mockStringUtils = {
            splitString: jest.fn(),
            isBlankString: jest.fn(),
            isValidNotBlankString: jest.fn(),
            parseTemplateString: jest.fn(),
            replaceTemplateVariables: jest.fn(),
            joinStrings: jest.fn(),
        } as unknown as jest.Mocked<StringUtils>;

        mockContext = {
            hasParameterName: jest.fn(),
            getParameter: jest.fn(),
            addParameter: jest.fn(),
            resolveValue: jest.fn(),
            originalTemplate: {},
        } as unknown as jest.Mocked<ResolvingContext>;

        mockResolveValue = jest.fn();

        intrinsic = new FnSplitIntrinsic(mockIntrinsicUtils, mockStringUtils);

        jest.clearAllMocks();
    });

    it('should validate the intrinsic object', () => {
        const splitObject = { 'Fn::Split': [':', 'a:b:c'] };
        mockResolveValue.mockReturnValueOnce('a:b:c');
        mockStringUtils.splitString.mockReturnValueOnce(['a', 'b', 'c']);

        intrinsic.resolveValue(splitObject, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(splitObject, CfIntrinsicFunctions.Fn_Split);
    });

    it('should throw an error if the Fn::Split value is not an array', () => {
        const splitObject = { 'Fn::Split': 'not-an-array' };
        expect(() => intrinsic.resolveValue(splitObject, mockContext, mockResolveValue)).toThrow('Expected 2 items in Fn::Split array');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(splitObject, CfIntrinsicFunctions.Fn_Split);
    });

    it('should throw an error if the Fn::Split array does not have exactly 2 elements', () => {
        const splitObjectShort = { 'Fn::Split': [':'] };
        expect(() => intrinsic.resolveValue(splitObjectShort, mockContext, mockResolveValue)).toThrow('Expected 2 items in Fn::Split array');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(splitObjectShort, CfIntrinsicFunctions.Fn_Split);

        const splitObjectLong = { 'Fn::Split': [':', 'a', 'extra'] };
        expect(() => intrinsic.resolveValue(splitObjectLong, mockContext, mockResolveValue)).toThrow('Expected 2 items in Fn::Split array');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(splitObjectLong, CfIntrinsicFunctions.Fn_Split);
    });

    it('should split a pre-resolved string with the given delimiter', () => {
        const splitObject = { 'Fn::Split': [':', 'a:b:c'] };
        mockResolveValue.mockReturnValueOnce('a:b:c');
        mockStringUtils.splitString.mockReturnValue(['a', 'b', 'c']);

        const result = intrinsic.resolveValue(splitObject, mockContext, mockResolveValue);

        expect(mockResolveValue).toHaveBeenCalledTimes(1);
        expect(mockResolveValue).toHaveBeenCalledWith('a:b:c', mockContext);
        expect(mockStringUtils.splitString).toHaveBeenCalledWith('a:b:c', ':');
        expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should split a string resolved via ValueResolverFunc', () => {
        const splitObject = { 'Fn::Split': [':', { Ref: 'SomeString' }] };
        mockResolveValue.mockReturnValue('resolved:string');
        mockStringUtils.splitString.mockReturnValue(['resolved', 'string']);

        const result = intrinsic.resolveValue(splitObject, mockContext, mockResolveValue);

        expect(mockResolveValue).toHaveBeenCalledTimes(1);
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'SomeString' }, mockContext);
        expect(mockStringUtils.splitString).toHaveBeenCalledWith('resolved:string', ':');
        expect(result).toEqual(['resolved', 'string']);
    });

    it('should throw an error if the resolved source string is not a string', () => {
        const splitObject = { 'Fn::Split': [':', { Ref: 'SomeNonString' }] };
        mockResolveValue.mockReturnValue(123);

        expect(() => intrinsic.resolveValue(splitObject, mockContext, mockResolveValue)).toThrow(
            'Expected second argument in Fn::Split to resolve to a string',
        );
        expect(mockResolveValue).toHaveBeenCalledTimes(1);
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'SomeNonString' }, mockContext);
        expect(mockStringUtils.splitString).not.toHaveBeenCalled();
    });

    it('should handle an empty delimiter', () => {
        const splitObject = { 'Fn::Split': ['', 'abc'] };
        mockStringUtils.splitString.mockReturnValue(['a', 'b', 'c']);
        mockResolveValue.mockReturnValue('abc');

        const result = intrinsic.resolveValue(splitObject, mockContext, mockResolveValue);

        expect(mockResolveValue).toHaveBeenCalledTimes(1);
        expect(mockResolveValue).toHaveBeenCalledWith('abc', mockContext);
        expect(mockStringUtils.splitString).toHaveBeenCalledWith('abc', '');
        expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should handle an empty source string', () => {
        const splitObject = { 'Fn::Split': [':', ''] };
        mockStringUtils.splitString.mockReturnValue(['']);
        mockResolveValue.mockReturnValue('');

        const result = intrinsic.resolveValue(splitObject, mockContext, mockResolveValue);

        expect(mockResolveValue).toHaveBeenCalledTimes(1);
        expect(mockResolveValue).toHaveBeenCalledWith('', mockContext);
        expect(mockStringUtils.splitString).toHaveBeenCalledWith('', ':');
        expect(result).toEqual(['']);
    });

    it('should handle a delimiter that is not found in the source string', () => {
        const splitObject = { 'Fn::Split': [',', 'abc'] };
        mockStringUtils.splitString.mockReturnValue(['abc']);
        mockResolveValue.mockReturnValue('abc');

        const result = intrinsic.resolveValue(splitObject, mockContext, mockResolveValue);

        expect(mockResolveValue).toHaveBeenCalledTimes(1);
        expect(mockResolveValue).toHaveBeenCalledWith('abc', mockContext);
        expect(mockStringUtils.splitString).toHaveBeenCalledWith('abc', ',');
        expect(result).toEqual(['abc']);
    });
});
