import { splitString } from 'coreutilsts';
import {
    UnexpectedVariableTypeError,
    WrongIntrinsicFormatError,
} from '../../../../../src/cloudformation/parsing/errors/errors';
import { resolveValue, ResolvingContext } from '../../../../../src/cloudformation/parsing/index';
import {
    fnSplit,
    validateThatCorrectIntrinsicCalled,
} from '../../../../../src/cloudformation/parsing/resolver/intrinsic';

jest.mock('../../../../../src/cloudformation/parsing/resolver/intrinsic/utils/intrinsic-utils', () => ({
    validateThatCorrectIntrinsicCalled: jest.fn(),
}));

jest.mock('../../../../../src/cloudformation/parsing/index', () => ({
    resolveValue: jest.fn(),
}));

jest.mock('coreutilsts', () => ({
    splitString: jest.fn(),
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

describe('fnSplit', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        (resolveValue as jest.Mock).mockReset();
        (validateThatCorrectIntrinsicCalled as jest.Mock).mockReset();
        (splitString as jest.Mock).mockReset();
    });

    it('should correctly split the source string with the given delimiter', () => {
        // Arrange: valid input with a string delimiter and source string.
        const input = { 'Fn::Split': ['-', 'a-b-c'] };
        // Simulate resolveValue returns its input (for source string).
        (resolveValue as jest.Mock).mockImplementation((val) => val);
        // Mock splitString to return the expected split array.
        (splitString as jest.Mock).mockReturnValue(['a', 'b', 'c']);

        // Act:
        const result = fnSplit(input, fakeCtx);

        // Assert:
        expect(result).toEqual(['a', 'b', 'c']);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Split');
        expect(splitString).toHaveBeenCalledWith('a-b-c', '-');
    });

    it('should throw WrongIntrinsicFormatError if Fn::Split value is not an array', () => {
        const input = { 'Fn::Split': 'not an array' };
        expect(() => fnSplit(input, fakeCtx)).toThrow(WrongIntrinsicFormatError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Split');
    });

    it('should throw WrongIntrinsicFormatError if Fn::Split array length is not 2', () => {
        const input = { 'Fn::Split': ['-', 'a-b-c', 'extra'] };
        expect(() => fnSplit(input, fakeCtx)).toThrow(WrongIntrinsicFormatError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Split');
    });

    it('should throw UnexpectedVariableTypeError if delimiter is not a string', () => {
        const input = { 'Fn::Split': [123, 'a-b-c'] };
        expect(() => fnSplit(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Split');
    });

    it('should throw UnexpectedVariableTypeError if source string does not resolve to a string', () => {
        const input = { 'Fn::Split': ['-', { not: 'a string' }] };
        // Simulate resolveValue returning a non-string value.
        (resolveValue as jest.Mock).mockReturnValue({ not: 'a string' });
        expect(() => fnSplit(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Split');
    });
});
