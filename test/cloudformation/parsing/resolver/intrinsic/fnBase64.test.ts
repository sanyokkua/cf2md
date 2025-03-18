import { Base64 } from 'js-base64';
import log from 'loglevel';

import { UnexpectedVariableTypeError } from '../../../../../src/cloudformation/parsing/errors/errors';
import { resolveValue, ResolvingContext } from '../../../../../src/cloudformation/parsing/index';
import {
    fnBase64,
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

describe('fnBase64', () => {
    let traceSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        traceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
        warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
        // Clear mocks for our dependencies.
        (validateThatCorrectIntrinsicCalled as jest.Mock).mockClear();
        (resolveValue as jest.Mock).mockClear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should encode a raw string directly when the Fn::Base64 value is a string', () => {
        // Arrange
        const input = { 'Fn::Base64': 'hello' };
        // Simulate that intrinsic validation passes.
        (validateThatCorrectIntrinsicCalled as jest.Mock).mockImplementation(() => {});

        // Act
        const result = fnBase64(input, fakeCtx);

        // Assert – result is Base64 encoded "hello"
        expect(result).toEqual(Base64.encode('hello'));
        // Check that logging was invoked.
        expect(traceSpy).toHaveBeenCalledWith('fnBase64 is called');
        expect(traceSpy).toHaveBeenCalledWith('fnBase64: Raw value is a string, encoding directly');
        expect(traceSpy).toHaveBeenCalledWith('fnBase64: Result is:', Base64.encode('hello'));
        // Verify that intrinsic validation was called with the correct parameters.
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::Base64');
    });

    it('should resolve a non-string raw value and encode the resolved string', () => {
        // Arrange
        const input = { 'Fn::Base64': 123 }; // raw value is a number (not a string)
        (validateThatCorrectIntrinsicCalled as jest.Mock).mockImplementation(() => {});
        // Stub resolveValue to return a string.
        (resolveValue as jest.Mock).mockReturnValue('resolvedValue');

        // Act
        const result = fnBase64(input, fakeCtx);

        // Assert – result equals Base64.encode("resolvedValue")
        expect(result).toEqual(Base64.encode('resolvedValue'));
        // Verify that resolveValue was called with the raw value and context.
        expect(resolveValue).toHaveBeenCalledWith(123, fakeCtx);
        expect(traceSpy).toHaveBeenCalledWith('fnBase64: Result is:', Base64.encode('resolvedValue'));
    });

    it('should throw an UnexpectedVariableTypeError when the resolved value is not a string', () => {
        // Arrange
        const input = { 'Fn::Base64': 456 };
        (validateThatCorrectIntrinsicCalled as jest.Mock).mockImplementation(() => {});
        // Stub resolveValue to return a non-string value.
        (resolveValue as jest.Mock).mockReturnValue(789);

        // Act & Assert
        expect(() => fnBase64(input, fakeCtx)).toThrow(UnexpectedVariableTypeError);
        expect(warnSpy).toHaveBeenCalledWith('fnBase64: Resolved value is not a string', 789);
    });

    it('should propagate errors thrown by validateThatCorrectIntrinsicCalled', () => {
        // Arrange
        const input = { 'Fn::Base64': 'hello' };
        const intrinsicError = new Error('Intrinsic validation error');
        (validateThatCorrectIntrinsicCalled as jest.Mock).mockImplementation(() => {
            throw intrinsicError;
        });

        // Act & Assert
        expect(() => fnBase64(input, fakeCtx)).toThrow(intrinsicError);
    });
});
