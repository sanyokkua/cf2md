import { removePrefixIfPresent } from 'coreutilsts';
import log from 'loglevel';
import { CloudFormationResource, SNSTopicResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveStringWithDefault } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS SNS Topic resources.
 *
 * This object provides methods to resolve intrinsic references ("Ref" and "Fn::GetAtt"),
 * generate ARNs, and produce unique identifiers for AWS::SNS::Topic resources defined in
 * CloudFormation templates. These functions are used by the CloudFormation parser to dynamically
 * compute resource-specific values based on the properties specified in the template and the deployment
 * context (region, account, partition).
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-sns-topic.html#aws-resource-sns-topic-return-values
 */
export const awsSnsTopicFunc: ResourceSpecificFunc = {
    /**
     * Resolves the "Ref" intrinsic for an SNS Topic.
     *
     * When the CloudFormation template uses the "Ref" intrinsic on an SNS Topic resource, this function
     * is invoked. It generates the ARN using arnGenFunc and then removes the ARN prefix to extract and return
     * the unique topic name.
     *
     * @param resourceType - The type of the resource (e.g., "AWS::SNS::Topic").
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The SNS Topic resource object.
     * @param ctx - The resolving context offering environment details.
     * @returns The unique topic name derived from the ARN.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Get the full ARN and remove the expected ARN prefix to obtain the topic name.
        return awsSnsTopicFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Resolves an attribute intrinsic ("Fn::GetAtt") for an SNS Topic.
     *
     * This function handles "Fn::GetAtt" calls. If the requested attribute key is:
     * - "TopicArn": returns the full ARN via arnGenFunc.
     * - "TopicName": extracts the topic name from the ARN by removing the ARN prefix.
     *
     * For unsupported keys, it logs a warning and falls back to returning the unique identifier generated
     * by idGenFunc.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The SNS Topic resource object.
     * @param ctx - The resolving context with environment data.
     * @returns The resolved attribute value.
     */
    getAttFunc: (
        resourceType: string,
        key: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called getAttFunc, for ${resourceType}, with logicalId=${logicalId}, and key=${key}`, resource, ctx);
        if (key === 'TopicArn') {
            return awsSnsTopicFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }
        if (key === 'TopicName') {
            // Extract topic name by removing the ARN prefix.
            const arn = awsSnsTopicFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const prefix = `arn:${partition}:sns:${region}:${accountId}:`;
            return removePrefixIfPresent(arn, prefix);
        }
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsSnsTopicFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the ARN for an SNS Topic.
     *
     * Constructs the ARN using the partition, region, and account ID from the resolving context,
     * combined with the unique topic name generated via idGenFunc. The ARN format is:
     *   arn:{partition}:sns:{region}:{accountId}:{topicName}
     *
     * If the ARN is not already cached on the resource object, it is computed and stored for later retrieval.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource from the CloudFormation template.
     * @param resource - The SNS Topic resource object.
     * @param ctx - The resolving context with environment-specific details.
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
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            // Use idGenFunc to generate the unique topic name.
            const topicName = awsSnsTopicFunc.idGenFunc(resourceType, logicalId, resource, ctx);
            resource._arn = `arn:${partition}:sns:${region}:${accountId}:${topicName}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an SNS Topic.
     *
     * If the resource does not have an assigned identifier (_id), this function attempts to resolve the
     * "TopicName" property from the resource. If the TopicName is not provided, it defaults to a generated
     * name using a random alphanumeric string. The identifier is then cached on the resource object for future use.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The SNS Topic resource object.
     * @param ctx - The resolving context providing helper functions.
     * @returns The resolved or generated unique identifier (TopicName) as a string.
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
            const resTyped = resource as SNSTopicResource;
            // Generate a default topic name if not provided.
            const nameDefault = `topic-${generateAlphaNumeric(6, ctx)}`;
            resource._id = resolveStringWithDefault(
                resTyped.Properties.TopicName,
                nameDefault,
                `${resourceType}.Properties.Topic`,
                ctx,
            );
        }
        return resource._id;
    },
};
