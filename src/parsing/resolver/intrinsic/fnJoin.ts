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
    ) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('fnJoin is called');
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Join);
        const value = object as FnJoin;

        // Retrieve the intrinsic array from the object.
        const fnJoinElement = value['Fn::Join'];

        // Verify that the intrinsic array has exactly 2 elements.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!Array.isArray(fnJoinElement) || fnJoinElement.length !== 2) {
            log.warn('fnJoin: Incorrect format, expected an array of 2 elements', fnJoinElement);
            throw new Error('Expected 2 items in Fn::Join array');
        }

        // Extract the delimiter and validate it is a string.
        const delimiter = fnJoinElement[0];

        // Extract the array of values to join and ensure that it is an array.
        const arrayOfValues = fnJoinElement[1];
        if (!Array.isArray(arrayOfValues)) {
            log.warn('fnJoin: Second element is not an array', arrayOfValues);
            throw new Error('Expected second item in Fn::Join to be an array');
        }

        // Resolve each value in the array using the resolving context.
        const resolvedValues = arrayOfValues.map((val) => resolveValue(val, ctx));

        // Verify that each resolved value is a string.
        const stringValues = resolvedValues.map((val) => {
            if (typeof val !== 'string') {
                log.warn('fnJoin: A resolved value is not a string', val);
                throw new Error('Resolved value is not a string');
            }
            return val;
        });

        // Join the resolved string values using the specified delimiter.
        const result = this.stringUtils.joinStrings(stringValues, delimiter);
        log.trace(`fnJoin: Result is "${result}"`);
        return result;
    }
}
