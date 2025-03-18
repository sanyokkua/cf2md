import log from 'loglevel';
import { FnImportValue } from '../../../types/cloudformation-model';
import { UnexpectedVariableTypeError } from '../../errors/errors';
import { resolveValue, ResolvingContext } from '../../index';
import { IntrinsicFunc } from '../../types/types';
import { validateThatCorrectIntrinsicCalled } from './utils/intrinsic-utils';

/**
 * Processes the "Fn::ImportValue" intrinsic of an AWS CloudFormation template.
 *
 * This intrinsic is used to import a value from another stack. Since the parser cannot
 * load values from external stacks, it resolves and returns the original value as a string.
 * The function follows these steps:
 *
 * 1. Validates that the intrinsic object contains the correct "Fn::ImportValue" key.
 * 2. Checks whether the associated value is already a string.
 *    - If it is, the value is returned directly.
 * 3. If the value is not a string, it is resolved using the provided context.
 * 4. If the resolved value is not a string, an error is thrown indicating an unexpected type.
 *
 * @param node - The intrinsic function node containing the "Fn::ImportValue" key with the value to import.
 * @param ctx - The resolving context which contains helper methods and the original template information.
 * @returns The original value intended for import, resolved to a string.
 * @throws UnexpectedVariableTypeError If the resolved value is not a string.
 */
export const fnImportValue: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): unknown => {
    log.trace('fnImportValue is called');

    // Validate that the node properly contains the "Fn::ImportValue" intrinsic.
    validateThatCorrectIntrinsicCalled(node, 'Fn::ImportValue');

    // Cast the incoming node to the expected FnImportValue structure.
    const value = node as FnImportValue;

    // Retrieve the value associated with the "Fn::ImportValue" key.
    const importVal = value['Fn::ImportValue'];

    // If the value is already a string, it is returned directly.
    if (typeof importVal === 'string') {
        log.trace(`fnImportValue: Found string value: "${importVal}"`);
        return importVal;
    }

    // Otherwise, resolve the value using the provided context.
    const resolvedValue = resolveValue(importVal, ctx);

    // Ensure that the resolved value is a string.
    if (typeof resolvedValue !== 'string') {
        log.warn('fnImportValue: Resolved value is not a string', resolvedValue);
        throw new UnexpectedVariableTypeError('Resolved value is not a string');
    }

    // Return the resolved value as a string.
    log.trace(`fnImportValue: Resolved value is "${resolvedValue}"`);
    return resolvedValue;
};
