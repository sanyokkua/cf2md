import { isBlankString } from 'coreutilsts';
import log from 'loglevel';
import { v4 as uuidv4 } from 'uuid';
import { randomString } from '../../../../src/utils/random-utils';
// Path should be full
import { resolveValue } from '../../../../src/cloudformation';
import { UnexpectedVariableTypeError } from '../../../../src/cloudformation/parsing/errors/errors';
import { ResolvingContext } from '../../../../src/cloudformation/parsing/types/types';
import {
    fullUuid,
    generateAlphaNumeric,
    generateAZs,
    resolveString,
    resolveStringWithDefault,
    shortUuid,
} from '../../../../src/cloudformation/parsing/utils/helper-utils'; // adjust the import path accordingly

// --- Mocks for external dependencies ---
jest.mock('coreutilsts', () => ({
    isBlankString: jest.fn(),
}));

jest.mock('uuid', () => ({
    v4: jest.fn(),
}));

jest.mock('../../../../src/utils/random-utils', () => ({
    randomString: jest.fn(),
}));

jest.mock('../../../../src/cloudformation/parsing/resolver/value-resolver', () => ({
    resolveValue: jest.fn(),
}));

// A simple fake resolution context implementing only isIdExists.
const createFakeCtx = (isIdExistsImpl: (id: string) => boolean): ResolvingContext => {
    return {
        isIdExists: jest.fn(isIdExistsImpl),
        getCurrentPath: jest.fn(),
    } as unknown as ResolvingContext;
};

