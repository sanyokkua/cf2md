import log from 'loglevel';
import { ApiGatewayAuthorizerResource, CloudFormationResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveString } from '../../utils/helper-utils';

/**
 * Resource specific functions for AWS API Gateway Authorizer resources.
 *
 * This object defines functions to resolve CloudFormation intrinsic references, attributes,
 * Amazon Resource Names (ARNs), and resource IDs for API Gateway Authorizer resources.
 * These functions are used by the AWS CloudFormation parser to dynamically process and
 * generate values for the API Gateway Authorizer resource defined in a CloudFormation template.
 *
 * Functions included:
 * - refFunc: Resolves the reference for the resource by generating its ID.
 * - getAttFunc: Returns a specific attribute value given a key (supports "AuthorizerId").
 * - arnGenFunc: Generates the ARN for the resource based on its properties.
 * - idGenFunc: Generates a unique identifier for the resource.
 */
export const awsApiGatewayAuthorizerFunc: ResourceSpecificFunc = {
    /**
     * Resolves the reference for the API Gateway Authorizer resource.
     *
     * This function is called when a "Ref" intrinsic is used on the API Gateway Authorizer resource.
     * It logs the call and returns the resource ID by invoking the idGenFunc.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context containing template and environmental information.
     * @returns The generated resource ID.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Generate and return the resource ID.
        return awsApiGatewayAuthorizerFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Retrieves an attribute value from the API Gateway Authorizer resource.
     *
     * This function handles the "Fn::GetAtt" intrinsic for the resource. If the key is "AuthorizerId",
     * it returns the resource ID by calling idGenFunc. For any unsupported attribute key,
     * it logs a warning and defaults to returning the resource ID.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context containing template and environmental information.
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
        // If the key is "AuthorizerId", return the generated resource ID.
        if (key === 'AuthorizerId') {
            return awsApiGatewayAuthorizerFunc.idGenFunc(resourceType, logicalId, resource, ctx);
        }
        // For any unsupported key, log a warning and return the resource ID as a default value.
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsApiGatewayAuthorizerFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for the API Gateway Authorizer resource.
     *
     * This function constructs the ARN based on the resource properties. If the ARN is not already generated,
     * it computes the ARN using the partition, region, RestApiId, and resource ID.
     * The ARN is then cached on the resource object for future calls.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object (expected to be an ApiGatewayAuthorizerResource).
     * @param ctx - The resolving context containing template and environmental information.
     * @returns The generated ARN string for the resource.
     */
    arnGenFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): string => {
        log.trace(`Called arnGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // If the ARN is not already generated, compute and cache it.
        if (!resource._arn) {
            const resTyped = resource as ApiGatewayAuthorizerResource;
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            // Resolve the RestApiId property from the resource.
            const restApiId = resolveString(resTyped.Properties.RestApiId, 'resTyped.Properties.RestApiId', ctx);
            // Generate the Authorizer ID.
            const authorizerId = awsApiGatewayAuthorizerFunc.idGenFunc(resourceType, logicalId, resource, ctx);

            // Construct the ARN using the standard format.
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${restApiId}/authorizers/${authorizerId}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for the API Gateway Authorizer resource.
     *
     * This function returns a cached resource ID if available. Otherwise, it generates a new alphanumeric
     * string of 10 characters, caches it on the resource object, and returns it.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context providing auxiliary functions and information.
     * @returns The generated or cached resource ID as a string.
     */
    idGenFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): string => {
        log.trace(`Called idGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // If the resource ID is not set, generate a new one.
        if (!resource._id) {
            log.trace(`For ${logicalId} with type ${resourceType} id is not set, will be generated`);
            resource._id = generateAlphaNumeric(10, ctx);
        }
        return resource._id;
    },
};
