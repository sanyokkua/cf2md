import log from 'loglevel';
import { CloudFormationResource, EventsRuleResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveStringWithDefault } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS Events Rule resources.
 *
 * This object provides methods to resolve intrinsic references, generate ARNs, and create unique identifiers
 * for AWS::Events::Rule resources in CloudFormation templates. These functions are used by the CloudFormation
 * parser to dynamically calculate resource values based on the properties specified in the template and the
 * environment context (such as region, account, and partition).
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-events-rule.html#aws-resource-events-rule-return-values
 */
export const awsEventsRuleFunc: ResourceSpecificFunc = {
    /**
     * Resolves the "Ref" intrinsic for an AWS Events Rule resource.
     *
     * When a CloudFormation template references an Events Rule using the "Ref" intrinsic, this function is invoked.
     * It logs the invocation and delegates to the idGenFunc to generate and return the unique identifier for the resource.
     *
     * @param resourceType - The type of the resource (e.g., "AWS::Events::Rule").
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The CloudFormation resource object representing the Events Rule.
     * @param ctx - The resolving context supplying environment-specific helpers and configuration.
     * @returns The generated unique identifier for the Events Rule resource.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Use idGenFunc to produce the unique identifier for this resource.
        return awsEventsRuleFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Retrieves an attribute value for an AWS Events Rule resource.
     *
     * This function implements the "Fn::GetAtt" intrinsic. If the requested attribute key is "Arn", it returns the ARN
     * generated by arnGenFunc. If the key is unsupported, a warning is logged and the unique identifier produced by idGenFunc
     * is returned instead.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested (e.g., "Arn").
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object representing the Events Rule.
     * @param ctx - The resolving context providing environment and helper data.
     * @returns The resolved attribute value, typically the ARN or the unique identifier.
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
            return awsEventsRuleFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }

        // For any unsupported attribute keys, log a warning and return the resource's unique identifier.
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsEventsRuleFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an AWS Events Rule resource.
     *
     * Constructs the ARN using the partition, region, and account ID provided by the resolving context,
     * along with the unique rule name generated via idGenFunc. If the ARN is not already cached on the resource,
     * it is built and then stored on the resource object for subsequent use.
     *
     * The ARN follows this format:
     *   arn:{partition}:events:{region}:{accountId}:rule/{ruleName}
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The CloudFormation resource object representing the Events Rule.
     * @param ctx - The resolving context containing environment details like region, account ID, and partition.
     * @returns The constructed ARN as a string.
     */
    arnGenFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): string => {
        log.trace(`Called arnGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._arn) {
            // Retrieve necessary context details.
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            // Use idGenFunc to compute a unique rule name.
            const ruleName = awsEventsRuleFunc.idGenFunc(resourceType, logicalId, resource, ctx);

            // Construct the ARN string.
            resource._arn = `arn:${partition}:events:${region}:${accountId}:rule/${ruleName}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an AWS Events Rule resource.
     *
     * This function generates a unique identifier for the resource by resolving the "Name" property.
     * If the "Name" property is missing, it falls back to using the logical ID with a default prefix.
     * The computed identifier is then cached on the resource object.
     *
     * @param resourceType - The type of the resource (e.g., "AWS::Events::Rule").
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The CloudFormation resource object representing the Events Rule.
     * @param ctx - The resolving context offering additional helper methods.
     * @returns The unique identifier (rule name) as a string.
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
            // Cast resource to EventsRuleResource to access the Name property.
            const resTyped = resource as EventsRuleResource;
            // Generate a default name using a random alphanumeric string prefixed with "rule-".
            const nameDefault = `rule-${generateAlphaNumeric(6, ctx)}`;
            // Resolve the Name property; if not provided, use the default generated value.
            resource._id = resolveStringWithDefault(
                resTyped.Properties.Name,
                nameDefault,
                `${resourceType}.Properties.Name`,
                ctx,
            );
        }
        return resource._id;
    },
};
