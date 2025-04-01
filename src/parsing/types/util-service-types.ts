import { StringKeyObject } from '../../common';
import { CloudFormationTemplate } from './cloudformation-model';
import { TemplateParam, UserProvidedParam } from './parsing-types';
import { ResolvingContext, ValueResolverFunc } from './resolving-types';

// Just alias for better understanding in the different context
export type ResultParamMap = StringKeyObject;

export type MergeStatistics = {
    totalParamsProcessed: number;
    overriddenParams: string[];
    changedCount: number;
    missingRequiredParams: string[];
};

export interface RandomUtils {
    randomString(minLength: number, maxLength: number): string;
    randomInteger(min: number, max: number): number;
    randomArray<T>(itemGenerator: () => T, minItems: number, maxItems: number): T[];
    shortUuid(): string;
    fullUuid(): string;
}

export interface IntrinsicUtils {
    isIntrinsic(objectNode: unknown): boolean;
    getIntrinsicKey(objectNode: unknown): string;
    validateIntrinsic(objectNode: unknown, intrinsicKey: string): void;
    deepEqual(a: unknown, b: unknown): boolean;
}

export interface ResourceUtils {
    generateAZs(region: string): string[];
    generateAlphaNumeric(length: number, ctx: ResolvingContext): string;
    shortUuid(ctx: ResolvingContext): string;
    fullUuid(ctx: ResolvingContext): string;
    generateGenericId(logicalId: string, uniqAlphaNumericSize: number, ctx: ResolvingContext): string;
    generatePrefixedId(idPrefix: string, uniqAlphaNumericSize: number, ctx: ResolvingContext): string;
    generateNameId(
        nameField: unknown,
        nameFieldPath: string,
        defaultNamePattern: string,
        ctx: ResolvingContext,
        resolveValue: ValueResolverFunc,
        alphanumericLength: number,
    ): string;
    resolveString(property: unknown, propertyName: string, ctx: ResolvingContext, resolveValue: ValueResolverFunc): string;
    resolveStringWithDefault(
        property: unknown,
        defaultValue: string,
        propertyName: string,
        ctx: ResolvingContext,
        resolveValue: ValueResolverFunc,
    ): string;
}

export interface ParserUtils {
    buildTemplateParam(key: string, type: string, value: unknown, isRequired: boolean, stub: unknown): TemplateParam;
    analyzeParams(cft: CloudFormationTemplate): TemplateParam[];
    replaceParamsWithUserDefined(templateParams: TemplateParam[], userParams: UserProvidedParam[]): [ResultParamMap, MergeStatistics];
    generateStubOnType(paramType: string): unknown;
    validateParamsList(paramsMap: ResultParamMap): void;
}
