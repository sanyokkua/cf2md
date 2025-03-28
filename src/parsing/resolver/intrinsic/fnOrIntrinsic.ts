import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnOr } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnOrIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('fnOr: Invocation started.', { object, context: ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Or);

        const value = object as FnOr;
        const conditionArr = value[CfIntrinsicFunctions.Fn_Or];

        if (!Array.isArray(conditionArr)) {
            throw new Error('fnOr: Fn::Or requires an array of conditions.');
        }

        // Evaluate each condition.
        for (const condition of conditionArr) {
            let resolvedCondition: unknown;

            if (typeof condition === 'boolean') {
                resolvedCondition = condition;
                log.trace('fnOr: Boolean condition encountered.', { condition });
            } else if (typeof condition === 'string') {
                if (['true', 'false'].includes(condition.toLowerCase())) {
                    resolvedCondition = condition.toLowerCase() === 'true';
                    log.trace('fnOr: Literal string condition encountered.', {
                        condition,
                        resolved: resolvedCondition,
                    });
                } else if (ctx.originalTemplate.Conditions && condition in ctx.originalTemplate.Conditions) {
                    log.trace('fnOr: Condition reference found in Conditions section.', { condition });
                    const conditionFromTemplate = ctx.originalTemplate.Conditions[condition];
                    resolvedCondition = resolveValue(conditionFromTemplate, ctx);
                } else {
                    log.trace('fnOr: Resolving string as nested intrinsic.', { condition });
                    resolvedCondition = resolveValue(condition, ctx);
                }
            } else {
                log.trace('fnOr: Resolving condition using resolveValue.', { condition });
                resolvedCondition = resolveValue(condition, ctx);
            }
            log.trace('fnOr: Resolved condition value.', { resolvedCondition });
            if (typeof resolvedCondition !== 'boolean') {
                throw new Error('fnOr: Resolved condition is not a boolean.');
            }
            if (resolvedCondition) {
                log.trace('fnOr: Short-circuit - condition evaluated to true.', { condition, resolvedCondition });
                return true;
            }
        }
        log.trace('fnOr: No conditions evaluated to true.');
        return false;
    }
}
