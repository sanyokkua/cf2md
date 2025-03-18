import log from 'loglevel';
import { Ref } from '../../../types/cloudformation-model';
import { MissingIntrinsicKeyError, UnexpectedVariableTypeError } from '../../errors/errors';
import { resolveValue, ResolvingContext } from '../../index';
import { IntrinsicFunc } from '../../types/types';
import { resourceSpecificResolverFunc } from '../resource-spec-func-resolver';
import { validateThatCorrectIntrinsicCalled } from './utils/intrinsic-utils';

/**
 * Resolves the "Ref" intrinsic function within an AWS CloudFormation template.
 *
 * This function is part of a CloudFormation parser and is used to resolve references to resource logical names
 * or intrinsic functions specified by the "Ref" key. The resolution process is as follows:
 *
 * 1. Validates that the provided intrinsic object correctly contains the "Ref" key.
 * 2. Determines if the "Ref" value is a string:
 *    - If it is not a string, the value is resolved using the given context.
 * 3. Checks if the resolved key is already cached within the context:
 *    - If cached, the corresponding value is returned.
 * 4. If not cached, it attempts to locate a resource with the given key in the template.
 *    - If found, the resource is processed using a resource-specific resolver, the result is cached, and then returned.
 * 5. If the key cannot be found in either the cache or the template's resources, an error is thrown.
 *
 * @param node - The object representing the "Ref" intrinsic in the CloudFormation template.
 * @param ctx - The resolving context that contains the original template and parameter cache.
 * @returns The resolved reference value, which could be a reference to a resource attribute or other intrinsic value.
 * @throws UnexpectedVariableTypeError If the resolved reference key is not a string.
 * @throws MissingIntrinsicKeyError If the reference key cannot be found in the context or among the template resources.
 */
export const fnRef: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): unknown => {
    log.trace('fnRef is called');

    // Validate that the intrinsic object contains the correct "Ref" key.
    validateThatCorrectIntrinsicCalled(node, 'Ref');
    const value = node as Ref;
    let key: string;

    // If the "Ref" field is not a string, resolve its value using the context.
    if (typeof value.Ref !== 'string') {
        log.trace('fnRef: Ref is not a string, resolving value');
        const resolvedKey = resolveValue(value, ctx);
        if (typeof resolvedKey !== 'string') {
            log.warn('fnRef: Resolved key is not a string', resolvedKey);
            throw new UnexpectedVariableTypeError('Key was not resolved as a string');
        }
        log.trace(`fnRef: Resolved key is "${resolvedKey}"`);
        key = resolvedKey;
    } else {
        // Use the provided string directly as the key.
        key = value.Ref;
    }

    // Check for the key in the context's parameter cache.
    if (ctx.hasParameterName(key)) {
        log.trace(`fnRef: Key "${key}" found in cache`);
        return ctx.getParameter(key);
    }
    log.trace(`fnRef: Key "${key}" not found in cache`);

    // Attempt to resolve the key by looking it up among the template's resources.
    if (key in ctx.originalTemplate.Resources) {
        const resource = ctx.originalTemplate.Resources[key];
        const resType = resource.Type;
        log.debug(`fnRef: Resolving resource with logical ID "${key}" and type "${resType}"`);

        // Use a resource-specific resolver to compute the reference value.
        const resolved = resourceSpecificResolverFunc(resType).refFunc(resType, key, resource, ctx);

        // Cache the resolved value for future use.
        ctx.addParameter(key, resolved);
        return resolved;
    }

    // If the key is not found in the context or resources, throw an error.
    log.error(`fnRef: Key "${key}" not found in context or Resources`);
    throw new MissingIntrinsicKeyError(`${key} is not found in context and among Resources logicalIds`);
};
