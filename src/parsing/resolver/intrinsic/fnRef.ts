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
    ) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('fnRef is called');
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Ref);
        const value = object as Ref;
        let key: string;

        if (typeof value.Ref !== 'string') {
            log.trace('fnRef: Ref is not a string, resolving value');
            const resolvedKey = resolveValue(value, ctx);
            if (typeof resolvedKey !== 'string') {
                log.warn('fnRef: Resolved key is not a string', resolvedKey);
                throw new Error('Key was not resolved as a string');
            }
            log.trace(`fnRef: Resolved key is "${resolvedKey}"`);
            key = resolvedKey;
        } else {
            key = value.Ref;
        }

        if (ctx.hasParameterName(key)) {
            log.trace(`fnRef: Key "${key}" found in cache`);
            return ctx.getParameter(key);
        }
        log.trace(`fnRef: Key "${key}" not found in cache`);

        if (key in ctx.originalTemplate.Resources) {
            const resource = ctx.originalTemplate.Resources[key];
            const resType = resource.Type;
            log.debug(`fnRef: Resolving resource with logical ID "${key}" and type "${resType}"`);

            const context: IntrinsicContext = {
                resource: resource,
                logicalId: key,
                ctx: ctx,
                valueResolver: resolveValue,
            };
            const resolved = this.resourceSpecificIntrinsicResolver.getResourceIntrinsic(resType).refFunc(context);

            ctx.addParameter(key, resolved);
            return resolved;
        }

        // If the key is not found in the context or resources, throw an error.
        log.error(`fnRef: Key "${key}" not found in context or Resources`);
        throw new Error(`${key} is not found in context and among Resources logicalIds`);
    }
}
