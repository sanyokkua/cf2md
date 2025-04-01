import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnToJsonString } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnToJsonStringIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {
        log.trace('[FnToJsonStringIntrinsic.constructor] Entering constructor.');
        log.trace('[FnToJsonStringIntrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnToJsonStringIntrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnToJsonStringIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_ToJsonString);
        const value = object as FnToJsonString;
        const fnValueObj = value[CfIntrinsicFunctions.Fn_ToJsonString];
        log.debug('[FnToJsonStringIntrinsic.resolveValue] Extracted Fn::ToJsonString value:', fnValueObj);

        if (typeof fnValueObj === 'string') {
            log.trace(`[FnToJsonStringIntrinsic.resolveValue] Value is already a string: "${fnValueObj}"`);
            log.trace('[FnToJsonStringIntrinsic.resolveValue] Exiting, returning:', fnValueObj);
            return fnValueObj;
        }

        log.trace('[FnToJsonStringIntrinsic.resolveValue] Value is not a string, attempting to resolve.');
        const resolvedObject = resolveValue(fnValueObj, ctx);
        log.debug('[FnToJsonStringIntrinsic.resolveValue] Resolved object:', resolvedObject);

        if (typeof resolvedObject === 'string') {
            log.trace(`[FnToJsonStringIntrinsic.resolveValue] Resolved object is a string: "${resolvedObject}"`);
            log.trace('[FnToJsonStringIntrinsic.resolveValue] Exiting, returning:', resolvedObject);
            return resolvedObject;
        }

        if ((resolvedObject !== null && typeof resolvedObject === 'object') || Array.isArray(resolvedObject)) {
            log.trace('[FnToJsonStringIntrinsic.resolveValue] Resolved object is an object or array, converting to JSON string.');
            const jsonString = JSON.stringify(resolvedObject);
            log.trace(`[FnToJsonStringIntrinsic.resolveValue] JSON string generated: "${jsonString}"`);
            log.trace('[FnToJsonStringIntrinsic.resolveValue] Exiting, returning:', jsonString);
            return jsonString;
        }

        const resolvedObjectType = resolvedObject === null ? 'null' : typeof resolvedObject;
        log.warn(`[FnToJsonStringIntrinsic.resolveValue] Resolved object is not a supported type: ${resolvedObjectType}`, resolvedObject);
        const error = new Error(`Failed to convert object to JSON string. Unsupported type: ${resolvedObjectType}`);
        log.error('[FnToJsonStringIntrinsic.resolveValue] Error:', error);
        throw error;
    }
}
