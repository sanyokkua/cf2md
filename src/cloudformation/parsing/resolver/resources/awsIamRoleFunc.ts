import log from 'loglevel';
import { CloudFormationResource, IAMRoleResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveStringWithDefault } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS IAM Role resources.
 *
 * This object provides helper functions to resolve intrinsic references (such as "Ref" and "Fn::GetAtt"),
 * generate ARNs, and create unique identifiers for AWS::IAM::Role resources defined in CloudFormation templates.
 * These functions form a part of the CloudFormation parser and use resource properties along with environment
 * context (e.g., account, partition) to compute unique values.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-iam-role.html#aws-resource-iam-role-return-values
 */
export const awsIamRoleFunc: ResourceSpecificFunc = {
    /**
     * Resolves the "Ref" intrinsic for an AWS IAM Role resource.
     *
     * Invoked when a CloudFormation template references an IAM Role via "Ref", this function logs the call
     * and delegates the resolution to the idGenFunc, which produces the resource's unique identifier.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The CloudFormation resource object (representing an IAM Role).
     * @param ctx - The resolving context containing environment-specific helper methods.
     * @returns The unique identifier for the IAM Role resource.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Delegate to idGenFunc to obtain the unique identifier.
        return awsIamRoleFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Resolves an attribute for an AWS IAM Role resource using the "Fn::GetAtt" intrinsic.
     *
     * This function handles attribute resolution. If the requested key is "Arn", it returns the generated ARN.
     * If the key is "RoleId", it returns the unique identifier. For any unsupported key, a warning is logged and
     * the unique identifier is returned.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context with environment details and helper methods.
     * @returns The resolved attribute value (ARN or RoleId) for the IAM Role.
     */
    getAttFunc: (
        resourceType: string,
        key: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called getAttFunc, for ${resourceType}, with logicalId=${logicalId}, and key=${key}`, resource, ctx);

        if (key === 'Arn') {
            // Return the ARN by delegating to arnGenFunc.
            return awsIamRoleFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }
        if (key === 'RoleId') {
            // Return the unique identifier by delegating to idGenFunc.
            return awsIamRoleFunc.idGenFunc(resourceType, logicalId, resource, ctx);
        }

        // For unsupported attribute keys, log a warning and fall back to the resource's unique identifier.
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsIamRoleFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an AWS IAM Role resource.
     *
     * Constructs the ARN using the partition and account ID from the context along with the IAM Role name
     * resolved from the resource properties. The ARN follows this pattern:
     *   arn:{partition}:iam::{accountId}:role/{roleName}
     * If not already set, the ARN is generated and cached on the resource object.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID from the CloudFormation template.
     * @param resource - The IAM Role resource object.
     * @param ctx - The resolving context providing environmental details (account ID, partition, etc.).
     * @returns The generated ARN string.
     */
    arnGenFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): string => {
        log.trace(`Called arnGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._arn) {
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            // Cast the generic resource to IAMRoleResource to access the RoleName property.
            const resTyped = resource as IAMRoleResource;
            // Generate a default role name using a random alphanumeric string if RoleName is not set.
            const nameDefault = `role-${generateAlphaNumeric(6, ctx)}`;
            const roleName = resolveStringWithDefault(
                resTyped.Properties.RoleName,
                nameDefault,
                `${resourceType}.Properties.RoleName`,
                ctx,
            );

            // Construct the ARN using the standard IAM role ARN format.
            resource._arn = `arn:${partition}:iam::${accountId}:role/${roleName}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an AWS IAM Role resource.
     *
     * Checks if the resource already has an assigned unique identifier (_id). If not, it uses the ARN generated
     * by arnGenFunc as the unique identifier. The result is cached on the resource object.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID from the CloudFormation template.
     * @param resource - The IAM Role resource object.
     * @param ctx - The resolving context providing helper methods.
     * @returns The unique identifier for the resource.
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
            // Use the ARN from arnGenFunc as the unique identifier.
            resource._id = awsIamRoleFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }
        return resource._id;
    },
};
