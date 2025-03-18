import log from 'loglevel';
import { ApiGatewayV2StageResource, CloudFormationResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveString, resolveStringWithDefault } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS API Gateway V2 Stage resources.
 *
 * This object provides methods to resolve intrinsic references, generate unique identifiers,
 * and build Amazon Resource Names (ARNs) for AWS::ApiGatewayV2::Stage resources in a CloudFormation template.
 * These functions support intrinsic operations such as "Ref" and "Fn::GetAtt", allowing the parser
 * to dynamically compute values based on the resource's properties and environment context (e.g., region and partition).
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-stage.html#aws-resource-apigatewayv2-stage-return-values
 */
export const awsApiGatewayV2StageFunc: ResourceSpecificFunc = {
    /**
     * Resolves the reference for an API Gateway V2 Stage resource.
     *
     * This function is invoked when the "Ref" intrinsic is used on an API Gateway V2 Stage resource.
     * It logs the invocation and defers to the idGenFunc to generate and return the unique resource identifier.
     *
     * @param resourceType - A string representing the resource type.
     * @param logicalId - A string representing the logical ID of the resource in the CloudFormation template.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context which provides environment and helper methods.
     * @returns The generated unique identifier for the resource.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Delegate reference resolution to idGenFunc for unique identifier generation.
        return awsApiGatewayV2StageFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Resolves an attribute value for an API Gateway V2 Stage resource.
     *
     * This function handles "Fn::GetAtt" intrinsics. If the requested attribute key is "Id", it returns
     * the unique identifier by calling idGenFunc. For any other attribute key, it logs a warning and
     * returns the generated identifier as a fallback.
     *
     * @param resourceType - A string representing the resource type.
     * @param key - The attribute key requested.
     * @param logicalId - A string representing the logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context containing necessary environmental data.
     * @returns The resolved attribute value, typically the unique resource identifier.
     */
    getAttFunc: (
        resourceType: string,
        key: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called getAttFunc, for ${resourceType}, with logicalId=${logicalId}, and key=${key}`, resource, ctx);

        if (key === 'Id') {
            return awsApiGatewayV2StageFunc.idGenFunc(resourceType, logicalId, resource, ctx);
        }

        // Log a warning for unsupported attribute keys and return the resource ID as fallback.
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsApiGatewayV2StageFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an API Gateway V2 Stage resource.
     *
     * Constructs the ARN using the partition and region derived from the resolving context,
     * along with the API ID (resolved from the resource's properties) and the unique stage name.
     * If the ARN is not already set, it is generated and cached on the resource object.
     *
     * @param resourceType - A string representing the resource type.
     * @param logicalId - A string representing the logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context offering methods to retrieve region and partition details.
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
            // Cast to ApiGatewayV2StageResource to access stage-specific properties.
            const resTyped = resource as ApiGatewayV2StageResource;
            // Retrieve region and partition details from the context.
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            // Resolve the API ID from resource properties.
            const apiId = resolveString(resTyped.Properties.ApiId, `${resourceType}.Properties.ApiId`, ctx);
            // Generate the stage name using idGenFunc.
            const stageName = awsApiGatewayV2StageFunc.idGenFunc(resourceType, logicalId, resource, ctx);

            // Build the ARN according to the API Gateway V2 stage ARN format.
            resource._arn = `arn:${partition}:apigateway:${region}::/apis/${apiId}/stages/${stageName}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an API Gateway V2 Stage resource.
     *
     * This function checks if the resource already has an ID assigned. If not, it resolves the StageName
     * property and, if necessary, generates a default value using a helper function. The identifier is
     * then cached on the resource object and returned.
     *
     * @param resourceType - A string representing the resource type.
     * @param logicalId - A string representing the logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context that provides helper functions and environment data.
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
            // Cast to ApiGatewayV2StageResource to access the StageName property.
            const resTyped = resource as ApiGatewayV2StageResource;
            const stageName = resTyped.Properties.StageName;
            // Generate a default stage name with a random alphanumeric string if StageName is not provided.
            const defaultValue = `stage-${generateAlphaNumeric(4, ctx)}`;
            resource._id = resolveStringWithDefault(
                stageName,
                defaultValue,
                `${resourceType}.Properties.StageName`,
                ctx,
            );
        }
        return resource._id;
    },
};
