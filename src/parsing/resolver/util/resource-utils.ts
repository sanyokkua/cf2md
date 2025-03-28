import log from 'loglevel';
import { StringUtils } from '../../../common';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { RandomUtils, ResourceUtils } from '../../types/util-service-types';

export class ResourceUtilsImpl implements ResourceUtils {
    constructor(
        private readonly stringUtils: StringUtils,
        private readonly randomUtils: RandomUtils,
    ) {}

    generateAZs(region: string): string[] {
        log.trace(`generateAZs called with region: "${region}"`);
        if (this.stringUtils.isBlankString(region)) {
            log.warn('generateAZs received a blank region, returning empty AZs');
            return [];
        }

        const azs = [`${region}-1a`, `${region}-1b`];
        log.debug(`Generated AZs for region "${region}": ${JSON.stringify(azs)}`);
        return azs;
    }

    generateAlphaNumeric(length: number, ctx: ResolvingContext): string {
        const maxAttempts = 10;
        let attempt = 0;
        let result: string;

        do {
            result = this.randomUtils.randomString(length, length);
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

    shortUuid(ctx: ResolvingContext): string {
        const maxAttempts = 10;
        let attempt = 0;
        let idString: string;

        do {
            idString = this.randomUtils.shortUuid();
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

    fullUuid(ctx: ResolvingContext): string {
        const maxAttempts = 10;
        let attempt = 0;
        let idString: string;

        do {
            idString = this.randomUtils.fullUuid();
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

    generateGenericId(logicalId: string, uniqAlphaNumericSize: number, ctx: ResolvingContext): string {
        log.trace(`Called generateGenericId, with logicalId: ${logicalId}, alphaSize: ${String(uniqAlphaNumericSize)}`);
        const stackName = ctx.getStackName();
        const unique = this.generateAlphaNumeric(uniqAlphaNumericSize, ctx);
        const generatedId = `${stackName}-${logicalId}-${unique}`;
        log.trace(`Generated ID: ${generatedId}`);
        return generatedId;
    }

    generatePrefixedId(idPrefix: string, uniqAlphaNumericSize: number, ctx: ResolvingContext): string {
        log.trace(`Called generatePrefixedId, with idPrefix: ${idPrefix}, alphaSize: ${String(uniqAlphaNumericSize)}`);
        const unique = this.generateAlphaNumeric(uniqAlphaNumericSize, ctx);
        const resolvedName = `${idPrefix}-${unique}`;
        log.trace(`Generated Name ID: ${resolvedName}`);
        return resolvedName;
    }

    generateNameId(
        nameField: unknown,
        nameFieldPath: string,
        defaultNamePattern: string,
        ctx: ResolvingContext,
        resolveValue: ValueResolverFunc,
        alphanumericLength: number = 6,
    ): string {
        log.trace(`Called generateNameId, with nameFieldPath: ${nameFieldPath}, defaultNamePattern: ${defaultNamePattern}`, nameFieldPath);
        const defaultName = this.generatePrefixedId(defaultNamePattern, alphanumericLength, ctx);
        const resolvedName = this.resolveStringWithDefault(nameField, defaultName, nameFieldPath, ctx, resolveValue);
        log.trace(`Generated Name ID: ${resolvedName}`);
        return resolvedName;
    }

    resolveString(property: unknown, propertyName: string, ctx: ResolvingContext, resolveValue: ValueResolverFunc): string {
        if (property === undefined || property === null) {
            log.warn(`${propertyName} doesn't have a value`);
            throw new Error(`${propertyName} must not be null or undefined.`);
        }

        const resolved = resolveValue(property, ctx);
        if (typeof resolved !== 'string') {
            log.warn(`${propertyName} was not resolved into a string`);
            throw new Error(`${propertyName} was resolved to a non-string type.`);
        }

        log.trace(`${propertyName} resolved to string value: "${resolved}"`);
        return resolved;
    }

    resolveStringWithDefault(
        property: unknown,
        defaultValue: string,
        propertyName: string,
        ctx: ResolvingContext,
        resolveValue: ValueResolverFunc,
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
}
