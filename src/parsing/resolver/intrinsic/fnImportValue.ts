import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnImportValue } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnImportValueIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {
        log.trace('[FnImportValueIntrinsic.constructor] Entering constructor.');
        log.trace('[FnImportValueIntrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnImportValueIntrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnImportValueIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_ImportValue);
        const value = object as FnImportValue;

        const importVal = value[CfIntrinsicFunctions.Fn_ImportValue];
        log.debug('[FnImportValueIntrinsic.resolveValue] Extracted import value:', importVal);

        if (typeof importVal === 'string') {
            log.trace(`[FnImportValueIntrinsic.resolveValue] Found string value directly: "${importVal}"`);
            log.trace('[FnImportValueIntrinsic.resolveValue] Exiting, returning:', importVal);
            return importVal;
        }

        log.trace('[FnImportValueIntrinsic.resolveValue] Import value is not a string, attempting to resolve.');
        const resolvedValue = resolveValue(importVal, ctx);
        log.debug('[FnImportValueIntrinsic.resolveValue] Resolved value:', resolvedValue);

        if (typeof resolvedValue !== 'string') {
            log.warn('[FnImportValueIntrinsic.resolveValue] Resolved value is not a string', resolvedValue);
            const error = new Error('Resolved value is not a string');
            log.error('[FnImportValueIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        log.trace(`[FnImportValueIntrinsic.resolveValue] Resolved value is "${resolvedValue}"`);
        log.trace('[FnImportValueIntrinsic.resolveValue] Exiting, returning:', resolvedValue);
        return resolvedValue;
    }
}
