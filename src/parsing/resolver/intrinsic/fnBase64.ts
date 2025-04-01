import { Base64 } from 'js-base64';
import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnBase64 } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnBase64Intrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {
        log.trace('[FnBase64Intrinsic.constructor] Entering constructor.');
        log.trace('[FnBase64Intrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnBase64Intrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnBase64Intrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Base64);
        const value = object as FnBase64;

        const rawVal = value[CfIntrinsicFunctions.Fn_Base64];
        log.debug('[FnBase64Intrinsic.resolveValue] Raw value from Fn::Base64:', rawVal);

        if (typeof rawVal === 'string') {
            log.trace('[FnBase64Intrinsic.resolveValue] Raw value is a string, encoding directly.');
            const result = Base64.encode(rawVal);
            log.debug('[FnBase64Intrinsic.resolveValue] Base64 encoded result:', result);
            log.trace('[FnBase64Intrinsic.resolveValue] Exiting, returning:', result);
            return result;
        }

        log.trace('[FnBase64Intrinsic.resolveValue] Raw value is not a string, attempting to resolve it.');
        const resolvedValue = resolveValue(rawVal, ctx);
        log.debug('[FnBase64Intrinsic.resolveValue] Resolved value:', resolvedValue);

        if (typeof resolvedValue !== 'string') {
            log.warn('[FnBase64Intrinsic.resolveValue] Resolved value is not a string.', { resolvedValue });
            const error = new Error('Expected a string value for Fn::Base64 after resolution');
            log.error('[FnBase64Intrinsic.resolveValue] Error:', error);
            throw error;
        }

        const result = Base64.encode(resolvedValue);
        log.debug('[FnBase64Intrinsic.resolveValue] Base64 encoded result:', result);
        log.trace('[FnBase64Intrinsic.resolveValue] Exiting, returning:', result);
        return result;
    }
}
