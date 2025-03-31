import { RandomUtilsImpl } from '../../../src/parsing/random/random-utils';
import { RandomUtils } from '../../../src/parsing/types/util-service-types';

describe('RandomUtils', () => {
    let randomUtils: RandomUtils;

    beforeEach(() => {
        randomUtils = new RandomUtilsImpl();
    });

    describe('randomString', () => {
        const allowedCharsRegex = /^[a-z0-9]+$/;

        it('should return a string with length between the given min and max', () => {
            const min = 10;
            const max = 20;
            const str = randomUtils.randomString(min, max);
            expect(str).toMatch(allowedCharsRegex);
            expect(str.length).toBeGreaterThanOrEqual(min);
            expect(str.length).toBeLessThanOrEqual(max);
        });

        it('should return a string with fixed length when minLength equals maxLength', () => {
            const fixedLength = 8;
            const str = randomUtils.randomString(fixedLength, fixedLength);
            expect(str.length).toBe(fixedLength);
            expect(str).toMatch(allowedCharsRegex);
        });

        it('should throw an error if maxLength is less than minLength', () => {
            expect(() => randomUtils.randomString(10, 5)).toThrow('maxLength must be greater than or equal to minLength');
        });
    });

    describe('randomInteger', () => {
        it('should return an integer within a specified range', () => {
            const min = 50;
            const max = 60;
            const num = randomUtils.randomInteger(min, max);
            expect(num).toBeGreaterThanOrEqual(min);
            expect(num).toBeLessThanOrEqual(max);
        });

        it('should always return the fixed number when min equals max', () => {
            const fixedValue = 42;
            const num = randomUtils.randomInteger(fixedValue, fixedValue);
            expect(num).toBe(fixedValue);
        });

        it('should return the minimum value when Math.random returns 0', () => {
            const spy = jest.spyOn(Math, 'random').mockReturnValue(0);
            const min = 10;
            const max = 20;
            const num = randomUtils.randomInteger(min, max);
            expect(num).toBe(min);
            spy.mockRestore();
        });

        it('should return the maximum value when Math.random returns a value close to 1', () => {
            const spy = jest.spyOn(Math, 'random').mockReturnValue(0.9999);
            const min = 10;
            const max = 20;
            const num = randomUtils.randomInteger(min, max);
            expect(num).toBe(max);
            spy.mockRestore();
        });

        it('should throw an error if max is less than min', () => {
            expect(() => randomUtils.randomInteger(20, 10)).toThrow('max must be greater than or equal to min');
        });
    });

    describe('randomArray', () => {
        const constantGenerator = jest.fn(() => 42);

        beforeEach(() => {
            constantGenerator.mockClear();
        });

        it('should return an array with length between specified minItems and maxItems', () => {
            const minItems = 3;
            const maxItems = 7;
            const arr = randomUtils.randomArray(constantGenerator, minItems, maxItems);
            expect(arr.length).toBeGreaterThanOrEqual(minItems);
            expect(arr.length).toBeLessThanOrEqual(maxItems);
            expect(constantGenerator).toHaveBeenCalledTimes(arr.length);
        });

        it('should return an array with fixed length when minItems equals maxItems', () => {
            const fixedCount = 4;
            const arr = randomUtils.randomArray(constantGenerator, fixedCount, fixedCount);
            expect(arr.length).toBe(fixedCount);
            expect(constantGenerator).toHaveBeenCalledTimes(fixedCount);
        });

        it('should return a predictable length when Math.random is overridden (minimum case)', () => {
            const minItems = 2;
            const maxItems = 5;
            const spy = jest.spyOn(Math, 'random').mockReturnValue(0);
            const arr = randomUtils.randomArray(constantGenerator, minItems, maxItems);
            expect(arr.length).toBe(minItems);
            spy.mockRestore();
        });

        it('should return a predictable length when Math.random is overridden (maximum case)', () => {
            const minItems = 2;
            const maxItems = 5;
            const spy = jest.spyOn(Math, 'random').mockReturnValue(0.9999);
            const arr = randomUtils.randomArray(constantGenerator, minItems, maxItems);
            expect(arr.length).toBe(maxItems);
            spy.mockRestore();
        });

        it('should throw an error if maxItems is less than minItems', () => {
            expect(() => randomUtils.randomArray(constantGenerator, 5, 3)).toThrow('maxItems must be greater than or equal to minItems');
        });
    });

    describe('shortUuid', () => {
        it('should return a 12-character string without dashes', () => {
            const result = randomUtils.shortUuid();
            expect(result.length).toBe(12);
            expect(result.includes('-')).toBeFalsy();
        });
    });

    describe('fullUuid', () => {
        it('should return a full uuid string with dashes', () => {
            const result = randomUtils.fullUuid();
            expect(result.length).toBe(36);
            expect(result.includes('-')).toBeTruthy();
            expect(result.split('-').length).toBe(5);
        });
    });
});
