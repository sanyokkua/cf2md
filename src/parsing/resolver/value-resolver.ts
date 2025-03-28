import log from 'loglevel';
import { Intrinsic, IntrinsicResolver } from '../types/intrinsic-types';
import { ResolvingContext, ValueResolver } from '../types/resolving-types';
import { IntrinsicUtils } from '../types/util-service-types';

export class ValueResolverImpl implements ValueResolver {
    constructor(
        private readonly intrinsicUtils: IntrinsicUtils,
        private readonly intrinsicResolver: IntrinsicResolver,
    ) {}

    resolveValue(value: unknown, ctx: ResolvingContext): unknown {
        log.trace(`Resolving value at path: ${ctx.getCurrentPath()}`);

        if (Array.isArray(value)) {
            log.debug(`Encountered array at path: ${ctx.getCurrentPath()}`);
            return this.resolveArray(ctx, value);
        }

        // Narrowing value: we know it's a non-null object from this check.
        if (value !== null && typeof value === 'object') {
            log.debug(`Encountered Object at path: ${ctx.getCurrentPath()}`);
            // Cast to Record<string, unknown> for intrinsic checks and resolution.
            const objValue = value as Record<string, unknown>;
            if (this.intrinsicUtils.isIntrinsic(objValue)) {
                log.debug(`Encountered Object at path: ${ctx.getCurrentPath()} is intrinsic`);
                return this.resolveIntrinsicObject(ctx, objValue);
            }
            return this.resolveObject(ctx, objValue);
        }

        log.debug(`Encountered Primitive at path: ${ctx.getCurrentPath()}`);
        return this.resolvePrimitiveObject(ctx, value);
    }

    private resolveArray(ctx: ResolvingContext, value: unknown[]): unknown[] {
        return value.map((item) => this.resolveValue(item, ctx));
    }

    private resolveIntrinsicObject(ctx: ResolvingContext, value: Record<string, unknown>): unknown {
        const intrinsicKey: string = this.intrinsicUtils.getIntrinsicKey(value);
        if (!intrinsicKey) {
            throw new Error('Intrinsic key missing');
        }
        log.debug(`Found intrinsic "${intrinsicKey}" at path: ${ctx.getCurrentPath()}`);

        ctx.addName(intrinsicKey);
        try {
            const intrinsic: Intrinsic = this.intrinsicResolver.getIntrinsic(intrinsicKey);
            const resolverFunction = (value: unknown, ctx: ResolvingContext) => this.resolveValue(value, ctx);
            const result = intrinsic.resolveValue(value, ctx, resolverFunction);
            log.debug(`Intrinsic "${intrinsicKey}" resolved to:`, result);
            return result;
        } catch (error) {
            log.error(`Error resolving intrinsic "${intrinsicKey}" at path: ${ctx.getCurrentPath()}`, error);
            throw error;
        } finally {
            ctx.popName();
        }
    }

    private resolveObject(ctx: ResolvingContext, value: Record<string, unknown>): unknown {
        const result: Record<string, unknown> = {};

        log.debug(`Recursively resolving object at path: ${ctx.getCurrentPath()}`);
        for (const key of Object.keys(value)) {
            // Use helper to manage context name for each property.
            result[key] = this.withContextName(ctx, key, () => this.resolveValue(value[key], ctx));
        }
        return result;
    }

    private withContextName<T>(ctx: ResolvingContext, name: string, fn: () => T): T {
        ctx.addName(name);
        try {
            return fn();
        } finally {
            ctx.popName();
        }
    }

    private resolvePrimitiveObject(ctx: ResolvingContext, value: unknown): unknown {
        log.trace(`Returning primitive value at path: ${ctx.getCurrentPath()}: ${String(value)}`);
        return value;
    }
}
