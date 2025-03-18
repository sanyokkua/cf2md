import log from 'loglevel';
import { CloudFormationResource, IAMPolicyResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { resolveString } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS IAM Policy resources.
 *
 * This object provides helper functions to resolve intrinsic references ("Ref" and "Fn::GetAtt"),
 * generate ARNs, and produce unique identifiers for AWS::IAM::Policy resources in CloudFormation templates.
 * These functions are leveraged by the CloudFormation parser to dynamically determine and resolve resource
 * values using properties specified in the template along with environmental context (e.g., account ID, partition).
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-iam-policy.html#aws-resource-iam-policy-return-values
 */
export const awsIamPolicyFunc: ResourceSpecificFunc = {
    /**
     * Resolves the "Ref" intrinsic for an AWS IAM Policy resource.
     *
     * When a CloudFormation template references an IAM Policy resource using "Ref", this function is invoked.
     * It converts the resource to an IAMPolicyResource and resolves its PolicyName property. The resulting policy name
     * is used as the unique reference value.
     *
     * @param resourceType - The type of the resource (e.g., "AWS::IAM::Policy").
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The IAM Policy resource object.
     * @param ctx - The resolving context containing helper functions and environment information.
     * @returns The resolved policy name.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        const resTyped = resource as IAMPolicyResource;
        // Resolve the PolicyName property using a helper function.
        return resolveString(resTyped.Properties.PolicyName, `${resourceType}.Properties.PolicyName`, ctx);
    },

    /**
     * Resolves an attribute ("Fn::GetAtt") for an AWS IAM Policy resource.
     *
     * For the IAM Policy resource, if the requested attribute key is "Id", this function returns the unique identifier
     * generated by idGenFunc. For other attribute keys, a warning is logged and the unique identifier is returned.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The IAM Policy resource object.
     * @param ctx - The resolving context with relevant helper methods.
     * @returns The unique identifier for the resource.
     */
    getAttFunc: (
        resourceType: string,
        key: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called getAttFunc, for ${resourceType}, with logicalId=${logicalId}, and key=${key}`, resource, ctx);

        if (key === 'Id') {
            return awsIamPolicyFunc.idGenFunc(resourceType, logicalId, resource, ctx);
        }

        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsIamPolicyFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Constructs the Amazon Resource Name (ARN) for an AWS IAM Policy resource.
     *
     * The ARN is generated using the partition and account ID obtained from the resolving context,
     * along with the policy name (obtained via refFunc). If the ARN is not already cached on the resource,
     * it is computed and stored on the resource for subsequent retrieval.
     *
     * The resulting ARN follows the format:
     *   arn:{partition}:iam::{accountId}:policy/{policyName}
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID from the CloudFormation template.
     * @param resource - The IAM Policy resource object.
     * @param ctx - The resolving context providing environmental details.
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
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            // Retrieve the policy name by calling refFunc.
            const policyName = awsIamPolicyFunc.refFunc(resourceType, logicalId, resource, ctx) as string;
            resource._arn = `arn:${partition}:iam::${accountId}:policy/${policyName}`;
        }

        return resource._arn;
    },

    /**
     * Generates a unique identifier for an AWS IAM Policy resource.
     *
     * This function generates a unique identifier for the resource. If no identifier has been set, it defaults
     * to using the resource's logical ID. The identifier is then cached on the resource.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID from the CloudFormation template.
     * @param resource - The IAM Policy resource object.
     * @param ctx - The resolving context.
     * @returns The unique identifier for the IAM Policy resource.
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
            // Use the logical ID as the unique identifier if no specific property is provided.
            resource._id = logicalId;
        }

        return resource._id;
    },
};
