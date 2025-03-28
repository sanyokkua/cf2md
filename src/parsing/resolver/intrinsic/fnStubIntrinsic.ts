import log from 'loglevel';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';

export class FnStubIntrinsic implements Intrinsic {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    resolveValue(object: unknown, ctx: ResolvingContext, _resolveValue: ValueResolverFunc): unknown {
        log.trace('stubIntrinsic is called', object, ctx); // Log the invocation with input parameters for debugging.
        return 'stubIntrinsic'; // Return a static placeholder value.
    }
}
