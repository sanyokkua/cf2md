import { v4 as uuidv4 } from 'uuid';

import { RandomUtils } from '../types/util-service-types';

export class RandomUtilsImpl implements RandomUtils {
    randomString(minLength: number = 5, maxLength: number = 15): string {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const len = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        let result = '';
        for (let i = 0; i < len; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    randomInteger(min: number = 1, max: number = 100): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomArray<T>(itemGenerator: () => T, minItems: number = 1, maxItems: number = 5): T[] {
        const length = Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;
        const array: T[] = [];
        for (let i = 0; i < length; i++) {
            array.push(itemGenerator());
        }
        return array;
    }

    shortUuid(): string {
        return uuidv4().replace(/-/g, '').substring(0, 12);
    }

    fullUuid(): string {
        return uuidv4();
    }
}
