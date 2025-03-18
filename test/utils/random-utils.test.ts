import { randomArray, randomInteger, randomString } from '../../src/utils/random-utils';

describe('randomString', () => {
    const allowedCharsRegex = /^[a-z0-9]+$/;

    it('should return a string within the default length [5, 15] and match allowed characters', () => {
        const str = randomString();
        expect(str).toMatch(allowedCharsRegex);
        expect(str.length).toBeGreaterThanOrEqual(5);
        expect(str.length).toBeLessThanOrEqual(15);
    });

    it('should return a string with length between the given min and max', () => {
        const min = 10;
        const max = 20;
        const str = randomString(min, max);
        expect(str).toMatch(allowedCharsRegex);
        expect(str.length).toBeGreaterThanOrEqual(min);
        expect(str.length).toBeLessThanOrEqual(max);
    });

    it('should return a string with fixed length when minLength equals maxLength', () => {
        const fixedLength = 8;
        const str = randomString(fixedLength, fixedLength);
        expect(str.length).toBe(fixedLength);
        expect(str).toMatch(allowedCharsRegex);
    });
});

describe('randomInteger', () => {
    it('should return an integer within the default range [1, 100]', () => {
        const num = randomInteger();
        expect(Number.isInteger(num)).toBe(true);
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(100);
    });

    it('should return an integer within a specified range', () => {
        const min = 50;
        const max = 60;
        const num = randomInteger(min, max);
        expect(num).toBeGreaterThanOrEqual(min);
        expect(num).toBeLessThanOrEqual(max);
    });

    it('should always return the fixed number when min equals max', () => {
        const fixedValue = 42;
        const num = randomInteger(fixedValue, fixedValue);
        expect(num).toBe(fixedValue);
    });

    it('should return the minimum value when Math.random returns 0', () => {
        const spy = jest.spyOn(Math, 'random').mockReturnValue(0); // Always returns 0
        const min = 10;
        const max = 20;
        const num = randomInteger(min, max);
        expect(num).toBe(min);
        spy.mockRestore();
    });

    it('should return the maximum value when Math.random returns a value close to 1', () => {
        // For min = 10, max = 20:
        // Calculation: Math.floor(0.9999 * (11)) = Math.floor(10.9989) = 10, then + 10 equals 20.
        const spy = jest.spyOn(Math, 'random').mockReturnValue(0.9999);
        const min = 10;
        const max = 20;
        const num = randomInteger(min, max);
        expect(num).toBe(max);
        spy.mockRestore();
    });
});

describe('randomArray', () => {
    // A simple item generator that returns a constant value.
    const constantGenerator = jest.fn(() => 42);

    beforeEach(() => {
        // Reset the generator count before each test.
        constantGenerator.mockClear();
    });

    it('should return an array with a default length between 1 and 5 and use the generator for items', () => {
        const arr = randomArray(constantGenerator);
        expect(arr.length).toBeGreaterThanOrEqual(1);
        expect(arr.length).toBeLessThanOrEqual(5);
        expect(constantGenerator).toHaveBeenCalledTimes(arr.length);
        // Verify each element from the generator.
        arr.forEach((item) => {
            expect(item).toBe(42);
        });
    });

    it('should return an array with length between specified minItems and maxItems', () => {
        const minItems = 3;
        const maxItems = 7;
        const arr = randomArray(constantGenerator, minItems, maxItems);
        expect(arr.length).toBeGreaterThanOrEqual(minItems);
        expect(arr.length).toBeLessThanOrEqual(maxItems);
        expect(constantGenerator).toHaveBeenCalledTimes(arr.length);
    });

    it('should return an array with fixed length when minItems equals maxItems', () => {
        const fixedCount = 4;
        const arr = randomArray(constantGenerator, fixedCount, fixedCount);
        expect(arr.length).toBe(fixedCount);
        expect(constantGenerator).toHaveBeenCalledTimes(fixedCount);
    });

    it('should return a predictable length when Math.random is overridden (minimum case)', () => {
        // For minItems = 2, maxItems = 5, when Math.random returns 0:
        // Calculation: Math.floor(0 * (5 - 2 + 1)) + 2 = 0 + 2 = 2.
        const minItems = 2;
        const maxItems = 5;
        const spy = jest.spyOn(Math, 'random').mockReturnValue(0);
        const arr = randomArray(constantGenerator, minItems, maxItems);
        expect(arr.length).toBe(minItems);
        spy.mockRestore();
    });

    it('should return a predictable length when Math.random is overridden (maximum case)', () => {
        // For minItems = 2, maxItems = 5:
        // Calculation: Math.floor(0.9999 * (5 - 2 + 1)) + 2 = Math.floor(0.9999 * 4) + 2.
        // Math.floor(3.9996) = 3, then +2 = 5.
        const minItems = 2;
        const maxItems = 5;
        const spy = jest.spyOn(Math, 'random').mockReturnValue(0.9999);
        const arr = randomArray(constantGenerator, minItems, maxItems);
        expect(arr.length).toBe(maxItems);
        spy.mockRestore();
    });
});
