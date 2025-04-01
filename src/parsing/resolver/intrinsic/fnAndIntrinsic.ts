import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnAnd } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnAndIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {
        log.trace('[FnAndIntrinsic.constructor] Entering constructor.');
        log.trace('[FnAndIntrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnAndIntrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnAndIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_And);

        const value = object as FnAnd;
        const conditionArr = value[CfIntrinsicFunctions.Fn_And];

        if (!Array.isArray(conditionArr)) {
            const error = new Error('fnAnd: Fn::And requires an array of conditions.');
            log.error('[FnAndIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        for (const condition of conditionArr) {
            const resolvedCondition = this.evaluateCondition(condition, ctx, resolveValue);
            if (!resolvedCondition) {
                log.trace('[FnAndIntrinsic.resolveValue] Short-circuit - condition evaluated to false.', { condition, resolvedCondition });
                log.trace('[FnAndIntrinsic.resolveValue] Exiting, returning:', false);
                return false;
            }
        }

        log.trace('[FnAndIntrinsic.resolveValue] All conditions resolved to true.');
        log.trace('[FnAndIntrinsic.resolveValue] Exiting, returning:', true);
        return true;
    }

    private evaluateCondition(condition: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): boolean {
        log.trace('[FnAndIntrinsic.evaluateCondition] Entering with arguments:', { condition, ctx });
        let resolvedCondition: boolean;

        if (typeof condition === 'boolean') {
            resolvedCondition = condition;
            log.trace('[FnAndIntrinsic.evaluateCondition] Boolean condition encountered.', { condition, resolved: resolvedCondition });
        } else if (typeof condition === 'string') {
            const lowerCaseCondition = condition.toLowerCase();
            if (['true', 'false'].includes(lowerCaseCondition)) {
                resolvedCondition = lowerCaseCondition === 'true';
                log.trace('[FnAndIntrinsic.evaluateCondition] Literal string condition encountered.', {
                    condition,
                    resolved: resolvedCondition,
                });
            } else if (ctx.originalTemplate.Conditions && condition in ctx.originalTemplate.Conditions) {
                log.trace('[FnAndIntrinsic.evaluateCondition] Condition reference found in Conditions section.', { condition });
                const conditionFromTemplate = ctx.originalTemplate.Conditions[condition];
                const resolved = resolveValue(conditionFromTemplate, ctx);
                if (typeof resolved !== 'boolean') {
                    const error = new Error(`fnAnd: Resolved condition from template "${condition}" is not a boolean.`);
                    log.error('[FnAndIntrinsic.evaluateCondition] Error:', error);
                    throw error;
                }
                resolvedCondition = resolved;
            } else {
                log.trace('[FnAndIntrinsic.evaluateCondition] Resolving string as nested intrinsic.', { condition });
                const resolved = resolveValue(condition, ctx);
                if (typeof resolved !== 'boolean') {
                    const error = new Error('fnAnd: Resolved nested intrinsic condition is not a boolean.');
                    log.error('[FnAndIntrinsic.evaluateCondition] Error:', error);
                    throw error;
                }
                resolvedCondition = resolved;
            }
        } else {
            log.trace('[FnAndIntrinsic.evaluateCondition] Resolving condition using resolveValue.', { condition });
            const resolved = resolveValue(condition, ctx);
            if (typeof resolved !== 'boolean') {
                const error = new Error('fnAnd: Resolved condition is not a boolean.');
                log.error('[FnAndIntrinsic.evaluateCondition] Error:', error);
                throw error;
            }
            resolvedCondition = resolved;
        }
        log.trace('[FnAndIntrinsic.evaluateCondition] Condition evaluated.', { condition, resolvedCondition });
        log.trace('[FnAndIntrinsic.evaluateCondition] Exiting, returning:', resolvedCondition);
        return resolvedCondition;
    }
}
