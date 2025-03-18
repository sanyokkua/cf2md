import { Base64 } from 'js-base64';
import log from 'loglevel';
import { FnBase64 } from '../../../types/cloudformation-model';
import { UnexpectedVariableTypeError } from '../../errors/errors';
import { resolveValue, ResolvingContext } from '../../index';
import { IntrinsicFunc } from '../../types/types';
import { validateThatCorrectIntrinsicCalled } from './utils/intrinsic-utils';

/**
 * Processes the AWS CloudFormation intrinsic function "Fn::Base64" by encoding
 * a provided string value to its Base64 representation.
 *
 * This function forms part of an AWS CloudFormation parser responsible for resolving intrinsic functions.
 * It validates the structure of the intrinsic function node, resolves the value if necessary, and returns
 * its Base64 encoded result.
 *
 * The logic flow is as follows:
 * 1. Validate that the input object correctly contains the "Fn::Base64" key.
 * 2. If the associated value is a string, encode it directly.
 * 3. Otherwise, resolve the value using the provided context and then encode it.
 * 4. If the resolved value is not a string, throw an error indicating an unexpected variable type.
 *
 * @param node - An object representing the "Fn::Base64" intrinsic. It should contain a single property "Fn::Base64".
 * @param ctx - The resolving context used to evaluate dynamic values within AWS CloudFormation templates.
 * @returns The Base64 encoded string corresponding to the provided or resolved value.
 * @throws UnexpectedVariableTypeError - Thrown when the resolved value is not a string as expected.
 */
export const fnBase64: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): unknown => {
    log.trace('fnBase64 is called');

    // Validate that the node has the proper structure with the "Fn::Base64" key.
    validateThatCorrectIntrinsicCalled(node, 'Fn::Base64');
    // Cast the node to the expected FnBase64 format.
    const value = node as FnBase64;

    // Extract the value to be encoded from the "Fn::Base64" intrinsic.
    const rawVal = value['Fn::Base64'];

    // If the raw value is a string, encode it directly.
    if (typeof rawVal === 'string') {
        log.trace('fnBase64: Raw value is a string, encoding directly');
        const result = Base64.encode(rawVal);
        log.trace(`fnBase64: Result is:`, result);
        return result;
    }

    // Otherwise, resolve the value using the provided context.
    const resolvedValue = resolveValue(rawVal, ctx);

    // Ensure the resolved value is a string; if not, throw an error.
    if (typeof resolvedValue !== 'string') {
        log.warn('fnBase64: Resolved value is not a string', resolvedValue);
        throw new UnexpectedVariableTypeError('Expected a string value for Fn::Base64 after resolution');
    }

    // Encode the resolved string value to Base64.
    const result = Base64.encode(resolvedValue);
    log.trace(`fnBase64: Result is:`, result);
    return result;
};
