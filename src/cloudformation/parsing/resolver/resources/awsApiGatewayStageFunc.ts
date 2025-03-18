import log from 'loglevel';
import { ApiGatewayStageResource, CloudFormationResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveString, resolveStringWithDefault } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS API Gateway Stage resources.
 *
 * This object provides methods to resolve intrinsic properties, generate ARNs, and produce unique
 * identifiers for API Gateway Stage resources in AWS CloudFormation templates. These functions are used
 * by the CloudFormation parser to correctly interpret intrinsic references (such as "Ref" and "Fn::GetAtt")
 * and generate corresponding values.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-stage.html#aws-resource-apigateway-stage-return-values
 */
export const awsApiGatewayStageFunc: ResourceSpecificFunc = {
    /**
     * Resolves the reference for an API Gateway Stage resource.
     *
     * When a CloudFormation template uses the "Ref" intrinsic on an API Gateway Stage resource,
     * this function generates a unique resource identifier by delegating to the idGenFunc.
     *
     * @param resourceType - The resource type as defined in the template.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context providing environment and template data.
     * @returns The generated resource ID.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Delegate ID generation to idGenFunc to obtain the unique identifier.
        return awsApiGatewayStageFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Retrieves an attribute from an API Gateway Stage resource.
     *
     * This function handles the "Fn::GetAtt" intrinsic for API Gateway Stage resources.
     * Currently, it supports the attribute "RestApiId" by returning the generated resource ID.
     * For the attribute "RootResourceId", it returns a placeholder value.
     * For any unsupported attribute keys, a warning is logged and the resource ID is returned.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context containing relevant resolution information.
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

        // If the specific attribute "RestApiId" is requested, return the generated ID.
        if (key === 'RestApiId') {
            return awsApiGatewayStageFunc.idGenFunc(resourceType, logicalId, resource, ctx);
        }
        // For "RootResourceId", return a placeholder value.
        if (key === 'RootResourceId') {
            // TODO: Implement proper resolution for RootResourceId.
            return 'RUNTIME_RootResourceId';
        }

        // For other keys, log a warning and default to returning the resource ID.
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsApiGatewayStageFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an API Gateway Stage resource.
     *
     * The ARN is constructed from the partition and region (provided by the context),
     * the RestApiId (resolved from resource properties), and the stage name.
     * If the ARN is not already computed, it is generated, cached on the resource, and returned.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context that provides region, partition, and template details.
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
            // Cast the resource to ApiGatewayStageResource to access stage-specific properties.
            const resTyped = resource as ApiGatewayStageResource;
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            // Resolve the RestApiId from the resource properties.
            const restApiId = resolveString(resTyped.Properties.RestApiId, `${resourceType}.Properties.RestApiId`, ctx);
            // Resolve the stage name; use logicalId as fallback via resolveStringWithDefault.
            const stageName = resolveStringWithDefault(
                resTyped.Properties.StageName,
                `${resourceType}.Properties.StageName`,
                logicalId,
                ctx,
            );

            // Construct the ARN using the API Gateway stage ARN format.
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${restApiId}/stages/${stageName}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an API Gateway Stage resource.
     *
     * If the resource does not already have an ID, this function retrieves the stage name from
     * the resource properties and uses it to resolve a unique identifier. If the stage name is not set,
     * a default value is generated using an alphanumeric string. The generated ID is cached on the resource
     * for future use.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context offering helper methods and environmental data.
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
            // Cast the resource to ApiGatewayStageResource to access the StageName property.
            const resTyped = resource as ApiGatewayStageResource;
            const stageName = resTyped.Properties.StageName;
            // Generate a default value for the stage ID if not provided.
            const defaultValue = `stage-${generateAlphaNumeric(4, ctx)}`; // Not optimal, fix later
            // Resolve the stage name or default to the generated value.
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
