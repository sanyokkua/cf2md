import { resolveValue, ResolvingContext } from '../../../../../src/cloudformation/parsing/index';
import {
    fnToJsonString,
    validateThatCorrectIntrinsicCalled,
} from '../../../../../src/cloudformation/parsing/resolver/intrinsic';
import { UnexpectedParamError } from '../../../../../src/errors/cloudformation-errors';

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

describe('fnToJsonString', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return the string if Fn::ToJsonString property is a string', () => {
        const input = { 'Fn::ToJsonString': 'myString' };
        const result = fnToJsonString(input, fakeCtx);
        expect(result).toBe('myString');
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::ToJsonString');
    });

    it('should return the resolved string if resolveValue returns a string', () => {
        const input = { 'Fn::ToJsonString': { some: 'object' } };
        (resolveValue as jest.Mock).mockReturnValue('resolvedString');
        const result = fnToJsonString(input, fakeCtx);
        expect(result).toBe('resolvedString');
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::ToJsonString');
        expect(resolveValue).toHaveBeenCalledWith(input, fakeCtx);
    });

    it('should return a JSON string if resolveValue returns an object', () => {
        const input = { 'Fn::ToJsonString': { some: 'object' } };
        const resolvedObj = { key: 'value' };
        (resolveValue as jest.Mock).mockReturnValue(resolvedObj);
        const result = fnToJsonString(input, fakeCtx);
        expect(result).toBe(JSON.stringify(resolvedObj));
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::ToJsonString');
    });

    it('should return a JSON string if resolveValue returns an array', () => {
        const input = { 'Fn::ToJsonString': { some: 'object' } };
        const resolvedArr = [1, 2, 3];
        (resolveValue as jest.Mock).mockReturnValue(resolvedArr);
        const result = fnToJsonString(input, fakeCtx);
        expect(result).toBe(JSON.stringify(resolvedArr));
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::ToJsonString');
    });

    it('should throw UnexpectedParamError if resolved value is not a string or object/array', () => {
        const input = { 'Fn::ToJsonString': { some: 'object' } };
        (resolveValue as jest.Mock).mockReturnValue(123);
        expect(() => fnToJsonString(input, fakeCtx)).toThrow(UnexpectedParamError);
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(input, 'Fn::ToJsonString');
    });
});
