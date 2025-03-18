import log from 'loglevel';
import { FnAnd, FnContains, FnEquals, FnIf, FnNot, FnOr } from '../../../types/cloudformation-model';
import { UnexpectedVariableTypeError } from '../../errors/errors';
import { resolveValue } from '../../resolver/value-resolver';
import { IntrinsicFunc, ResolvingContext } from '../../types/types';
import { isIntrinsic, validateThatCorrectIntrinsicCalled } from './utils/intrinsic-utils';

/**
 * Implements the Fn::Not intrinsic function.
 * Returns the logical NOT of the resolved condition.
 *
 * Supported input:
 *  - Boolean value
 *  - Literal string "true" or "false" (case-insensitive)
 *  - A reference to a condition defined in the Conditions section
 *  - A nested intrinsic that resolves to a boolean
 *
 * @param node - An object of the form { "Fn::Not": [ condition ] }
 * @param ctx - The resolving context containing the original template and parameters.
 * @returns The negated boolean value of the resolved condition.
 * @throws {UnexpectedVariableTypeError} When the resolved condition is not boolean.
 */
export const fnNot: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): boolean => {
    log.trace('fnNot: Invocation started.', { node, context: ctx });
    validateThatCorrectIntrinsicCalled(node, 'Fn::Not');

    const value = node as FnNot;
    const conditionArr = value['Fn::Not'];
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
            throw new UnexpectedVariableTypeError('fnNot: Resolved condition is not a boolean.');
        }
        return !resolvedCondition;
    }

    // Case 4: The condition is itself a nested intrinsic.
    const [isIntrinsicObj, intrinsicName] = isIntrinsic(conditionContent);
    log.trace('fnNot: Checking nested intrinsic.', { isIntrinsic: isIntrinsicObj, intrinsicName });
    if (isIntrinsicObj) {
        const resolvedCondition = resolveValue(conditionContent, ctx);
        log.trace('fnNot: Resolved nested intrinsic condition.', { resolvedCondition });
        if (typeof resolvedCondition !== 'boolean') {
            throw new UnexpectedVariableTypeError('fnNot: Resolved nested intrinsic did not yield a boolean.');
        }
        return !resolvedCondition;
    }

    throw new UnexpectedVariableTypeError('fnNot: Incorrect type for Fn::Not. Cannot resolve the condition value.');
};

/**
 * Implements the Fn::And intrinsic function.
 * Returns true if all conditions resolve to true, otherwise returns false.
 *
 * Supported input: Array of conditions, where each condition may be a boolean, literal string,
 * a reference to a Conditions section entry, or a nested intrinsic.
 *
 * @param node - An object of the form { "Fn::And": [ condition1, condition2, ... ] }
 * @param ctx - The current resolving context.
 * @returns The boolean AND of all resolved conditions.
 * @throws {UnexpectedVariableTypeError} When any resolved condition is not a boolean.
 */
export const fnAnd: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): boolean => {
    log.trace('fnAnd: Invocation started.', { node, context: ctx });
    validateThatCorrectIntrinsicCalled(node, 'Fn::And');

    const value = node as FnAnd;
    const conditionArr = value['Fn::And'];

    if (!Array.isArray(conditionArr)) {
        throw new UnexpectedVariableTypeError('fnAnd: Fn::And requires an array of conditions.');
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
                log.trace('fnAnd: Literal string condition encountered.', { condition, resolved: resolvedCondition });
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
            throw new UnexpectedVariableTypeError('fnAnd: Resolved condition is not a boolean.');
        }
        if (!resolvedCondition) {
            log.trace('fnAnd: Short-circuit - condition evaluated to false.', { condition, resolvedCondition });
            return false;
        }
    }
    log.trace('fnAnd: All conditions resolved to true.');
    return true;
};

/**
 * Implements the Fn::Or intrinsic function.
 * Returns true if any condition resolves to true; otherwise, returns false.
 *
 * Supported input: Array of conditions similar to Fn::And.
 *
 * @param node - An object of the form { "Fn::Or": [ condition1, condition2, ... ] }
 * @param ctx - The current resolving context.
 * @returns The boolean OR of all resolved conditions.
 * @throws {UnexpectedVariableTypeError} When any resolved condition is not a boolean.
 */
export const fnOr: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): boolean => {
    log.trace('fnOr: Invocation started.', { node, context: ctx });
    validateThatCorrectIntrinsicCalled(node, 'Fn::Or');

    const value = node as FnOr;
    const conditionArr = value['Fn::Or'];

    if (!Array.isArray(conditionArr)) {
        throw new UnexpectedVariableTypeError('fnOr: Fn::Or requires an array of conditions.');
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
                log.trace('fnOr: Literal string condition encountered.', { condition, resolved: resolvedCondition });
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
            throw new UnexpectedVariableTypeError('fnOr: Resolved condition is not a boolean.');
        }
        if (resolvedCondition) {
            log.trace('fnOr: Short-circuit - condition evaluated to true.', { condition, resolvedCondition });
            return true;
        }
    }
    log.trace('fnOr: No conditions evaluated to true.');
    return false;
};

