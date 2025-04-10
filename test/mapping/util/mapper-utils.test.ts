import { StringKeyValueObject } from '../../../src/common';
import { MapperUtil } from '../../../src/mapping/types/utils-model';
import { MapperUtilsImpl } from '../../../src/mapping/util/mapper-utils';

describe('MapperUtilsImpl', () => {
    let mapperUtils: MapperUtil;

    beforeEach(() => {
        mapperUtils = new MapperUtilsImpl();
    });

    describe('extractString', () => {
        it('should throw an error if input is null', () => {
            expect(() => mapperUtils.extractString(null)).toThrow('Input cannot be null or undefined');
        });

        it('should throw an error if input is undefined', () => {
            expect(() => mapperUtils.extractString(undefined)).toThrow('Input cannot be null or undefined');
        });

        it('should return the string representation of a string', () => {
            expect(mapperUtils.extractString('test')).toBe('test');
        });

        it('should return the string representation of a number', () => {
            expect(mapperUtils.extractString(123)).toBe('123');
        });

        it('should return the string representation of zero', () => {
            expect(mapperUtils.extractString(0)).toBe('0');
        });

        it('should return the string representation of -5', () => {
            expect(mapperUtils.extractString(-5)).toBe('-5');
        });

        it('should return the string representation of 0.009', () => {
            expect(mapperUtils.extractString(0.009)).toBe('0.009');
        });

        it('should return the string representation of a boolean (true)', () => {
            expect(mapperUtils.extractString(true)).toBe('true');
        });

        it('should return the string representation of a boolean (false)', () => {
            expect(mapperUtils.extractString(false)).toBe('false');
        });

        it('should return the string representation of a bigint', () => {
            expect(mapperUtils.extractString(BigInt(123))).toBe('123');
        });

        it('should return the string representation of a symbol', () => {
            const sym = Symbol('test');
            expect(mapperUtils.extractString(sym)).toBe('Symbol(test)');
        });

        it('should return the JSON string representation of a simple object', () => {
            const obj = { key: 'value' };
            expect(mapperUtils.extractString(obj)).toBe('{"key":"value"}');
        });

        it('should return the JSON string representation of an array', () => {
            const arr = [1, 'two', true];
            expect(mapperUtils.extractString(arr)).toBe('[1,"two",true]');
        });

        it('should throw an error if input is an object with circular references', () => {
            const obj: any = {};
            obj.circular = obj;
            expect(() => mapperUtils.extractString(obj)).toThrow();
        });

        it('should throw an error for an unsupported input type (function)', () => {
            const func = () => {};
            expect(() => mapperUtils.extractString(func)).toThrow('Unsupported input type: function');
        });
    });

    describe('extractStringOrDefault', () => {
        it('should return the string representation if extractString succeeds', () => {
            expect(mapperUtils.extractStringOrDefault('test', 'default')).toBe('test');
        });

        it('should return the default value if extractString throws an error (null input)', () => {
            expect(mapperUtils.extractStringOrDefault(null, 'default')).toBe('default');
        });

        it('should return the default value if extractString throws an error (unsupported type)', () => {
            const func = () => {};
            expect(mapperUtils.extractStringOrDefault(func, 'default')).toBe('default');
        });
    });

    describe('extractStringOrDefaultFromMap', () => {
        const defaultValues: StringKeyValueObject = {
            key1: 'value1',
            key2: 'value2',
        };

        it('should return the string representation if extractString succeeds', () => {
            expect(mapperUtils.extractStringOrDefaultFromMap('test', 'key1', defaultValues)).toBe('test');
        });

        it('should return the value from the map if extractString throws an error and key exists', () => {
            expect(mapperUtils.extractStringOrDefaultFromMap(null, 'key1', defaultValues)).toBe('value1');
        });

        it('should return an empty string if extractString throws an error and key does not exist', () => {
            expect(mapperUtils.extractStringOrDefaultFromMap(undefined, 'nonExistentKey', defaultValues)).toBe('');
        });

        it('should return an empty string if extractString throws an error and defaultValues is empty', () => {
            expect(mapperUtils.extractStringOrDefaultFromMap(undefined, 'key1', {})).toBe('');
        });
    });

    describe('extractStringOrJsonStringOrEmptyString', () => {
        it('should return the string representation if extractString succeeds', () => {
            expect(mapperUtils.extractStringOrJsonStringOrEmptyString('test')).toBe('test');
        });

        it('should return an empty string if extractString throws an error (null input)', () => {
            expect(mapperUtils.extractStringOrJsonStringOrEmptyString(null)).toBe('');
        });

        it('should return an empty string if extractString throws an error (unsupported type)', () => {
            const func = () => {};
            expect(mapperUtils.extractStringOrJsonStringOrEmptyString(func)).toBe('');
        });
    });
});
