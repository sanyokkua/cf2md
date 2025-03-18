import log from 'loglevel';
import { ApiGatewayResourceResource, CloudFormationResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveString } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS API Gateway Resource resources.
 *
 * This object defines helper functions used by the CloudFormation parser to resolve intrinsic
 * properties, generate unique identifiers, and construct ARNs for AWS::ApiGateway::Resource resources.
 * These functions handle "Ref" and "Fn::GetAtt" intrinsics by computing appropriate values
 * based on the resource's properties and the current environment (such as region and partition).
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-resource.html#aws-resource-apigateway-resource-return-values
 */
export const awsApiGatewayResourceFunc: ResourceSpecificFunc = {
    /**
     * Resolves the reference for an API Gateway Resource.
     *
     * This function is invoked when a CloudFormation template references the resource using the "Ref" intrinsic.
     * It logs the call and delegates the task of generating a unique resource identifier to the idGenFunc.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical identifier of the resource in the template.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context that provides environment and template details.
     * @returns The generated unique identifier for the resource.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Delegate ID generation to idGenFunc.
        return awsApiGatewayResourceFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Retrieves an attribute value from an API Gateway Resource.
     *
     * This function handles "Fn::GetAtt" intrinsic calls. If the requested attribute key is "ResourceId",
     * it returns the unique resource identifier generated by idGenFunc. For any unsupported attribute key,
     * a warning is logged and the resource ID is returned as a default.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key to retrieve.
     * @param logicalId - The logical identifier of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context containing environmental details.
     * @returns The resource ID (or attribute value) for the resource.
     */
    getAttFunc: (
        resourceType: string,
        key: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called getAttFunc, for ${resourceType}, with logicalId=${logicalId}, and key=${key}`, resource, ctx);

        if (key === 'ResourceId') {
            return awsApiGatewayResourceFunc.idGenFunc(resourceType, logicalId, resource, ctx);
        }

        // Log a warning for unsupported attribute keys and return the resource ID as default.
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsApiGatewayResourceFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an API Gateway Resource.
     *
     * Constructs the ARN using the region, partition, RestApiId, and the generated resource ID.
     * If the ARN is not already stored on the resource object, it is built using the resolved values:
     * - Region and partition from the resolving context.
     * - The RestApiId property from the resource.
     * - The unique resource ID generated by idGenFunc.
     * The ARN is then cached on the resource for future calls.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical identifier for the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context providing environment details like region and partition.
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
            // Cast the generic resource to ApiGatewayResourceResource to access specific properties.
            const resTyped = resource as ApiGatewayResourceResource;
            // Retrieve region and partition from the context.
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            // Resolve the RestApiId from the resource's properties.
            const restApiId = resolveString(resTyped.Properties.RestApiId, `${resourceType}.Properties.RestApiId`, ctx);
            // Generate the unique resource ID.
            const resourceId = awsApiGatewayResourceFunc.idGenFunc(resourceType, logicalId, resource, ctx);

            // Construct the ARN using the appropriate format.
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${restApiId}/resources/${resourceId}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an API Gateway Resource.
     *
     * If the resource does not already have an ID, this function generates a new unique alphanumeric string
     * (16 characters long) using a helper function, caches it on the resource, and returns it. If the ID is
     * already set, it returns the cached value.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical identifier of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context that provides additional helper functions and environment data.
     * @returns The generated unique identifier for the resource.
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
            resource._id = generateAlphaNumeric(16, ctx);
        }
        return resource._id;
    },
};
