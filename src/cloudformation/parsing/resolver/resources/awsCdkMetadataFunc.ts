import log from 'loglevel';
import { ResourceSpecificFunc } from '../../types/types';

/**
 * Resource-specific functions for AWS CDK Metadata resources.
 *
 * This module provides functions to resolve intrinsic references (e.g., "Ref" and "Fn::GetAtt"),
 * generate ARNs, and produce unique identifiers for AWS CDK metadata as defined in CloudFormation
 * templates. These functions ensure that the CDK metadata resource is processed correctly during
 * the CloudFormation parsing process.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-restapi.html#aws-resource-apigateway-restapi-return-values
 */
export const awsCdkMetadataFunc: ResourceSpecificFunc = {
    /**
     * Resolves the "Ref" intrinsic for an AWS CDK Metadata resource.
     *
     * When a template uses the "Ref" intrinsic on a CDK metadata resource, this function
     * is invoked. It simply logs the invocation and returns the unique resource ID by "
     * delegating to the idGenFunc.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context providing environment-specific helper methods.
     * @returns The generated resource identifier.
     */
    refFunc: (resourceType, logicalId, resource, ctx): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        return awsCdkMetadataFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Resolves the "Fn::GetAtt" intrinsic for an AWS CDK Metadata resource.
     *
     * This function handles "Fn::GetAtt" intrinsics. Since CDK metadata only supports the unique
     * resource identifier, any attribute request returns the ID. A warning is logged if an
     * unsupported attribute key is requested.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource.
     * @param ctx - The resolving context providing template data.
     * @returns The resource identifier.
     */
    getAttFunc: (resourceType, key, logicalId, resource, ctx): unknown => {
        log.trace(`Called getAttFunc, for ${resourceType}, with logicalId=${logicalId}, and key=${key}`, resource, ctx);
        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsCdkMetadataFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an AWS CDK Metadata resource.
     *
     * Constructs the ARN using the partition and account ID from the resolving context
     * and the logical ID of the resource. If the ARN is not already computed, it is generated,
     * cached on the resource object, and then returned.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource from the template.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context providing partition and account info.
     * @returns The generated ARN as a string.
     */
    arnGenFunc: (resourceType, logicalId, resource, ctx): string => {
        log.trace(`Called arnGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._arn) {
            const partition = ctx.getPartition();
            const accountId = ctx.getAccountId();
            resource._arn = `arn:${partition}:cdk::${accountId}:${logicalId}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an AWS CDK Metadata resource.
     *
     * If the resource does not have a unique identifier (_id), this function sets
     * the resource's logical ID as its unique identifier and returns it.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context.
     * @returns The unique resource identifier.
     */
    idGenFunc: (resourceType, logicalId, resource, ctx): string => {
        log.trace(`Called idGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._id) {
            log.trace(`For ${logicalId} with type ${resourceType} id is not set, will be generated`);
            resource._id = logicalId;
        }
        return resource._id;
    },
};
