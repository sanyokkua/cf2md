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
    ) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('fnGetAtt is called');
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_GetAtt);
        const value = object as FnGetAtt;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!Array.isArray(value['Fn::GetAtt']) || value['Fn::GetAtt'].length !== 2) {
            log.warn('fnGetAtt: Incorrect format for Fn::GetAtt', value['Fn::GetAtt']);
            throw new Error('Expected 2 items in Fn::GetAtt array');
        }

        const logicalResourceName = value['Fn::GetAtt'][0];
        const rawAttrVal = value['Fn::GetAtt'][1];
        const attrLogicalId = resolveValue(logicalResourceName, ctx);
        const attrParamKey = resolveValue(rawAttrVal, ctx);

        if (typeof attrLogicalId !== 'string') {
            log.warn('fnGetAtt: First parameter is not a string', attrLogicalId);
            throw new Error('Expected first parameter of Fn::GetAtt to be a string');
        }
        if (typeof attrParamKey !== 'string') {
            log.warn('fnGetAtt: Second parameter is not a string', attrParamKey);
            throw new Error('Expected second parameter of Fn::GetAtt to be a string');
        }

        // Combine the logical resource name and attribute name to form a unique cache key.
        const attributeKey = `${attrLogicalId}:${attrParamKey}`;
        log.debug(`fnGetAtt: attributeKey is "${attributeKey}"`);

        if (ctx.hasParameterName(attributeKey)) {
            log.trace(`fnGetAtt: attributeKey "${attributeKey}" found in cache`);
            return ctx.getParameter(attributeKey);
        }

        if (attrLogicalId in ctx.originalTemplate.Resources) {
            const resource = ctx.originalTemplate.Resources[attrLogicalId];
            const resType = resource.Type;
            log.debug(`fnGetAtt: Resolving resource "${attrLogicalId}" with type "${resType}"`);

            const context: IntrinsicContext = {
                resource: resource,
                logicalId: attrLogicalId,
                ctx: ctx,
                valueResolver: resolveValue,
            };
            const resolved = this.resourceSpecificIntrinsicResolver.getResourceIntrinsic(resType).getAttFunc(context, attrParamKey);

            // Cache the resolved attribute value for future use.
            ctx.addParameter(attributeKey, resolved);
            return resolved;
        }

        // If the resource cannot be found, log an error and throw.
        log.error(`fnGetAtt: Resource with logical ID "${attrLogicalId}" not found in Resources`);
        throw new Error(`${attributeKey} is not found in context and ${attrLogicalId} is not found in Resources`);
    }
}
