import log from 'loglevel';
import { DynamoDBTableResource } from '../../../types/cloudformation-model';
import { ResourceSpecificFunc } from '../../types/types';
import { resolveStringWithDefault } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS DynamoDB Table resources.
 *
 * This object provides utility methods to resolve intrinsic references (like "Ref" and "Fn::GetAtt"),
 * generate ARNs, and produce unique identifiers for DynamoDB Table resources in CloudFormation templates.
 * The functions help the CloudFormation parser compute resource-specific values based on the resource properties
 * and the context (e.g., region, account information) in which the resource is deployed.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html#aws-resource-dynamodb-table-return-values
 */
export const awsDynamoDbTableFunc: ResourceSpecificFunc = {
    /**
     * Resolves the "Ref" intrinsic for a DynamoDB Table resource.
     *
     * When a CloudFormation template references a DynamoDB Table using "Ref", this function is invoked.
     * It logs the call and delegates the generation of a unique identifier to the `idGenFunc`.
     *
     * @param resourceType - The resource type (e.g., "AWS::DynamoDB::Table").
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The DynamoDB Table resource object.
     * @param ctx - The resolving context providing helper methods and environment data.
     * @returns The generated unique identifier for the DynamoDB Table.
     */
    refFunc: (resourceType, logicalId, resource, ctx): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Delegate to idGenFunc to generate the unique identifier.
        return awsDynamoDbTableFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Resolves an attribute intrinsic ("Fn::GetAtt") for a DynamoDB Table resource.
     *
     * This function handles "Fn::GetAtt" calls by returning the appropriate attribute.
     * - If the requested key is "Arn", it returns the resource ARN via `arnGenFunc`.
     * - If the key is "StreamArn", a placeholder value is returned (to be implemented later).
     * - For any unsupported key, a warning is logged and the resource's unique identifier is returned.
     *
     * @param resourceType - The resource type (e.g., "AWS::DynamoDB::Table").
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The DynamoDB Table resource object.
     * @param ctx - The resolving context with necessary environment data.
     * @returns The resolved attribute value.
     */
    getAttFunc: (resourceType, key, logicalId, resource, ctx): unknown => {
        log.trace(`Called getAttFunc, for ${resourceType}, with logicalId=${logicalId}, and key=${key}`, resource, ctx);

        if (key === 'Arn') {
            // Return the ARN for the resource.
            return awsDynamoDbTableFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }
        if (key === 'StreamArn') {
            // Placeholder for StreamArn; implementation pending.
            return 'RUNTIME_StreamArn'; // TODO: Implement StreamArn resolution.
        }

        // For unsupported attribute keys, log a warning and return the unique identifier as a fallback.
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsDynamoDbTableFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for a DynamoDB Table resource.
     *
     * Constructs the ARN using the region, account ID, partition from the context, and the table name
     * derived from the resource. If the ARN is not already cached on the resource object, it is generated
     * and then stored for future calls.
     *
     * The resulting ARN follows this format:
     *  arn:{partition}:dynamodb:{region}:{accountId}:table/{tableName}
     *
     * @param resourceType - The resource type.
     * @param logicalId - The logical identifier of the resource.
     * @param resource - The DynamoDB Table resource object.
     * @param ctx - The resolving context supplying region, account ID, and partition information.
     * @returns The generated ARN as a string.
     */
    arnGenFunc: (resourceType, logicalId, resource, ctx): string => {
        log.trace(`Called arnGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._arn) {
            // Retrieve region, account ID, and partition from the context.
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            // Generate the table name by calling idGenFunc.
            const tableName = awsDynamoDbTableFunc.idGenFunc(resourceType, logicalId, resource, ctx);

            // Construct the ARN for the DynamoDB Table.
            resource._arn = `arn:${partition}:dynamodb:${region}:${accountId}:table/${tableName}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for a DynamoDB Table resource.
     *
     * This function checks if the resource already has an assigned ID. If not, it retrieves the table name
     * from the resource's properties (using the TableName property if available) and uses the logical ID as
     * the default fallback. The resolved value is then cached on the resource object.
     *
     * @param resourceType - The resource type.
     * @param logicalId - The logical ID from the CloudFormation template.
     * @param resource - The DynamoDB Table resource object.
     * @param ctx - The resolving context providing additional helper functions.
     * @returns The unique identifier (table name) for the resource.
     */
    idGenFunc: (resourceType, logicalId, resource, ctx): string => {
        log.trace(`Called idGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._id) {
            log.trace(`For ${logicalId} with type ${resourceType} id is not set, will be generated`);
            // Cast the resource to DynamoDBTableResource to access its TableName property.
            const resTyped = resource as DynamoDBTableResource;
            resource._id = resolveStringWithDefault(
                resTyped.Properties.TableName,
                logicalId,
                `${resourceType}.Properties.TableName`,
                ctx,
            );
        }
        return resource._id;
    },
};
