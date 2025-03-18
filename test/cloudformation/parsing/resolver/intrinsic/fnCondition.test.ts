import log from 'loglevel';
import { resolveValue, ResolvingContext } from '../../../../../src/cloudformation';
import { UnexpectedVariableTypeError } from '../../../../../src/cloudformation/parsing/errors/errors';
import {
    fnAnd,
    fnContains,
    fnEquals,
    fnIf,
    fnNot,
    fnOr,
    isIntrinsic,
    validateThatCorrectIntrinsicCalled,
} from '../../../../../src/cloudformation/parsing/resolver/intrinsic';

// Extend the existing mock to include isIntrinsic.
jest.mock('../../../../../src/cloudformation/parsing/resolver/intrinsic/utils/intrinsic-utils', () => ({
    validateThatCorrectIntrinsicCalled: jest.fn(),
    isIntrinsic: jest.fn(() => [false, '']),
}));

jest.mock('../../../../../src/cloudformation/parsing/resolver/value-resolver', () => ({
    resolveValue: jest.fn(),
}));

// const infoSpy = jest.spyOn(log, 'info').mockImplementation(() => {});
// const debugSpy = jest.spyOn(log, 'debug').mockImplementation(() => {});
// const warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
// const errorSpy = jest.spyOn(log, 'error').mockImplementation(() => {});
const traceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});

