import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { IntrinsicUtils } from '../../types/util-service-types';

export class IntrinsicUtilsImpl implements IntrinsicUtils {
    isIntrinsic(objectNode: unknown): objectNode is Record<string, unknown> {
        if (objectNode === null || objectNode === undefined || typeof objectNode !== 'object') {
            log.debug('isIntrinsic: Passed objectNode has invalid type, it is not an intrinsic object');
            return false;
        }

        const keys = Object.keys(objectNode);
        if (keys.length !== 1) {
            log.debug('isIntrinsic: Passed objectNode has more than 1 key, it is not a valid intrinsic object');
            return false;
        }

        const objectKey = keys[0];
        const supportedIntrinsicFunctions = Object.values(CfIntrinsicFunctions).map((val) => String(val));
        if (supportedIntrinsicFunctions.includes(objectKey)) {
            log.debug(`isIntrinsic: Supported intrinsic with key "${objectKey}" is found`);
            return true;
        }

        log.warn(`isIntrinsic: Intrinsic key "${objectKey}" is not supported`);
        return false;
    }

    getIntrinsicKey(objectNode: unknown): string {
        if (!this.isIntrinsic(objectNode)) {
            return '';
        }
        const keys = Object.keys(objectNode);
        return keys[0];
    }

    validateIntrinsic(objectNode: unknown, intrinsicKey: string): void {
        if (!this.isIntrinsic(objectNode)) {
            log.warn('validateIntrinsic: Passed objectNode has invalid intrinsic type');
            throw new Error('Passed objectNode is not an intrinsic object');
        }

        if (!Object.keys(objectNode).includes(intrinsicKey)) {
            log.warn(`validateIntrinsic: Object does not include expected intrinsic key "${intrinsicKey}"`);
            throw new Error(`Intrinsic key "${intrinsicKey}" is not found in the object`);
        }
    }
}
