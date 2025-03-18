import { isNullOrBlankString } from 'coreutilsts';

/**
 * Checks whether a provided value is a valid, non-blank string.
 *
 * This function acts as a type guard ensuring that the input value:
 * - Is not null or undefined.
 * - Is of type string.
 * - Contains non-blank characters (i.e., not empty or solely whitespace), as determined by the
 *   utility function `isNullOrBlankString`.
 *
 * @param value - The value to check, which may be a string or may be undefined or null.
 * @returns True if the value is a valid, non-blank string; otherwise, false.
 *
 * @example
 * // Returns true
 * isValidString("hello");
 *
 * // Returns false, as the string is blank.
 * isValidString("   ");
 *
 * // Returns false, as the value is undefined.
 * isValidString(undefined);
 */
export function isValidString(value: string | undefined | null): value is string {
    // Check if the value is either null, undefined, or a blank string.
    return !(isNullOrBlankString(value) || typeof value !== 'string');
}
