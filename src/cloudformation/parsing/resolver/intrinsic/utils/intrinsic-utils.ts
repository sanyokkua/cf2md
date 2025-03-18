import log from 'loglevel';
import { SupportedIntrinsicFunctions } from '../../../../constants';
import { InvalidIntrinsicObjectError, MissingIntrinsicKeyError } from '../../../errors/errors';

/**
 * Determines whether the provided object represents a valid AWS CloudFormation intrinsic function.
 *
 * This function checks if the given object meets the criteria of an intrinsic function object used within
 * CloudFormation templates. Specifically, it verifies that:
 *
 * - The object is non-null, defined, and of type 'object'.
 * - The object contains exactly one key.
 * - The single key matches one of the supported intrinsic function names declared in SupportedIntrinsicFunctions.
 *
 * @param objectNode - The object to test for being a valid intrinsic function.
 * @returns A tuple where the first element is a boolean indicating if the object is intrinsic, and the second element is the intrinsic key if valid, or an empty string otherwise.
 */
export function isIntrinsic(objectNode: unknown): [boolean, string] {
    // Check if objectNode is null, undefined, or not an object
    if (objectNode === null || objectNode === undefined || typeof objectNode !== 'object') {
        log.debug('isIntrinsic: Passed objectNode has invalid type, it is not an intrinsic object');
        return [false, ''];
    }

    // Extract all keys from the object; a valid intrinsic should have exactly one key
    const keys = Object.keys(objectNode);
    if (keys.length !== 1) {
        log.debug('isIntrinsic: Passed objectNode has more than 1 key, it is not a valid intrinsic object');
        return [false, ''];
    }

    // Extract the single key and check if it matches any supported intrinsic function
    const objectKey = keys[0];
    const supportedIntrinsicFunctions = Object.values(SupportedIntrinsicFunctions).map((val) => String(val));
    if (supportedIntrinsicFunctions.includes(objectKey)) {
        log.debug(`isIntrinsic: Supported intrinsic with key "${objectKey}" is found`);
        return [true, objectKey];
    }

    // If the key is not supported, log the information and return false
    log.debug(`isIntrinsic: Intrinsic key "${objectKey}" is not supported`);
    return [false, ''];
}

/**
 * Validates that the given object contains the expected AWS CloudFormation intrinsic key.
 *
 * This function asserts that the provided object (expected to be an intrinsic function object) includes a specified key.
 * It is used within the CloudFormation parser to ensure that intrinsic functions are correctly structured.
 * If the validation fails, an appropriate error is thrown:
 * - If the object is not a valid object, an InvalidIntrinsicObjectError is thrown.
 * - If the object does not contain the expected intrinsic key, a MissingIntrinsicKeyError is thrown.
 *
 * @param objectNode - The intrinsic function object under validation.
 * @param intrinsicKey - The expected intrinsic key that must be present in objectNode.
 * @returns Nothing. Throws an error if the object is invalid or if the expected key is missing.
 */
export function validateThatCorrectIntrinsicCalled(objectNode: unknown, intrinsicKey: string): void {
    // Confirm the object is valid (non-null object)
    if (objectNode === null || objectNode === undefined || typeof objectNode !== 'object') {
        log.warn('validateThatCorrectIntrinsicCalled: Passed objectNode has invalid type, expected an object');
        throw new InvalidIntrinsicObjectError('Passed objectNode is not an object');
    }

    // Check if the object contains the expected intrinsic key
    if (!Object.keys(objectNode).includes(intrinsicKey)) {
        log.warn(
            `validateThatCorrectIntrinsicCalled: Object does not include expected intrinsic key "${intrinsicKey}"`,
        );
        throw new MissingIntrinsicKeyError(`Intrinsic key "${intrinsicKey}" is not found in the object`);
    }
}
