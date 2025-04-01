import log from 'loglevel';
import { StringUtils } from '../../../common';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnJoin } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnJoinIntrinsic implements Intrinsic {
    constructor(
        private readonly intrinsicUtils: IntrinsicUtils,
        private readonly stringUtils: StringUtils,
    ) {
        log.trace('[FnJoinIntrinsic.constructor] Entering constructor.');
        log.trace('[FnJoinIntrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnJoinIntrinsic.constructor] stringUtils:', this.stringUtils);
        log.trace('[FnJoinIntrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnJoinIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Join);
        const value = object as FnJoin;

        const fnJoinElement = value['Fn::Join'];
        log.debug('[FnJoinIntrinsic.resolveValue] Extracted Fn::Join element:', fnJoinElement);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!Array.isArray(fnJoinElement) || fnJoinElement.length !== 2) {
            log.warn('[FnJoinIntrinsic.resolveValue] Incorrect format, expected an array of 2 elements', fnJoinElement);
            const error = new Error('Expected 2 items in Fn::Join array');
            log.error('[FnJoinIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        const [delimiterValue, arrayOfValuesValue] = fnJoinElement;
        log.debug('[FnJoinIntrinsic.resolveValue] Delimiter Value:', delimiterValue);
        log.debug('[FnJoinIntrinsic.resolveValue] Array of Values Value:', arrayOfValuesValue);

        log.trace('[FnJoinIntrinsic.resolveValue] Resolving the delimiter.');
        const delimiter = resolveValue(delimiterValue, ctx);
        log.debug('[FnJoinIntrinsic.resolveValue] Resolved delimiter:', delimiter);
        if (typeof delimiter !== 'string') {
            log.warn('[FnJoinIntrinsic.resolveValue] Delimiter is not a string', delimiter);
            const error = new Error('Expected first item in Fn::Join to be a string (the delimiter)');
            log.error('[FnJoinIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        if (!Array.isArray(arrayOfValuesValue)) {
            log.warn('[FnJoinIntrinsic.resolveValue] Second element is not an array', arrayOfValuesValue);
            const error = new Error('Expected second item in Fn::Join to be an array of values to join');
            log.error('[FnJoinIntrinsic.resolveValue] Error:', error);
            throw error;
        }
        log.debug('[FnJoinIntrinsic.resolveValue] Array of values to join:', arrayOfValuesValue);

        const resolvedValues = arrayOfValuesValue.map((val) => {
            log.trace('[FnJoinIntrinsic.resolveValue] Resolving a value in the array:', val);
            const resolvedVal = resolveValue(val, ctx);
            log.debug('[FnJoinIntrinsic.resolveValue] Resolved value:', resolvedVal);
            if (typeof resolvedVal !== 'string') {
                log.warn('[FnJoinIntrinsic.resolveValue] A resolved value is not a string', resolvedVal);
                const error = new Error('Resolved value in Fn::Join is not a string');
                log.error('[FnJoinIntrinsic.resolveValue] Error:', error);
                throw error;
            }
            return resolvedVal;
        });
        log.debug('[FnJoinIntrinsic.resolveValue] Resolved array of values:', resolvedValues);

        const result = this.stringUtils.joinStrings(resolvedValues, delimiter);
        log.trace(`[FnJoinIntrinsic.resolveValue] Result is "${result}"`);
        log.trace('[FnJoinIntrinsic.resolveValue] Exiting, returning:', result);
        return result;
    }
}
