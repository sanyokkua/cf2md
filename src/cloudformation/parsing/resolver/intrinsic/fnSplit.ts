/* eslint-disable @typescript-eslint/no-unnecessary-condition*/
import { splitString } from 'coreutilsts';
import log from 'loglevel';
import { FnSplit } from '../../../types/cloudformation-model';
import { UnexpectedVariableTypeError, WrongIntrinsicFormatError } from '../../errors/errors';
import { resolveValue, ResolvingContext } from '../../index';
import { IntrinsicFunc } from '../../types/types';
import { validateThatCorrectIntrinsicCalled } from './utils/intrinsic-utils';

/**
 * Processes the "Fn::Split" intrinsic function in an AWS CloudFormation template.
 *
 * This function is part of the CloudFormation parser and is responsible for splitting a source string into
 * an array of substrings based on a specified delimiter. The intrinsic is expected to be in the following format:
 *
 * { "Fn::Split": [ "delimiter", "source string" ] }
 *
 * The processing steps are:
 * 1. Validate that the intrinsic object contains the "Fn::Split" key.
 * 2. Check that the intrinsic value is an array of exactly 2 elements:
 *    - The first element is the delimiter and must be a string.
 *    - The second element is the source string, which is resolved using the given context.
 * 3. Split the resolved source string into an array of strings using the delimiter.
 * 4. Return the array of split substrings.
 *
 * @param node - The CloudFormation intrinsic function node containing the "Fn::Split" key.
 * @param ctx - The resolving context, which provides support for resolving values within the template.
 * @returns The array of substrings obtained by splitting the source string using the delimiter.
 * @throws WrongIntrinsicFormatError if the intrinsic array does not contain exactly 2 elements.
 * @throws UnexpectedVariableTypeError if the delimiter is not a string or if the source string does not resolve to a string.
 */
export const fnSplit: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): unknown => {
    log.trace('fnSplit is called');

    // Validate that the node properly uses the "Fn::Split" intrinsic.
    validateThatCorrectIntrinsicCalled(node, 'Fn::Split');

    // Cast the node to the FnSplit structure.
    const value = node as FnSplit;

    // Retrieve the intrinsic array from the provided value.
    const splitObject = value['Fn::Split'];
    // Ensure that the intrinsic value is an array with exactly 2 elements.
    if (!Array.isArray(splitObject) || splitObject.length !== 2) {
        log.warn('fnSplit: splitObject is not an array with 2 elements', splitObject);
        throw new WrongIntrinsicFormatError('Expected 2 items in Fn::Split array');
    }

    // Extract the delimiter (first element) and ensure it is a string.
    const delimiter = splitObject[0];
    if (typeof delimiter !== 'string') {
        log.warn('fnSplit: Delimiter is not a string', delimiter);
        throw new UnexpectedVariableTypeError('Expected first argument in Fn::Split to be a string');
    }

    // Resolve the source string (second element) using the provided context.
    const sourceString = resolveValue(splitObject[1], ctx);
    if (typeof sourceString !== 'string') {
        log.warn('fnSplit: Source string did not resolve to a string', sourceString);
        throw new UnexpectedVariableTypeError('Expected second argument in Fn::Split to resolve to a string');
    }

    // Split the source string using the delimiter and return the result.
    const result = splitString(sourceString, delimiter);
    log.trace(`fnSplit: Result is "${JSON.stringify(result)}"`);
    return result;
};
