import log from 'loglevel';
import { ParsingValidationError } from '../error/parsing-errors';
import { CloudFormationResource } from '../types/cloudformation-model';
import { Intrinsic, IntrinsicContext, IntrinsicResolver, ResourceIntrinsicResolver } from '../types/intrinsic-types';
import { ResolvingContext, ValueResolver } from '../types/resolving-types';
import { IntrinsicUtils } from '../types/util-service-types';

type StringKeyUnknownObject = Record<string, unknown>;

export class ValueResolverImpl implements ValueResolver {
    constructor(
        private readonly intrinsicUtils: IntrinsicUtils,
        private readonly intrinsicResolver: IntrinsicResolver,
        private readonly cfResourceResolver: ResourceIntrinsicResolver,
    ) {
        log.trace('[ValueResolverImpl.constructor] Entering with arguments:', { intrinsicUtils, intrinsicResolver });
        log.trace('[ValueResolverImpl.constructor] Exiting');
    }

    resolveValue(value: unknown, ctx: ResolvingContext): unknown {
        log.trace(`[ValueResolverImpl.resolveValue] Entering with arguments:`, { value, ctx });
        log.trace(`[ValueResolverImpl.resolveValue] Resolving value at path: ${ctx.getCurrentPath()}`);

        let resolvedValue: unknown;

        if (Array.isArray(value)) {
            resolvedValue = this.resolveArray(ctx, value);
        } else if (value !== null && typeof value === 'object') {
            const objValue = value as StringKeyUnknownObject;
            if (this.intrinsicUtils.isIntrinsic(objValue)) {
                resolvedValue = this.resolveIntrinsicObject(ctx, objValue);
            } else {
                resolvedValue = this.resolveObject(ctx, objValue);
            }
        } else {
            resolvedValue = this.resolvePrimitiveObject(ctx, value);
        }

        log.trace(`[ValueResolverImpl.resolveValue] Resolved value at path: ${ctx.getCurrentPath()} to:`, resolvedValue);
        return resolvedValue;
    }

    private resolveArray(ctx: ResolvingContext, value: unknown[]): unknown[] {
        log.trace('[ValueResolverImpl.resolveArray] Entering with arguments:', { ctx, value });
        log.debug(`[ValueResolverImpl.resolveArray] Encountered array at path: ${ctx.getCurrentPath()}`);
        const resolvedArray = value.map((item) => this.resolveValue(item, ctx));
        log.trace('[ValueResolverImpl.resolveArray] Exiting with result:', resolvedArray);
        return resolvedArray;
    }

    private resolveIntrinsicObject(ctx: ResolvingContext, value: StringKeyUnknownObject): unknown {
        log.trace('[ValueResolverImpl.resolveIntrinsicObject] Entering with arguments:', { ctx, value });
        const intrinsicKey: string | undefined = this.intrinsicUtils.getIntrinsicKey(value);
        if (!intrinsicKey) {
            const errorMsg = 'Intrinsic key missing';
            log.error(`[ValueResolverImpl.resolveIntrinsicObject] Error: ${errorMsg} at path: ${ctx.getCurrentPath()}`, value);
            throw new ParsingValidationError(errorMsg);
        }
        log.debug(`[ValueResolverImpl.resolveIntrinsicObject] Found intrinsic "${intrinsicKey}" at path: ${ctx.getCurrentPath()}`);

        const result = this.withContextName(ctx, intrinsicKey, () => {
            const intrinsic: Intrinsic = this.intrinsicResolver.getIntrinsic(intrinsicKey);
            const resolverFunction = (val: unknown, context: ResolvingContext) => this.resolveValue(val, context);
            try {
                const resolved = intrinsic.resolveValue(value, ctx, resolverFunction);
                log.debug(`[ValueResolverImpl.resolveIntrinsicObject] Intrinsic "${intrinsicKey}" resolved to:`, resolved);
                return resolved;
            } catch (error) {
                log.error(
                    `[ValueResolverImpl.resolveIntrinsicObject] Error resolving intrinsic "${intrinsicKey}" at path: ${ctx.getCurrentPath()}`,
                    error,
                    value,
                );
                throw error;
            }
        });
        log.trace('[ValueResolverImpl.resolveIntrinsicObject] Exiting with result:', result);
        return result;
    }

    private resolveObject(ctx: ResolvingContext, value: StringKeyUnknownObject): unknown {
        log.trace('[ValueResolverImpl.resolveObject] Entering with arguments:', { ctx, value });
        const result: StringKeyUnknownObject = {};

        log.debug(`[ValueResolverImpl.resolveObject] Recursively resolving object at path: ${ctx.getCurrentPath()}`);
        for (const key of Object.keys(value)) {
            const valueElement = value[key];
            if (typeof valueElement === 'object') {
                // Before processing any object, check if it is a CloudFormationResource and if it is - assign id and arn
                const obj = valueElement as StringKeyUnknownObject;
                if (Object.keys(obj).includes('Properties') && Object.keys(obj).includes('Type')) {
                    const resource = obj as CloudFormationResource;
                    const resolverFunction = (value: unknown, ctx: ResolvingContext) => this.resolveValue(value, ctx);
                    const resolverIntr = this.cfResourceResolver.getResourceIntrinsic(resource.Type);
                    const identifierContext: IntrinsicContext = { resource, logicalId: key, ctx: ctx, valueResolver: resolverFunction };
                    if (resource._id === undefined) {
                        resource._id = resolverIntr.idGenFunc(identifierContext);
                    }
                    if (resource._arn === undefined) {
                        resource._arn = resolverIntr.arnGenFunc(identifierContext);
                    }
                }
            }
            result[key] = this.withContextName(ctx, key, () => this.resolveValue(valueElement, ctx));
        }
        log.trace('[ValueResolverImpl.resolveObject] Exiting with result:', result);
        return result;
    }

    private withContextName<T>(ctx: ResolvingContext, name: string, fn: () => T): T {
        log.trace('[ValueResolverImpl.withContextName] Entering with arguments:', { ctx, name });
        ctx.addName(name);
        log.trace(`[ValueResolverImpl.withContextName] Added name "${name}" to context. Current path: ${ctx.getCurrentPath()}`);
        try {
            const result = fn();
            log.trace(`[ValueResolverImpl.withContextName] Exiting after function call for name "${name}".`);
            return result;
        } finally {
            ctx.popName();
            log.trace(`[ValueResolverImpl.withContextName] Popped name "${name}" from context. Current path: ${ctx.getCurrentPath()}`);
        }
    }

    private resolvePrimitiveObject(ctx: ResolvingContext, value: unknown): unknown {
        log.trace('[ValueResolverImpl.resolvePrimitiveObject] Entering with arguments:', { ctx, value });
        log.trace(`[ValueResolverImpl.resolvePrimitiveObject] Returning primitive value at path: ${ctx.getCurrentPath()}: ${String(value)}`);
        log.trace('[ValueResolverImpl.resolvePrimitiveObject] Exiting with result:', value);
        return value;
    }
}
