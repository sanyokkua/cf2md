import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnOr } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnOrIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {
        log.trace('[FnOrIntrinsic.constructor] Entering constructor.');
        log.trace('[FnOrIntrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnOrIntrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnOrIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Or);

        const value = object as FnOr;
        const conditionArr = value[CfIntrinsicFunctions.Fn_Or];
        log.debug('[FnOrIntrinsic.resolveValue] Extracted condition array:', conditionArr);

        if (!Array.isArray(conditionArr)) {
            const error = new Error('fnOr: Fn::Or requires an array of conditions.');
            log.error('[FnOrIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        log.debug('[FnOrIntrinsic.resolveValue] Iterating through conditions:', conditionArr);
        for (const condition of conditionArr) {
            log.trace('[FnOrIntrinsic.resolveValue] Resolving condition:', condition);
            const resolvedCondition = this.resolveCondition(condition, ctx, resolveValue);
            log.debug('[FnOrIntrinsic.resolveValue] Resolved condition value:', { condition, resolvedCondition });

            if (typeof resolvedCondition !== 'boolean') {
                const error = new Error('fnOr: Resolved condition is not a boolean.');
                log.error('[FnOrIntrinsic.resolveValue] Error:', error);
                throw error;
            }

            if (resolvedCondition) {
                log.trace('[FnOrIntrinsic.resolveValue] Short-circuit - condition evaluated to true.');
                log.trace('[FnOrIntrinsic.resolveValue] Exiting, returning:', true);
                return true;
            }
            log.trace('[FnOrIntrinsic.resolveValue] Condition evaluated to false, continuing to next condition.');
        }

        log.trace('[FnOrIntrinsic.resolveValue] No conditions evaluated to true.');
        log.trace('[FnOrIntrinsic.resolveValue] Exiting, returning:', false);
        return false;
    }

    private resolveCondition(condition: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnOrIntrinsic.resolveCondition] Entering with arguments:', { condition, ctx });

        if (typeof condition === 'boolean') {
            log.trace('[FnOrIntrinsic.resolveCondition] Boolean condition encountered.');
            log.trace('[FnOrIntrinsic.resolveCondition] Exiting, returning:', condition);
            return condition;
        } else if (typeof condition === 'string') {
            const lowerCaseCondition = condition.toLowerCase();
            if (['true', 'false'].includes(lowerCaseCondition)) {
                const resolved = lowerCaseCondition === 'true';
                log.trace('[FnOrIntrinsic.resolveCondition] Literal string condition encountered.', { condition, resolved });
                log.trace('[FnOrIntrinsic.resolveCondition] Exiting, returning:', resolved);
                return resolved;
            } else if (ctx.originalTemplate.Conditions && condition in ctx.originalTemplate.Conditions) {
                log.trace('[FnOrIntrinsic.resolveCondition] Condition reference found in Conditions section.', { condition });
                const conditionFromTemplate = ctx.originalTemplate.Conditions[condition];
                log.debug('[FnOrIntrinsic.resolveCondition] Condition from template:', conditionFromTemplate);
                const resolvedValue = resolveValue(conditionFromTemplate, ctx);
                log.trace('[FnOrIntrinsic.resolveCondition] Exiting, returning:', resolvedValue);
                return resolvedValue;
            } else {
                log.trace('[FnOrIntrinsic.resolveCondition] Resolving string as nested intrinsic.', { condition });
                const resolvedValue = resolveValue(condition, ctx);
                log.trace('[FnOrIntrinsic.resolveCondition] Exiting, returning:', resolvedValue);
                return resolvedValue;
            }
        } else {
            log.trace('[FnOrIntrinsic.resolveCondition] Resolving condition using resolveValue.', { condition });
            const resolvedValue = resolveValue(condition, ctx);
            log.trace('[FnOrIntrinsic.resolveCondition] Exiting, returning:', resolvedValue);
            return resolvedValue;
        }
    }
}
