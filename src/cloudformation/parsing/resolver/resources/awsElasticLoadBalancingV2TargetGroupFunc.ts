import { removePrefixIfPresent } from 'coreutilsts';
import log from 'loglevel';
import { ElasticLoadBalancingV2TargetGroupResource } from '../../../types/cloudformation-model';
import { ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveStringWithDefault } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS Elastic Load Balancing V2 Target Group resources.
 *
 * This object provides helper functions to resolve intrinsic references, generate unique identifiers,
 * and construct ARNs for AWS::ElasticLoadBalancingV2::TargetGroup resources in CloudFormation templates.
 * The functions support intrinsic operations like "Ref" and "Fn::GetAtt" by computing values based on
 * resource properties and contextual environment details (e.g., region, account ID, partition).
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-elasticloadbalancingv2-listenerrule.html#aws-resource-elasticloadbalancingv2-listenerrule-return-values
 */
export const awsElasticLoadBalancingV2TargetGroupFunc: ResourceSpecificFunc = {
    /**
     * Resolves the "Ref" intrinsic for an ELBv2 Target Group resource.
     *
     * When a CloudFormation template uses the "Ref" intrinsic on a Target Group resource,
     * this function is invoked to generate and return the unique identifier, which in this case
     * is the resource's ARN. It logs the call and delegates to the arnGenFunc.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The Target Group resource object.
     * @param ctx - The resolving context providing helper methods and environment details.
     * @returns The generated ARN serving as the unique identifier.
     */
    refFunc: (resourceType, logicalId, resource, ctx): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        return awsElasticLoadBalancingV2TargetGroupFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Resolves an attribute intrinsic ("Fn::GetAtt") for an ELBv2 Target Group resource.
     *
     * Supported attribute keys:
     * - "LoadBalancerArns": Returns a fixed placeholder string.
     * - "TargetGroupArn": Returns the target group's ARN.
     * - "TargetGroupFullName": Removes the known ARN prefix and returns the remainder.
     * - "TargetGroupName": Extracts the name segment from the ARN after removing a specific prefix.
     * For any unsupported key, a warning is logged and the unique identifier is returned.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The Target Group resource object.
     * @param ctx - The resolving context supplying environment data.
     * @returns The resolved attribute value.
     */
    getAttFunc: (resourceType, key, logicalId, resource, ctx): unknown => {
        log.trace(`Called getAttFunc, for ${resourceType}, with logicalId=${logicalId}, and key=${key}`, resource, ctx);

        if (key === 'LoadBalancerArns') {
            return 'LoadBalancerArns';
        }
        if (key === 'TargetGroupArn') {
            return awsElasticLoadBalancingV2TargetGroupFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }
        if (key === 'TargetGroupFullName') {
            // Remove the known ARN prefix to isolate the full target group name.
            const arn = awsElasticLoadBalancingV2TargetGroupFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const prefix = `arn:${partition}:elasticloadbalancing:${region}:${accountId}:`;
            return removePrefixIfPresent(arn, prefix);
        }
        if (key === 'TargetGroupName') {
            // Extract the target group name from the ARN by removing the prefix and taking the first segment.
            const arn = awsElasticLoadBalancingV2TargetGroupFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const prefix = `arn:${partition}:elasticloadbalancing:${region}:${accountId}:targetgroup/`;
            const withoutPrefix = removePrefixIfPresent(arn, prefix);
            return withoutPrefix.substring(0, withoutPrefix.indexOf('/'));
        }

        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsElasticLoadBalancingV2TargetGroupFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an ELBv2 Target Group resource.
     *
     * Constructs the ARN using context details (region, account ID, partition) and resource properties.
     * A default target group name is generated if not provided, and a random alphanumeric target group ID is appended.
     * The constructed ARN follows the format:
     *   arn:{partition}:elasticloadbalancing:{region}:{accountId}:targetgroup/{targetGroupName}/{targetGroupId}
     * The ARN is then cached on the resource to optimize subsequent lookups.
     *
     * @param resourceType - The resource type.
     * @param logicalId - The logical identifier of the resource.
     * @param resource - The Target Group resource object.
     * @param ctx - The resolving context that provides region, account, and partition information.
     * @returns The generated ARN as a string.
     */
    arnGenFunc: (resourceType, logicalId, resource, ctx): string => {
        log.trace(`Called arnGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._arn) {
            const resTyped = resource as ElasticLoadBalancingV2TargetGroupResource;
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            // Generate a default target group name if none is provided.
            const tgName = `tg-${generateAlphaNumeric(4, ctx)}`; // Not optimal, may require improvement.
            const targetGroupName = resolveStringWithDefault(
                resTyped.Properties.Name,
                tgName,
                `${resourceType}.Properties.Name`,
                ctx,
            );
            // Generate a random target group ID.
            const targetGroupId = generateAlphaNumeric(16, ctx);

            resource._arn = `arn:${partition}:elasticloadbalancing:${region}:${accountId}:targetgroup/${targetGroupName}/${targetGroupId}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an ELBv2 Target Group resource.
     *
     * If the unique identifier (_id) is not set on the resource, this function calls arnGenFunc to generate
     * an ARN, which is then used as the identifier. The unique identifier is cached on the resource for future use.
     *
     * @param resourceType - The resource type.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The Target Group resource object.
     * @param ctx - The resolving context offering helper methods.
     * @returns The generated unique identifier as a string.
     */
    idGenFunc: (resourceType, logicalId, resource, ctx): string => {
        log.trace(`Called idGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._id) {
            log.trace(`For ${logicalId} with type ${resourceType} id is not set, will be generated`);
            resource._id = awsElasticLoadBalancingV2TargetGroupFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }
        return resource._id;
    },
};
