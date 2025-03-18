import {
    MissingIntrinsicKeyError,
    UnexpectedVariableTypeError,
    WrongIntrinsicFormatError,
} from '../../../../../src/cloudformation/parsing/errors/errors';
import { resolveValue, ResolvingContext } from '../../../../../src/cloudformation/parsing/index';
import {
    fnSub,
    validateThatCorrectIntrinsicCalled,
} from '../../../../../src/cloudformation/parsing/resolver/intrinsic';
import { UnexpectedParamError } from '../../../../../src/errors/cloudformation-errors';
import { parseTemplateString, replaceTemplateVariables } from '../../../../../src/utils/string-utils';

jest.mock('../../../../../src/cloudformation/parsing/resolver/intrinsic/utils/intrinsic-utils', () => ({
    validateThatCorrectIntrinsicCalled: jest.fn(),
}));

jest.mock('../../../../../src/cloudformation/parsing/index', () => ({
    resolveValue: jest.fn(),
}));

jest.mock('../../../../../src/utils/string-utils', () => ({
    parseTemplateString: jest.fn(),
    replaceTemplateVariables: jest.fn(),
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

describe('fnSub', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('when Fn::Sub value is a string', () => {
        it('should replace template variables and return the replaced string when all variables are in cache', () => {
            const input = { 'Fn::Sub': 'Hello ${World}' };
            // Simulate that parseTemplateString extracts the variable "World"
            (parseTemplateString as jest.Mock).mockReturnValue(['World']);
            // Simulate that the context has "World" in cache
            fakeCtx.hasParameterName = jest.fn().mockReturnValue(true);
            fakeCtx.getParameter = jest.fn().mockReturnValue('Earth');
            // Simulate that the replacement function returns the expected result
            (replaceTemplateVariables as jest.Mock).mockReturnValue('Hello Earth');

            const result = fnSub(input, fakeCtx);
            expect(result).toBe('Hello Earth');
            expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Sub');
            expect(parseTemplateString).toHaveBeenCalledWith('Hello ${World}');
            expect(replaceTemplateVariables).toHaveBeenCalledWith('Hello ${World}', { World: 'Earth' });
        });

        it('should throw MissingIntrinsicKeyError when a variable is not found in cache', () => {
            const input = { 'Fn::Sub': 'Hello ${World}' };
            (parseTemplateString as jest.Mock).mockReturnValue(['World']);
            fakeCtx.hasParameterName = jest.fn().mockReturnValue(false);

            expect(() => fnSub(input, fakeCtx)).toThrow(MissingIntrinsicKeyError);
            expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Sub');
        });
    });

    describe('when Fn::Sub value is an array', () => {
        it('should return the replaced string when provided with a valid array input', () => {
            const input = { 'Fn::Sub': ['Hello ${Name}!', { Name: 'John' }] };
            // Simulate resolveValue: for each variable value, return the same value.
            (resolveValue as jest.Mock).mockImplementation((val) => val);
            (replaceTemplateVariables as jest.Mock).mockReturnValue('Hello John!');

            const result = fnSub(input, fakeCtx);
            expect(result).toBe('Hello John!');
            expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Sub');
            expect(resolveValue).toHaveBeenCalledWith('John', fakeCtx);
            expect(replaceTemplateVariables).toHaveBeenCalledWith('Hello ${Name}!', { Name: 'John' });
        });

        it('should throw WrongIntrinsicFormatError if the array length is not 2', () => {
            const input = { 'Fn::Sub': ['Hello ${Name}!'] };
            expect(() => fnSub(input, fakeCtx)).toThrow(WrongIntrinsicFormatError);
            expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Sub');
        });

        it('should throw UnexpectedVariableTypeError if the first element is not a string', () => {
            const input = { 'Fn::Sub': [123, { Name: 'John' }] };
            expect(() => fnSub(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
            expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Sub');
        });

        it('should throw UnexpectedVariableTypeError if the second element is not an object', () => {
            const input = { 'Fn::Sub': ['Hello ${Name}!', 'NotAnObject'] };
            expect(() => fnSub(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
            expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Sub');
        });

        it('should throw UnexpectedParamError if a variable value resolves to undefined or null', () => {
            const input = { 'Fn::Sub': ['Hello ${Name}!', { Name: 'John' }] };
            // Simulate that resolveValue returns undefined for "John"
            (resolveValue as jest.Mock).mockReturnValue(undefined);
            expect(() => fnSub(input, fakeCtx)).toThrow(UnexpectedParamError);
            expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Sub');
        });
    });

    describe('when Fn::Sub value is neither a string nor an array', () => {
        it('should throw WrongIntrinsicFormatError', () => {
            const input = { 'Fn::Sub': 123 };
            expect(() => fnSub(input, fakeCtx)).toThrow(WrongIntrinsicFormatError);
            expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Sub');
        });
    });
});
