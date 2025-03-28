import { CloudFormationResource } from './cloudformation-model';
import { ResolvingContext, ValueResolverFunc } from './resolving-types';

// Raw Intrinsic

export interface Intrinsic {
    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown;
}

export interface IntrinsicResolver {
    getIntrinsic(key: string): Intrinsic;
}

// Resource Specific Intrinsic implementations

export type IntrinsicContext = {
    resource: CloudFormationResource;
    logicalId: string;
    ctx: ResolvingContext;
    valueResolver: ValueResolverFunc;
};

export interface ResourceIntrinsic {
    refFunc(context: IntrinsicContext): string;
    getAttFunc(context: IntrinsicContext, key: string): unknown;
    arnGenFunc(context: IntrinsicContext): string;
    idGenFunc(context: IntrinsicContext): string;
}

export interface ResourceIntrinsicResolver {
    getResourceIntrinsic(resourceType: string): ResourceIntrinsic;
}