describe('fnConditions', () => {
    let fakeCtx: ResolvingContext;
    beforeEach(() => {
        fakeCtx = {
            originalTemplate: {
                Resources: {},
                Mappings: {
                    MapName: {
                        Key1: {
                            Key2: 'ValueFound',
                        },
                    },
                },
                Conditions: {},
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
    });

    describe('fnNot', () => {
        beforeEach(() => {
            // Reset mocks before each test.
            (resolveValue as jest.Mock).mockReset();
            (validateThatCorrectIntrinsicCalled as jest.Mock).mockReset();
            (isIntrinsic as jest.Mock).mockReset();

            // By default, resolveValue returns its input (simulate a pass-through).
            (resolveValue as jest.Mock).mockImplementation((x) => x);
            // By default, isIntrinsic returns false.
            (isIntrinsic as jest.Mock).mockReturnValue([false, '']);
        });

        // Test Case 1: Explicit boolean true returns false.
        it('should negate an explicit boolean true to false', () => {
            const node = { 'Fn::Not': [true] };
            const result = fnNot(node, fakeCtx);
            expect(result).toBe(false);
            expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(node, 'Fn::Not');
        });

        // Test Case 2: Explicit boolean false returns true.
        it('should negate an explicit boolean false to true', () => {
            const node = { 'Fn::Not': [false] };
            const result = fnNot(node, fakeCtx);
            expect(result).toBe(true);
        });

        // Test Case 3: Literal string "true" returns false.
        it('should negate literal string "true" to false', () => {
            const node = { 'Fn::Not': ['true'] };
            const result = fnNot(node, fakeCtx);
            expect(result).toBe(false);
        });

        // Test Case 4: Literal string "false" returns true.
        it('should negate literal string "false" to true', () => {
            const node = { 'Fn::Not': ['false'] };
            const result = fnNot(node, fakeCtx);
            expect(result).toBe(true);
        });

        // Test Case 5: Condition reference from Conditions section.
        it('should resolve a condition reference from the Conditions section', () => {
            fakeCtx.originalTemplate.Conditions = { MyCond: true };
            const node = { 'Fn::Not': ['MyCond'] };

            // In this branch, the function fetches the condition from Conditions,
            // calls resolveValue (which acts as identity by default) and negates it.
            const result = fnNot(node, fakeCtx);
            expect(result).toBe(false);
        });

        // Test Case 6: Condition reference resolves to a non-boolean value.
        it('should throw an error when a condition reference resolves to a non-boolean', () => {
            fakeCtx.originalTemplate.Conditions = { MyCond: 'not a boolean' };
            const node = { 'Fn::Not': ['MyCond'] };

            expect(() => fnNot(node, fakeCtx)).toThrowError(UnexpectedVariableTypeError);
        });

        // Test Case 7: Nested intrinsic condition that resolves to boolean.
        it('should resolve a nested intrinsic condition and negate its boolean value', () => {
            const nestedIntrinsic = { 'Fn::SomeIntrinsic': 'value' };
            const node = { 'Fn::Not': [nestedIntrinsic] };

            // Simulate that isIntrinsic returns a positive result.
            (isIntrinsic as jest.Mock).mockReturnValue([true, 'Fn::SomeIntrinsic']);
            // Override resolveValue to return a boolean (for the nested intrinsic).
            (resolveValue as jest.Mock).mockReturnValue(true);

            const result = fnNot(node, fakeCtx);
            expect(result).toBe(false);
        });

        // Test Case 8: Nested intrinsic condition that does not resolve to boolean.
        it('should throw an error when nested intrinsic condition does not yield a boolean', () => {
            const nestedIntrinsic = { 'Fn::SomeIntrinsic': 'value' };
            const node = { 'Fn::Not': [nestedIntrinsic] };

            (isIntrinsic as jest.Mock).mockReturnValue([true, 'Fn::SomeIntrinsic']);
            (resolveValue as jest.Mock).mockReturnValue('unexpected type');

            expect(() => fnNot(node, fakeCtx)).toThrowError(UnexpectedVariableTypeError);
        });

        // Test Case 9: Condition value does not match any supported type.
        it('should throw an error when condition value is of an incorrect type', () => {
            const node = { 'Fn::Not': [123] }; // number is not handled by any branch.
            expect(() => fnNot(node, fakeCtx)).toThrowError(UnexpectedVariableTypeError);
        });

        // Additional test: Log messages (optional, shows that logs are produced).
        it('should log details at various stages', () => {
            const node = { 'Fn::Not': [true] };
            fnNot(node, fakeCtx);
            expect(traceSpy).toHaveBeenCalled();
        });
    });

    describe('fnAnd', () => {
        beforeEach(() => {
            (resolveValue as jest.Mock).mockReset();
            (validateThatCorrectIntrinsicCalled as jest.Mock).mockReset();
            (isIntrinsic as jest.Mock).mockReset();

            (resolveValue as jest.Mock).mockImplementation((x) => x);
            (isIntrinsic as jest.Mock).mockReturnValue([false, '']);
        });

        it('should return true when all conditions are true', () => {
            const node = { 'Fn::And': [true, true, true] };
            const result = fnAnd(node, fakeCtx);
            expect(result).toBe(true);
        });

        it('should return false when any condition is false', () => {
            const node = { 'Fn::And': [true, false, true] };
            const result = fnAnd(node, fakeCtx);
            expect(result).toBe(false);
        });

        it('should negate a literal string "true" to boolean true', () => {
            const node = { 'Fn::And': ['true', true] };
            const result = fnAnd(node, fakeCtx);
            expect(result).toBe(true);
        });

        it('should negate a literal string "false" to boolean false', () => {
            const node = { 'Fn::And': ['false', true] };
            const result = fnAnd(node, fakeCtx);
            expect(result).toBe(false);
        });

        it('should resolve a condition reference from the Conditions section', () => {
            fakeCtx.originalTemplate.Conditions = { MyCond: true };
            const node = { 'Fn::And': ['MyCond', true] };
            const result = fnAnd(node, fakeCtx);
            expect(result).toBe(true);
        });

        it('should throw an error when a condition resolves to a non-boolean', () => {
            fakeCtx.originalTemplate.Conditions = { MyCond: 'not a boolean' };
            const node = { 'Fn::And': ['MyCond', true] };
            expect(() => fnAnd(node, fakeCtx)).toThrowError(UnexpectedVariableTypeError);
        });

        it('should handle a nested intrinsic function resolving to boolean', () => {
            const nestedIntrinsic = { 'Fn::SomeIntrinsic': 'value' };
            const node = { 'Fn::And': [nestedIntrinsic, true] };

            (isIntrinsic as jest.Mock).mockReturnValue([true, 'Fn::SomeIntrinsic']);
            (resolveValue as jest.Mock).mockReturnValue(true);

            const result = fnAnd(node, fakeCtx);
            expect(result).toBe(true);
        });

        it('should throw an error when a nested intrinsic does not resolve to boolean', () => {
            const nestedIntrinsic = { 'Fn::SomeIntrinsic': 'value' };
            const node = { 'Fn::And': [nestedIntrinsic, true] };

            (isIntrinsic as jest.Mock).mockReturnValue([true, 'Fn::SomeIntrinsic']);
            (resolveValue as jest.Mock).mockReturnValue('unexpected type');

            expect(() => fnAnd(node, fakeCtx)).toThrowError(UnexpectedVariableTypeError);
        });

        it('should return false immediately when the first condition is false', () => {
            const node = { 'Fn::And': [false, true, true] };
            const result = fnAnd(node, fakeCtx);
            expect(result).toBe(false);
        });

        it('should throw an error when input is not an array', () => {
            const node = { 'Fn::And': 'not an array' };
            expect(() => fnAnd(node, fakeCtx)).toThrowError(UnexpectedVariableTypeError);
        });

        it('should log messages at various stages', () => {
            const node = { 'Fn::And': [true, true] };
            fnAnd(node, fakeCtx);
            expect(traceSpy).toHaveBeenCalled();
        });
    });

    describe('fnOr', () => {
        beforeEach(() => {
            (resolveValue as jest.Mock).mockReset();
            (validateThatCorrectIntrinsicCalled as jest.Mock).mockReset();
            (isIntrinsic as jest.Mock).mockReset();

            (resolveValue as jest.Mock).mockImplementation((x) => x);
            (isIntrinsic as jest.Mock).mockReturnValue([false, '']);
        });

        it('should return true if at least one condition is true', () => {
            const node = { 'Fn::Or': [false, true, false] };
            expect(fnOr(node, fakeCtx)).toBe(true);
        });

        it('should return false if all conditions are false', () => {
            const node = { 'Fn::Or': [false, false, false] };
            expect(fnOr(node, fakeCtx)).toBe(false);
        });

        it('should resolve condition references from the Conditions section', () => {
            fakeCtx.originalTemplate.Conditions = { MyCond: true };
            const node = { 'Fn::Or': ['MyCond', false] };
            expect(fnOr(node, fakeCtx)).toBe(true);
        });

        it('should short-circuit and return true as soon as a true condition is encountered', () => {
            const resolveMock = (resolveValue as jest.Mock).mockImplementation((x) => x === 'EarlyTrue');
            const node = { 'Fn::Or': ['EarlyTrue', 'OtherCondition'] };
            expect(fnOr(node, fakeCtx)).toBe(true);
            expect(resolveMock).toHaveBeenCalledTimes(1); // Stops at first true condition
        });

        it('should throw an error if any resolved condition is not a boolean', () => {
            (resolveValue as jest.Mock).mockReturnValue('invalid type');
            const node = { 'Fn::Or': ['InvalidCondition'] };
            expect(() => fnOr(node, fakeCtx)).toThrowError(UnexpectedVariableTypeError);
        });
    });

    describe('fnEquals', () => {
        beforeEach(() => {
            (resolveValue as jest.Mock).mockReset();
        });

        it('should return true for equal primitive values', () => {
            const node = { 'Fn::Equals': ['hello', 'hello'] };
            expect(fnEquals(node, fakeCtx)).toBe(true);
        });

        it('should return false for different primitive values', () => {
            const node = { 'Fn::Equals': [1, 2] };
            (resolveValue as jest.Mock).mockReturnValueOnce(1);
            (resolveValue as jest.Mock).mockReturnValueOnce(2);
            expect(fnEquals(node, fakeCtx)).toBe(false);
        });

        it('should compare objects deeply', () => {
            const node = { 'Fn::Equals': [{ key: 'value' }, { key: 'value' }] };
            expect(fnEquals(node, fakeCtx)).toBe(true);
        });

        it('should return false for non-equal objects', () => {
            const node = { 'Fn::Equals': [{ key: 'value1' }, { key: 'value2' }] };
            (resolveValue as jest.Mock).mockReturnValueOnce('value1');
            (resolveValue as jest.Mock).mockReturnValueOnce('value2');
            expect(fnEquals(node, fakeCtx)).toBe(false);
        });
    });

    describe('fnIf', () => {
        beforeEach(() => {
            (resolveValue as jest.Mock).mockReset();
        });

        it('should return the first value when the condition is true', () => {
            (resolveValue as jest.Mock).mockImplementation((x) => (x === 'Condition' ? true : x));
            const node = { 'Fn::If': ['Condition', 'TrueValue', 'FalseValue'] };
            expect(fnIf(node, fakeCtx)).toBe('TrueValue');
        });

        it('should return the second value when the condition is false', () => {
            (resolveValue as jest.Mock).mockImplementation((x) => (x === 'Condition' ? false : x));
            const node = { 'Fn::If': ['Condition', 'TrueValue', 'FalseValue'] };
            expect(fnIf(node, fakeCtx)).toBe('FalseValue');
        });

        it('should throw an error if the condition does not resolve to a boolean', () => {
            (resolveValue as jest.Mock).mockReturnValue('not a boolean');
            const node = { 'Fn::If': ['Condition', 'TrueValue', 'FalseValue'] };
            expect(() => fnIf(node, fakeCtx)).toThrowError(UnexpectedVariableTypeError);
        });
    });

    describe('fnContains', () => {
        beforeEach(() => {
            (resolveValue as jest.Mock).mockReset();
        });

        it('should return true when array contains the value', () => {
            const node = { 'Fn::Contains': [['apple', 'banana', 'cherry'], 'banana'] };
            (resolveValue as jest.Mock).mockReturnValueOnce(['apple', 'banana', 'cherry']);
            (resolveValue as jest.Mock).mockReturnValueOnce('banana');
            expect(fnContains(node, fakeCtx)).toBe(true);
        });

        it('should return false when array does not contain the value', () => {
            const node = { 'Fn::Contains': [['apple', 'banana', 'cherry'], 'orange'] };
            (resolveValue as jest.Mock).mockReturnValueOnce(['apple', 'banana', 'cherry']);
            (resolveValue as jest.Mock).mockReturnValueOnce('orange');
            expect(fnContains(node, fakeCtx)).toBe(false);
        });

        it('should compare objects deeply', () => {
            const node = { 'Fn::Contains': [[{ key: 'value' }], { key: 'value' }] };
            (resolveValue as jest.Mock).mockReturnValueOnce([{ key: 'value' }]);
            (resolveValue as jest.Mock).mockReturnValueOnce({ key: 'value' });
            expect(fnContains(node, fakeCtx)).toBe(true);
        });

        it('should throw an error if first argument is not an array', () => {
            const node = { 'Fn::Contains': ['not an array', 'value'] };
            expect(() => fnContains(node, fakeCtx)).toThrowError(UnexpectedVariableTypeError);
        });
    });
});