/**
 * Implements the Fn::Equals intrinsic function.
 * Evaluates equality between two values.
 *
 * Supported input: An array with exactly two values to compare.
 * Both values are recursively resolved first. A strict equality check is performed;
 * if that fails and both values are objects, a simple deep equality check using JSON.stringify is used.
 *
 * @param node - An object of the form { "Fn::Equals": [ value1, value2 ] }
 * @param ctx - The current resolving context.
 * @returns true if the two resolved values are equal; false otherwise.
 * @throws {UnexpectedVariableTypeError} When the input array is invalid.
 */
export const fnEquals: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): boolean => {
    log.trace('fnEquals: Invocation started.', { node, context: ctx });
    validateThatCorrectIntrinsicCalled(node, 'Fn::Equals');

    const value = node as FnEquals;
    const conditionArr = value['Fn::Equals'];

    if (!Array.isArray(conditionArr)) {
        throw new UnexpectedVariableTypeError('fnEquals: Fn::Equals requires an array.');
    }

    const resolved0 = resolveValue(conditionArr[0], ctx);
    const resolved1 = resolveValue(conditionArr[1], ctx);
    log.trace('fnEquals: Resolved values.', { resolved0, resolved1 });

    if (resolved0 === resolved1) {
        log.trace('fnEquals: Values are strictly equal.');
        return true;
    }

    if (typeof resolved0 === 'object' && resolved0 !== null && typeof resolved1 === 'object' && resolved1 !== null) {
        const deepEqual = JSON.stringify(resolved0) === JSON.stringify(resolved1);
        log.trace('fnEquals: Deep equality check result.', { deepEqual });
        return deepEqual;
    }

    log.trace('fnEquals: Values are not equal.');
    return false;
};

/**
 * Implements the Fn::If intrinsic function.
 * Returns one value if the condition evaluates to true and another value if it evaluates to false.
 *
 * Supported input: An array with exactly three elements: [ condition, valueIfTrue, valueIfFalse ].
 * The condition is resolved first and must result in a boolean. Then the corresponding branch is resolved.
 *
 * @param node - An object of the form { "Fn::If": [ condition, valueIfTrue, valueIfFalse ] }
 * @param ctx - The current resolving context.
 * @returns The resolved value for the appropriate branch.
 * @throws {UnexpectedVariableTypeError} When the condition does not resolve to a boolean.
 */
export const fnIf: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): unknown => {
    log.trace('fnIf: Invocation started.', { node, context: ctx });
    validateThatCorrectIntrinsicCalled(node, 'Fn::If');

    const value = node as FnIf;
    const conditionArr = value['Fn::If'];

    if (!Array.isArray(conditionArr)) {
        throw new UnexpectedVariableTypeError('fnIf: Fn::If requires an array.');
    }

    const conditionEvaluated = resolveValue(conditionArr[0], ctx);
    log.trace('fnIf: Resolved condition value.', { conditionEvaluated });
    if (typeof conditionEvaluated !== 'boolean') {
        throw new UnexpectedVariableTypeError('fnIf: The condition must resolve to a boolean.');
    }

    if (conditionEvaluated) {
        log.trace('fnIf: Condition evaluated to true; resolving true branch.');
        return resolveValue(conditionArr[1], ctx);
    } else {
        log.trace('fnIf: Condition evaluated to false; resolving false branch.');
        return resolveValue(conditionArr[2], ctx);
    }
};

/**
 * Implements the Fn::Contains intrinsic function.
 * Returns true if the resolved array contains the specified search value.
 *
 * Supported input: An array with exactly 2 elements,
 * where the first element resolves to an array and the second is the search value.
 *
 * The function checks for strict equality first. If that fails and both values are objects,
 * a simple deep-equality check (via JSON.stringify) is performed.
 *
 * @param node - An object of the form { "Fn::Contains": [ list, searchValue ] }
 * @param ctx - The current resolving context.
 * @returns true if the searchValue is found in the array; otherwise, false.
 * @throws {UnexpectedVariableTypeError} When the first parameter does not resolve to an array.
 */
export const fnContains: IntrinsicFunc = (node: unknown, ctx: ResolvingContext): boolean => {
    log.trace('fnContains: Invocation started.', { node, context: ctx });
    validateThatCorrectIntrinsicCalled(node, 'Fn::Contains');

    const value = node as FnContains;
    const arr = value['Fn::Contains'];

    if (!Array.isArray(arr)) {
        throw new UnexpectedVariableTypeError('fnContains: Fn::Contains requires an array.');
    }

    const listCandidate = resolveValue(arr[0], ctx);
    const searchValue = resolveValue(arr[1], ctx);

    log.trace('fnContains: Resolved parameters.', { listCandidate, searchValue });

    if (!Array.isArray(listCandidate)) {
        throw new UnexpectedVariableTypeError('fnContains: The first parameter must resolve to an array.');
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
};
