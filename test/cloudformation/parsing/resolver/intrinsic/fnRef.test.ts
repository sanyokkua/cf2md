import {
    MissingIntrinsicKeyError,
    UnexpectedVariableTypeError,
} from '../../../../../src/cloudformation/parsing/errors/errors';
import { resolveValue, ResolvingContext } from '../../../../../src/cloudformation/parsing/index';
import {
    fnRef,
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
    originalTemplate: { Resources: {} } as any,
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

describe('fnRef', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        (resolveValue as jest.Mock).mockReset();
        (validateThatCorrectIntrinsicCalled as jest.Mock).mockReset();
        (resourceSpecificResolverFunc as jest.Mock).mockReset();
    });

    // --- Branch 1: value.Ref is a string ---

    it('should return the cached parameter if key from Ref is a string and found in context', () => {
        const input = { Ref: 'myKey' };
        // Simulate that the key is found in the context (cached)
        fakeCtx.hasParameterName = jest.fn().mockReturnValue(true);
        fakeCtx.getParameter = jest.fn().mockReturnValue('cachedValue');

        const result = fnRef(input, fakeCtx);
        expect(result).toBe('cachedValue');
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Ref');
    });

    it('should resolve the resource if key from Ref is a string, not cached, and exists in Resources', () => {
        const input = { Ref: 'myKey' };
        fakeCtx.hasParameterName = jest.fn().mockReturnValue(false);
        fakeCtx.originalTemplate.Resources = {
            // @ts-ignore
            myKey: { Type: 'MyResourceType', prop: 'someValue' },
        };

        const fakeResolved = 'resolvedValue';
        const fakeRefFunc = jest.fn().mockReturnValue(fakeResolved);
        (resourceSpecificResolverFunc as jest.Mock).mockReturnValue({ refFunc: fakeRefFunc });

        const result = fnRef(input, fakeCtx);
        expect(result).toBe(fakeResolved);
        expect(fakeCtx.addParameter).toHaveBeenCalledWith('myKey', fakeResolved);
        expect(resourceSpecificResolverFunc).toHaveBeenCalledWith('MyResourceType');
        expect(fakeRefFunc).toHaveBeenCalledWith(
            'MyResourceType',
            'myKey',
            fakeCtx.originalTemplate.Resources.myKey,
            fakeCtx,
        );
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Ref');
    });

    it('should throw MissingIntrinsicKeyError if key from Ref is a string, not cached, and not found in Resources', () => {
        const input = { Ref: 'missingKey' };
        fakeCtx.hasParameterName = jest.fn().mockReturnValue(false);
        fakeCtx.originalTemplate.Resources = {}; // "missingKey" is not present

        expect(() => fnRef(input, fakeCtx)).toThrow(MissingIntrinsicKeyError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Ref');
    });

    // --- Branch 2: value.Ref is not a string ---

    it('should throw UnexpectedVariableTypeError if resolved key is not a string', () => {
        const input = { Ref: { some: 'value' } }; // value.Ref is not a string
        // Simulate resolveValue returning a non-string
        (resolveValue as jest.Mock).mockReturnValue(123);
        expect(() => fnRef(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Ref');
    });

    it('should return the cached parameter if resolved key is a string and found in context', () => {
        const input = { Ref: { some: 'value' } }; // value.Ref is not a string
        // Simulate resolveValue returning a valid string key
        (resolveValue as jest.Mock).mockReturnValue('resolvedKey');
        fakeCtx.hasParameterName = jest.fn().mockReturnValue(true);
        fakeCtx.getParameter = jest.fn().mockReturnValue('cachedResolvedValue');

        const result = fnRef(input, fakeCtx);
        expect(result).toBe('cachedResolvedValue');
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Ref');
    });

    it('should resolve the resource if resolved key is a string, not cached, and exists in Resources', () => {
        const input = { Ref: { some: 'value' } }; // value.Ref is not a string
        (resolveValue as jest.Mock).mockReturnValue('resolvedKey');
        fakeCtx.hasParameterName = jest.fn().mockReturnValue(false);
        fakeCtx.originalTemplate.Resources = {
            // @ts-ignore
            resolvedKey: { Type: 'MyResourceType', prop: 'someValue' },
        };

        const fakeResolved = 'resolvedResourceValue';
        const fakeRefFunc = jest.fn().mockReturnValue(fakeResolved);
        (resourceSpecificResolverFunc as jest.Mock).mockReturnValue({ refFunc: fakeRefFunc });

        const result = fnRef(input, fakeCtx);
        expect(result).toBe(fakeResolved);
        expect(fakeCtx.addParameter).toHaveBeenCalledWith('resolvedKey', fakeResolved);
        expect(resourceSpecificResolverFunc).toHaveBeenCalledWith('MyResourceType');
        expect(fakeRefFunc).toHaveBeenCalledWith(
            'MyResourceType',
            'resolvedKey',
            fakeCtx.originalTemplate.Resources.resolvedKey,
            fakeCtx,
        );
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Ref');
    });

    it('should throw MissingIntrinsicKeyError if resolved key is a string, not cached, and not found in Resources', () => {
        const input = { Ref: { some: 'value' } };
        (resolveValue as jest.Mock).mockReturnValue('nonExistentKey');
        fakeCtx.hasParameterName = jest.fn().mockReturnValue(false);
        fakeCtx.originalTemplate.Resources = {}; // key is not present

        expect(() => fnRef(input, fakeCtx)).toThrow(MissingIntrinsicKeyError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Ref');
    });
});
