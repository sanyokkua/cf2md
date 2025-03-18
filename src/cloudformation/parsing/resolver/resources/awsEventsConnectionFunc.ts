import log from 'loglevel';
import { CloudFormationResource, EventsConnectionResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveStringWithDefault } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS Events Connection resources.
 *
 * This object provides helper functions to resolve intrinsic references (e.g., "Ref" and "Fn::GetAtt"),
 * generate unique identifiers, and construct Amazon Resource Names (ARNs) for AWS::Events::Connection
 * resources in CloudFormation templates. These functions help the CloudFormation parser dynamically compute
 * resource values based on resource properties and environment context (such as region, account, and partition).
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-events-connection.html#aws-resource-events-connection-return-values
 */
export const awsEventsConnectionFunc: ResourceSpecificFunc = {
    /**
     * Resolves the "Ref" intrinsic for an AWS Events Connection resource.
     *
     * When a CloudFormation template references an Events Connection resource using "Ref",
     * this function is called. It logs the call and returns the unique identifier by delegating
     * to the idGenFunc.
     *
     * @param resourceType - The type of the resource (e.g., "AWS::Events::Connection").
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The Events Connection resource object.
     * @param ctx - The resolving context providing environment details and helper methods.
     * @returns The unique identifier for the Events Connection resource.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Delegate reference resolution to the idGenFunc.
        return awsEventsConnectionFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Resolves an attribute ("Fn::GetAtt") for an AWS Events Connection resource.
     *
     * This function handles attribute resolution. If the attribute key is:
     * - "Arn": it returns the generated ARN by calling arnGenFunc.
     * - "AuthParameters.ConnectivityParameters.ResourceParameters.ResourceAssociationArn":
     *   retrieves and resolves the corresponding property from the resource.
     * - "InvocationConnectivityParameters.ResourceParameters.ResourceAssociationArn":
     *   retrieves and resolves the corresponding property from the resource.
     * - "SecretArn": it retrieves and resolves the SecretArn property.
     * For any unsupported attribute keys, it logs a warning and returns the unique identifier.
     *
     * @param resourceType - The resource type.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The Events Connection resource object.
     * @param ctx - The resolving context providing environment and template data.
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

        if (key === 'Arn') {
            // Return the ARN for the resource.
            return awsEventsConnectionFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }

        if (key === 'AuthParameters.ConnectivityParameters.ResourceParameters.ResourceAssociationArn') {
            // Cast the resource to EventsConnectionResource to access nested properties.
            const resTyped = resource as EventsConnectionResource;
            return resolveStringWithDefault(
                resTyped.Properties.AuthParameters?.ConnectivityParameters?.ResourceParameters.ResourceAssociationArn,
                'ResourceAssociationArn',
                `${resourceType}.Properties.AuthParameters?.ConnectivityParameters?.ResourceParameters.ResourceAssociationArn`,
                ctx,
            );
        }

        if (key === 'InvocationConnectivityParameters.ResourceParameters.ResourceAssociationArn') {
            const resTyped = resource as EventsConnectionResource;
            return resolveStringWithDefault(
                resTyped.Properties.InvocationConnectivityParameters?.ResourceParameters.ResourceAssociationArn,
                'ResourceAssociationArn',
                `${resourceType}.Properties.InvocationConnectivityParameters?.ResourceParameters.ResourceAssociationArn`,
                ctx,
            );
        }

        if (key === 'SecretArn') {
            const resTyped = resource as EventsConnectionResource;
            return resolveStringWithDefault(
                resTyped.Properties.SecretArn,
                'SecretsArn',
                `${resourceType}.Properties.SecretArn`,
                ctx,
            );
        }

        // For unsupported keys, warn and fall back to returning the unique identifier.
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsEventsConnectionFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an AWS Events Connection resource.
     *
     * The ARN is constructed using the region, account ID, and partition from the resolving context,
     * combined with the unique identifier (name) for the resource obtained from idGenFunc.
     * The ARN follows the format:
     *   arn:{partition}:events:{region}:{accountId}:connection/{name}
     * The ARN is cached on the resource object to optimize subsequent resolutions.
     *
     * @param resourceType - The resource type.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The Events Connection resource object.
     * @param ctx - The resolving context supplying environment details.
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
            // Retrieve region, account ID, and partition from the resolving context.
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            // Use idGenFunc to generate the unique name for the resource.
            const name = awsEventsConnectionFunc.idGenFunc(resourceType, logicalId, resource, ctx);

            // Construct and cache the ARN.
            resource._arn = `arn:${partition}:events:${region}:${accountId}:connection/${name}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an AWS Events Connection resource.
     *
     * This function determines the unique identifier by resolving the resource's "Name" property.
     * If the "Name" property is not specified, it falls back to a default value generated using a random
     * alphanumeric string prefixed with "connection-". The identifier is cached on the resource for future use.
     *
     * @param resourceType - The resource type.
     * @param logicalId - The logical ID of the resource provided in the CloudFormation template.
     * @param resource - The Events Connection resource object.
     * @param ctx - The resolving context providing helper functions.
     * @returns The resolved or generated unique identifier as a string.
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
            // Cast the resource to EventsConnectionResource to access its "Name" property.
            const resTyped = resource as EventsConnectionResource;
            // Generate a default name if not provided.
            const nameDefault = `connection-${generateAlphaNumeric(6, ctx)}`;
            // Resolve the "Name" property using a default value if necessary.
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
