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
            const deepEqual = JSON.stringify(resolved0) === JSON.stringify(resolved1);
            log.trace('fnEquals: Deep equality check result.', { deepEqual });
            return deepEqual;
        }

        log.trace('fnEquals: Values are not equal.');
        return false;
    }
}
