import {
    MissingIntrinsicKeyError,
    UnexpectedVariableTypeError,
    WrongIntrinsicFormatError,
} from '../../../../../src/cloudformation/parsing/errors/errors';
import { resolveValue, ResolvingContext } from '../../../../../src/cloudformation/parsing/index';
import {
    fnGetAtt,
    validateThatCorrectIntrinsicCalled,
} from '../../../../../src/cloudformation/parsing/resolver/intrinsic';
import { resourceSpecificResolverFunc } from '../../../../../src/cloudformation/parsing/resolver/resource-spec-func-resolver';

jest.mock('../../../../../src/cloudformation/parsing/resolver/intrinsic/utils/intrinsic-utils', () => ({
    validateThatCorrectIntrinsicCalled: jest.fn(),
}));

jest.mock('../../../../../src/cloudformation/parsing/index', () => ({
    resolveValue: jest.fn(),
}));

jest.mock('../../../../../src/cloudformation/parsing/resolver/resource-spec-func-resolver', () => ({
    resourceSpecificResolverFunc: jest.fn(),
}));

// Create a dummy ResolvingContext with minimal implementation.
const fakeCtx: ResolvingContext = {
    originalTemplate: {
        Resources: {
            // @ts-ignore
            MyResource: {
                Type: 'MyType',
            },
        },
    },
    lookupMapPreProcessed: {},
    generatedIds: new Set(),
    lookupMapDynamic: {},
    currentPath: [],
    addName: jest.fn(),
    popName: jest.fn(),
    getCurrentPath: jest.fn(() => ''),
    hasParameterName: jest.fn(),
    getParameter: jest.fn(),
    addParameter: jest.fn(),
    addGeneratedId: jest.fn(),
    isIdExists: jest.fn(() => false),
    getRegion: jest.fn(() => 'us-east-1'),
    getPartition: jest.fn(() => 'aws'),
    getAccountId: jest.fn(() => '123456789012'),
    getAZs: jest.fn(() => ['us-east-1a', 'us-east-1b']),
};

describe('fnGetAtt', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        // By default, resolveValue returns its input.
        (resolveValue as jest.Mock).mockImplementation((x) => x);
    });

    it('should throw WrongIntrinsicFormatError if Fn::GetAtt is not an array', () => {
        const input = { 'Fn::GetAtt': 'not an array' };
        expect(() => fnGetAtt(input, fakeCtx)).toThrow(WrongIntrinsicFormatError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::GetAtt');
    });

    it('should throw WrongIntrinsicFormatError if Fn::GetAtt array length is not 2', () => {
        const input = { 'Fn::GetAtt': ['OnlyOneItem'] };
        expect(() => fnGetAtt(input, fakeCtx)).toThrow(WrongIntrinsicFormatError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::GetAtt');
    });

    it('should throw UnexpectedVariableTypeError if first parameter resolved is not a string', () => {
        // Simulate resolveValue returning non-string for the first parameter.
        (resolveValue as jest.Mock)
            .mockImplementationOnce(() => 123) // for logicalResourceName
            .mockImplementationOnce((x) => x); // for attribute name
        const input = { 'Fn::GetAtt': ['MyResource', 'Attribute'] };
        expect(() => fnGetAtt(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::GetAtt');
    });

    it('should throw UnexpectedVariableTypeError if second parameter resolved is not a string', () => {
        (resolveValue as jest.Mock)
            .mockImplementationOnce((x) => x) // first parameter returns a valid string
            .mockImplementationOnce(() => false); // second parameter returns non-string
        const input = { 'Fn::GetAtt': ['MyResource', 'Attribute'] };
        expect(() => fnGetAtt(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::GetAtt');
    });

    it('should return cached parameter if attributeKey exists in context', () => {
        const attrLogicalId = 'MyResource';
        const attrParamKey = 'Attribute';
        // const attributeKey = `${attrLogicalId}:${attrParamKey}`;
        (resolveValue as jest.Mock)
            .mockImplementationOnce(() => attrLogicalId)
            .mockImplementationOnce(() => attrParamKey);
        fakeCtx.hasParameterName = jest.fn().mockReturnValue(true);
        fakeCtx.getParameter = jest.fn().mockReturnValue('cachedValue');
        const input = { 'Fn::GetAtt': [attrLogicalId, attrParamKey] };
        const result = fnGetAtt(input, fakeCtx);
        expect(result).toBe('cachedValue');
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::GetAtt');
    });

    it('should resolve resource attribute when resource exists and parameter is not cached', () => {
        const attrLogicalId = 'MyResource';
        const attrParamKey = 'Attribute';
        const attributeKey = `${attrLogicalId}:${attrParamKey}`;
        (resolveValue as jest.Mock)
            .mockImplementationOnce(() => attrLogicalId)
            .mockImplementationOnce(() => attrParamKey);
        fakeCtx.hasParameterName = jest.fn().mockReturnValue(false);
        fakeCtx.getParameter = jest.fn();
        const fakeResolvedValue = 'resolvedValue';
        // Set up the resource-specific resolver mock.
        const fakeGetAttFunc = jest.fn().mockReturnValue(fakeResolvedValue);
        const fakeResolver = { getAttFunc: fakeGetAttFunc };
        (resourceSpecificResolverFunc as jest.Mock).mockReturnValue(fakeResolver);
        const input = { 'Fn::GetAtt': [attrLogicalId, attrParamKey] };
        const result = fnGetAtt(input, fakeCtx);
        expect(result).toBe(fakeResolvedValue);
        expect(fakeCtx.addParameter).toHaveBeenCalledWith(attributeKey, fakeResolvedValue);
        expect(resourceSpecificResolverFunc).toHaveBeenCalledWith('MyType');
        expect(fakeGetAttFunc).toHaveBeenCalledWith(
            'MyType',
            attrParamKey,
            attrLogicalId,
            fakeCtx.originalTemplate.Resources[attrLogicalId],
            fakeCtx,
        );
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::GetAtt');
    });

    it('should throw MissingIntrinsicKeyError when resource does not exist in Resources', () => {
        const attrLogicalId = 'NonExistentResource';
        const attrParamKey = 'Attribute';
        (resolveValue as jest.Mock)
            .mockImplementationOnce(() => attrLogicalId)
            .mockImplementationOnce(() => attrParamKey);
        fakeCtx.hasParameterName = jest.fn().mockReturnValue(false);
        fakeCtx.originalTemplate.Resources = {}; // no resources present
        const input = { 'Fn::GetAtt': [attrLogicalId, attrParamKey] };
        expect(() => fnGetAtt(input, fakeCtx)).toThrow(MissingIntrinsicKeyError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::GetAtt');
    });
});
