import log from 'loglevel';
import { ApiGatewayDeploymentResource, CloudFormationResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveString } from '../../utils/helper-utils';

/**
 * Resource specific functions for AWS API Gateway Deployment resources.
 *
 * This set of functions is used by the CloudFormation parser to resolve intrinsic values
 * (such as Ref and GetAtt), generate Amazon Resource Names (ARNs), and produce unique IDs for
 * AWS::ApiGateway::Deployment resources. These functions utilize properties from the resource
 * template combined with environmental context (e.g., region and partition) to compute the
 * necessary values.
 *
 * Functions included:
 * - refFunc: Returns a reference for the resource by generating its unique ID.
 * - getAttFunc: Resolves an attribute (primarily "DeploymentId") for the resource.
 * - arnGenFunc: Generates the ARN for the resource based on its properties and context.
 * - idGenFunc: Generates and caches a unique identifier for the resource.
 */
export const awsApiGatewayDeploymentFunc: ResourceSpecificFunc = {
    /**
     * Resolves the reference for an API Gateway Deployment resource.
     *
     * When the CloudFormation template uses "Ref" on a deployment resource, this function
     * is called to generate and return the unique resource ID. It delegates the actual
     * ID generation to the idGenFunc.
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
        // Generate and return the resource ID via idGenFunc.
        return awsApiGatewayDeploymentFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Retrieves an attribute value from an API Gateway Deployment resource.
     *
     * This function is used to resolve the "GetAtt" intrinsic. If the requested attribute key is
     * "DeploymentId", it returns the resource's generated ID. For any unsupported key, it logs a warning
     * and defaults to returning the generated resource ID.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context containing template and environment information.
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
        // Support only the "DeploymentId" attribute; for other keys, log a warning.
        if (key === 'DeploymentId') {
            return awsApiGatewayDeploymentFunc.idGenFunc(resourceType, logicalId, resource, ctx);
        }
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsApiGatewayDeploymentFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an API Gateway Deployment resource.
     *
     * This function constructs the ARN using properties from the resource and information from
     * the resolving context, such as the region and AWS partition. If the ARN is not already cached
     * on the resource object, it is generated and stored for future use.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context containing template and environment details.
     * @returns The generated ARN string.
     */
    arnGenFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): string => {
        log.trace(`Called arnGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // If the ARN is not already generated and cached, compute it.
        if (!resource._arn) {
            // Cast the generic resource to ApiGatewayDeploymentResource to access specific properties.
            const resTyped = resource as ApiGatewayDeploymentResource;
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            // Resolve the RestApiId from the resource's properties.
            const restApiId = resolveString(resTyped.Properties.RestApiId, 'resTyped.Properties.RestApiId', ctx);
            // Generate the unique deployment ID.
            const deploymentId = awsApiGatewayDeploymentFunc.idGenFunc(resourceType, logicalId, resource, ctx);

            // Construct the ARN per the standard format for API Gateway deployments.
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${restApiId}/deployments/${deploymentId}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an API Gateway Deployment resource.
     *
     * This function checks whether the resource already has an assigned ID (_id property). If not,
     * it generates a new alphanumeric string (12 characters long) using a helper function and caches
     * it on the resource. The generated ID uniquely identifies the resource.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context providing helper functions and environment details.
     * @returns The generated or cached unique identifier for the resource.
     */
    idGenFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): string => {
        log.trace(`Called idGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // If no ID is set yet, generate a new one using generateAlphaNumeric.
        if (!resource._id) {
            log.trace(`For ${logicalId} with type ${resourceType} id is not set, will be generated`);
            resource._id = generateAlphaNumeric(12, ctx);
        }
        return resource._id;
    },
};
