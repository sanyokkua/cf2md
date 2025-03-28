import { StringKeyObject } from '../../common/types/common-types';
import { CloudFormationTemplate } from './cloudformation-model';

export interface ResolvingContext {
    readonly originalTemplate: CloudFormationTemplate;
    readonly lookupMapPreProcessed: StringKeyObject;
    readonly generatedIds: Set<string>;
    lookupMapDynamic: StringKeyObject;
    currentPath: string[];

    // Debug-Oriented Methods
    addName(name: string): void;
    popName(): string;
    getCurrentPath(): string;

    // Cache Functionality
    hasParameterName(name: string): boolean;
    getParameter(name: string): unknown;
    addParameter(name: string, value: unknown): void;

    // Mock Functionality (Values available only during/after deployment)
    addGeneratedId(generatedId: string): void;
    isIdExists(idString: string): boolean;
    getRegion(): string;
    getPartition(): string;
    getAccountId(): string;
    getAZs(region?: string): string[];
    getStackName(): string;
}

export type ValueResolverFunc = (value: unknown, ctx: ResolvingContext) => unknown;

export interface ValueResolver {
    resolveValue: ValueResolverFunc;
}
