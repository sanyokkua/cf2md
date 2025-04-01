import log from 'loglevel';
import { StringUtils } from '../../../common';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { RandomUtils, ResourceUtils } from '../../types/util-service-types';

export class ResourceUtilsImpl implements ResourceUtils {
    constructor(
        private readonly stringUtils: StringUtils,
        private readonly randomUtils: RandomUtils,
    ) {
        log.trace('[ResourceUtilsImpl.constructor] Entering constructor.');
        log.trace('[ResourceUtilsImpl.constructor] stringUtils:', this.stringUtils);
        log.trace('[ResourceUtilsImpl.constructor] randomUtils:', this.randomUtils);
        log.trace('[ResourceUtilsImpl.constructor] Exiting constructor.');
    }

    generateAZs(region: string): string[] {
        log.trace('[ResourceUtilsImpl.generateAZs] Entering with arguments:', { region });
        if (this.stringUtils.isBlankString(region)) {
            log.warn('[ResourceUtilsImpl.generateAZs] Received a blank region, returning empty AZs');
            const result: string[] = [];
            log.trace('[ResourceUtilsImpl.generateAZs] Exiting, returning:', result);
            return result;
        }

        const azs = [`${region}-1a`, `${region}-1b`];
        log.debug(`[ResourceUtilsImpl.generateAZs] Generated AZs for region "${region}":`, azs);
        log.trace('[ResourceUtilsImpl.generateAZs] Exiting, returning:', azs);
        return azs;
    }

    generateAlphaNumeric(length: number, ctx: ResolvingContext): string {
        log.trace('[ResourceUtilsImpl.generateAlphaNumeric] Entering with arguments:', { length, ctx });
        const maxAttempts = 10;
        let attempt = 0;
        let result: string;

        do {
            result = this.randomUtils.randomString(length, length);
            attempt++;
            if (ctx.isIdExists(result)) {
                log.trace(
                    `[ResourceUtilsImpl.generateAlphaNumeric] Attempt ${String(attempt)}: Generated id "${result}" already exists. Trying again...`,
                );
            } else {
                log.debug(`[ResourceUtilsImpl.generateAlphaNumeric] Unique alphanumeric id generated: "${result}" on attempt ${String(attempt)}`);
                break;
            }
            if (attempt >= maxAttempts) {
                log.error(
                    `[ResourceUtilsImpl.generateAlphaNumeric] Exceeded maximum attempts (${String(maxAttempts)}) to generate a unique alphanumeric id. Using last generated id: "${result}"`,
                );
                break;
            }
        } while (attempt < maxAttempts);

        log.trace('[ResourceUtilsImpl.generateAlphaNumeric] Exiting, returning:', result);
        return result;
    }

    shortUuid(ctx: ResolvingContext): string {
        log.trace('[ResourceUtilsImpl.shortUuid] Entering with arguments:', { ctx });
        const maxAttempts = 10;
        let attempt = 0;
        let idString: string;

        do {
            idString = this.randomUtils.shortUuid();
            attempt++;
            if (ctx.isIdExists(idString)) {
                log.trace(`[ResourceUtilsImpl.shortUuid] Attempt ${String(attempt)}: Short UUID "${idString}" already exists. Retrying...`);
            } else {
                log.debug(`[ResourceUtilsImpl.shortUuid] Unique short UUID generated: "${idString}" on attempt ${String(attempt)}`);
                break;
            }
            if (attempt >= maxAttempts) {
                log.error(
                    `[ResourceUtilsImpl.shortUuid] Exceeded maximum attempts (${String(maxAttempts)}) to generate a unique short UUID. Using last generated value: "${idString}"`,
                );
                break;
            }
        } while (attempt < maxAttempts);

        log.trace('[ResourceUtilsImpl.shortUuid] Exiting, returning:', idString);
        return idString;
    }

    fullUuid(ctx: ResolvingContext): string {
        log.trace('[ResourceUtilsImpl.fullUuid] Entering with arguments:', { ctx });
        const maxAttempts = 10;
        let attempt = 0;
        let idString: string;

        do {
            idString = this.randomUtils.fullUuid();
            attempt++;
            if (ctx.isIdExists(idString)) {
                log.trace(`[ResourceUtilsImpl.fullUuid] Attempt ${String(attempt)}: Full UUID "${idString}" already exists. Retrying...`);
            } else {
                log.debug(`[ResourceUtilsImpl.fullUuid] Unique full UUID generated: "${idString}" on attempt ${String(attempt)}`);
                break;
            }
            if (attempt >= maxAttempts) {
                log.error(
                    `[ResourceUtilsImpl.fullUuid] Exceeded maximum attempts (${String(maxAttempts)}) to generate a unique full UUID. Using last generated value: "${idString}"`,
                );
                break;
            }
        } while (attempt < maxAttempts);

        log.trace('[ResourceUtilsImpl.fullUuid] Exiting, returning:', idString);
        return idString;
    }

