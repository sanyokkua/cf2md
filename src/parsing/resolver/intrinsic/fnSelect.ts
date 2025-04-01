import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnSelect } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnSelectIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {
        log.trace('[FnSelectIntrinsic.constructor] Entering constructor.');
        log.trace('[FnSelectIntrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnSelectIntrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnSelectIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_Select);
        const value = object as FnSelect;

        const fnSelectElement: [unknown, unknown] | undefined = value[CfIntrinsicFunctions.Fn_Select];
        log.debug('[FnSelectIntrinsic.resolveValue] Extracted Fn::Select element:', fnSelectElement);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!Array.isArray(fnSelectElement) || fnSelectElement.length !== 2) {
            log.warn('[FnSelectIntrinsic.resolveValue] Incorrect format, expected an array of 2 elements', fnSelectElement);
            const error = new Error('Expected 2 items in Fn::Select array');
            log.error('[FnSelectIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        log.trace('[FnSelectIntrinsic.resolveValue] Resolving the index value.');
        const indexRaw = resolveValue(fnSelectElement[0], ctx);
        log.debug('[FnSelectIntrinsic.resolveValue] Raw index value:', indexRaw);
        const indexNumber = this.parseIndex(indexRaw);
        log.debug('[FnSelectIntrinsic.resolveValue] Parsed index number:', indexNumber);

        log.trace('[FnSelectIntrinsic.resolveValue] Resolving the array of values.');
        const values = resolveValue(fnSelectElement[1], ctx);
        log.debug('[FnSelectIntrinsic.resolveValue] Resolved values:', values);
        if (!Array.isArray(values)) {
            log.warn('[FnSelectIntrinsic.resolveValue] Values did not resolve to an array', values);
            const error = new Error('Expected the second argument of Fn::Select to resolve to an array');
            log.error('[FnSelectIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        if (indexNumber < 0 || indexNumber >= values.length) {
            log.warn(`[FnSelectIntrinsic.resolveValue] Index ${String(indexNumber)} is out of bounds for array length ${String(values.length)}`);
            const error = new Error('Index is out of bounds in Fn::Select');
            log.error('[FnSelectIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        const result: unknown = values[indexNumber];
        log.trace('[FnSelectIntrinsic.resolveValue] Result is:', result);
        log.trace('[FnSelectIntrinsic.resolveValue] Exiting, returning:', result);
        return result;
    }

    private parseIndex(index: unknown): number {
        log.trace('[FnSelectIntrinsic.parseIndex] Entering with argument:', { index });
        const number = parseInt(String(index), 10);
        log.debug('[FnSelectIntrinsic.parseIndex] Parsed number:', number);
        if (isNaN(number)) {
            log.warn('[FnSelectIntrinsic.parseIndex] Index could not be parsed as a number', index);
            const error = new Error(`Index for Fn::Select could not be parsed as a number: ${JSON.stringify(index)}`);
            log.error('[FnSelectIntrinsic.parseIndex] Error:', error);
            throw error;
        }
        log.trace('[FnSelectIntrinsic.parseIndex] Exiting, returning:', number);
        return number;
    }
}
