import { removePrefixIfPresent } from 'coreutilsts';
import log from 'loglevel';
import { SQSQueueResource } from '../../../types/cloudformation-model';
import { ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveStringWithDefault } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS SQS Queue resources.
 *
 * This object provides helper functions for resolving intrinsic references ("Ref" and "Fn::GetAtt"),
 * generating ARNs, and producing unique identifiers for AWS::SQS::Queue resources in CloudFormation templates.
 * These functions are utilized by the CloudFormation parser to dynamically compute resource values based
 * on both resource properties and the deployment context (such as region, account ID, and partition).
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-sqs-queue.html#aws-resource-sqs-queue-return-values
 */
export const awsSqsQueueFunc: ResourceSpecificFunc = {
    /**
     * Resolves the "Ref" intrinsic for an AWS SQS Queue resource.
     *
     * When a CloudFormation template references an SQS Queue using "Ref", this function is called.
     * It logs the call and delegates to idGenFunc to generate the unique identifier (i.e., the queue URL).
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The CloudFormation resource object representing the SQS Queue.
     * @param ctx - The resolving context that provides environment-specific details.
     * @returns The unique identifier (queue URL) for the SQS Queue resource.
     */
    refFunc: (resourceType, logicalId, resource, ctx): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Delegate identifier generation to idGenFunc.
        return awsSqsQueueFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Resolves an attribute ("Fn::GetAtt") for an AWS SQS Queue resource.
     *
     * This function supports attribute resolution based on the provided key:
     *   - "Arn": Returns the queue's ARN by calling arnGenFunc.
     *   - "QueueName": Returns the queue's name by extracting it from the generated queue URL.
     *   - "QueueUrl": Returns the full queue URL, which is the unique identifier.
     * For unsupported attributes, a warning is logged and the unique identifier is returned.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object representing the SQS Queue.
     * @param ctx - The resolving context with environment and helper methods.
     * @returns The resolved attribute value.
     */
    getAttFunc: (resourceType, key, logicalId, resource, ctx): unknown => {
        log.trace(`Called getAttFunc, for ${resourceType}, with logicalId=${logicalId}, and key=${key}`, resource, ctx);

        if (key === 'Arn') {
            return awsSqsQueueFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }
        if (key === 'QueueName') {
            // Extract the queue name from the generated queue URL.
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const queueUrl = awsSqsQueueFunc.idGenFunc(resourceType, logicalId, resource, ctx);
            const prefix = `https://sqs.${region}.amazonaws.com/${accountId}/`;
            return removePrefixIfPresent(queueUrl, prefix);
        }
        if (key === 'QueueUrl') {
            return awsSqsQueueFunc.idGenFunc(resourceType, logicalId, resource, ctx);
        }

        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsSqsQueueFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an AWS SQS Queue resource.
     *
     * Constructs the ARN using the partition, region, and account ID provided by the context,
     * combined with the unique queue name derived from the resource. The ARN format is:
     *   arn:{partition}:sqs:{region}:{accountId}:{queueName}
     * The generated ARN is cached on the resource object for performance.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource within the CloudFormation template.
     * @param resource - The SQS Queue resource object.
     * @param ctx - The resolving context supplying environment details.
     * @returns The generated ARN as a string.
     */
    arnGenFunc: (resourceType, logicalId, resource, ctx): string => {
        log.trace(`Called arnGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            // Use idGenFunc to get the unique queue URL, and then extract the queue name.
            const queueUrl = awsSqsQueueFunc.idGenFunc(resourceType, logicalId, resource, ctx);
            const prefix = `https://sqs.${region}.amazonaws.com/${accountId}/`;
            const queueName = removePrefixIfPresent(queueUrl, prefix);
            resource._arn = `arn:${partition}:sqs:${region}:${accountId}:${queueName}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an AWS SQS Queue resource.
     *
     * This function determines a unique identifier by resolving the QueueName property from the resource.
     * If the QueueName is not provided, it falls back to a default value generated using a short UUID.
     * The unique identifier is then assembled into the full queue URL and cached on the resource.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID from the CloudFormation template.
     * @param resource - The CloudFormation resource object representing the SQS Queue.
     * @param ctx - The resolving context that offers helper utilities.
     * @returns The unique identifier (queue URL) as a string.
     */
    idGenFunc: (resourceType, logicalId, resource, ctx): string => {
        log.trace(`Called idGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._id) {
            log.trace(`For ${logicalId} with type ${resourceType} id is not set, will be generated`);
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const resTyped = resource as SQSQueueResource;
            // Define a default queue name using a short UUID if QueueName is not provided.
            const nameDefault = `sqs${generateAlphaNumeric(6, ctx)}`;
            const queueName = resolveStringWithDefault(
                resTyped.Properties.QueueName,
                nameDefault,
                `${resourceType}.Properties.QueueName`,
                ctx,
            );
            // Construct the full queue URL.
            resource._id = `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;
        }
        return resource._id;
    },
};
