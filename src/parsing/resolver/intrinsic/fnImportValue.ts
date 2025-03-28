import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnImportValue } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnImportValueIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('fnImportValue is called');
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_ImportValue);
        const value = object as FnImportValue;

        const importVal = value[CfIntrinsicFunctions.Fn_ImportValue];
        if (typeof importVal === 'string') {
            log.trace(`fnImportValue: Found string value: "${importVal}"`);
            return importVal;
        }

        const resolvedValue = resolveValue(importVal, ctx);
        if (typeof resolvedValue !== 'string') {
            log.warn('fnImportValue: Resolved value is not a string', resolvedValue);
            throw new Error('Resolved value is not a string');
        }

        log.trace(`fnImportValue: Resolved value is "${resolvedValue}"`);
        return resolvedValue;
    }
}
