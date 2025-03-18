/* eslint-disable @typescript-eslint/no-unnecessary-condition*/
import log from 'loglevel';
import { FnSelect } from '../../../types/cloudformation-model';
import { UnexpectedVariableTypeError, WrongIntrinsicFormatError } from '../../errors/errors';
import { resolveValue, ResolvingContext } from '../../index';
import { IntrinsicFunc } from '../../types/types';
import { validateThatCorrectIntrinsicCalled } from './utils/intrinsic-utils';

/**
 * Resolves the "Fn::Select" intrinsic function in an AWS CloudFormation template.
 *
 * This function is part of the CloudFormation parser and is used to return a specific element from
 * an array based on the provided index. The intrinsic is expected to follow this format:
 *
 * { "Fn::Select": [ index, listOfObjects ] }
 *
 * The resolution process involves:
 * 1. Validating that the intrinsic object contains the "Fn::Select" key and ensuring its value is an array
 *    of exactly 2 elements.
 * 2. Resolving the first element (index) via the provided context and converting it into a number.
 * 3. Resolving the second element into an array.
 * 4. Checking that the index is within the bounds of the array.
 * 5. Returning the element at the specified index.
 *
 * @param node - The intrinsic function node containing the "Fn::Select" key.
 * @param ctx - The resolving context which includes the original template and methods for resolving values.
 * @returns The element from the array at the specified index.
 * @throws WrongIntrinsicFormatError when the intrinsic format is incorrect or the index is out of bounds.
 * @throws UnexpectedVariableTypeError when the index is not a number or the array does not resolve correctly.
 */
export const fnSelect: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): unknown => {
    log.trace('fnSelect is called');

    // Validate that the passed node properly contains the "Fn::Select" key.
    validateThatCorrectIntrinsicCalled(node, 'Fn::Select');
    const value = node as FnSelect;

    // Retrieve the intrinsic array and ensure it has exactly 2 items:
    // 1. The index (which may require resolution).
    // 2. The array from which a value is selected.
    const fnSelectElement = value['Fn::Select'];
    if (!Array.isArray(fnSelectElement) || fnSelectElement.length !== 2) {
        log.warn('fnSelect: Incorrect format, expected an array of 2 elements', fnSelectElement);
        throw new WrongIntrinsicFormatError('Expected 2 items in Fn::Select array');
    }

    // Resolve the first element to obtain the index.
    const indexRaw = resolveValue(fnSelectElement[0], ctx);
    const indexNumber = parseInt(String(indexRaw), 10);
    if (isNaN(indexNumber)) {
        log.warn('fnSelect: Index could not be parsed as a number', indexRaw);
        throw new UnexpectedVariableTypeError(
            `Index for Fn::Select could not be parsed as a number: ${JSON.stringify(indexRaw)}`,
        );
    }

    // Resolve the second element to obtain the array of values.
    const values = resolveValue(fnSelectElement[1], ctx);
    if (!Array.isArray(values)) {
        log.warn('fnSelect: Values did not resolve to an array', values);
        throw new UnexpectedVariableTypeError('Expected the second argument of Fn::Select to resolve to an array');
    }

    // Validate that the index is within the bounds of the array.
    if (indexNumber < 0 || indexNumber >= values.length) {
        log.warn(`fnSelect: Index ${String(indexNumber)} is out of bounds for array length ${String(values.length)}`);
        throw new WrongIntrinsicFormatError('Index is out of bounds in Fn::Select');
    }

    // Retrieve and return the selected element.
    const result: unknown = values[indexNumber];
    log.trace('fnSelect: Result is:', result);
    return result;
};
