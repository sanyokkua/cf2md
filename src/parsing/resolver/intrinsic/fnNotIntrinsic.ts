import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnNot } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnNotIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('fnNot: Invocation started.', { object, context: ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Not);

        const value = object as FnNot;
        const conditionArr = value[CfIntrinsicFunctions.Fn_Not];
        const conditionContent = conditionArr[0];
        const conditionsSection = ctx.originalTemplate.Conditions;

        // Case 1: Explicit boolean.
        if (typeof conditionContent === 'boolean') {
            log.trace('fnNot: Direct boolean encountered.', { condition: conditionContent });
            return !conditionContent;
        }

        // Case 2: Literal string "true" or "false".
        if (typeof conditionContent === 'string' && ['true', 'false'].includes(conditionContent.toLowerCase())) {
            log.trace('fnNot: Literal string encountered.', { condition: conditionContent });
            return conditionContent.toLowerCase() !== 'true';
        }

        // Case 3: A condition reference from the Conditions section.
        if (typeof conditionContent === 'string' && conditionsSection && conditionContent in conditionsSection) {
            log.trace('fnNot: Condition reference detected.', { conditionReference: conditionContent });
            const conditionFromSection = conditionsSection[conditionContent];
            const resolvedCondition = resolveValue(conditionFromSection, ctx);
            log.trace('fnNot: Resolved condition from Conditions section.', { resolvedCondition });
            if (typeof resolvedCondition !== 'boolean') {
                throw new Error('fnNot: Resolved condition is not a boolean.');
            }
            return !resolvedCondition;
        }

        // Case 4: The condition is itself a nested intrinsic.
        const isIntrinsicObj = this.intrinsicUtils.isIntrinsic(conditionContent);
        log.trace('fnNot: Checking nested intrinsic.', { isIntrinsic: isIntrinsicObj });
        if (isIntrinsicObj) {
            const resolvedCondition = resolveValue(conditionContent, ctx);
            log.trace('fnNot: Resolved nested intrinsic condition.', { resolvedCondition });
            if (typeof resolvedCondition !== 'boolean') {
                throw new Error('fnNot: Resolved nested intrinsic did not yield a boolean.');
            }
            return !resolvedCondition;
        }

        throw new Error('fnNot: Incorrect type for Fn::Not. Cannot resolve the condition value.');
    }
}
