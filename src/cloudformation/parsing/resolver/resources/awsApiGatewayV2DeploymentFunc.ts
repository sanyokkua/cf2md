import log from 'loglevel';
import { ApiGatewayV2DeploymentResource, CloudFormationResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveString } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS API Gateway V2 Deployment resources.
 *
 * This object provides helper functions for resolving intrinsic properties, generating unique identifiers,
 * and constructing ARNs for AWS::ApiGatewayV2::Deployment resources in CloudFormation templates. It supports
 * the "Ref" intrinsic (via refFunc), the "Fn::GetAtt" intrinsic (via getAttFunc), and methods to generate the ARN
 * and unique ID for the resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-deployment.html#aws-resource-apigatewayv2-deployment-return-values
 */
export const awsApiGatewayV2DeploymentFunc: ResourceSpecificFunc = {
    /**
     * Resolves the reference for an API Gateway V2 Deployment resource.
     *
     * This function is called when a CloudFormation template references the deployment resource using the "Ref" intrinsic.
     * It logs the call and delegates the generation of the unique identifier to idGenFunc.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical identifier of the resource as defined in the CloudFormation template.
     * @param resource - The CloudFormation resource object representing the deployment.
     * @param ctx - The resolving context containing environment-specific methods and template data.
     * @returns The generated unique identifier for the resource.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Delegate ID generation to the idGenFunc.
        return awsApiGatewayV2DeploymentFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Retrieves an attribute value from an API Gateway V2 Deployment resource.
     *
     * This function is used to handle "Fn::GetAtt" intrinsic calls. If the requested attribute key is "DeploymentId",
     * it returns the unique identifier of the deployment by delegating to idGenFunc. For any unsupported attribute key,
     * it logs a warning and returns the generated resource ID as a fallback.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested by the template.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context providing necessary details for resolution.
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

        // If the attribute key is 'DeploymentId', return the unique deployment identifier.
        if (key === 'DeploymentId') {
            return awsApiGatewayV2DeploymentFunc.idGenFunc(resourceType, logicalId, resource, ctx);
        }

        // For any unsupported key, log a warning and use the resource ID as a fallback.
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsApiGatewayV2DeploymentFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an API Gateway V2 Deployment resource.
     *
     * This function constructs the ARN using the partition and region provided by the resolving context,
     * along with the API ID resolved from the resource's properties and the deployment's unique identifier.
     * If an ARN has not already been generated and cached on the resource, it is created and stored.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context containing environment data like region and partition.
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
            // Cast the generic resource to ApiGatewayV2DeploymentResource to access specific properties.
            const resTyped = resource as ApiGatewayV2DeploymentResource;
            // Get the region and partition from the context.
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            // Resolve the API ID using a helper function.
            const apiId = resolveString(resTyped.Properties.ApiId, `${resourceType}.Properties.ApiId`, ctx);
            // Generate the deployment's unique identifier.
            const deploymentId = awsApiGatewayV2DeploymentFunc.idGenFunc(resourceType, logicalId, resource, ctx);

            // Construct the ARN using the appropriate format for API Gateway V2 deployments.
            resource._arn = `arn:${partition}:apigateway:${region}::/apis/${apiId}/deployments/${deploymentId}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an API Gateway V2 Deployment resource.
     *
     * If the resource does not already have a unique identifier (_id), this function generates a new alphanumeric
     * string (6 characters long) using a helper function, caches it on the resource, and returns it.
     * Otherwise, it returns the cached identifier.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource defined in the CloudFormation template.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context that provides additional helper functions.
     * @returns The generated resource identifier as a string.
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
            // Generate a new unique identifier (6 alphanumeric characters) and cache it on the resource.
            resource._id = generateAlphaNumeric(6, ctx);
        }
        return resource._id;
    },
};
