import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnContains } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnContainsIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('fnContains: Invocation started.', { object, context: ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Contains);

        const value = object as FnContains;
        const arr = value[CfIntrinsicFunctions.Fn_Contains];

        if (!Array.isArray(arr)) {
            throw new Error('fnContains: Fn::Contains requires an array.');
        }

        const listCandidate = resolveValue(arr[0], ctx);
        const searchValue = resolveValue(arr[1], ctx);

        log.trace('fnContains: Resolved parameters.', { listCandidate, searchValue });

        if (!Array.isArray(listCandidate)) {
            throw new Error('fnContains: The first parameter must resolve to an array.');
        }

        // Iterate over each element in the array, checking for a match.
        for (const element of listCandidate) {
            if (element === searchValue) {
                log.trace('fnContains: Found matching element using strict equality.', element);
                return true;
            }
            if (
                typeof element === 'object' &&
                element !== null &&
                typeof searchValue === 'object' &&
                searchValue !== null &&
                JSON.stringify(element) === JSON.stringify(searchValue)
            ) {
                log.trace('fnContains: Found matching element using deep equality.', element);
                return true;
            }
        }

        log.trace('fnContains: No matching element found.');
        return false;
    }
}
