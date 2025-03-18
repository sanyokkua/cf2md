import log from 'loglevel';
import { ApiGatewayMethodResource, CloudFormationResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { resolveString } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS API Gateway Method resources.
 *
 * This object defines functions used by the CloudFormation parser to resolve intrinsic values, generate
 * ARNs, and assign identifiers for AWS::ApiGateway::Method resources. The functions included are:
 *
 * - refFunc: Returns a reference for the resource by generating its unique ID.
 * - getAttFunc: Retrieves an attribute value for the resource—here, unsupported attribute keys default to the resource ID.
 * - arnGenFunc: Generates the Amazon Resource Name (ARN) for the resource using its properties.
 * - idGenFunc: Generates (or returns a cached) unique identifier for the resource.
 */
export const awsApiGatewayMethodFunc: ResourceSpecificFunc = {
    /**
     * Resolves the reference for an API Gateway Method resource.
     *
     * When the CloudFormation template uses the "Ref" intrinsic on an API Gateway Method, this function is invoked
     * to return the unique resource ID. It delegates the identifier generation to the idGenFunc.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context containing template and environment data.
     * @returns The generated resource ID.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Delegate ID generation.
        return awsApiGatewayMethodFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Retrieves an attribute value from an API Gateway Method resource.
     *
     * This function handles "Fn::GetAtt" for the resource. Unsupported attribute keys are logged as warnings,
     * and the resource ID is returned as a default.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context with template and environment details.
     * @returns The resolved attribute value, typically the resource ID.
     */
    getAttFunc: (
        resourceType: string,
        key: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called getAttFunc, for ${resourceType}, with logicalId=${logicalId}, and key=${key}`, resource, ctx);
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsApiGatewayMethodFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an API Gateway Method resource.
     *
     * The ARN is built using the region, partition, RestApiId, ResourceId, and HttpMethod properties. If the
     * ARN is not yet generated, it is constructed dynamically and cached on the resource object.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context that provides methods to obtain the region and partition.
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
            // Cast the resource object to access API Gateway Method specific properties.
            const resTyped = resource as ApiGatewayMethodResource;
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            // Resolve the RestApiId from the resource's properties.
            const restApiId = resolveString(resTyped.Properties.RestApiId, `${resourceType}.Properties.RestApiId`, ctx);
            // Resolve the ResourceId and HttpMethod from the resource's properties.
            const resourceId = resolveString(
                resTyped.Properties.ResourceId,
                `${resourceType}.Properties.ResourceId`,
                ctx,
            );
            const httpMethod = resolveString(
                resTyped.Properties.HttpMethod,
                `${resourceType}.Properties.HttpMethod`,
                ctx,
            );

            // Construct the ARN using the standard API Gateway ARN format.
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${restApiId}/resources/${resourceId}/methods/${httpMethod}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an API Gateway Method resource.
     *
     * If the resource doesn't already have an assigned ID, this function sets its logical ID as the unique identifier
     * and caches it on the resource object.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context, which provides additional information if needed.
     * @returns The resource ID as a string.
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
            resource._id = logicalId;
        }
        return resource._id;
    },
};
