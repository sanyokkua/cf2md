import { isValidString } from '../../src/utils/validation-utils';

describe('Validation Utils', () => {
    describe('isValidString', () => {
        it(`should return false for null`, () => {
            expect(isValidString(null)).toBeFalsy();
        });

        it(`should return false for undefined`, () => {
            expect(isValidString(null)).toBeFalsy();
        });

        it(`should return false for ""`, () => {
            expect(isValidString('')).toBeFalsy();
        });

        it(`should return false for "  "`, () => {
            expect(isValidString('  ')).toBeFalsy();
        });

        it(`should return true for " This Is A String "`, () => {
            expect(isValidString(' This Is A String ')).toBeTruthy();
        });
    });
});
