import log from 'loglevel';
import { ApiGatewayV2AuthorizerResource, CloudFormationResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveString } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS API Gateway V2 Authorizer resources.
 *
 * This object provides methods to resolve intrinsic properties, generate unique identifiers,
 * and construct ARNs for API Gateway V2 Authorizer resources in AWS CloudFormation templates.
 * It is used by the CloudFormation parser to resolve the "Ref" and "Fn::GetAtt" intrinsics for
 * authorizer resources.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-authorizer.html#aws-resource-apigatewayv2-authorizer-return-values
 */
export const awsApiGatewayV2AuthorizerFunc: ResourceSpecificFunc = {
    /**
     * Resolves the reference for an API Gateway V2 Authorizer resource.
     *
     * When a CloudFormation template uses the "Ref" intrinsic on an API Gateway V2 Authorizer,
     * this function is invoked. It logs the call and generates the resource ID by delegating
     * to the idGenFunc.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical identifier of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context that provides environment and template details.
     * @returns The generated resource ID.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Delegate reference resolution to idGenFunc to generate a unique identifier.
        return awsApiGatewayV2AuthorizerFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Retrieves an attribute value from an API Gateway V2 Authorizer resource.
     *
     * This function handles the "Fn::GetAtt" intrinsic. If the requested key is "AuthorizerId",
     * the function returns the unique resource ID using the idGenFunc. For any unsupported key,
     * a warning is logged and the resource ID is returned by default.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested.
     * @param logicalId - The logical identifier of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context containing necessary contextual information.
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

        if (key === 'AuthorizerId') {
            // For the "AuthorizerId" attribute, return the generated resource ID.
            return awsApiGatewayV2AuthorizerFunc.idGenFunc(resourceType, logicalId, resource, ctx);
        }

        // For unsupported attribute keys, log a warning and return the resource ID as a fallback.
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsApiGatewayV2AuthorizerFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an API Gateway V2 Authorizer resource.
     *
     * The ARN is constructed using the partition and region from the resolving context, combined with
     * the API ID and the generated authorizer ID. If the ARN is not already cached on the resource, it
     * is generated and stored for future retrieval.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical identifier of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context that provides region, partition, and other template details.
     * @returns The generated ARN string.
     */
    arnGenFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): string => {
        log.trace(`Called arnGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._arn) {
            // Cast resource as ApiGatewayV2AuthorizerResource to access authorizer-specific properties.
            const resTyped = resource as ApiGatewayV2AuthorizerResource;
            // Get region and partition from the context.
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            // Resolve the API ID from the resource properties.
            const apiId = resolveString(resTyped.Properties.ApiId, `${resourceType}.Properties.ApiId`, ctx);
            // Generate the authorizer ID using idGenFunc.
            const authorizerId = awsApiGatewayV2AuthorizerFunc.idGenFunc(resourceType, logicalId, resource, ctx);

            // Construct the ARN using the standard API Gateway V2 authorizer ARN format.
            resource._arn = `arn:${partition}:apigateway:${region}::/apis/${apiId}/authorizers/${authorizerId}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an API Gateway V2 Authorizer resource.
     *
     * If the resource does not already have an assigned ID, this function generates a new unique alphanumeric
     * string (9 characters long) using a helper function and caches it on the resource object.
     * If an ID is already set, it returns the cached value.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical identifier of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context that offers helper functions and environment details.
     * @returns The unique resource identifier as a string.
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
            // Generate and cache a new unique identifier.
            resource._id = generateAlphaNumeric(9, ctx);
        }
        return resource._id;
    },
};
