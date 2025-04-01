import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { Ref } from '../../types/cloudformation-model';
import { Intrinsic, IntrinsicContext, ResourceIntrinsicResolver } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnRefIntrinsic implements Intrinsic {
    constructor(
        private readonly intrinsicUtils: IntrinsicUtils,
        private readonly resourceSpecificIntrinsicResolver: ResourceIntrinsicResolver,
    ) {
        log.trace('[FnRefIntrinsic.constructor] Entering constructor.');
        log.trace('[FnRefIntrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnRefIntrinsic.constructor] resourceSpecificIntrinsicResolver:', this.resourceSpecificIntrinsicResolver);
        log.trace('[FnRefIntrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnRefIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Ref);
        const value = object as Ref;
        let key: string;
        log.debug('[FnRefIntrinsic.resolveValue] Extracted Ref value:', value);

        if (typeof value.Ref !== 'string') {
            log.trace('[FnRefIntrinsic.resolveValue] Ref is not a string, attempting to resolve value.');
            const resolvedKey = resolveValue(value.Ref, ctx);
            log.debug('[FnRefIntrinsic.resolveValue] Resolved key:', resolvedKey);
            if (typeof resolvedKey !== 'string') {
                log.warn('[FnRefIntrinsic.resolveValue] Resolved key is not a string', resolvedKey);
                const error = new Error('The reference key was not resolved as a string.');
                log.error('[FnRefIntrinsic.resolveValue] Error:', error);
                throw error;
            }
            log.trace(`[FnRefIntrinsic.resolveValue] Resolved key is "${resolvedKey}".`);
            key = resolvedKey;
        } else {
            key = value.Ref;
            log.debug(`[FnRefIntrinsic.resolveValue] Ref key is a string: "${key}".`);
        }

        if (ctx.hasParameterName(key)) {
            log.trace(`[FnRefIntrinsic.resolveValue] Key "${key}" found in parameter cache.`);
            const cachedValue = ctx.getParameter(key);
            log.trace('[FnRefIntrinsic.resolveValue] Exiting, returning cached value:', cachedValue);
            return cachedValue;
        }
        log.trace(`[FnRefIntrinsic.resolveValue] Key "${key}" not found in parameter cache.`);

        if (key in ctx.originalTemplate.Resources) {
            const resource = ctx.originalTemplate.Resources[key];
            const resType = resource.Type;
            log.debug(`[FnRefIntrinsic.resolveValue] Resolving resource reference with logical ID "${key}" and type "${resType}".`);

            const context: IntrinsicContext = {
                resource: resource,
                logicalId: key,
                ctx: ctx,
                valueResolver: resolveValue,
            };
            log.trace('[FnRefIntrinsic.resolveValue] Creating IntrinsicContext:', context);
            const resolved = this.resourceSpecificIntrinsicResolver.getResourceIntrinsic(resType).refFunc(context);
            log.debug('[FnRefIntrinsic.resolveValue] Resolved resource value:', resolved);

            ctx.addParameter(key, resolved);
            log.debug(`[FnRefIntrinsic.resolveValue] Cached resolved value for key "${key}":`, resolved);
            log.trace('[FnRefIntrinsic.resolveValue] Exiting, returning resolved resource value:', resolved);
            return resolved;
        }

        // If the key is not found as a parameter or a resource, throw an error.
        log.error(`[FnRefIntrinsic.resolveValue] Key "${key}" not found as a parameter or a resource in the template.`);
        const error = new Error(`${key} is not found as a parameter or a resource in the template.`);
        log.error('[FnRefIntrinsic.resolveValue] Error:', error);
        throw error;
    }
}
