import log from 'loglevel';
import { SupportedIntrinsicFunctions } from '../../../../../../src/cloudformation/constants';
import {
    InvalidIntrinsicObjectError,
    MissingIntrinsicKeyError,
} from '../../../../../../src/cloudformation/parsing/errors/errors';
import {
    isIntrinsic,
    validateThatCorrectIntrinsicCalled,
} from '../../../../../../src/cloudformation/parsing/resolver/intrinsic'; // adjust this path as needed

describe('intrinsic-utils', () => {
    describe('isIntrinsic', () => {
        let debugSpy: jest.SpyInstance;

        beforeEach(() => {
            debugSpy = jest.spyOn(log, 'debug').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should return [false, ""] when objectNode is null', () => {
            const result = isIntrinsic(null);
            expect(result).toEqual([false, '']);
            expect(debugSpy).toHaveBeenCalledWith(
                'isIntrinsic: Passed objectNode has invalid type, it is not an intrinsic object',
            );
        });

        it('should return [false, ""] when objectNode is undefined', () => {
            const result = isIntrinsic(undefined);
            expect(result).toEqual([false, '']);
            expect(debugSpy).toHaveBeenCalledWith(
                'isIntrinsic: Passed objectNode has invalid type, it is not an intrinsic object',
            );
        });

        it('should return [false, ""] when objectNode is not an object (e.g., a number)', () => {
            const result = isIntrinsic(123);
            expect(result).toEqual([false, '']);
            expect(debugSpy).toHaveBeenCalledWith(
                'isIntrinsic: Passed objectNode has invalid type, it is not an intrinsic object',
            );
        });

        it('should return [false, ""] when objectNode is an object with zero keys', () => {
            const result = isIntrinsic({});
            expect(result).toEqual([false, '']);
            expect(debugSpy).toHaveBeenCalledWith(
                'isIntrinsic: Passed objectNode has more than 1 key, it is not a valid intrinsic object',
            );
        });

        it('should return [false, ""] when objectNode has more than one key', () => {
            const result = isIntrinsic({ Ref: 'val', Extra: 'value' });
            expect(result).toEqual([false, '']);
            expect(debugSpy).toHaveBeenCalledWith(
                'isIntrinsic: Passed objectNode has more than 1 key, it is not a valid intrinsic object',
            );
        });

        it('should return [true, objectKey] when objectNode has exactly one key that is a supported intrinsic', () => {
            // Use one of the supported intrinsic functions (for instance "Ref")
            const intrinsicKey = SupportedIntrinsicFunctions.Ref; // e.g., "Ref"
            const result = isIntrinsic({ [intrinsicKey]: 'someValue' });
            expect(result).toEqual([true, intrinsicKey]);
            expect(debugSpy).toHaveBeenCalledWith(
                `isIntrinsic: Supported intrinsic with key "${intrinsicKey}" is found`,
            );
        });

        it('should return [false, ""] if the single key is not supported', () => {
            const invalidKey = 'NotSupported';
            const result = isIntrinsic({ [invalidKey]: 'whatever' });
            expect(result).toEqual([false, '']);
            expect(debugSpy).toHaveBeenCalledWith(`isIntrinsic: Intrinsic key "${invalidKey}" is not supported`);
        });
    });

    describe('validateThatCorrectIntrinsicCalled', () => {
        let warnSpy: jest.SpyInstance;

        beforeEach(() => {
            warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should throw InvalidIntrinsicObjectError if objectNode is null', () => {
            expect(() => validateThatCorrectIntrinsicCalled(null, SupportedIntrinsicFunctions.Ref)).toThrowError(
                InvalidIntrinsicObjectError,
            );
            expect(warnSpy).toHaveBeenCalledWith(
                'validateThatCorrectIntrinsicCalled: Passed objectNode has invalid type, expected an object',
            );
        });

        it('should throw InvalidIntrinsicObjectError if objectNode is not an object (e.g., a string)', () => {
            expect(() =>
                validateThatCorrectIntrinsicCalled('not an object', SupportedIntrinsicFunctions.Ref),
            ).toThrowError(InvalidIntrinsicObjectError);
            expect(warnSpy).toHaveBeenCalledWith(
                'validateThatCorrectIntrinsicCalled: Passed objectNode has invalid type, expected an object',
            );
        });

        it('should throw MissingIntrinsicKeyError if the intrinsic key is not present in the object', () => {
            const obj = { SomeOtherKey: 'value' };
            const intrinsicKey = SupportedIntrinsicFunctions.Ref;
            expect(() => validateThatCorrectIntrinsicCalled(obj, intrinsicKey)).toThrowError(MissingIntrinsicKeyError);
            expect(warnSpy).toHaveBeenCalledWith(
                `validateThatCorrectIntrinsicCalled: Object does not include expected intrinsic key "${intrinsicKey}"`,
            );
        });

        it('should not throw if the intrinsic key is present in the object', () => {
            const intrinsicKey = SupportedIntrinsicFunctions.Fn_Join;
            const obj = { [intrinsicKey]: 'someValue' };
            expect(() => validateThatCorrectIntrinsicCalled(obj, intrinsicKey)).not.toThrow();
        });
    });
});
