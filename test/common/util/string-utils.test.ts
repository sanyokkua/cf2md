import log from 'loglevel';
import { StringUtils, StringUtilsImpl } from '../../../src/common';

describe('string-utils', () => {
    let stringUtils: StringUtils;
    let traceSpy: jest.SpyInstance;
    let debugSpy: jest.SpyInstance;

    describe('isBlankString', () => {
        beforeEach(() => {
            // Spy on logging methods.
            stringUtils = new StringUtilsImpl();
            traceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
            debugSpy = jest.spyOn(log, 'debug').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it(`should return false for null`, () => {
            expect(stringUtils.isBlankString(null)).toBeTruthy();
        });

        it(`should return false for undefined`, () => {
            expect(stringUtils.isBlankString(null)).toBeTruthy();
        });

        it(`should return false for ""`, () => {
            expect(stringUtils.isBlankString('')).toBeTruthy();
        });

        it(`should return false for "  "`, () => {
            expect(stringUtils.isBlankString('  ')).toBeTruthy();
        });

        it(`should return true for " This Is A String "`, () => {
            expect(stringUtils.isBlankString(' This Is A String ')).toBeFalsy();
        });
    });

    describe('isValidNotBlankString', () => {
        beforeEach(() => {
            // Spy on logging methods.
            stringUtils = new StringUtilsImpl();
            traceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
            debugSpy = jest.spyOn(log, 'debug').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it(`should return false for null`, () => {
            expect(stringUtils.isValidNotBlankString(null)).toBeFalsy();
        });

        it(`should return false for undefined`, () => {
            expect(stringUtils.isValidNotBlankString(null)).toBeFalsy();
        });

        it(`should return false for ""`, () => {
            expect(stringUtils.isValidNotBlankString('')).toBeFalsy();
        });

        it(`should return false for "  "`, () => {
            expect(stringUtils.isValidNotBlankString('  ')).toBeFalsy();
        });

        it(`should return true for " This Is A String "`, () => {
            expect(stringUtils.isValidNotBlankString(' This Is A String ')).toBeTruthy();
        });
    });

    describe('parseTemplateString', () => {
        beforeEach(() => {
            // Spy on logging methods.
            stringUtils = new StringUtilsImpl();
            traceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
            debugSpy = jest.spyOn(log, 'debug').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should return an empty array if there are no placeholders', () => {
            const template = 'Hello World!';
            const result = stringUtils.parseTemplateString(template);
            expect(result).toEqual([]);
            expect(debugSpy).not.toHaveBeenCalled();
            // Two trace calls: at start and at end.
            expect(traceSpy).toHaveBeenCalledTimes(2);
        });

        it('should extract a single placeholder', () => {
            const template = 'Hello ${name}';
            const result = stringUtils.parseTemplateString(template);
            expect(result).toEqual(['name']);
            expect(debugSpy).toHaveBeenCalledTimes(1);
            expect(debugSpy).toHaveBeenCalledWith('[StringUtilsImpl.parseTemplateString] Found variable:', 'name');
        });

        it('should extract multiple distinct placeholders', () => {
            const template = 'Hello ${first}, meet ${second}';
            const result = stringUtils.parseTemplateString(template);
            expect(result).toEqual(['first', 'second']);
            expect(debugSpy).toHaveBeenCalledTimes(2);
            expect(debugSpy).toHaveBeenCalledWith('[StringUtilsImpl.parseTemplateString] Found variable:', 'first');
            expect(debugSpy).toHaveBeenCalledWith('[StringUtilsImpl.parseTemplateString] Found variable:', 'second');
        });

        it('should extract repeated placeholders', () => {
            const template = 'Repeat ${dup}, then ${dup}';
            const result = stringUtils.parseTemplateString(template);
            expect(result).toEqual(['dup', 'dup']);
            expect(debugSpy).toHaveBeenCalledTimes(2);
        });

        it('should extract adjacent placeholders', () => {
            const template = 'Values: ${a}${b}';
            const result = stringUtils.parseTemplateString(template);
            expect(result).toEqual(['a', 'b']);
            expect(debugSpy).toHaveBeenCalledTimes(2);
        });

        it('should return an empty array for a malformed placeholder (missing closing brace)', () => {
            const template = 'This is a ${test';
            const result = stringUtils.parseTemplateString(template);
            expect(result).toEqual([]);
        });

        it('should extract placeholders that include spaces', () => {
            const template = 'Hello ${first name}';
            const result = stringUtils.parseTemplateString(template);
            expect(result).toEqual(['first name']);
        });

        it('should return an empty array when the template is an empty string', () => {
            const template = '';
            const result = stringUtils.parseTemplateString(template);
            expect(result).toEqual([]);
        });
    });

    describe('replaceTemplateVariables', () => {
        beforeEach(() => {
            stringUtils = new StringUtilsImpl();
            traceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
            debugSpy = jest.spyOn(log, 'debug').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should replace a single placeholder with the provided value', () => {
            const template = 'Hello ${name}';
            const values = { name: 'World' };
            const result = stringUtils.replaceTemplateVariables(template, values);
            expect(result).toBe('Hello World');
            expect(debugSpy).toHaveBeenCalledWith(
                '[StringUtilsImpl.replaceTemplateVariables] Replacing placeholder:',
                '${name}',
                'with value:',
                'World',
            );
            expect(traceSpy).toHaveBeenCalledTimes(2);
        });

        it('should replace multiple occurrences of the same placeholder', () => {
            const template = 'Hello ${name}, ${name}!';
            const values = { name: 'John' };
            const result = stringUtils.replaceTemplateVariables(template, values);
            expect(result).toBe('Hello John, John!');
            // Only one replacement loop since there's one key.
            expect(debugSpy).toHaveBeenCalledTimes(1);
            expect(debugSpy).toHaveBeenCalledWith(
                '[StringUtilsImpl.replaceTemplateVariables] Replacing placeholder:',
                '${name}',
                'with value:',
                'John',
            );
        });

        it('should replace multiple different placeholders', () => {
            const template = 'The ${animal} jumped over the ${object}';
            const values = { animal: 'cow', object: 'moon' };
            const result = stringUtils.replaceTemplateVariables(template, values);
            expect(result).toBe('The cow jumped over the moon');
            expect(debugSpy).toHaveBeenCalledTimes(2);
        });

        it('should leave placeholders intact if no corresponding value is provided', () => {
            const template = 'Hello ${name} and ${city}';
            const values = { name: 'Alice' };
            const result = stringUtils.replaceTemplateVariables(template, values);
            expect(result).toBe('Hello Alice and ${city}');
            // Only ${name} replacement occurs.
            expect(debugSpy).toHaveBeenCalledTimes(1);
        });

        it('should convert non-string values to their string representation', () => {
            const template = 'Number: ${num}, Boolean: ${isActive}';
            const values = { num: 123, isActive: false };
            const result = stringUtils.replaceTemplateVariables(template, values);
            expect(result).toBe('Number: 123, Boolean: false');
            expect(debugSpy).toHaveBeenCalledTimes(2);
        });

        it('should properly replace keys containing special regex characters', () => {
            const template = 'Sum: ${a+b}';
            const values = { 'a+b': 5 };
            const result = stringUtils.replaceTemplateVariables(template, values);
            expect(result).toBe('Sum: 5');
            expect(debugSpy).toHaveBeenCalledWith('[StringUtilsImpl.replaceTemplateVariables] Replacing placeholder:', '${a+b}', 'with value:', 5);
        });

        it('should leave the template unchanged if there are no placeholders', () => {
            const template = 'Static text';
            const values = { any: 'value' };
            const result = stringUtils.replaceTemplateVariables(template, values);
            expect(result).toBe('Static text');
        });

        it('should not replace partial or malformed placeholders', () => {
            const template = 'This is not a placeholder: $name or ${name';
            const values = { name: 'Test' };
            const result = stringUtils.replaceTemplateVariables(template, values);
            expect(result).toBe('This is not a placeholder: $name or ${name');
        });
    });

    describe('joinStrings', () => {
        beforeEach(() => {
            stringUtils = new StringUtilsImpl();
        });

        it('should join strings', () => {
            const result = stringUtils.joinStrings(['a', 'b', 'c'], ',');
            expect(result).toBe('a,b,c');
        });
    });

    describe('splitString', () => {
        beforeEach(() => {
            stringUtils = new StringUtilsImpl();
        });

        it('should split string', () => {
            const result = stringUtils.splitString('a,b,c,d', ',');
            expect(result).toStrictEqual(['a', 'b', 'c', 'd']);
        });
    });
});
