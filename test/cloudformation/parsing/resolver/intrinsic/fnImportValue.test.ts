import { UnexpectedVariableTypeError } from '../../../../../src/cloudformation/parsing/errors/errors';
import { resolveValue, ResolvingContext } from '../../../../../src/cloudformation/parsing/index';
import {
    fnImportValue,
    validateThatCorrectIntrinsicCalled,
} from '../../../../../src/cloudformation/parsing/resolver/intrinsic';

jest.mock('../../../../../src/cloudformation/parsing/resolver/intrinsic/utils/intrinsic-utils', () => ({
    validateThatCorrectIntrinsicCalled: jest.fn(),
}));

jest.mock('../../../../../src/cloudformation/parsing/index', () => ({
    resolveValue: jest.fn(),
}));

// Create a dummy ResolvingContext with minimal implementation.
const fakeCtx: ResolvingContext = {
    originalTemplate: {} as any,
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

describe('fnImportValue', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        (resolveValue as jest.Mock).mockReset();
        (validateThatCorrectIntrinsicCalled as jest.Mock).mockReset();
    });

    it('should return the string value if "Fn::ImportValue" is a string', () => {
        const input = { 'Fn::ImportValue': 'simpleStringValue' };
        const result = fnImportValue(input, fakeCtx);
        expect(result).toBe('simpleStringValue');
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::ImportValue');
        // resolveValue is not used when the value is a string.
        expect(resolveValue).not.toHaveBeenCalled();
    });

    it('should resolve and return a string if the resolved value is a string', () => {
        const input = { 'Fn::ImportValue': { some: 'object' } };
        (resolveValue as jest.Mock).mockReturnValue('resolvedString');
        const result = fnImportValue(input, fakeCtx);
        expect(result).toBe('resolvedString');
        expect(resolveValue).toHaveBeenCalledWith({ some: 'object' }, fakeCtx);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::ImportValue');
    });

    it('should throw UnexpectedVariableTypeError if the resolved value is not a string', () => {
        const input = { 'Fn::ImportValue': { some: 'object' } };
        (resolveValue as jest.Mock).mockReturnValue(123);
        expect(() => fnImportValue(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
        expect(resolveValue).toHaveBeenCalledWith({ some: 'object' }, fakeCtx);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::ImportValue');
    });
});
