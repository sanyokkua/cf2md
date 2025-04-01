import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnContains } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnContainsIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {
        log.trace('[FnContainsIntrinsic.constructor] Entering constructor.');
        log.trace('[FnContainsIntrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnContainsIntrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnContainsIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Contains);

        const value = object as FnContains;
        const arr = value[CfIntrinsicFunctions.Fn_Contains];

        log.debug('[FnContainsIntrinsic.resolveValue] Extracted array from Fn::Contains:', arr);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!Array.isArray(arr) || arr.length !== 2) {
            const error = new Error('fnContains: Fn::Contains requires an array with two elements: [list, value].');
            log.error('[FnContainsIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        log.trace('[FnContainsIntrinsic.resolveValue] Resolving the list candidate:', arr[0]);
        const listCandidate = resolveValue(arr[0], ctx);
        log.trace('[FnContainsIntrinsic.resolveValue] Resolved list candidate:', listCandidate);

        log.trace('[FnContainsIntrinsic.resolveValue] Resolving the search value:', arr[1]);
        const searchValue = resolveValue(arr[1], ctx);
        log.trace('[FnContainsIntrinsic.resolveValue] Resolved search value:', searchValue);

        log.debug('[FnContainsIntrinsic.resolveValue] Resolved parameters.', { listCandidate, searchValue });

        if (!Array.isArray(listCandidate)) {
            const error = new Error('fnContains: The first parameter must resolve to an array.');
            log.error('[FnContainsIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        log.debug('[FnContainsIntrinsic.resolveValue] Iterating through the list candidate:', listCandidate);
        for (const element of listCandidate) {
            log.trace('[FnContainsIntrinsic.resolveValue] Comparing element:', element, 'with search value:', searchValue, 'using strict equality.');
            if (element === searchValue) {
                log.trace('[FnContainsIntrinsic.resolveValue] Found matching element using strict equality.', element);
                log.trace('[FnContainsIntrinsic.resolveValue] Exiting, returning:', true);
                return true;
            }
            log.trace('[FnContainsIntrinsic.resolveValue] Strict equality check failed. Comparing using deep equality.');
            log.trace('[FnContainsIntrinsic.resolveValue] Comparing element:', element, 'with search value:', searchValue, 'using deep equality.');
            if (this.intrinsicUtils.deepEqual(element, searchValue)) {
                log.trace('[FnContainsIntrinsic.resolveValue] Found matching element using deep equality.', element);
                log.trace('[FnContainsIntrinsic.resolveValue] Exiting, returning:', true);
                return true;
            }
            log.trace('[FnContainsIntrinsic.resolveValue] Deep equality check failed. Continuing to the next element.');
        }

        log.trace('[FnContainsIntrinsic.resolveValue] No matching element found.');
        log.trace('[FnContainsIntrinsic.resolveValue] Exiting, returning:', false);
        return false;
    }
}
