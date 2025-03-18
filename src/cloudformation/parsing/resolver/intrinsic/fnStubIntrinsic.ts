import log from 'loglevel';
import { ResolvingContext } from '../../index';
import { IntrinsicFunc } from '../../types/types';

/**
 * A stub intrinsic function used within the AWS CloudFormation parser.
 *
 * This function serves as a placeholder implementation for an intrinsic function. It demonstrates
 * the required structure and logging behavior for intrinsic functions in the CloudFormation parser.
 * When invoked, it logs its inputs and returns a static string "stubIntrinsic".
 *
 * @param node - The intrinsic function node from the CloudFormation template.
 * @param ctx - The resolving context containing template data and helper methods.
 * @returns A fixed string "stubIntrinsic" as a placeholder result.
 */
export const stubIntrinsic: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): unknown => {
    log.trace('stubIntrinsic is called', node, ctx); // Log the invocation with input parameters for debugging.
    return 'stubIntrinsic'; // Return a static placeholder value.
};
