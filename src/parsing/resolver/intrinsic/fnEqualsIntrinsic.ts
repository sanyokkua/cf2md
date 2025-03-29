import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnEquals } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnEqualsIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('fnEquals: Invocation started.', { object, context: ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Equals);

        const value = object as FnEquals;
        const conditionArr = value[CfIntrinsicFunctions.Fn_Equals];

        if (!Array.isArray(conditionArr)) {
            throw new Error('fnEquals: Fn::Equals requires an array.');
        }

        const resolved0 = resolveValue(conditionArr[0], ctx);
        const resolved1 = resolveValue(conditionArr[1], ctx);
        log.trace('fnEquals: Resolved values.', { resolved0, resolved1 });

        if (resolved0 === resolved1) {
            log.trace('fnEquals: Values are strictly equal.');
            return true;
        }

        if (typeof resolved0 === 'object' && resolved0 !== null && typeof resolved1 === 'object' && resolved1 !== null) {
            return this.deepEqual(resolved0, resolved1);
        }

        log.trace('fnEquals: Values are not equal.');
        return false;
    }

    deepEqual(a: unknown, b: unknown): boolean {
        if (a === b) {
            return true;
        } // Strictly equal objects are deeply equal.
        if (a == null || b == null) {
            return false;
        } // One is null/undefined but not both.
        if (typeof a !== typeof b) {
            return false;
        } // Types must be identical.

        if (a instanceof Date && b instanceof Date) {
            return a.getTime() === b.getTime(); // Compare dates by time.
        }

        if (a instanceof RegExp && b instanceof RegExp) {
            return a.toString() === b.toString(); // Compare regex patterns.
        }

        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) {
                return false;
            } // Arrays must be same length.
            return a.every((item, index) => this.deepEqual(item, b[index])); // Compare elements recursively.
        }

        if (typeof a === 'object' && typeof b === 'object') {
            const aKeys = Object.keys(a as Record<string, unknown>);
            const bKeys = Object.keys(b as Record<string, unknown>);

            if (aKeys.length !== bKeys.length) {
                return false;
            } // Objects must have the same number of keys.

            return aKeys.every(
                (key) =>
                    Object.prototype.hasOwnProperty.call(b, key) &&
                    this.deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
            );
        }

        return false;
    }
}
