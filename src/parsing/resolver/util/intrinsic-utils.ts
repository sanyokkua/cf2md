import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { ParsingValidationError } from '../../error/parsing-errors';
import { IntrinsicUtils } from '../../types/util-service-types';

export class IntrinsicUtilsImpl implements IntrinsicUtils {
    isIntrinsic(objectNode: unknown): objectNode is Record<string, unknown> {
        log.trace('[IntrinsicUtilsImpl.isIntrinsic] Entering with argument:', { objectNode });
        if (objectNode === null || objectNode === undefined || typeof objectNode !== 'object') {
            log.debug('[IntrinsicUtilsImpl.isIntrinsic] Passed objectNode has invalid type, it is not an intrinsic object');
            log.trace('[IntrinsicUtilsImpl.isIntrinsic] Exiting with result: false');
            return false;
        }

        const keys = Object.keys(objectNode);
        log.debug('[IntrinsicUtilsImpl.isIntrinsic] Object keys:', keys);
        if (keys.length !== 1) {
            log.debug('[IntrinsicUtilsImpl.isIntrinsic] Passed objectNode has more than 1 key, it is not a valid intrinsic object');
            log.trace('[IntrinsicUtilsImpl.isIntrinsic] Exiting with result: false');
            return false;
        }

        const objectKey = keys[0];
        log.debug('[IntrinsicUtilsImpl.isIntrinsic] Checking key:', objectKey);
        const supportedIntrinsicFunctions = Object.values(CfIntrinsicFunctions).map((val) => String(val));
        log.debug('[IntrinsicUtilsImpl.isIntrinsic] Supported intrinsic functions:', supportedIntrinsicFunctions);
        if (supportedIntrinsicFunctions.includes(objectKey)) {
            log.debug(`[IntrinsicUtilsImpl.isIntrinsic] Supported intrinsic with key "${objectKey}" is found`);
            log.trace('[IntrinsicUtilsImpl.isIntrinsic] Exiting with result: true');
            return true;
        }

        log.warn(`[IntrinsicUtilsImpl.isIntrinsic] Intrinsic key "${objectKey}" is not supported`);
        log.trace('[IntrinsicUtilsImpl.isIntrinsic] Exiting with result: false');
        return false;
    }

    getIntrinsicKey(objectNode: unknown): string {
        log.trace('[IntrinsicUtilsImpl.getIntrinsicKey] Entering with argument:', { objectNode });
        log.debug('[IntrinsicUtilsImpl.getIntrinsicKey] Checking if objectNode is an intrinsic');
        if (!this.isIntrinsic(objectNode)) {
            log.debug('[IntrinsicUtilsImpl.getIntrinsicKey] objectNode is not an intrinsic. Returning empty string.');
            log.trace('[IntrinsicUtilsImpl.getIntrinsicKey] Exiting with result: ""');
            return '';
        }
        const keys = Object.keys(objectNode);
        const key = keys[0];
        log.debug('[IntrinsicUtilsImpl.getIntrinsicKey] Intrinsic key found:', key);
        log.trace('[IntrinsicUtilsImpl.getIntrinsicKey] Exiting with result:', key);
        return key;
    }

    validateIntrinsic(objectNode: unknown, intrinsicKey: string): void {
        log.trace('[IntrinsicUtilsImpl.validateIntrinsic] Entering with arguments:', { objectNode, intrinsicKey });
        log.debug('[IntrinsicUtilsImpl.validateIntrinsic] Checking if objectNode is an intrinsic');
        if (!this.isIntrinsic(objectNode)) {
            log.warn('[IntrinsicUtilsImpl.validateIntrinsic] Passed objectNode has invalid intrinsic type');
            throw new ParsingValidationError('Passed objectNode is not an intrinsic object');
        }

        log.debug(`[IntrinsicUtilsImpl.validateIntrinsic] Checking if object includes expected intrinsic key "${intrinsicKey}"`);
        if (!Object.keys(objectNode).includes(intrinsicKey)) {
            log.warn(`[IntrinsicUtilsImpl.validateIntrinsic] Object does not include expected intrinsic key "${intrinsicKey}"`);
            throw new ParsingValidationError(`Intrinsic key "${intrinsicKey}" is not found in the object`);
        }
        log.trace('[IntrinsicUtilsImpl.validateIntrinsic] Exiting');
    }

