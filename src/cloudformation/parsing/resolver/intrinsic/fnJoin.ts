/* eslint-disable @typescript-eslint/no-unnecessary-condition*/
import { joinStrings } from 'coreutilsts';
import log from 'loglevel';
import { FnJoin } from '../../../types/cloudformation-model';
import { UnexpectedVariableTypeError, WrongIntrinsicFormatError } from '../../errors/errors';
import { resolveValue, ResolvingContext } from '../../index';
import { IntrinsicFunc } from '../../types/types';
import { validateThatCorrectIntrinsicCalled } from './utils/intrinsic-utils';

/**
 * Processes the "Fn::Join" intrinsic function in an AWS CloudFormation template.
 *
 * This function is part of the CloudFormation parser and resolves the "Fn::Join" intrinsic.
 * The intrinsic is expected in the following format:
 *
 * { "Fn::Join": [ "delimiter", [ list of values ] ] }
 *
 * The function's logic follows these steps:
 * 1. Validate that the provided object correctly contains the "Fn::Join" intrinsic.
 * 2. Ensure that the intrinsic value is an array of exactly 2 elements:
 *    - The first element is the delimiter and must be a string.
 *    - The second element is an array of values to join.
 * 3. Each value in the array is resolved using the provided context.
 * 4. Confirm that each resolved value is a string.
 * 5. Join the string values using the specified delimiter and return the resulting string.
 *
 * @param node - The CloudFormation intrinsic function node with the "Fn::Join" key.
 * @param ctx - The resolving context containing utility methods and template data for resolution.
 * @returns The joined string computed from the array of resolved values.
 * @throws WrongIntrinsicFormatError if the intrinsic array is not exactly 2 items.
 * @throws UnexpectedVariableTypeError if the delimiter is not a string or any resolved value is not a string.
 */
export const fnJoin: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): unknown => {
    log.trace('fnJoin is called');

    // Ensure the object contains the correct "Fn::Join" key and format.
    validateThatCorrectIntrinsicCalled(node, 'Fn::Join');
    const value = node as FnJoin;

    // Retrieve the intrinsic array from the object.
    const fnJoinElement = value['Fn::Join'];

    // Verify that the intrinsic array has exactly 2 elements.
    if (!Array.isArray(fnJoinElement) || fnJoinElement.length !== 2) {
        log.warn('fnJoin: Incorrect format, expected an array of 2 elements', fnJoinElement);
        throw new WrongIntrinsicFormatError('Expected 2 items in Fn::Join array');
    }

    // Extract the delimiter and validate it is a string.
    const delimiter = fnJoinElement[0];
    if (typeof delimiter !== 'string') {
        log.warn('fnJoin: Delimiter is not a string', delimiter);
        throw new UnexpectedVariableTypeError('Expected first argument in Fn::Join to be a string');
    }

    // Extract the array of values to join and ensure that it is an array.
    const arrayOfValues = fnJoinElement[1];
    if (!Array.isArray(arrayOfValues)) {
        log.warn('fnJoin: Second element is not an array', arrayOfValues);
        throw new UnexpectedVariableTypeError('Expected second item in Fn::Join to be an array');
    }

    // Resolve each value in the array using the resolving context.
    const resolvedValues = arrayOfValues.map((val) => resolveValue(val, ctx));

    // Verify that each resolved value is a string.
    const stringValues = resolvedValues.map((val) => {
        if (typeof val !== 'string') {
            log.warn('fnJoin: A resolved value is not a string', val);
            throw new UnexpectedVariableTypeError('Resolved value is not a string');
        }
        return val;
    });

    // Join the resolved string values using the specified delimiter.
    const result = joinStrings(stringValues, delimiter);
    log.trace(`fnJoin: Result is "${result}"`);
    return result;
};
