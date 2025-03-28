import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnSelect } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnSelectIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('fnSelect is called');
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Select);
        const value = object as FnSelect;

        const fnSelectElement = value[CfIntrinsicFunctions.Fn_Select];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!Array.isArray(fnSelectElement) || fnSelectElement.length !== 2) {
            log.warn('fnSelect: Incorrect format, expected an array of 2 elements', fnSelectElement);
            throw new Error('Expected 2 items in Fn::Select array');
        }

        const indexRaw = resolveValue(fnSelectElement[0], ctx);
        const indexNumber = parseInt(String(indexRaw), 10);
        if (isNaN(indexNumber)) {
            log.warn('fnSelect: Index could not be parsed as a number', indexRaw);
            throw new Error(`Index for Fn::Select could not be parsed as a number: ${JSON.stringify(indexRaw)}`);
        }

        const values = resolveValue(fnSelectElement[1], ctx);
        if (!Array.isArray(values)) {
            log.warn('fnSelect: Values did not resolve to an array', values);
            throw new Error('Expected the second argument of Fn::Select to resolve to an array');
        }

        if (indexNumber < 0 || indexNumber >= values.length) {
            log.warn(`fnSelect: Index ${String(indexNumber)} is out of bounds for array length ${String(values.length)}`);
            throw new Error('Index is out of bounds in Fn::Select');
        }

        const result: unknown = values[indexNumber];
        log.trace('fnSelect: Result is:', result);
        return result;
    }
}
