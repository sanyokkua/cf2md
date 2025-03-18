import {
    UnexpectedVariableTypeError,
    WrongIntrinsicFormatError,
} from '../../../../../src/cloudformation/parsing/errors/errors';
import { resolveValue, ResolvingContext } from '../../../../../src/cloudformation/parsing/index';
import {
    fnSelect,
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

describe('fnSelect', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        (resolveValue as jest.Mock).mockReset();
        (validateThatCorrectIntrinsicCalled as jest.Mock).mockReset();
    });

    it('should return the correct element for valid input', () => {
        const input = { 'Fn::Select': ['1', ['a', 'b', 'c']] };
        // Simulate resolveValue: first call returns "1", second call returns the array.
        (resolveValue as jest.Mock)
            .mockImplementationOnce((val, _ctx) => val) // indexRaw: "1"
            .mockImplementationOnce((val, _ctx) => val); // values: ["a", "b", "c"]
        const result = fnSelect(input, fakeCtx);
        expect(result).toBe('b');
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Select');
    });

    it('should throw WrongIntrinsicFormatError if Fn::Select is not an array', () => {
        const input = { 'Fn::Select': 'not an array' };
        expect(() => fnSelect(input, fakeCtx)).toThrow(WrongIntrinsicFormatError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Select');
    });

    it('should throw WrongIntrinsicFormatError if Fn::Select array length is not 2', () => {
        const input = { 'Fn::Select': ['1'] };
        expect(() => fnSelect(input, fakeCtx)).toThrow(WrongIntrinsicFormatError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Select');
    });

    it('should throw UnexpectedVariableTypeError if index cannot be parsed as a number', () => {
        const input = { 'Fn::Select': ['abc', ['a', 'b', 'c']] };
        (resolveValue as jest.Mock)
            .mockImplementationOnce((val, _ctx) => val) // indexRaw: "abc"
            .mockImplementationOnce((val, _ctx) => val); // values: ["a", "b", "c"]
        expect(() => fnSelect(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Select');
    });

    it('should throw UnexpectedVariableTypeError if resolved values does not resolve to an array', () => {
        const input = { 'Fn::Select': ['0', 'not an array'] };
        (resolveValue as jest.Mock)
            .mockImplementationOnce((val, _ctx) => val) // indexRaw: "0"
            .mockImplementationOnce((val, _ctx) => val); // values: "not an array"
        expect(() => fnSelect(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Select');
    });

    it('should throw WrongIntrinsicFormatError if index is negative', () => {
        const input = { 'Fn::Select': ['-1', ['a', 'b']] };
        (resolveValue as jest.Mock)
            .mockImplementationOnce((val, _ctx) => val) // indexRaw: "-1"
            .mockImplementationOnce((val, _ctx) => val); // values: ["a", "b"]
        expect(() => fnSelect(input, fakeCtx)).toThrow(WrongIntrinsicFormatError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Select');
    });

    it('should throw WrongIntrinsicFormatError if index is equal to array length', () => {
        const input = { 'Fn::Select': ['2', ['a', 'b']] };
        (resolveValue as jest.Mock)
            .mockImplementationOnce((val, _ctx) => val) // indexRaw: "2"
            .mockImplementationOnce((val, _ctx) => val); // values: ["a", "b"]
        expect(() => fnSelect(input, fakeCtx)).toThrow(WrongIntrinsicFormatError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Select');
    });

    it('should throw WrongIntrinsicFormatError if index is greater than array length', () => {
        const input = { 'Fn::Select': ['5', ['a', 'b']] };
        (resolveValue as jest.Mock)
            .mockImplementationOnce((val, _ctx) => val) // indexRaw: "5"
            .mockImplementationOnce((val, _ctx) => val); // values: ["a", "b"]
        expect(() => fnSelect(input, fakeCtx)).toThrow(WrongIntrinsicFormatError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Select');
    });
});
