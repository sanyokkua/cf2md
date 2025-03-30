import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnToJsonString } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnToJsonStringIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('fnToJsonString is called');
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_ToJsonString);
        const value = object as FnToJsonString;
        const fnValueObj = value[CfIntrinsicFunctions.Fn_ToJsonString];

        if (typeof fnValueObj === 'string') {
            log.trace(`fnToJsonString: Value is a string: "${fnValueObj}"`);
            return fnValueObj;
        }

        const resolvedObject = resolveValue(fnValueObj, ctx);
        if (typeof resolvedObject === 'string') {
            log.trace(`fnToJsonString: Resolved object is a string: "${resolvedObject}"`);
            return resolvedObject;
        }

        if (resolvedObject && (typeof resolvedObject === 'object' || Array.isArray(resolvedObject))) {
            const jsonString = JSON.stringify(resolvedObject);
            log.trace(`fnToJsonString: JSON string generated: "${jsonString}"`);
            return jsonString;
        }

        log.warn('fnToJsonString: Resolved object is not a supported type', resolvedObject);
        throw new Error('Failed to parse object to JSON string');
    }
}
