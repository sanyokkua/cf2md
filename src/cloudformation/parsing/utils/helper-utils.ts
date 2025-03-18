import { isBlankString } from 'coreutilsts';
import log from 'loglevel';
import { v4 as uuidv4 } from 'uuid';
import { randomString } from '../../../utils/random-utils';
import { UnexpectedVariableTypeError } from '../errors/errors';
import { resolveValue } from '../resolver/value-resolver';
import { ResolvingContext } from '../types/types';

/**
 * Generates an array of Availability Zones (AZs) for the specified AWS region.
 *
 * @param region - The AWS region identifier (e.g., "us-east-1").
 * @returns An array of AZ identifiers formatted as [`${region}-1a`, `${region}-1b`].
 */
export function generateAZs(region: string): string[] {
    log.trace(`generateAZs called with region: "${region}"`);
    if (isBlankString(region)) {
        log.warn('generateAZs received a blank region, returning empty AZs');
        return [];
    }
    const azs = [`${region}-1a`, `${region}-1b`];
    log.debug(`Generated AZs for region "${region}": ${JSON.stringify(azs)}`);
    return azs;
}

/**
 * Generates a unique alphanumeric string of the given length.
 *
 * This function uses a random string generator and checks for uniqueness within the provided
 * resolution context. If a generated string already exists, it will regenerate until a unique
 * value is found or a maximum number of attempts is reached.
 *
 * @param length - The length of the desired alphanumeric string.
 * @param ctx - The resolution context used to verify uniqueness.
 * @returns A unique alphanumeric string.
 */
export function generateAlphaNumeric(length: number, ctx: ResolvingContext): string {
    const maxAttempts = 10;
    let attempt = 0;
    let result: string;

    do {
        result = randomString(length, length);
        attempt++;
        if (ctx.isIdExists(result)) {
            log.trace(`Attempt ${String(attempt)}: Generated id "${result}" already exists. Trying again...`);
        } else {
            log.debug(`Unique alphanumeric id generated: "${result}" on attempt ${String(attempt)}`);
            break;
        }
        if (attempt >= maxAttempts) {
            log.error(
                `Exceeded maximum attempts (${String(maxAttempts)}) to generate a unique alphanumeric id. Using last generated id: "${result}"`,
            );
            break;
        }
    } while (attempt < maxAttempts);

    return result;
}

/**
 * Generates a short UUID (12-character string) from a UUID v4.
 *
 * This function removes dashes from the generated UUID and truncates it to 12 characters.
 * Uniqueness is validated within the resolution context.
 *
 * @param ctx - The resolution context used to verify uniqueness.
 * @returns A unique short UUID string.
 */
export function shortUuid(ctx: ResolvingContext): string {
    const maxAttempts = 10;
    let attempt = 0;
    let idString: string;

    do {
        idString = uuidv4().replace(/-/g, '').substring(0, 12);
        attempt++;
        if (ctx.isIdExists(idString)) {
            log.trace(`Attempt ${String(attempt)}: Short UUID "${idString}" already exists. Retrying...`);
        } else {
            log.debug(`Unique short UUID generated: "${idString}" on attempt ${String(attempt)}`);
            break;
        }
        if (attempt >= maxAttempts) {
            log.error(
                `Exceeded maximum attempts (${String(maxAttempts)}) to generate a unique short UUID. Using last generated value: "${idString}"`,
            );
            break;
        }
    } while (attempt < maxAttempts);

    return idString;
}

/**
 * Generates a full UUID (v4 string).
 *
 * Uniqueness is validated within the resolution context.
 *
 * @param ctx - The resolution context used to verify uniqueness.
 * @returns A unique full UUID string.
 */
export function fullUuid(ctx: ResolvingContext): string {
    const maxAttempts = 10;
    let attempt = 0;
    let idString: string;

    do {
        idString = uuidv4();
        attempt++;
        if (ctx.isIdExists(idString)) {
            log.trace(`Attempt ${String(attempt)}: Full UUID "${idString}" already exists. Retrying...`);
        } else {
            log.debug(`Unique full UUID generated: "${idString}" on attempt ${String(attempt)}`);
            break;
        }
        if (attempt >= maxAttempts) {
            log.error(
                `Exceeded maximum attempts (${String(maxAttempts)}) to generate a unique full UUID. Using last generated value: "${idString}"`,
            );
            break;
        }
    } while (attempt < maxAttempts);

    return idString;
}

/**
 * Resolves a property value into a string using the provided resolution context.
 *
 * The function first validates that the input property is defined, then resolves it
 * using the recursive value resolver. If the resolved value is not a string, an error is thrown.
 *
 * @param property - The property to resolve.
 * @param propertyName - The descriptive name of the property (used for logging).
 * @param ctx - The resolution context.
 * @returns The resolved string value.
 * @throws {UnexpectedVariableTypeError} If the property is null/undefined or does not resolve to a string.
 */
export function resolveString(property: unknown, propertyName: string, ctx: ResolvingContext): string {
    if (property === undefined || property === null) {
        log.warn(`${propertyName} doesn't have a value`);
        throw new UnexpectedVariableTypeError(`${propertyName} must not be null or undefined.`);
    }

    const resolved = resolveValue(property, ctx);
    if (typeof resolved !== 'string') {
        log.warn(`${propertyName} was not resolved into a string`);
        throw new UnexpectedVariableTypeError(`${propertyName} was resolved to a non-string type.`);
    }

    log.trace(`${propertyName} resolved to string value: "${resolved}"`);
    return resolved;
}

/**
 * Resolves a property value into a string, returning a default value if unresolved or invalid.
 *
 * The function attempts to resolve the property using the provided resolution context.
 * If the property is undefined or the resolved value is not a string, the specified default
 * string is returned.
 *
 * @param property - The property to resolve.
 * @param defaultValue - The default string value to return in case the property is not provided or not resolvable to a string.
 * @param propertyName - The descriptive name of the property (used for logging).
 * @param ctx - The resolution context.
 * @returns The resolved string value or the default value.
 */
export function resolveStringWithDefault(
    property: unknown,
    defaultValue: string,
    propertyName: string,
    ctx: ResolvingContext,
): string {
    if (!property) {
        log.trace(`${propertyName} is not provided, returning default value: "${defaultValue}"`);
        return defaultValue;
    }

    const resolved = resolveValue(property, ctx);
    if (typeof resolved === 'string') {
        log.trace(`${propertyName} successfully resolved to string: "${resolved}"`);
        return resolved;
    }

    log.trace(`${propertyName} did not resolve to a string, returning default value: "${defaultValue}"`);
    return defaultValue;
}
