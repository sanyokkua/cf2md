import log from 'loglevel';
import { ApiGatewayRequestValidatorResource, CloudFormationResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveString } from '../../utils/helper-utils';

/**
 * Resource specific functions for AWS API Gateway Request Validator resources.
 *
 * This object defines functions used by the CloudFormation parser to resolve intrinsic references,
 * generate ARNs, and produce unique identifiers for AWS::ApiGateway::RequestValidator resources.
 * These functions are responsible for handling “Ref” and “Fn::GetAtt” intrinsics and for constructing
 * the resource ARN based on CloudFormation properties and contextual information such as region and partition.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-restapi.html#aws-resource-apigateway-restapi-return-values
 */
export const awsApiGatewayRequestValidatorFunc: ResourceSpecificFunc = {
    /**
     * Resolves the reference for an API Gateway Request Validator resource.
     *
     * When a CloudFormation template uses the "Ref" intrinsic on a request validator resource,
     * this function is invoked to return the resource's unique identifier. It logs the call and
     * delegates the actual ID generation to the idGenFunc.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical identifier of the resource in the template.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context that contains environment and template data.
     * @returns The generated resource ID.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Delegate ID generation to idGenFunc.
        return awsApiGatewayRequestValidatorFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Retrieves an attribute value from an API Gateway Request Validator resource.
     *
     * This function is used to handle "Fn::GetAtt" intrinsic calls. If the requested attribute key is
     * "RequestValidatorId", it returns the resource ID by invoking idGenFunc. For any unsupported key,
     * a warning is logged and the resource ID is returned by default.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key being requested.
     * @param logicalId - The logical identifier of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context with environmental and template details.
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

        if (key === 'RequestValidatorId') {
            return awsApiGatewayRequestValidatorFunc.idGenFunc(resourceType, logicalId, resource, ctx);
        }

        // Unsupported attribute key; log a warning and return the resource ID as a default.
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsApiGatewayRequestValidatorFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an API Gateway Request Validator resource.
     *
     * Constructs the ARN using the resource's RestApiId and contextual information such as the region
     * and partition. If the ARN is not already generated and cached on the resource object, it is computed
     * and stored. The ARN format follows:
     *
     * arn:{partition}:apigateway:{region}::/restapis/{RestApiId}/requestvalidators/{validatorId}
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical identifier of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context providing region, partition, and template details.
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
            // Cast the generic resource to access properties specific to ApiGatewayRequestValidatorResource.
            const resTyped = resource as ApiGatewayRequestValidatorResource;
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            // Resolve the RestApiId property from the resource.
            const restApiId = resolveString(resTyped.Properties.RestApiId, `${resourceType}.Properties.RestApiId`, ctx);
            // Generate the resource ID for the request validator.
            const validatorId = awsApiGatewayRequestValidatorFunc.idGenFunc(resourceType, logicalId, resource, ctx);

            // Construct and cache the ARN.
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${restApiId}/requestvalidators/${validatorId}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an API Gateway Request Validator resource.
     *
     * Checks if the resource already has an assigned ID (_id). If not, it generates
     * a new alphanumeric ID of 10 characters using a helper function and caches it on the resource.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical identifier of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context offering additional helper methods and environmental data.
     * @returns The generated resource ID.
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
            resource._id = generateAlphaNumeric(10, ctx);
        }
        return resource._id;
    },
};
