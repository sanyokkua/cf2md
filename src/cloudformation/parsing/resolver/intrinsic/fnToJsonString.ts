import log from 'loglevel';
import { UnexpectedParamError } from '../../../../errors/cloudformation-errors';
import { FnToJsonString } from '../../../types/cloudformation-model';
import { resolveValue, ResolvingContext } from '../../index';
import { IntrinsicFunc } from '../../types/types';
import { validateThatCorrectIntrinsicCalled } from './utils/intrinsic-utils';

/**
 * Resolves the "Fn::ToJsonString" intrinsic in an AWS CloudFormation template.
 *
 * This function is part of the CloudFormation parser and converts a given value to its JSON string representation.
 * The "Fn::ToJsonString" intrinsic can be used in two scenarios:
 *
 * 1. If the intrinsic value is already a string, that string is returned directly.
 * 2. Otherwise, the function resolves the value using the provided context and:
 *    - Returns it directly if it resolves to a string.
 *    - Serializes it to a JSON string if it resolves to an object or array.
 *
 * If the resolved value does not conform to any supported type, the function logs a warning and throws an error.
 *
 * @param node - The intrinsic function node that contains the "Fn::ToJsonString" key.
 * @param ctx - The resolving context that holds template data and provides methods for value resolution.
 * @returns The JSON string representation of the resolved value.
 * @throws UnexpectedParamError if the resolved value cannot be converted to a JSON string.
 */
export const fnToJsonString: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): string => {
    log.trace('fnToJsonString is called');

    // Validate that the intrinsic object uses the correct "Fn::ToJsonString" key.
    validateThatCorrectIntrinsicCalled(node, 'Fn::ToJsonString');

    // Cast the node as the expected FnToJsonString shape.
    const value = node as FnToJsonString;

    // If the intrinsic value is already a string, return it directly.
    if (typeof value['Fn::ToJsonString'] === 'string') {
        log.trace(`fnToJsonString: Value is a string: "${value['Fn::ToJsonString']}"`);
        return value['Fn::ToJsonString'];
    }

    // Resolve the value using the provided context.
    const resolvedObject = resolveValue(value, ctx);

    // If the resolved value is a string, return it.
    if (typeof resolvedObject === 'string') {
        log.trace(`fnToJsonString: Resolved object is a string: "${resolvedObject}"`);
        return resolvedObject;
    }

    // If resolved value is an object or array, serialize it to JSON.
    if (resolvedObject && (typeof resolvedObject === 'object' || Array.isArray(resolvedObject))) {
        const jsonString = JSON.stringify(resolvedObject);
        log.trace(`fnToJsonString: JSON string generated: "${jsonString}"`);
        return jsonString;
    }

    // Log a warning and throw an error if the resolved type is unsupported.
    log.warn('fnToJsonString: Resolved object is not a supported type', resolvedObject);
    throw new UnexpectedParamError('Failed to parse object to JSON string');
};
