import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnAnd } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnAndIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('fnAnd: Invocation started.', { object, context: ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_And);

        const value = object as FnAnd;
        const conditionArr = value[CfIntrinsicFunctions.Fn_And];

        if (!Array.isArray(conditionArr)) {
            throw new Error('fnAnd: Fn::And requires an array of conditions.');
        }

        // Evaluate each condition.
        for (const condition of conditionArr) {
            let resolvedCondition: unknown;

            if (typeof condition === 'boolean') {
                resolvedCondition = condition;
                log.trace('fnAnd: Boolean condition encountered.', { condition });
            } else if (typeof condition === 'string') {
                if (['true', 'false'].includes(condition.toLowerCase())) {
                    resolvedCondition = condition.toLowerCase() === 'true';
                    log.trace('fnAnd: Literal string condition encountered.', {
                        condition,
                        resolved: resolvedCondition,
                    });
                } else if (ctx.originalTemplate.Conditions && condition in ctx.originalTemplate.Conditions) {
                    log.trace('fnAnd: Condition reference found in Conditions section.', { condition });
                    const conditionFromTemplate = ctx.originalTemplate.Conditions[condition];
                    resolvedCondition = resolveValue(conditionFromTemplate, ctx);
                } else {
                    log.trace('fnAnd: Resolving string as nested intrinsic.', { condition });
                    resolvedCondition = resolveValue(condition, ctx);
                }
            } else {
                log.trace('fnAnd: Resolving condition using resolveValue.', { condition });
                resolvedCondition = resolveValue(condition, ctx);
            }
            log.trace('fnAnd: Resolved condition value.', { resolvedCondition });
            if (typeof resolvedCondition !== 'boolean') {
                throw new Error('fnAnd: Resolved condition is not a boolean.');
            }
            if (!resolvedCondition) {
                log.trace('fnAnd: Short-circuit - condition evaluated to false.', { condition, resolvedCondition });
                return false;
            }
        }
        log.trace('fnAnd: All conditions resolved to true.');
        return true;
    }
}
