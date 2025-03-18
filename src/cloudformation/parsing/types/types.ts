import { CloudFormationResource, CloudFormationTemplate } from '../../types/cloudformation-model';

/**
 * An object with string keys and values of unknown type.
 */
export type StringKeyObject = { [key: string]: unknown };

/**
 * Represents a function to resolve CloudFormation intrinsic elements.
 *
 * @param node - The node or value to resolve.
 * @param ctx - The current resolution context.
 * @returns The resolved value.
 */
export type IntrinsicFunc = (node: unknown, ctx: ResolvingContext) => unknown;

/**
 * A function that returns an intrinsic resolver given an intrinsic key.
 *
 * @param intrinsicKey - The key representing an intrinsic function.
 * @returns A corresponding intrinsic function.
 */
export type IntrinsicResolver = (intrinsicKey: string) => IntrinsicFunc;

/**
 * Function signature for resolving a CloudFormation "Ref" intrinsic.
 *
 * @param resourceType - The type of the CloudFormation resource.
 * @param logicalId - The logical identifier of the resource.
 * @param resource - The CloudFormation resource object.
 * @param ctx - The resolution context.
 * @returns The resolved reference value.
 */
export type IntrinsicRef = (
    resourceType: string,
    logicalId: string,
    resource: CloudFormationResource,
    ctx: ResolvingContext,
) => unknown;

/**
 * Function signature for resolving a CloudFormation "GetAtt" intrinsic.
 *
 * @param resourceType - The type of the CloudFormation resource.
 * @param key - The attribute key to retrieve.
 * @param logicalId - The logical identifier of the resource.
 * @param resource - The CloudFormation resource object.
 * @param ctx - The resolution context.
 * @returns The retrieved attribute value.
 */
export type IntrinsicGetAtt = (
    resourceType: string,
    key: string,
    logicalId: string,
    resource: CloudFormationResource,
    ctx: ResolvingContext,
) => unknown;

/**
 * Function that generates an Amazon Resource Name (ARN) for a resource.
 *
 * @param resourceType - The type of the resource.
 * @param logicalId - The logical identifier of the resource.
 * @param resource - The CloudFormation resource object.
 * @param ctx - The resolution context.
 * @returns The generated ARN as a string.
 */
export type ArnGeneratorFunc = (
    resourceType: string,
    logicalId: string,
    resource: CloudFormationResource,
    ctx: ResolvingContext,
) => string;

/**
 * Function that generates a unique identifier for a resource.
 *
 * @param resourceType - The type of the resource.
 * @param logicalId - The logical identifier of the resource.
 * @param resource - The CloudFormation resource object.
 * @param ctx - The resolution context.
 * @returns The generated identifier as a string.
 */
export type IdGeneratorFunc = (
    resourceType: string,
    logicalId: string,
    resource: CloudFormationResource,
    ctx: ResolvingContext,
) => string;

/**
 * A collection of functions specific to processing a CloudFormation resource,
 * including intrinsic function resolution, ARN generation, and ID generation.
 */
export type ResourceSpecificFunc = {
    /** Resolves the CloudFormation "Ref" intrinsic for the resource. */
    refFunc: IntrinsicRef;
    /** Resolves the CloudFormation "GetAtt" intrinsic for the resource. */
    getAttFunc: IntrinsicGetAtt;
    /** Generates an ARN for the resource. */
    arnGenFunc: ArnGeneratorFunc;
    /** Generates a unique ID for the resource. */
    idGenFunc: IdGeneratorFunc;
};

/**
 * A function that resolves resource-specific functions based on the resource type.
 *
 * @param resourceType - The type of the CloudFormation resource.
 * @returns The ResourceSpecificFunc containing functions for that resource type.
 */
export type ResourceSpecificResolverFunc = (resourceType: string) => ResourceSpecificFunc;

/**
 * Context for resolving CloudFormation template resources and intrinsic functions.
 *
 * This interface provides methods to manipulate resolution state, including
 * debugging, caching, and generating mock values during or after deployment.
 */
export interface ResolvingContext {
    /** The original CloudFormation template being processed. */
    readonly originalTemplate: CloudFormationTemplate;
    /** A pre-processed lookup map derived from the template. */
    readonly lookupMapPreProcessed: StringKeyObject;
    /** A set of generated IDs to ensure uniqueness across resources. */
    readonly generatedIds: Set<string>;
    /** A dynamic lookup map maintained during resolution. */
    lookupMapDynamic: StringKeyObject;
    /** The current resolution path as an array of string segments. */
    currentPath: string[];

    // Debug-Oriented Methods

    /**
     * Adds a name to the current resolution path for debugging purposes.
     *
     * @param name - The name to add to the path.
     */
    addName(name: string): void;

    /**
     * Removes the most recent name from the resolution path.
     *
     * @returns The removed name.
     */
    popName(): string;

    /**
     * Retrieves the current resolution path as a formatted string.
     *
     * @returns The current path.
     */
    getCurrentPath(): string;

    // Cache Functionality

    /**
     * Checks whether a parameter exists in the context.
     *
     * @param name - The parameter name to verify.
     * @returns True if the parameter exists; otherwise, false.
     */
    hasParameterName(name: string): boolean;

    /**
     * Retrieves the value of a parameter by name.
     *
     * @param name - The parameter name.
     * @returns The parameter's value, or undefined if not found.
     */
    getParameter(name: string): unknown;

    /**
     * Adds a parameter and its associated value to the context.
     *
     * @param name - The parameter name.
     * @param value - The parameter's value.
     */
    addParameter(name: string, value: unknown): void;

    // Mock Functionality (Values available only during/after deployment)

    /**
     * Registers a generated ID within the context.
     *
     * @param generatedId - The generated ID to be recorded.
     */
    addGeneratedId(generatedId: string): void;

    /**
     * Checks if the specified generated ID already exists in the context.
     *
     * @param idString - The generated ID to check.
     * @returns True if the generated ID exists; otherwise, false.
     */
    isIdExists(idString: string): boolean;

    /**
     * Retrieves the AWS region from the context.
     *
     * @returns The region as a string.
     */
    getRegion(): string;

    /**
     * Retrieves the AWS partition from the context (e.g., aws, aws-cn).
     *
     * @returns The partition as a string.
     */
    getPartition(): string;

    /**
     * Retrieves the AWS account ID from the context.
     *
     * @returns The account ID as a string.
     */
    getAccountId(): string;

    /**
     * Retrieves the Availability Zones (AZs) for the current or specified region.
     *
     * @param region - An optional region for which to retrieve AZs.
     * @returns An array of AZ identifiers.
     */
    getAZs(region?: string): string[];
}
