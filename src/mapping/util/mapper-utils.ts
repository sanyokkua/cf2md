import { StringKeyValueObject } from '../../common';
import { MapperUtil } from '../types/utils-model';

export class MapperUtilsImpl implements MapperUtil {
    extractString(input: unknown): string {
        if (input === null || input === undefined) {
            throw new Error('Input cannot be null or undefined');
        }

        const inputType = typeof input;
        if (inputType === 'string' || inputType === 'number' || inputType === 'boolean' || inputType === 'bigint' || inputType === 'symbol') {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            return String(input);
        }

        if (inputType === 'object') {
            try {
                return JSON.stringify(input);
            } catch (error) {
                throw new Error('Failed to convert object to string: ' + (error as Error).message);
            }
        }

        throw new Error(`Unsupported input type: ${inputType}`);
    }

    extractStringOrDefault(input: unknown, defaultValue: string): string {
        try {
            return this.extractString(input);
        } catch {
            return defaultValue;
        }
    }

    extractStringOrDefaultFromMap(input: unknown, defaultValueKey: string, defaultValues: StringKeyValueObject): string {
        try {
            return this.extractString(input);
        } catch {
            return defaultValues[defaultValueKey] ?? '';
        }
    }

    extractStringOrJsonStringOrEmptyString(input: unknown): string {
        try {
            return this.extractString(input);
        } catch {
            return '';
        }
    }
}
