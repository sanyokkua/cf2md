import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnNot } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnNotIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {
        log.trace('[FnNotIntrinsic.constructor] Entering constructor.');
        log.trace('[FnNotIntrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnNotIntrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnNotIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Not);

        const value = object as FnNot;
        const conditionArr = value[CfIntrinsicFunctions.Fn_Not];
        log.debug('[FnNotIntrinsic.resolveValue] Extracted condition array:', conditionArr);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!Array.isArray(conditionArr) || conditionArr.length !== 1) {
            log.warn('[FnNotIntrinsic.resolveValue] Fn::Not requires an array with exactly one element.', conditionArr);
            const error = new Error('fnNot: Fn::Not requires an array with exactly one element.');
            log.error('[FnNotIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        const [conditionContent] = conditionArr;
        log.debug('[FnNotIntrinsic.resolveValue] Condition content:', conditionContent);
        const conditionsSection = ctx.originalTemplate.Conditions;
        log.debug('[FnNotIntrinsic.resolveValue] Conditions section from context:', conditionsSection);

        // Case 1: Explicit boolean.
        if (typeof conditionContent === 'boolean') {
            log.trace('[FnNotIntrinsic.resolveValue] Direct boolean encountered.', { condition: conditionContent });
            const result = !conditionContent;
            log.debug('[FnNotIntrinsic.resolveValue] Negated boolean result:', result);
            log.trace('[FnNotIntrinsic.resolveValue] Exiting, returning:', result);
            return result;
        }

        // Case 2: Literal string "true" or "false".
        if (typeof conditionContent === 'string' && ['true', 'false'].includes(conditionContent.toLowerCase())) {
            log.trace('[FnNotIntrinsic.resolveValue] Literal string encountered.', { condition: conditionContent });
            const result = conditionContent.toLowerCase() !== 'true';
            log.debug('[FnNotIntrinsic.resolveValue] Negated string result:', result);
            log.trace('[FnNotIntrinsic.resolveValue] Exiting, returning:', result);
            return result;
        }

        // Case 3: A condition reference from the Conditions section.
        if (typeof conditionContent === 'string' && conditionsSection && conditionContent in conditionsSection) {
            log.trace('[FnNotIntrinsic.resolveValue] Condition reference detected.', { conditionReference: conditionContent });
            const conditionFromSection = conditionsSection[conditionContent];
            log.debug('[FnNotIntrinsic.resolveValue] Condition from section:', conditionFromSection);
            const resolvedCondition = this.resolveAndValidateBoolean(conditionFromSection, ctx, resolveValue);
            const result = !resolvedCondition;
            log.debug('[FnNotIntrinsic.resolveValue] Resolved and negated condition:', result);
            log.trace('[FnNotIntrinsic.resolveValue] Exiting, returning:', result);
            return result;
        }

        // Case 4: The condition is itself a nested intrinsic.
        if (this.intrinsicUtils.isIntrinsic(conditionContent)) {
            log.trace('[FnNotIntrinsic.resolveValue] Nested intrinsic condition detected.', { condition: conditionContent });
            const resolvedCondition = this.resolveAndValidateBoolean(conditionContent, ctx, resolveValue);
            const result = !resolvedCondition;
            log.debug('[FnNotIntrinsic.resolveValue] Resolved and negated nested intrinsic:', result);
            log.trace('[FnNotIntrinsic.resolveValue] Exiting, returning:', result);
            return result;
        }

        const error = new Error('fnNot: Incorrect type for Fn::Not. Cannot resolve the condition value.');
        log.error('[FnNotIntrinsic.resolveValue] Error:', error);
        throw error;
    }

    private resolveAndValidateBoolean(valueToResolve: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): boolean {
        log.trace('[FnNotIntrinsic.resolveAndValidateBoolean] Entering with arguments:', { valueToResolve, ctx });
        log.trace('[FnNotIntrinsic.resolveAndValidateBoolean] Resolving value.');
        const resolvedValue = resolveValue(valueToResolve, ctx);
        log.debug('[FnNotIntrinsic.resolveAndValidateBoolean] Resolved value:', resolvedValue);
        if (typeof resolvedValue !== 'boolean') {
            const error = new Error('fnNot: Resolved condition is not a boolean.');
            log.error('[FnNotIntrinsic.resolveAndValidateBoolean] Error:', error);
            throw error;
        }
        log.trace('[FnNotIntrinsic.resolveAndValidateBoolean] Exiting, returning:', resolvedValue);
        return resolvedValue;
    }
}
