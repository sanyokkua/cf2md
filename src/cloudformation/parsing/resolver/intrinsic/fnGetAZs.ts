import { isBlankString } from 'coreutilsts';
import log from 'loglevel';
import { FnGetAZs } from '../../../types/cloudformation-model';
import { resolveValue, ResolvingContext } from '../../index';
import { IntrinsicFunc } from '../../types/types';
import { validateThatCorrectIntrinsicCalled } from './utils/intrinsic-utils';

/**
 * Resolves the "Fn::GetAZs" intrinsic function used in AWS CloudFormation templates.
 *
 * This function is part of a CloudFormation parser and is used to retrieve the list of Availability Zones (AZs)
 * based on the region provided in the intrinsic. The process involves:
 *
 * 1. Validating that the intrinsic object contains the correct key ("Fn::GetAZs").
 * 2. Resolving the region value using the provided resolving context.
 * 3. Checking if the resolved region is a non-blank string.
 *    - If the region is not specified or is blank, the function returns a default list of AZs.
 *    - If a valid region is provided, the function fetches the list of AZs for that region.
 *
 * Example intrinsic:
 * { "Fn::GetAZs": "region" }
 *
 * @param node - The intrinsic function node containing the "Fn::GetAZs" key.
 * @param ctx - The resolving context that includes utility methods for retrieving AZs.
 * @returns The list of Availability Zones for the specified region, or the default AZs if no valid region is provided.
 */
export const fnGetAZs: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): unknown => {
    log.trace('fnGetAZs is called');

    // Validate that the passed object correctly contains the "Fn::GetAZs" key.
    validateThatCorrectIntrinsicCalled(node, 'Fn::GetAZs');

    // Cast the node to the expected FnGetAZs format.
    const value = node as FnGetAZs;

    // Resolve the region value from the intrinsic.
    const region = resolveValue(value['Fn::GetAZs'], ctx);

    // If the region is not a valid non-blank string, use default AZs.
    if (typeof region !== 'string' || isBlankString(region)) {
        log.trace('fnGetAZs: Region is blank or not a string, using default AZs');
        return ctx.getAZs();
    }

    // If a valid region is provided, fetch the list of AZs for that region.
    log.trace(`fnGetAZs: Region resolved as "${region}", fetching AZs for region`);
    return ctx.getAZs(region);
};
