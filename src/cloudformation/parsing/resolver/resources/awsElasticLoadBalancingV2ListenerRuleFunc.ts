import log from 'loglevel';
import { ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS Elastic Load Balancing V2 Listener Rule resources.
 *
 * This object provides methods to resolve intrinsic references ("Ref" and "Fn::GetAtt"),
 * generate unique identifiers, and construct Amazon Resource Names (ARNs) for ELBv2 Listener Rule
 * resources defined in AWS CloudFormation templates. These functions are a critical part of the CloudFormation
 * parser that enables dynamic resolution of resource properties.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-elasticloadbalancingv2-listenerrule.html#aws-resource-elasticloadbalancingv2-listenerrule-return-values
 */
export const awsElasticLoadBalancingV2ListenerRuleFunc: ResourceSpecificFunc = {
    /**
     * Resolves the "Ref" intrinsic for an ELBv2 Listener Rule resource.
     *
     * When a CloudFormation template uses "Ref" on a Listener Rule, this function is called.
     * It logs the call and delegates to `arnGenFunc` to generate the resource's unique identifier.
     *
     * @param resourceType - The resource type, e.g., "AWS::ElasticLoadBalancingV2::ListenerRule".
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The resource object representing the Listener Rule.
     * @param ctx - The resolving context providing environment details such as region, account, and partition.
     * @returns The unique identifier (ARN) for the Listener Rule.
     */
    refFunc: (resourceType, logicalId, resource, ctx): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Delegate reference resolution to the ARN generation function.
        return awsElasticLoadBalancingV2ListenerRuleFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Retrieves an attribute value for an ELBv2 Listener Rule resource.
     *
     * This function processes "Fn::GetAtt" intrinsics. It supports certain attribute keys:
     * - "IsDefault": Currently returns a runtime placeholder.
     * - "RuleArn": Returns the resource's ARN.
     * For unsupported keys, it logs a warning and falls back to the generated unique identifier.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The Listener Rule resource object.
     * @param ctx - The resolving context supplying environment and helper methods.
     * @returns The resolved attribute value for the resource.
     */
    getAttFunc: (resourceType, key, logicalId, resource, ctx): unknown => {
        log.trace(`Called getAttFunc, for ${resourceType}, with logicalId=${logicalId}, and key=${key}`, resource, ctx);

        if (key === 'IsDefault') {
            // TODO: Properly resolve whether this listener rule is default.
            return 'RUNTIME_IsDefault';
        }
        if (key === 'RuleArn') {
            // Return the ARN for the listener rule.
            return awsElasticLoadBalancingV2ListenerRuleFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }

        // For unsupported keys, log a warning and return the generated unique identifier.
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsElasticLoadBalancingV2ListenerRuleFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an ELBv2 Listener Rule resource.
     *
     * Constructs the ARN using the region, account ID, and partition from the resolving context,
     * combined with three randomly generated alphanumeric segments. This ARN uniquely identifies the Listener Rule.
     * The generated ARN is cached on the resource object to avoid redundant computations.
     *
     * @param resourceType - The resource type.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The resource object.
     * @param ctx - The resolving context providing region, account, and partition information.
     * @returns The generated ARN as a string.
     */
    arnGenFunc: (resourceType, logicalId, resource, ctx): string => {
        log.trace(`Called arnGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._arn) {
            // Retrieve necessary environment variables from the context.
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            // Generate three unique alphanumeric segments.
            const id1 = generateAlphaNumeric(16, ctx);
            const id2 = generateAlphaNumeric(16, ctx);
            const id3 = generateAlphaNumeric(16, ctx);

            // Construct the ARN using the standard ELBv2 Listener Rule format.
            resource._arn = `arn:${partition}:elasticloadbalancing:${region}:${accountId}:listener-rule/stub-cluster/${id1}/${id2}/${id3}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an ELBv2 Listener Rule resource.
     *
     * If the resource does not already have an identifier (_id), this function generates one by calling
     * `arnGenFunc` (which produces a unique ARN) and then caches that value as the identifier.
     *
     * @param resourceType - The resource type.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The resource object.
     * @param ctx - The resolving context that provides necessary helper functions.
     * @returns The generated unique identifier for the resource.
     */
    idGenFunc: (resourceType, logicalId, resource, ctx): string => {
        log.trace(`Called idGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._id) {
            log.trace(`For ${logicalId} with type ${resourceType} id is not set, will be generated`);
            resource._id = awsElasticLoadBalancingV2ListenerRuleFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }
        return resource._id;
    },
};
