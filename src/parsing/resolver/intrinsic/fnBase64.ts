import { Base64 } from 'js-base64';
import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnBase64 } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnBase64Intrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('FnBase64.resolveValue is called');
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Base64);
        const value = object as FnBase64;

        const rawVal = value[CfIntrinsicFunctions.Fn_Base64];
        if (typeof rawVal === 'string') {
            log.trace('fnBase64: Raw value is a string, encoding directly');
            const result = Base64.encode(rawVal);
            log.trace(`fnBase64: Result is:`, result);
            return result;
        }

        const resolvedValue = resolveValue(rawVal, ctx);
        if (typeof resolvedValue !== 'string') {
            log.warn('fnBase64: Resolved value is not a string', resolvedValue);
            throw new Error('Expected a string value for Fn::Base64 after resolution');
        }

        const result = Base64.encode(resolvedValue);
        log.trace(`fnBase64: Result is:`, result);
        return result;
    }
}
