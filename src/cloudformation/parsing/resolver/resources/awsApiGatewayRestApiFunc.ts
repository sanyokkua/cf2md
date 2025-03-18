import log from 'loglevel';
import { CloudFormationResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS API Gateway RestApi resources.
 *
 * These functions are used by the CloudFormation parser to resolve intrinsics related to the
 * AWS::ApiGateway::RestApi resource. They provide implementations for:
 * - refFunc: Resolving the resource reference ("Ref" intrinsic) by generating an ID.
 * - getAttFunc: Handling the "Fn::GetAtt" intrinsic, supporting attributes such as "RestApiId" and "RootResourceId".
 * - arnGenFunc: Generating the Amazon Resource Name (ARN) for the resource.
 * - idGenFunc: Generating (and caching) a unique identifier for the resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-restapi.html#aws-resource-apigateway-restapi-return-values
 */
export const awsApiGatewayRestApiFunc: ResourceSpecificFunc = {
    /**
     * Resolves the reference for an API Gateway RestApi resource.
     *
     * When a CloudFormation template uses the "Ref" intrinsic on an API Gateway RestApi resource,
     * this function is invoked. It logs the call and returns the generated resource ID.
     * The unique identifier is generated via the idGenFunc.
     *
     * @param resourceType - A string representing the resource type.
     * @param logicalId - A string representing the logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The context containing environment and template resolution methods.
     * @returns The generated resource identifier.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Delegate the reference resolution to idGenFunc.
        return awsApiGatewayRestApiFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Retrieves an attribute value for an API Gateway RestApi resource.
     *
     * Handles "Fn::GetAtt" intrinsic calls. If the attribute key is "RestApiId", it returns the resource ID.
     * If the key is "RootResourceId", it returns a placeholder string ("RUNTIME_RootResourceId") as a TODO.
     * For any other keys, it logs a warning and falls back to the resource ID.
     *
     * @param resourceType - The resource type as a string.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The context used for resolving values.
     * @returns The attribute value for the resource.
     */
    getAttFunc: (
        resourceType: string,
        key: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called getAttFunc, for ${resourceType}, with logicalId=${logicalId}, and key=${key}`, resource, ctx);

        // If the key is "RestApiId", return the generated resource ID.
        if (key === 'RestApiId') {
            return awsApiGatewayRestApiFunc.idGenFunc(resourceType, logicalId, resource, ctx);
        }
        // For the "RootResourceId", return a temporary value.
        if (key === 'RootResourceId') {
            // TODO: Implement proper resolution for RootResourceId.
            return 'RUNTIME_RootResourceId';
        }

        // For any unsupported key, log a warning and return the resource ID.
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsApiGatewayRestApiFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an API Gateway RestApi resource.
     *
     * Constructs the ARN using the partition and region from the context and the generated RestApiId.
     * If the ARN is not already cached on the resource object, it is built and then stored.
     *
     * @param resourceType - The resource type as a string.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The context providing region and partition details.
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
            // Retrieve region and partition from the resolving context.
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            // Generate the RestApiId by using idGenFunc.
            const restApiId = awsApiGatewayRestApiFunc.idGenFunc(resourceType, logicalId, resource, ctx);

            // Construct the ARN with the standard API Gateway RestApi format.
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${restApiId}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an API Gateway RestApi resource.
     *
     * If the resource does not have an ID already assigned, this function generates a new alphanumeric ID
     * (10 characters long) using a helper function and caches it on the resource object. If an ID exists,
     * it is returned directly.
     *
     * @param resourceType - The type of the resource as a string.
     * @param logicalId - The logical identifier of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context providing additional helper methods.
     * @returns The unique resource identifier.
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
            resource._id = generateAlphaNumeric(10, ctx);
        }
        return resource._id;
    },
};
