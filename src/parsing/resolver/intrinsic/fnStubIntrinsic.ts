import log from 'loglevel';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';

export class FnStubIntrinsic implements Intrinsic {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    resolveValue(object: unknown, ctx: ResolvingContext, _resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnStubIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        log.trace('[FnStubIntrinsic.resolveValue] Stub intrinsic invoked with object:', object, 'and context:', ctx); // Log the invocation with input parameters for debugging.
        const result = 'stubIntrinsic'; // Return a static placeholder value.
        log.trace('[FnStubIntrinsic.resolveValue] Exiting, returning:', result);
        return result;
    }
}
