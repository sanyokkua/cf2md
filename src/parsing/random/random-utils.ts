import log from 'loglevel';
import { v4 as uuidv4 } from 'uuid';
import { ParsingValidationError } from '../error/parsing-errors';
import { RandomUtils } from '../types/util-service-types';

export class RandomUtilsImpl implements RandomUtils {
    private validateRange(minValue: number, maxValue: number, minName: string, maxName: string): void {
        log.trace('[RandomUtilsImpl.validateRange] Entering with arguments:', { minValue, maxValue, minName, maxName });
        if (maxValue < minValue) {
            const errorMessage = `${maxName} must be greater than or equal to ${minName}`;
            log.error('[RandomUtilsImpl.validateRange] Validation error:', errorMessage);
            throw new ParsingValidationError(errorMessage);
        }
        log.trace('[RandomUtilsImpl.validateRange] Exiting');
    }

    randomString(minLength: number, maxLength: number): string {
        log.trace('[RandomUtilsImpl.randomString] Entering with arguments:', { minLength, maxLength });
        this.validateRange(minLength, maxLength, 'minLength', 'maxLength');
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const len = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        log.debug('[RandomUtilsImpl.randomString] Generated string length:', len);
        log.debug('[RandomUtilsImpl.randomString] Character pool:', chars);
        let result = '';
        for (let i = 0; i < len; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        log.trace('[RandomUtilsImpl.randomString] Exiting with result:', result);
        return result;
    }

    randomInteger(min: number, max: number): number {
        log.trace('[RandomUtilsImpl.randomInteger] Entering with arguments:', { min, max });
        this.validateRange(min, max, 'min', 'max');
        const result = Math.floor(Math.random() * (max - min + 1)) + min;
        log.debug('[RandomUtilsImpl.randomInteger] Generated integer:', result);
        log.trace('[RandomUtilsImpl.randomInteger] Exiting with result:', result);
        return result;
    }

    randomArray<T>(itemGenerator: () => T, minItems: number, maxItems: number): T[] {
        log.trace('[RandomUtilsImpl.randomArray] Entering with arguments:', { itemGenerator, minItems, maxItems });
        this.validateRange(minItems, maxItems, 'minItems', 'maxItems');
        const length = Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;
        log.debug('[RandomUtilsImpl.randomArray] Generated array length:', length);
        const array: T[] = [];
        for (let i = 0; i < length; i++) {
            array.push(itemGenerator());
        }
        log.trace('[RandomUtilsImpl.randomArray] Exiting with result:', array);
        return array;
    }

    shortUuid(): string {
        log.trace('[RandomUtilsImpl.shortUuid] Entering');
        const fullUuidValue = uuidv4();
        log.debug('[RandomUtilsImpl.shortUuid] Generated full UUID:', fullUuidValue);
        const result = fullUuidValue.replace(/-/g, '').substring(0, 12);
        log.trace('[RandomUtilsImpl.shortUuid] Exiting with result:', result);
        return result;
    }

    fullUuid(): string {
        log.trace('[RandomUtilsImpl.fullUuid] Entering');
        const result = uuidv4();
        log.debug('[RandomUtilsImpl.fullUuid] Generated UUID:', result);
        log.trace('[RandomUtilsImpl.fullUuid] Exiting with result:', result);
        return result;
    }
}
