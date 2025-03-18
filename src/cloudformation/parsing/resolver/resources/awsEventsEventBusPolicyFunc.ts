import log from 'loglevel';
import { ResourceSpecificFunc } from '../../types/types';

/**
 * Resource-specific functions for AWS Events EventBusPolicy resources.
 *
 * This object provides methods to resolve intrinsic references (e.g., "Ref" and "Fn::GetAtt"),
 * generate Amazon Resource Names (ARNs), and produce unique identifiers for AWS::Events::EventBusPolicy
 * resources in CloudFormation templates. These functions are part of the parser that dynamically resolves
 * resource values based on their properties and the deployment context (region, account, partition).
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-events-eventbuspolicy.html#aws-resource-events-eventbuspolicy-return-values
 */
export const awsEventsEventBusPolicyFunc: ResourceSpecificFunc = {
    /**
     * Resolves the "Ref" intrinsic for an Events EventBusPolicy resource.
     *
     * When a CloudFormation template uses "Ref" on an event bus policy resource, this function is invoked.
     * It logs the invocation and delegates to the arnGenFunc, which is used here to generate the unique identifier.
     *
     * @param resourceType - The resource type (e.g., "AWS::Events::EventBusPolicy").
     * @param logicalId - The logical ID of the resource in the template.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context supplying environment details and helper methods.
     * @returns The generated unique identifier (ARN) for the event bus policy resource.
     */
    refFunc: (resourceType, logicalId, resource, ctx): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Delegate resolution to arnGenFunc so that the ARN serves as a unique reference.
        return awsEventsEventBusPolicyFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Resolves an attribute intrinsic ("Fn::GetAtt") for an Events EventBusPolicy resource.
     *
     * This function processes attribute requests via the "Fn::GetAtt" intrinsic. For any requested attribute,
     * it logs a warning if the attribute is not explicitly supported and returns the unique identifier
     * generated by idGenFunc as a fallback.
     *
     * @param resourceType - The resource type.
     * @param key - The attribute key being requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context with environment and helper methods.
     * @returns The resolved attribute value, usually the unique identifier.
     */
    getAttFunc: (resourceType, key, logicalId, resource, ctx): unknown => {
        log.trace(`Called getAttFunc, for ${resourceType}, with logicalId=${logicalId}, and key=${key}`, resource, ctx);

        // Currently, no specific attributes are supported.
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        // Fall back to returning the unique identifier.
        return awsEventsEventBusPolicyFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an Events EventBusPolicy resource.
     *
     * Constructs the ARN using the region, account ID, and partition from the resolving context,
     * along with the unique policy identifier generated by idGenFunc. The ARN follows this pattern:
     *
     *    arn:{partition}:events:{region}:{accountId}:event-bus-policy/{policyId}
     *
     * If the ARN is not already computed, it is generated, cached on the resource, and then returned.
     *
     * @param resourceType - The resource type.
     * @param logicalId - The logical ID of the resource from the CloudFormation template.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context providing details like region, account ID, and partition.
     * @returns The generated ARN as a string.
     */
    arnGenFunc: (resourceType, logicalId, resource, ctx): string => {
        log.trace(`Called arnGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._arn) {
            // Retrieve necessary details from the context.
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            // Use idGenFunc to get a unique policy identifier.
            const policyId = awsEventsEventBusPolicyFunc.idGenFunc(resourceType, logicalId, resource, ctx);

            // Construct and cache the ARN.
            resource._arn = `arn:${partition}:events:${region}:${accountId}:event-bus-policy/${policyId}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an Events EventBusPolicy resource.
     *
     * This function checks whether the resource has an assigned identifier (_id). If not, it generates one
     * by using the resource's logical ID. The unique identifier is then cached on the resource object.
     *
     * @param resourceType - The resource type.
     * @param logicalId - The logical ID provided in the CloudFormation template.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context that facilitates helper functions.
     * @returns The unique identifier for the resource.
     */
    idGenFunc: (resourceType, logicalId, resource, ctx): string => {
        log.trace(`Called idGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._id) {
            log.trace(`For ${logicalId} with type ${resourceType} id is not set, will be generated`);
            // Use the logical ID as the unique identifier for now.
            resource._id = logicalId;
        }
        return resource._id;
    },
};
