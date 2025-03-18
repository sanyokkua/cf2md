/* eslint-disable @typescript-eslint/no-unnecessary-condition*/
import log from 'loglevel';
import { FnGetAtt } from '../../../types/cloudformation-model';
import { MissingIntrinsicKeyError, UnexpectedVariableTypeError, WrongIntrinsicFormatError } from '../../errors/errors';
import { resolveValue, ResolvingContext } from '../../index';
import { IntrinsicFunc } from '../../types/types';
import { resourceSpecificResolverFunc } from '../resource-spec-func-resolver';
import { validateThatCorrectIntrinsicCalled } from './utils/intrinsic-utils';

/**
 * Processes the "Fn::GetAtt" intrinsic function in an AWS CloudFormation template.
 *
 * This function resolves the attribute value for a resource specified by CloudFormation's Fn::GetAtt intrinsic.
 * It validates the intrinsic's format, resolves its parameters, checks for cached values in the context, and
 * invokes a resource-specific resolver if needed.
 *
 * The intrinsic should be provided as:
 * { "Fn::GetAtt": [ "logicalNameOfResource", "attributeName" ] }
 *
 * Steps:
 * 1. Validate that the intrinsic object has the correct key and format.
 * 2. Resolve the logical resource name and attribute name.
 * 3. Ensure both resolved values are strings.
 * 4. Build a unique attribute key and check the cache.
 * 5. If not cached, resolve the attribute via a resource-specific resolver.
 * 6. Cache the result and return it, or throw an error if the resource is missing.
 *
 * @param node - The intrinsic function object containing the "Fn::GetAtt" key.
 * @param ctx - The resolving context including the original CloudFormation template and parameter cache.
 * @returns The resolved value of the requested attribute from the resource.
 * @throws WrongIntrinsicFormatError if the intrinsic array does not contain exactly 2 items.
 * @throws UnexpectedVariableTypeError if either resolved parameter is not a string.
 * @throws MissingIntrinsicKeyError if the resource or attribute cannot be found.
 */
export const fnGetAtt: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): unknown => {
    log.trace('fnGetAtt is called');

    // Validate that the object properly uses the "Fn::GetAtt" intrinsic.
    validateThatCorrectIntrinsicCalled(node, 'Fn::GetAtt');
    const value = node as FnGetAtt;

    // Ensure the intrinsic value is an array containing exactly 2 elements.
    if (!Array.isArray(value['Fn::GetAtt']) || value['Fn::GetAtt'].length !== 2) {
        log.warn('fnGetAtt: Incorrect format for Fn::GetAtt', value['Fn::GetAtt']);
        throw new WrongIntrinsicFormatError('Expected 2 items in Fn::GetAtt array');
    }

    // Extract the logical resource name and attribute name from the intrinsic array.
    const logicalResourceName = value['Fn::GetAtt'][0];
    const rawAttrVal = value['Fn::GetAtt'][1];

    // Resolve parameters in case they refer to other values or intrinsics.
    const attrLogicalId = resolveValue(logicalResourceName, ctx);
    const attrParamKey = resolveValue(rawAttrVal, ctx);

    // Validate that both parameters are resolved to strings.
    if (typeof attrLogicalId !== 'string') {
        log.warn('fnGetAtt: First parameter is not a string', attrLogicalId);
        throw new UnexpectedVariableTypeError('Expected first parameter of Fn::GetAtt to be a string');
    }
    if (typeof attrParamKey !== 'string') {
        log.warn('fnGetAtt: Second parameter is not a string', attrParamKey);
        throw new UnexpectedVariableTypeError('Expected second parameter of Fn::GetAtt to be a string');
    }

    // Combine the logical resource name and attribute name to form a unique cache key.
    const attributeKey = `${attrLogicalId}:${attrParamKey}`;
    log.debug(`fnGetAtt: attributeKey is "${attributeKey}"`);

    // Return the cached value if it has already been resolved.
    if (ctx.hasParameterName(attributeKey)) {
        log.trace(`fnGetAtt: attributeKey "${attributeKey}" found in cache`);
        return ctx.getParameter(attributeKey);
    }

    // Check if the specified resource exists in the template's Resources.
    if (attrLogicalId in ctx.originalTemplate.Resources) {
        const resource = ctx.originalTemplate.Resources[attrLogicalId];
        const resType = resource.Type;
        log.debug(`fnGetAtt: Resolving resource "${attrLogicalId}" with type "${resType}"`);

        // Use a resource specific resolver to resolve the attribute.
        const resolved = resourceSpecificResolverFunc(resType).getAttFunc(
            resType,
            attrParamKey,
            attrLogicalId,
            resource,
            ctx,
        );

        // Cache the resolved attribute value for future use.
        ctx.addParameter(attributeKey, resolved);
        return resolved;
    }

    // If the resource cannot be found, log an error and throw.
    log.error(`fnGetAtt: Resource with logical ID "${attrLogicalId}" not found in Resources`);
    throw new MissingIntrinsicKeyError(
        `${attributeKey} is not found in context and ${attrLogicalId} is not found in Resources`,
    );
};
