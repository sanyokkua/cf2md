import log from 'loglevel';
import { StringUtils } from '../../../common';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnSplit } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnSplitIntrinsic implements Intrinsic {
    constructor(
        private readonly intrinsicUtils: IntrinsicUtils,
        private readonly stringUtils: StringUtils,
    ) {
        log.trace('[FnSplitIntrinsic.constructor] Entering constructor.');
        log.trace('[FnSplitIntrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnSplitIntrinsic.constructor] stringUtils:', this.stringUtils);
        log.trace('[FnSplitIntrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnSplitIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Split);
        const value = object as FnSplit;

        const splitObject = value[CfIntrinsicFunctions.Fn_Split];
        log.debug('[FnSplitIntrinsic.resolveValue] Extracted Fn::Split object:', splitObject);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!Array.isArray(splitObject) || splitObject.length !== 2) {
            log.warn('[FnSplitIntrinsic.resolveValue] splitObject is not an array with 2 elements', splitObject);
            const error = new Error('Expected 2 items in Fn::Split array');
            log.error('[FnSplitIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        const delimiterRaw = splitObject[0];
        log.trace('[FnSplitIntrinsic.resolveValue] Resolving the delimiter.');
        const delimiter = resolveValue(delimiterRaw, ctx);
        log.debug('[FnSplitIntrinsic.resolveValue] Resolved delimiter:', delimiter);
        if (typeof delimiter !== 'string') {
            log.warn('[FnSplitIntrinsic.resolveValue] Delimiter did not resolve to a string', delimiter);
            const error = new Error('Expected first argument in Fn::Split to resolve to a string');
            log.error('[FnSplitIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        log.trace('[FnSplitIntrinsic.resolveValue] Resolving the source string.');
        const sourceString = resolveValue(splitObject[1], ctx);
        log.debug('[FnSplitIntrinsic.resolveValue] Resolved source string:', sourceString);
        if (typeof sourceString !== 'string') {
            log.warn('[FnSplitIntrinsic.resolveValue] Source string did not resolve to a string', sourceString);
            const error = new Error('Expected second argument in Fn::Split to resolve to a string');
            log.error('[FnSplitIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        const result = this.stringUtils.splitString(sourceString, delimiter);
        log.trace(`[FnSplitIntrinsic.resolveValue] Result is "${JSON.stringify(result)}"`);
        log.trace('[FnSplitIntrinsic.resolveValue] Exiting, returning:', result);
        return result;
    }
}
