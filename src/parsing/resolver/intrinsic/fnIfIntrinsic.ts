import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnIf } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnIfIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {
        log.trace('[FnIfIntrinsic.constructor] Entering constructor.');
        log.trace('[FnIfIntrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnIfIntrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnIfIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_If);

        const value = object as FnIf;
        const conditionArr = value[CfIntrinsicFunctions.Fn_If];
        log.debug('[FnIfIntrinsic.resolveValue] Extracted array from Fn::If:', conditionArr);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!Array.isArray(conditionArr) || conditionArr.length !== 3) {
            log.warn('[FnIfIntrinsic.resolveValue] Fn::If requires an array with exactly 3 elements.', conditionArr);
            const error = new Error('fnIf: Fn::If requires an array with exactly 3 elements: [condition, valueIfTrue, valueIfFalse].');
            log.error('[FnIfIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        const [conditionValue, thenValue, elseValue] = conditionArr;
        log.debug('[FnIfIntrinsic.resolveValue] Condition Value:', conditionValue);
        log.debug('[FnIfIntrinsic.resolveValue] Then Value:', thenValue);
        log.debug('[FnIfIntrinsic.resolveValue] Else Value:', elseValue);

        log.trace('[FnIfIntrinsic.resolveValue] Resolving the condition value.');
        const conditionEvaluated = resolveValue(conditionValue, ctx);
        log.debug('[FnIfIntrinsic.resolveValue] Resolved condition value:', conditionEvaluated);

        if (typeof conditionEvaluated !== 'boolean') {
            const error = new Error('fnIf: The condition must resolve to a boolean.');
            log.error('[FnIfIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        if (conditionEvaluated) {
            log.trace('[FnIfIntrinsic.resolveValue] Condition evaluated to true; resolving true branch.');
            const resolvedThenValue = resolveValue(thenValue, ctx);
            log.debug('[FnIfIntrinsic.resolveValue] Resolved true branch value:', resolvedThenValue);
            log.trace('[FnIfIntrinsic.resolveValue] Exiting, returning resolved true value:', resolvedThenValue);
            return resolvedThenValue;
        } else {
            log.trace('[FnIfIntrinsic.resolveValue] Condition evaluated to false; resolving false branch.');
            const resolvedElseValue = resolveValue(elseValue, ctx);
            log.debug('[FnIfIntrinsic.resolveValue] Resolved false branch value:', resolvedElseValue);
            log.trace('[FnIfIntrinsic.resolveValue] Exiting, returning resolved false value:', resolvedElseValue);
            return resolvedElseValue;
        }
    }
}
