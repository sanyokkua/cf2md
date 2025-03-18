import log from 'loglevel';
import { AWSECSTaskDefinition, CloudFormationResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveStringWithDefault } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS ECS Task Definition resources.
 *
 * This object provides helper functions to resolve intrinsic references, generate ARNs,
 * and produce unique identifiers for ECS Task Definition resources in AWS CloudFormation templates.
 * These functions are used by the CloudFormation parser to dynamically determine resource-specific
 * properties based on the resource properties and context (e.g., region, account ID, partition).
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ecs-taskdefinition.html#aws-resource-ecs-taskdefinition-return-values
 */
export const awsEcsTaskDefinitionFunc: ResourceSpecificFunc = {
    /**
     * Resolves the "Ref" intrinsic for an ECS Task Definition resource.
     *
     * This function is called when the CloudFormation template references an ECS Task Definition
     * using the "Ref" intrinsic. It delegates the resolution to the arnGenFunc since the ARN
     * uniquely identifies the task definition.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The ECS Task Definition resource object.
     * @param ctx - The resolving context providing helper functions and environment data.
     * @returns The generated ARN for the ECS Task Definition, serving as its unique identifier.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Delegate the reference resolution to the ARN generation function.
        return awsEcsTaskDefinitionFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Resolves an attribute value ("Fn::GetAtt") for an ECS Task Definition resource.
     *
     * This function handles intrinsic attribute retrieval. Currently, if the attribute key
     * is "TaskDefinitionArn", the function returns the ARN of the ECS Task Definition by calling arnGenFunc.
     * For any unsupported attribute key, a warning is logged and the unique identifier is returned as fallback.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The ECS Task Definition resource object.
     * @param ctx - The resolving context with environment details.
     * @returns The resolved attribute value, typically the ARN.
     */
    getAttFunc: (
        resourceType: string,
        key: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called getAttFunc, for ${resourceType}, with logicalId=${logicalId}, and key=${key}`, resource, ctx);

        if (key === 'TaskDefinitionArn') {
            return awsEcsTaskDefinitionFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }

        // Log a warning for unsupported attribute keys and return the unique identifier as a fallback.
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsEcsTaskDefinitionFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an ECS Task Definition resource.
     *
     * Constructs the ARN using the partition, region, and account ID from the resolving context,
     * along with the task definition family name. If the family name is not provided, a default one
     * is generated using a random alphanumeric string. The ARN follows the format:
     *
     *   arn:{partition}:ecs:{region}:{accountId}:task-definition/{taskDefinitionFamily}:1
     *
     * If the ARN is not already cached on the resource, it is generated and stored for future reuse.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource in the template.
     * @param resource - The ECS Task Definition resource object.
     * @param ctx - The resolving context providing environment information.
     * @returns The generated ARN as a string.
     */
    arnGenFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): string => {
        log.trace(`Called arnGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._arn) {
            // Cast the generic resource to the ECS Task Definition resource to access specific properties.
            const resTyped = resource as AWSECSTaskDefinition;
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            // Generate a default family name if 'Family' property is missing.
            const defaultFamily = generateAlphaNumeric(5, ctx);
            // Resolve the task definition family, defaulting to the generated value if not provided.
            const taskDefinitionFamily = resolveStringWithDefault(
                resTyped.Properties.Family,
                defaultFamily,
                `${resourceType}.Properties.Family`,
                ctx,
            );

            // Build the ARN using the ECS task definition ARN format, assuming version "1".
            resource._arn = `arn:${partition}:ecs:${region}:${accountId}:task-definition/${taskDefinitionFamily}:1`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an ECS Task Definition resource.
     *
     * Checks if the resource already has an ID assigned. If not, it calls arnGenFunc to generate
     * the ARN, which will serve as the resource's unique identifier. The generated ID is cached on the
     * resource object for subsequent lookups.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource as defined in the CloudFormation template.
     * @param resource - The ECS Task Definition resource object.
     * @param ctx - The resolving context that provides utility methods.
     * @returns The generated unique identifier for the resource.
     */
    idGenFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): string => {
        log.trace(`Called idGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._id) {
            log.trace(`For ${logicalId} with type ${resourceType} id is not set, will be generated`);
            // Use the generated ARN as the unique identifier.
            resource._id = awsEcsTaskDefinitionFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }
        return resource._id;
    },
};
