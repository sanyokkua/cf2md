import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnEquals } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnEqualsIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {
        log.trace('[FnEqualsIntrinsic.constructor] Entering constructor.');
        log.trace('[FnEqualsIntrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnEqualsIntrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnEqualsIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Equals);

        const value = object as FnEquals;
        const conditionArr = value[CfIntrinsicFunctions.Fn_Equals];

        log.debug('[FnEqualsIntrinsic.resolveValue] Extracted array from Fn::Equals:', conditionArr);

        if (!Array.isArray(conditionArr)) {
            const error = new Error('fnEquals: Fn::Equals requires an array.');
            log.error('[FnEqualsIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        log.trace('[FnEqualsIntrinsic.resolveValue] Resolving the first value:', conditionArr[0]);
        const resolved0 = resolveValue(conditionArr[0], ctx);
        log.trace('[FnEqualsIntrinsic.resolveValue] Resolved first value:', resolved0);

        log.trace('[FnEqualsIntrinsic.resolveValue] Resolving the second value:', conditionArr[1]);
        const resolved1 = resolveValue(conditionArr[1], ctx);
        log.trace('[FnEqualsIntrinsic.resolveValue] Resolved second value:', resolved1);

        log.debug('[FnEqualsIntrinsic.resolveValue] Resolved values.', { resolved0, resolved1 });

        if (resolved0 === resolved1) {
            log.trace('[FnEqualsIntrinsic.resolveValue] Values are strictly equal.');
            log.trace('[FnEqualsIntrinsic.resolveValue] Exiting, returning:', true);
            return true;
        }

        log.trace('[FnEqualsIntrinsic.resolveValue] Strict equality check failed.');

        if (typeof resolved0 === 'object' && resolved0 !== null && typeof resolved1 === 'object' && resolved1 !== null) {
            log.trace('[FnEqualsIntrinsic.resolveValue] Both values are objects (and not null), performing deep equality check.');
            const deepEqualResult = this.intrinsicUtils.deepEqual(resolved0, resolved1);
            log.debug('[FnEqualsIntrinsic.resolveValue] Deep equality result:', deepEqualResult);
            log.trace('[FnEqualsIntrinsic.resolveValue] Exiting, returning:', deepEqualResult);
            return deepEqualResult;
        }

        log.trace('[FnEqualsIntrinsic.resolveValue] Values are not equal.');
        log.trace('[FnEqualsIntrinsic.resolveValue] Exiting, returning:', false);
        return false;
    }
}
