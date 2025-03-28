import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnIf } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnIfIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('fnIf: Invocation started.', { object, context: ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_If);

        const value = object as FnIf;
        const conditionArr = value[CfIntrinsicFunctions.Fn_If];

        if (!Array.isArray(conditionArr)) {
            throw new Error('fnIf: Fn::If requires an array.');
        }

        const conditionEvaluated = resolveValue(conditionArr[0], ctx);
        log.trace('fnIf: Resolved condition value.', { conditionEvaluated });
        if (typeof conditionEvaluated !== 'boolean') {
            throw new Error('fnIf: The condition must resolve to a boolean.');
        }

        if (conditionEvaluated) {
            log.trace('fnIf: Condition evaluated to true; resolving true branch.');
            return resolveValue(conditionArr[1], ctx);
        } else {
            log.trace('fnIf: Condition evaluated to false; resolving false branch.');
            return resolveValue(conditionArr[2], ctx);
        }
    }
}
