import { StringUtils } from '../../../../src/common';
import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnJoinIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnJoinIntrinsic', () => {
    let intrinsic: FnJoinIntrinsic;
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
            joinStrings: jest.fn(),
            isBlankString: jest.fn(),
            isValidNotBlankString: jest.fn(),
            parseTemplateString: jest.fn(),
            replaceTemplateVariables: jest.fn(),
            splitString: jest.fn(),
        } as unknown as jest.Mocked<StringUtils>;

        mockContext = {
            hasParameterName: jest.fn(),
            getParameter: jest.fn(),
            addParameter: jest.fn(),
            resolveValue: jest.fn(),
            originalTemplate: {},
        } as unknown as jest.Mocked<ResolvingContext>;

        mockResolveValue = jest.fn();

        intrinsic = new FnJoinIntrinsic(mockIntrinsicUtils, mockStringUtils);

        jest.clearAllMocks();
    });

    it('should validate the intrinsic object', () => {
        const joinObject = { 'Fn::Join': [':', ['a', 'b']] };
        mockResolveValue.mockReturnValueOnce('a').mockReturnValueOnce('b');
        intrinsic.resolveValue(joinObject, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(joinObject, CfIntrinsicFunctions.Fn_Join);
    });

    it('should throw an error if the Fn::Join value is not an array', () => {
        const joinObject = { 'Fn::Join': 'not-an-array' };
        expect(() => intrinsic.resolveValue(joinObject, mockContext, mockResolveValue)).toThrow('Expected 2 items in Fn::Join array');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(joinObject, CfIntrinsicFunctions.Fn_Join);
    });

    it('should throw an error if the Fn::Join array does not have exactly 2 elements', () => {
        const joinObjectShort = { 'Fn::Join': [':'] };
        expect(() => intrinsic.resolveValue(joinObjectShort, mockContext, mockResolveValue)).toThrow('Expected 2 items in Fn::Join array');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(joinObjectShort, CfIntrinsicFunctions.Fn_Join);

        const joinObjectLong = { 'Fn::Join': [':', ['a', 'b'], 'extra'] };
        expect(() => intrinsic.resolveValue(joinObjectLong, mockContext, mockResolveValue)).toThrow('Expected 2 items in Fn::Join array');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(joinObjectLong, CfIntrinsicFunctions.Fn_Join);
    });

    it('should throw an error if the second element of Fn::Join is not an array', () => {
        const joinObject = { 'Fn::Join': [':', 'not-an-array'] };
        expect(() => intrinsic.resolveValue(joinObject, mockContext, mockResolveValue)).toThrow('Expected second item in Fn::Join to be an array');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(joinObject, CfIntrinsicFunctions.Fn_Join);
    });

    it('should join an array of pre-resolved strings with the given delimiter', () => {
        const joinObject = { 'Fn::Join': [':', ['a', 'b', 'c']] };
        mockStringUtils.joinStrings.mockReturnValue('a:b:c');
        mockResolveValue.mockReturnValueOnce('a').mockReturnValueOnce('b').mockReturnValueOnce('c');
        const result = intrinsic.resolveValue(joinObject, mockContext, mockResolveValue);

        expect(mockResolveValue).toHaveBeenCalledTimes(3);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, 'a', mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, 'b', mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(3, 'c', mockContext);
        expect(mockStringUtils.joinStrings).toHaveBeenCalledWith(['a', 'b', 'c'], ':');
        expect(result).toBe('a:b:c');
    });

    it('should join an array with mixed pre-resolved and resolvable values', () => {
        const joinObject = { 'Fn::Join': [':', ['a', { Ref: 'SomeResource' }, 'c']] };
        mockResolveValue.mockReturnValueOnce('a').mockReturnValueOnce('resolved-resource').mockReturnValueOnce('c');
        mockStringUtils.joinStrings.mockReturnValue('a:resolved-resource:c');

        const result = intrinsic.resolveValue(joinObject, mockContext, mockResolveValue);

        expect(mockResolveValue).toHaveBeenCalledTimes(3);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, 'a', mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, { Ref: 'SomeResource' }, mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(3, 'c', mockContext);
        expect(mockStringUtils.joinStrings).toHaveBeenCalledWith(['a', 'resolved-resource', 'c'], ':');
        expect(result).toBe('a:resolved-resource:c');
    });

    it('should join an empty array with the given delimiter', () => {
        const joinObject = { 'Fn::Join': [':', []] };
        mockStringUtils.joinStrings.mockReturnValue('');
        mockResolveValue.mockReturnValue(undefined); // Should not be called

        const result = intrinsic.resolveValue(joinObject, mockContext, mockResolveValue);

        expect(mockResolveValue).not.toHaveBeenCalled();
        expect(mockStringUtils.joinStrings).toHaveBeenCalledWith([], ':');
        expect(result).toBe('');
    });

    it('should join an array with an empty delimiter', () => {
        const joinObject = { 'Fn::Join': ['', ['a', 'b']] };
        mockResolveValue.mockReturnValueOnce('a').mockReturnValueOnce('b');
        mockStringUtils.joinStrings.mockReturnValue('ab');

        const result = intrinsic.resolveValue(joinObject, mockContext, mockResolveValue);

        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockStringUtils.joinStrings).toHaveBeenCalledWith(['a', 'b'], '');
        expect(result).toBe('ab');
    });

    it('should throw an error if a resolved value is not a string', () => {
        const joinObject = { 'Fn::Join': [':', ['a', { Ref: 'SomeResource' }, 'c']] };
        mockResolveValue.mockReturnValueOnce('a').mockReturnValueOnce(123).mockReturnValueOnce('c');

        expect(() => intrinsic.resolveValue(joinObject, mockContext, mockResolveValue)).toThrow('Resolved value is not a string');
        expect(mockResolveValue).toHaveBeenCalledTimes(3);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, 'a', mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, { Ref: 'SomeResource' }, mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(3, 'c', mockContext);
        expect(mockStringUtils.joinStrings).not.toHaveBeenCalled();
    });
});