    deepEqual(a: unknown, b: unknown): boolean {
        log.trace('[IntrinsicUtilsImpl.deepEqual] Entering with arguments:', { a, b });
        if (a === null || b === undefined || a === undefined || b === null) {
            log.debug(`[IntrinsicUtilsImpl.deepEqual] One is null/undefined but not both. Result: ${String(false)}`);
            log.trace('[IntrinsicUtilsImpl.deepEqual] Exiting with result:', false);
            return false;
        }
        if (typeof a !== typeof b) {
            log.debug(`[IntrinsicUtilsImpl.deepEqual] Types must be identical. Type of a: ${typeof a}, Type of b: ${typeof b}. Result: false`);
            log.trace('[IntrinsicUtilsImpl.deepEqual] Exiting with result: false');
            return false;
        }
        if (a === b) {
            log.debug('[IntrinsicUtilsImpl.deepEqual] Strictly equal objects are deeply equal. Result: true');
            log.trace('[IntrinsicUtilsImpl.deepEqual] Exiting with result: true');
            return true;
        }
        if (a instanceof Date && b instanceof Date) {
            const result = a.getTime() === b.getTime();
            log.debug(`[IntrinsicUtilsImpl.deepEqual] Comparing dates by time. Result: ${String(result)}`);
            log.trace('[IntrinsicUtilsImpl.deepEqual] Exiting with result:', result);
            return result;
        }

        if (a instanceof RegExp && b instanceof RegExp) {
            const result = a.toString() === b.toString();
            log.debug(`[IntrinsicUtilsImpl.deepEqual] Comparing regex patterns. Result: ${String(result)}`);
            log.trace('[IntrinsicUtilsImpl.deepEqual] Exiting with result:', result);
            return result;
        }

        if (Array.isArray(a) && Array.isArray(b)) {
            log.debug('[IntrinsicUtilsImpl.deepEqual] Comparing arrays.');
            if (a.length !== b.length) {
                log.debug(
                    `[IntrinsicUtilsImpl.deepEqual] Arrays must be same length. Length of a: ${String(a.length)}, Length of b: ${String(b.length)}. Result: false`,
                );
                log.trace('[IntrinsicUtilsImpl.deepEqual] Exiting with result: false');
                return false;
            }
            const result = a.every((item, index) => this.deepEqual(item, b[index]));
            log.trace('[IntrinsicUtilsImpl.deepEqual] Array comparison result:', result);
            log.trace('[IntrinsicUtilsImpl.deepEqual] Exiting with result:', result);
            return result;
        }

        if (typeof a === 'object' && typeof b === 'object') {
            log.debug('[IntrinsicUtilsImpl.deepEqual] Comparing objects.');
            const aKeys = Object.keys(a as Record<string, unknown>);
            const bKeys = Object.keys(b as Record<string, unknown>);
            log.debug('[IntrinsicUtilsImpl.deepEqual] Keys of a:', aKeys);
            log.debug('[IntrinsicUtilsImpl.deepEqual] Keys of b:', bKeys);

            if (aKeys.length !== bKeys.length) {
                log.debug(
                    `[IntrinsicUtilsImpl.deepEqual] Objects must have the same number of keys. Count of a: ${String(aKeys.length)}, Count of b: ${String(bKeys.length)}. Result: false`,
                );
                log.trace('[IntrinsicUtilsImpl.deepEqual] Exiting with result: false');
                return false;
            }

            const result = aKeys.every((key) => {
                const hasProperty = bKeys.includes(key);
                const isDeepEq = this.deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]);
                return hasProperty && isDeepEq;
            });
            log.trace('[IntrinsicUtilsImpl.deepEqual] Object comparison result:', result);
            log.trace('[IntrinsicUtilsImpl.deepEqual] Exiting with result:', result);
            return result;
        }

        log.trace('[IntrinsicUtilsImpl.deepEqual] Exiting with result:', a === b);
        return a === b;
    }
}
