import { joinStrings } from 'coreutilsts';
import {
    UnexpectedVariableTypeError,
    WrongIntrinsicFormatError,
} from '../../../../../src/cloudformation/parsing/errors/errors';
import { resolveValue, ResolvingContext } from '../../../../../src/cloudformation/parsing/index';
import {
    fnJoin,
    validateThatCorrectIntrinsicCalled,
} from '../../../../../src/cloudformation/parsing/resolver/intrinsic';

jest.mock('../../../../../src/cloudformation/parsing/resolver/intrinsic/utils/intrinsic-utils', () => ({
    validateThatCorrectIntrinsicCalled: jest.fn(),
}));

jest.mock('../../../../../src/cloudformation/parsing/index', () => ({
    resolveValue: jest.fn(),
}));

jest.mock('coreutilsts', () => ({
    joinStrings: jest.fn((arr: string[], delimiter: string) => arr.join(delimiter)),
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

describe('fnJoin', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        (resolveValue as jest.Mock).mockReset();
        (validateThatCorrectIntrinsicCalled as jest.Mock).mockReset();
        // By default, simulate resolveValue as identity.
        (resolveValue as jest.Mock).mockImplementation((val) => val);
    });

    it('should join resolved string values with the provided delimiter', () => {
        (joinStrings as jest.Mock).mockImplementation(() => 'a,b,c');
        const input = { 'Fn::Join': [',', ['a', 'b', 'c']] };
        const result = fnJoin(input, fakeCtx);
        expect(result).toBe('a,b,c');
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Join');
        expect(joinStrings).toHaveBeenCalledWith(['a', 'b', 'c'], ',');
    });

    it('should throw WrongIntrinsicFormatError if the Fn::Join value is not an array', () => {
        const input = { 'Fn::Join': 'notAnArray' };
        expect(() => fnJoin(input, fakeCtx)).toThrow(WrongIntrinsicFormatError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Join');
    });

    it('should throw WrongIntrinsicFormatError if the Fn::Join array length is not 2', () => {
        const input = { 'Fn::Join': [','] };
        expect(() => fnJoin(input, fakeCtx)).toThrow(WrongIntrinsicFormatError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Join');
    });

    it('should throw UnexpectedVariableTypeError if the delimiter is not a string', () => {
        const input = { 'Fn::Join': [123, ['a', 'b']] };
        expect(() => fnJoin(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Join');
    });

    it('should throw UnexpectedVariableTypeError if the second element is not an array', () => {
        const input = { 'Fn::Join': [',', 'notAnArray'] };
        expect(() => fnJoin(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Join');
    });

    it('should throw UnexpectedVariableTypeError if any resolved value is not a string', () => {
        const input = { 'Fn::Join': [',', ['a', 123]] };
        // For the first element, return a string; for the second, simulate a non-string value.
        (resolveValue as jest.Mock)
            .mockImplementationOnce((val) => val) // 'a'
            .mockImplementationOnce(() => 123); // 123 (non-string)
        expect(() => fnJoin(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Join');
    });
});
