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
    ) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('fnSplit is called');
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Split);
        const value = object as FnSplit;

        const splitObject = value[CfIntrinsicFunctions.Fn_Split];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!Array.isArray(splitObject) || splitObject.length !== 2) {
            log.warn('fnSplit: splitObject is not an array with 2 elements', splitObject);
            throw new Error('Expected 2 items in Fn::Split array');
        }

        const delimiter = splitObject[0];

        const sourceString = resolveValue(splitObject[1], ctx);
        if (typeof sourceString !== 'string') {
            log.warn('fnSplit: Source string did not resolve to a string', sourceString);
            throw new Error('Expected second argument in Fn::Split to resolve to a string');
        }

        const result = this.stringUtils.splitString(sourceString, delimiter);
        log.trace(`fnSplit: Result is "${JSON.stringify(result)}"`);
        return result;
    }
}