describe('helper-utils', () => {
    let traceSpy: jest.SpyInstance;
    let debugSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        traceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
        debugSpy = jest.spyOn(log, 'debug').mockImplementation(() => {});
        errorSpy = jest.spyOn(log, 'error').mockImplementation(() => {});
        warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
    });

    describe('generateAZs', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should log a warning and return an empty array if region is blank', () => {
            // Simulate that the region is blank.
            (isBlankString as jest.Mock).mockReturnValue(true);
            const result = generateAZs('');
            expect(result).toEqual([]);
            expect(warnSpy).toHaveBeenCalledWith('generateAZs received a blank region, returning empty AZs');
            expect(traceSpy).toHaveBeenCalledWith('generateAZs called with region: ""');
        });

        it('should return an array of AZs when region is not blank', () => {
            (isBlankString as jest.Mock).mockReturnValue(false);
            const region = 'us-east-1';
            const result = generateAZs(region);
            expect(result).toEqual([`${region}-1a`, `${region}-1b`]);
            expect(traceSpy).toHaveBeenCalledWith(`generateAZs called with region: "${region}"`);
            expect(debugSpy).toHaveBeenCalledWith(`Generated AZs for region "${region}": ${JSON.stringify(result)}`);
        });
    });

    describe('generateAlphaNumeric', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return a unique alphanumeric string on first attempt', () => {
            const fakeCtx = createFakeCtx(() => false); // always unique
            (randomString as jest.Mock).mockReturnValue('unique123');
            const result = generateAlphaNumeric(9, fakeCtx);
            expect(result).toBe('unique123');
            expect(debugSpy).toHaveBeenCalledWith('Unique alphanumeric id generated: "unique123" on attempt 1');
        });

        it('should retry if duplicate is found, and return the unique string on second attempt', () => {
            const fakeCtx = createFakeCtx((id: string) => id === 'dup');
            (randomString as jest.Mock).mockReturnValueOnce('dup').mockReturnValueOnce('unique456');
            const result = generateAlphaNumeric(9, fakeCtx);
            expect(result).toBe('unique456');
            expect(traceSpy).toHaveBeenCalledWith('Attempt 1: Generated id "dup" already exists. Trying again...');
            expect(debugSpy).toHaveBeenCalledWith('Unique alphanumeric id generated: "unique456" on attempt 2');
        });

        it('should return the last attempted string after exceeding max attempts', () => {
            const maxAttempts = 10;
            // Always returning "duplicate" candidates.
            const candidates = ['dup1', 'dup2', 'dup3', 'dup4', 'dup5', 'dup6', 'dup7', 'dup8', 'dup9', 'dup10'];
            (randomString as jest.Mock).mockImplementation(() => candidates.shift());
            const fakeCtx = createFakeCtx(() => true); // every candidate is a duplicate

            const result = generateAlphaNumeric(6, fakeCtx);
            // Should return candidate from the 10th call.
            expect(result).toBe('dup10');
            expect(log.error).toHaveBeenCalledWith(
                `Exceeded maximum attempts (${maxAttempts}) to generate a unique alphanumeric id. Using last generated id: "dup10"`,
            );
        });
    });

    describe('shortUuid', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return a unique short UUID on first attempt', () => {
            const fakeCtx = createFakeCtx(() => false);
            // Provide a UUID value with dashes.
            (uuidv4 as jest.Mock).mockReturnValue('12345678-1234-1234-1234-123456789abc');
            const result = shortUuid(fakeCtx);
            // Remove dashes and take first 12 characters.
            expect(result).toBe('123456781234');
            expect(debugSpy).toHaveBeenCalledWith('Unique short UUID generated: "123456781234" on attempt 1');
        });

        it('should retry if short UUID already exists and then return a unique one', () => {
            // We simulate the first call returning a duplicate and then a unique value.
            const fakeCtx = createFakeCtx((id: string) => id === 'aaaabbbbcccc');
            (uuidv4 as jest.Mock)
                .mockReturnValueOnce('aaaa-bbbb-cccc-dddd-eeeeffffffff') // becomes "aaaabbbbcccc"
                .mockReturnValueOnce('1111-2222-3333-4444-555566667777'); // becomes "111122223333"
            const result = shortUuid(fakeCtx);
            expect(result).toBe('111122223333');
            expect(traceSpy).toHaveBeenCalledWith('Attempt 1: Short UUID "aaaabbbbcccc" already exists. Retrying...');
            expect(debugSpy).toHaveBeenCalledWith('Unique short UUID generated: "111122223333" on attempt 2');
        });

        it('should return the last attempted short UUID after exceeding max attempts', () => {
            const maxAttempts = 10;
            // Create an array of uuids that yield different short UUIDs.
            const uuids = [
                '00000000-0000-0000-0000-000000000001', // -> "000000000000"
                '00000000-0000-0000-0000-000000000002', // -> "000000000000" if length=12? Actually:
                // Let's ensure different values by using our own strings:
                'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', // becomes "aaaabbbbcccc"
                'ffffffff-ffff-ffff-ffff-ffffffffffff', // becomes "ffffffffffff"
                '11111111-2222-3333-4444-555555555555', // becomes "111111112222"
                '99999999-8888-7777-6666-555555555555', // becomes "999999998888"
                'aaaaaaaa-1111-bbbb-2222-cccccccccccc', // becomes "aaaaaaaa1111"
                'dddddddd-3333-eeee-4444-ffffffffffff', // becomes "dddddddd3333"
                '77777777-5555-6666-4444-333333333333', // becomes "777777775555"
                '88888888-9999-0000-aaaa-bbbbbbbbbbbb', // becomes "888888889999"
            ];
            (uuidv4 as jest.Mock).mockImplementation(() => uuids.shift());
            // All candidates are considered duplicates.
            const fakeCtx = createFakeCtx(() => true);
            const result = shortUuid(fakeCtx);
            expect(result).toBe('888888889999');
            expect(errorSpy).toHaveBeenCalledWith(
                `Exceeded maximum attempts (${maxAttempts}) to generate a unique short UUID. Using last generated value: "888888889999"`,
            );
        });
    });

    describe('fullUuid', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return a unique full UUID on first attempt', () => {
            const fakeCtx = createFakeCtx(() => false);
            (uuidv4 as jest.Mock).mockReturnValue('full-uuid-1');
            const result = fullUuid(fakeCtx);
            expect(result).toBe('full-uuid-1');
            expect(debugSpy).toHaveBeenCalledWith('Unique full UUID generated: "full-uuid-1" on attempt 1');
        });

        it('should retry if full UUID already exists then return a unique one', () => {
            const fakeCtx = createFakeCtx((id: string) => id === 'dup-full-uuid');
            (uuidv4 as jest.Mock).mockReturnValueOnce('dup-full-uuid').mockReturnValueOnce('unique-full-uuid');
            const result = fullUuid(fakeCtx);
            expect(result).toBe('unique-full-uuid');
            expect(traceSpy).toHaveBeenCalledWith('Attempt 1: Full UUID "dup-full-uuid" already exists. Retrying...');
            expect(debugSpy).toHaveBeenCalledWith('Unique full UUID generated: "unique-full-uuid" on attempt 2');
        });

        it('should return the last full UUID after exceeding max attempts', () => {
            const maxAttempts = 10;
            const uuids = ['uuid1', 'uuid2', 'uuid3', 'uuid4', 'uuid5', 'uuid6', 'uuid7', 'uuid8', 'uuid9', 'uuid10'];
            (uuidv4 as jest.Mock).mockImplementation(() => uuids.shift());
            const fakeCtx = createFakeCtx(() => true);
            const result = fullUuid(fakeCtx);
            expect(result).toBe('uuid10');
            expect(errorSpy).toHaveBeenCalledWith(
                `Exceeded maximum attempts (${maxAttempts}) to generate a unique full UUID. Using last generated value: "uuid10"`,
            );
        });
    });

    describe('resolveString', () => {
        let fakeCtx: ResolvingContext;
        beforeEach(() => {
            jest.clearAllMocks();
            fakeCtx = createFakeCtx(() => false);
        });

        it('should throw an error if property is null', () => {
            expect(() => resolveString(null, 'TestProperty', fakeCtx)).toThrow(UnexpectedVariableTypeError);
            expect(warnSpy).toHaveBeenCalledWith("TestProperty doesn't have a value");
        });

        it('should throw an error if property is undefined', () => {
            expect(() => resolveString(undefined, 'TestProperty', fakeCtx)).toThrow(UnexpectedVariableTypeError);
            expect(warnSpy).toHaveBeenCalledWith("TestProperty doesn't have a value");
        });

        it('should throw an error if resolved value is not a string', () => {
            (resolveValue as jest.Mock).mockReturnValue(42);
            expect(() => resolveString('input', 'TestProperty', fakeCtx)).toThrow(UnexpectedVariableTypeError);
            expect(warnSpy).toHaveBeenCalledWith('TestProperty was not resolved into a string');
        });

        it('should return the resolved string if valid', () => {
            (resolveValue as jest.Mock).mockReturnValue('resolvedValue');
            const result = resolveString('input', 'TestProperty', fakeCtx);
            expect(result).toBe('resolvedValue');
            expect(traceSpy).toHaveBeenCalledWith('TestProperty resolved to string value: "resolvedValue"');
        });
    });

    describe('resolveStringWithDefault', () => {
        let fakeCtx: ResolvingContext;
        beforeEach(() => {
            jest.clearAllMocks();
            fakeCtx = createFakeCtx(() => false);
        });

        it('should return the default value if property is not provided (falsy)', () => {
            const result = resolveStringWithDefault(undefined, 'defaultVal', 'Prop', fakeCtx);
            expect(result).toBe('defaultVal');
            expect(traceSpy).toHaveBeenCalledWith('Prop is not provided, returning default value: "defaultVal"');
        });

        it('should return the resolved string if it resolves to a string', () => {
            (resolveValue as jest.Mock).mockReturnValue('resolvedString');
            const result = resolveStringWithDefault('input', 'defaultVal', 'Prop', fakeCtx);
            expect(result).toBe('resolvedString');
            expect(traceSpy).toHaveBeenCalledWith('Prop successfully resolved to string: "resolvedString"');
        });

        it('should return the default value if resolved value is not a string', () => {
            (resolveValue as jest.Mock).mockReturnValue(100);
            const result = resolveStringWithDefault('input', 'defaultVal', 'Prop', fakeCtx);
            expect(result).toBe('defaultVal');
            expect(traceSpy).toHaveBeenCalledWith(
                'Prop did not resolve to a string, returning default value: "defaultVal"',
            );
        });
    });
});
