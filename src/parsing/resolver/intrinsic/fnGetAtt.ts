import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnGetAtt } from '../../types/cloudformation-model';
import { Intrinsic, IntrinsicContext, ResourceIntrinsicResolver } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnGetAttIntrinsic implements Intrinsic {
    constructor(
        private readonly intrinsicUtils: IntrinsicUtils,
        private readonly resourceSpecificIntrinsicResolver: ResourceIntrinsicResolver,
    ) {
        log.trace('[FnGetAttIntrinsic.constructor] Entering constructor.');
        log.trace('[FnGetAttIntrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnGetAttIntrinsic.constructor] resourceSpecificIntrinsicResolver:', this.resourceSpecificIntrinsicResolver);
        log.trace('[FnGetAttIntrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnGetAttIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_GetAtt);

        const getAttArray = (object as FnGetAtt)['Fn::GetAtt'];
        log.debug('[FnGetAttIntrinsic.resolveValue] Extracted array from Fn::GetAtt:', getAttArray);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!Array.isArray(getAttArray) || getAttArray.length !== 2) {
            log.warn('[FnGetAttIntrinsic.resolveValue] Incorrect format for Fn::GetAtt', getAttArray);
            const error = new Error('Expected 2 items in Fn::GetAtt array');
            log.error('[FnGetAttIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        const [logicalResourceNameValue, attributeNameValue] = getAttArray;
        log.debug('[FnGetAttIntrinsic.resolveValue] Logical Resource Name Value:', logicalResourceNameValue);
        log.debug('[FnGetAttIntrinsic.resolveValue] Attribute Name Value:', attributeNameValue);

        const attrLogicalId = this.resolveAndValidateString(
            logicalResourceNameValue,
            ctx,
            resolveValue,
            'First parameter of Fn::GetAtt (Logical Resource Name)',
        );
        log.debug('[FnGetAttIntrinsic.resolveValue] Resolved Logical Resource Name:', attrLogicalId);
        const attrParamKey = this.resolveAndValidateString(attributeNameValue, ctx, resolveValue, 'Second parameter of Fn::GetAtt (Attribute Name)');
        log.debug('[FnGetAttIntrinsic.resolveValue] Resolved Attribute Name:', attrParamKey);

        // Combine the logical resource name and attribute name to form a unique cache key.
        const attributeKey = `${attrLogicalId}:${attrParamKey}`;
        log.debug(`[FnGetAttIntrinsic.resolveValue] attributeKey is "${attributeKey}"`);

        if (ctx.hasParameterName(attributeKey)) {
            log.trace(`[FnGetAttIntrinsic.resolveValue] attributeKey "${attributeKey}" found in cache`);
            const cachedValue = ctx.getParameter(attributeKey);
            log.trace('[FnGetAttIntrinsic.resolveValue] Exiting, returning cached value:', cachedValue);
            return cachedValue;
        }

        if (attrLogicalId in ctx.originalTemplate.Resources) {
            const resource = ctx.originalTemplate.Resources[attrLogicalId];
            const resType = resource.Type;
            log.debug(`[FnGetAttIntrinsic.resolveValue] Resolving resource "${attrLogicalId}" with type "${resType}"`);

            const context: IntrinsicContext = {
                resource: resource,
                logicalId: attrLogicalId,
                ctx: ctx,
                valueResolver: resolveValue,
            };
            log.trace('[FnGetAttIntrinsic.resolveValue] Creating IntrinsicContext:', context);
            const resolved = this.resourceSpecificIntrinsicResolver.getResourceIntrinsic(resType).getAttFunc(context, attrParamKey);
            log.debug('[FnGetAttIntrinsic.resolveValue] Resolved attribute value:', resolved);

            // Cache the resolved attribute value for future use.
            ctx.addParameter(attributeKey, resolved);
            log.debug(`[FnGetAttIntrinsic.resolveValue] Cached attribute value for key "${attributeKey}":`, resolved);
            log.trace('[FnGetAttIntrinsic.resolveValue] Exiting, returning resolved value:', resolved);
            return resolved;
        }

        // If the resource cannot be found, log an error and throw.
        log.error(`[FnGetAttIntrinsic.resolveValue] Resource with logical ID "${attrLogicalId}" not found in Resources`);
        const error = new Error(`${attributeKey} is not found in context and ${attrLogicalId} is not found in Resources`);
        log.error('[FnGetAttIntrinsic.resolveValue] Error:', error);
        throw error;
    }

    private resolveAndValidateString(value: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc, paramName: string): string {
        log.trace('[FnGetAttIntrinsic.resolveAndValidateString] Entering with arguments:', { value, ctx, paramName });
        log.trace('[FnGetAttIntrinsic.resolveAndValidateString] Resolving value for:', paramName);
        const resolvedValue = resolveValue(value, ctx);
        log.trace('[FnGetAttIntrinsic.resolveAndValidateString] Resolved value for:', paramName, ':', resolvedValue);
        if (typeof resolvedValue !== 'string') {
            log.warn(`[FnGetAttIntrinsic.resolveAndValidateString] ${paramName} is not a string`, resolvedValue);
            const error = new Error(`Expected ${paramName.toLowerCase()} to be a string`);
            log.error('[FnGetAttIntrinsic.resolveAndValidateString] Error:', error);
            throw error;
        }
        log.trace('[FnGetAttIntrinsic.resolveAndValidateString] Exiting, returning:', resolvedValue);
        return resolvedValue;
    }
}
