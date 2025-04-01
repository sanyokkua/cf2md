import { StringUtils } from '../../../../src/common';
import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnGetAZsIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnGetAZsIntrinsic', () => {
    let intrinsic: FnGetAZsIntrinsic;
    let mockIntrinsicUtils: jest.Mocked<IntrinsicUtils>;
    let mockStringUtils: jest.Mocked<StringUtils>;
    let mockContext: jest.Mocked<ResolvingContext>;
    let mockResolveValue: jest.Mock<any, any>;

    beforeEach(() => {
        mockIntrinsicUtils = {
            validateIntrinsic: jest.fn(),
            isIntrinsic: jest.fn(),
            deepEqual: jest.fn(),
        } as unknown as jest.Mocked<IntrinsicUtils>;

        mockStringUtils = {
            isBlankString: jest.fn(),
        } as unknown as jest.Mocked<StringUtils>;

        mockContext = {
            originalTemplate: {},
            hasParameterName: jest.fn(),
            getParameter: jest.fn(),
            addParameter: jest.fn(),
            getAZs: jest.fn(),
        } as unknown as jest.Mocked<ResolvingContext>;

        mockResolveValue = jest.fn();
        mockResolveValue.mockImplementation((arg) => arg);
        intrinsic = new FnGetAZsIntrinsic(mockIntrinsicUtils, mockStringUtils);
    });

    it('should call validateIntrinsic with correct parameters', () => {
        const getAZsObject = { 'Fn::GetAZs': 'us-east-1' };
        intrinsic.resolveValue(getAZsObject, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(getAZsObject, CfIntrinsicFunctions.Fn_GetAZs);
    });

    it('should return default AZs when no region is specified', () => {
        const getAZsObject = { 'Fn::GetAZs': '' };
        mockStringUtils.isBlankString.mockReturnValue(true);
        mockContext.getAZs.mockReturnValue(['az1', 'az2', 'az3']);

        const result = intrinsic.resolveValue(getAZsObject, mockContext, mockResolveValue);
        expect(result).toEqual(['az1', 'az2', 'az3']);
        expect(mockResolveValue).toHaveBeenCalledWith('', mockContext);
        expect(mockContext.getAZs).toHaveBeenCalledWith();
    });

    it('should return default AZs when region resolves to an empty string', () => {
        const getAZsObject = { 'Fn::GetAZs': { Ref: 'RegionParam' } };
        mockResolveValue.mockReturnValue('');
        mockStringUtils.isBlankString.mockReturnValue(true);
        mockContext.getAZs.mockReturnValue(['az-a', 'az-b']);

        const result = intrinsic.resolveValue(getAZsObject, mockContext, mockResolveValue);
        expect(result).toEqual(['az-a', 'az-b']);
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'RegionParam' }, mockContext);
        expect(mockContext.getAZs).toHaveBeenCalledWith();
    });

    it('should return default AZs when region resolves to a non-string value', () => {
        const getAZsObject = { 'Fn::GetAZs': { Ref: 'RegionParam' } };
        mockResolveValue.mockReturnValue(123);
        mockStringUtils.isBlankString.mockReturnValue(false); // Should not be called in this branch
        mockContext.getAZs.mockReturnValue(['az-x', 'az-y', 'az-z']);

        const result = intrinsic.resolveValue(getAZsObject, mockContext, mockResolveValue);
        expect(result).toEqual(['az-x', 'az-y', 'az-z']);
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'RegionParam' }, mockContext);
        expect(mockContext.getAZs).toHaveBeenCalledWith();
    });

    it('should return AZs for the specified region (pre-resolved)', () => {
        const getAZsObject = { 'Fn::GetAZs': 'us-west-2' };
        mockStringUtils.isBlankString.mockReturnValue(false);
        mockContext.getAZs.mockReturnValue(['az-west-2a', 'az-west-2b']);

        const result = intrinsic.resolveValue(getAZsObject, mockContext, mockResolveValue);
        expect(result).toEqual(['az-west-2a', 'az-west-2b']);
        expect(mockResolveValue).toHaveBeenCalledWith('us-west-2', mockContext);
        expect(mockContext.getAZs).toHaveBeenCalledWith('us-west-2');
    });

    it('should return AZs for the specified region (resolved)', () => {
        const getAZsObject = { 'Fn::GetAZs': { Ref: 'RegionName' } };
        mockResolveValue.mockReturnValue('eu-central-1');
        mockStringUtils.isBlankString.mockReturnValue(false);
        mockContext.getAZs.mockReturnValue(['az-central-1a', 'az-central-1b', 'az-central-1c']);

        const result = intrinsic.resolveValue(getAZsObject, mockContext, mockResolveValue);
        expect(result).toEqual(['az-central-1a', 'az-central-1b', 'az-central-1c']);
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'RegionName' }, mockContext);
        expect(mockContext.getAZs).toHaveBeenCalledWith('eu-central-1');
    });

    it('should throw an error if the input object is not a valid intrinsic', () => {
        const invalidObject = { NotFnGetAZs: 'us-east-1' };
        mockResolveValue.mockImplementation(() => {
            throw new Error('invalidObject');
        });
        expect(() => intrinsic.resolveValue(invalidObject, mockContext, mockResolveValue)).toThrow('invalidObject');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(invalidObject, CfIntrinsicFunctions.Fn_GetAZs);
    });

    it('should handle undefined region and return default AZs', () => {
        const getAZsObject = { 'Fn::GetAZs': undefined };
        mockResolveValue.mockReturnValue(undefined);
        mockStringUtils.isBlankString.mockReturnValue(true);
        mockContext.getAZs.mockReturnValue(['az-u1', 'az-u2']);

        const result = intrinsic.resolveValue(getAZsObject, mockContext, mockResolveValue);
        expect(result).toEqual(['az-u1', 'az-u2']);
        expect(mockResolveValue).toHaveBeenCalledWith(undefined, mockContext);
        expect(mockContext.getAZs).toHaveBeenCalledWith();
    });

    it('should handle null region and return default AZs', () => {
        const getAZsObject = { 'Fn::GetAZs': null };
        mockResolveValue.mockReturnValue(null);
        mockStringUtils.isBlankString.mockReturnValue(true);
        mockContext.getAZs.mockReturnValue(['az-n1', 'az-n2', 'az-n3']);

        const result = intrinsic.resolveValue(getAZsObject, mockContext, mockResolveValue);
        expect(result).toEqual(['az-n1', 'az-n2', 'az-n3']);
        expect(mockResolveValue).toHaveBeenCalledWith(null, mockContext);
        expect(mockContext.getAZs).toHaveBeenCalledWith();
    });
});