    generateGenericId(logicalId: string, uniqAlphaNumericSize: number, ctx: ResolvingContext): string {
        log.trace('[ResourceUtilsImpl.generateGenericId] Entering with arguments:', { logicalId, uniqAlphaNumericSize, ctx });
        const stackName = ctx.getStackName();
        const unique = this.generateAlphaNumeric(uniqAlphaNumericSize, ctx);
        const generatedId = `${stackName}-${logicalId}-${unique}`;
        log.trace(`[ResourceUtilsImpl.generateGenericId] Generated ID: ${generatedId}`);
        log.trace('[ResourceUtilsImpl.generateGenericId] Exiting, returning:', generatedId);
        return generatedId;
    }

    generatePrefixedId(idPrefix: string, uniqAlphaNumericSize: number, ctx: ResolvingContext): string {
        log.trace('[ResourceUtilsImpl.generatePrefixedId] Entering with arguments:', { idPrefix, uniqAlphaNumericSize, ctx });
        const unique = this.generateAlphaNumeric(uniqAlphaNumericSize, ctx);
        const resolvedName = `${idPrefix}-${unique}`;
        log.trace(`[ResourceUtilsImpl.generatePrefixedId] Generated Name ID: ${resolvedName}`);
        log.trace('[ResourceUtilsImpl.generatePrefixedId] Exiting, returning:', resolvedName);
        return resolvedName;
    }

    generateNameId(
        nameField: unknown,
        nameFieldPath: string,
        defaultNamePattern: string,
        ctx: ResolvingContext,
        resolveValue: ValueResolverFunc,
        alphanumericLength: number,
    ): string {
        log.trace('[ResourceUtilsImpl.generateNameId] Entering with arguments:', {
            nameField,
            nameFieldPath,
            defaultNamePattern,
            ctx,
            alphanumericLength,
        });
        const defaultName = this.generatePrefixedId(defaultNamePattern, alphanumericLength, ctx);
        const resolvedName = this.resolveStringWithDefault(nameField, defaultName, nameFieldPath, ctx, resolveValue);
        log.trace(`[ResourceUtilsImpl.generateNameId] Generated Name ID: ${resolvedName}`);
        log.trace('[ResourceUtilsImpl.generateNameId] Exiting, returning:', resolvedName);
        return resolvedName;
    }

    resolveString(property: unknown, propertyName: string, ctx: ResolvingContext, resolveValue: ValueResolverFunc): string {
        log.trace('[ResourceUtilsImpl.resolveString] Entering with arguments:', { property, propertyName, ctx });
        if (property === undefined || property === null) {
            log.warn(`[ResourceUtilsImpl.resolveString] ${propertyName} doesn't have a value`);
            const error = new Error(`${propertyName} must not be null or undefined.`);
            log.error(`[ResourceUtilsImpl.resolveString] Error:`, error);
            throw error;
        }

        const resolved = resolveValue(property, ctx);
        if (typeof resolved !== 'string') {
            log.warn(`[ResourceUtilsImpl.resolveString] ${propertyName} was not resolved into a string`);
            const error = new Error(`${propertyName} was resolved to a non-string type.`);
            log.error(`[ResourceUtilsImpl.resolveString] Error:`, error);
            throw error;
        }

        log.trace(`[ResourceUtilsImpl.resolveString] ${propertyName} resolved to string value: "${resolved}"`);
        log.trace('[ResourceUtilsImpl.resolveString] Exiting, returning:', resolved);
        return resolved;
    }

    resolveStringWithDefault(
        property: unknown,
        defaultValue: string,
        propertyName: string,
        ctx: ResolvingContext,
        resolveValue: ValueResolverFunc,
    ): string {
        log.trace('[ResourceUtilsImpl.resolveStringWithDefault] Entering with arguments:', { property, defaultValue, propertyName, ctx });
        if (!property) {
            log.trace(`[ResourceUtilsImpl.resolveStringWithDefault] ${propertyName} is not provided, returning default value: "${defaultValue}"`);
            log.trace('[ResourceUtilsImpl.resolveStringWithDefault] Exiting, returning:', defaultValue);
            return defaultValue;
        }

        const resolved = resolveValue(property, ctx);
        if (typeof resolved === 'string') {
            log.trace(`[ResourceUtilsImpl.resolveStringWithDefault] ${propertyName} successfully resolved to string: "${resolved}"`);
            log.trace('[ResourceUtilsImpl.resolveStringWithDefault] Exiting, returning:', resolved);
            return resolved;
        }

        log.trace(
            `[ResourceUtilsImpl.resolveStringWithDefault] ${propertyName} did not resolve to a string, returning default value: "${defaultValue}"`,
        );
        log.trace('[ResourceUtilsImpl.resolveStringWithDefault] Exiting, returning:', defaultValue);
        return defaultValue;
    }
}
