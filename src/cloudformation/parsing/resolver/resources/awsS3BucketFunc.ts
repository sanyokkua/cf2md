import log from 'loglevel';
import { AwsS3BucketResource, CloudFormationResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { resolveStringWithDefault, shortUuid } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS S3 Bucket resources.
 *
 * This object provides methods for resolving intrinsic references ("Ref" and "Fn::GetAtt"),
 * generating ARNs, and creating unique identifiers for AWS::S3::Bucket resources defined in
 * CloudFormation templates. It forms part of the CloudFormation parser, using resource properties
 * and the deployment context (region, account, partition) to compute values.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-s3-bucket.html#aws-resource-s3-bucket-return-values
 */
export const awsS3BucketFunc: ResourceSpecificFunc = {
    /**
     * Resolves the "Ref" intrinsic for an S3 Bucket.
     *
     * This function is invoked when a CloudFormation template uses the "Ref" intrinsic on an S3 Bucket.
     * It logs the invocation and delegates to idGenFunc to generate the unique identifier (bucket name).
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The S3 Bucket resource object.
     * @param ctx - The resolving context providing environment details (e.g., helper methods).
     * @returns The resolved bucket name as the unique identifier.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        return awsS3BucketFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Resolves an attribute ("Fn::GetAtt") for an S3 Bucket.
     *
     * This function handles "Fn::GetAtt" intrinsic calls. Based on the requested attribute key, it resolves:
     * - "Arn": Returns the bucket's ARN.
     * - "DomainName": Returns a runtime placeholder for the domain name.
     * - "DualStackDomainName": Returns a runtime placeholder for the dual-stack domain name.
     * - "MetadataTableConfiguration.S3TablesDestination.TableArn": Resolves the table ARN from the bucket's
     *   metadata configuration.
     * - "MetadataTableConfiguration.S3TablesDestination.TableNamespace": Resolves the table namespace from the metadata.
     * - "RegionalDomainName": Returns a runtime placeholder for the regional domain name.
     * - "WebsiteURL": Returns a runtime placeholder for the website URL.
     *
     * For unsupported keys, a warning is logged and the unique identifier (bucket name) is returned.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The S3 Bucket resource object.
     * @param ctx - The resolving context with environment-specific details.
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

        const resTyped = resource as AwsS3BucketResource;

        if (key === 'Arn') {
            return awsS3BucketFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }
        if (key === 'DomainName') {
            return 'RUNTIME_DomainName';
        }
        if (key === 'DualStackDomainName') {
            return 'RUNTIME_DualStackDomainName';
        }
        if (key === 'MetadataTableConfiguration.S3TablesDestination.TableArn') {
            return resolveStringWithDefault(
                resTyped.Properties.MetadataTableConfiguration?.S3TablesDestination.TableArn,
                'RUNTIME_MetadataTableConfiguration',
                `${resourceType}.Properties.MetadataTableConfiguration?.S3TablesDestination.TableArn`,
                ctx,
            );
        }
        if (key === 'MetadataTableConfiguration.S3TablesDestination.TableNamespace') {
            return resolveStringWithDefault(
                resTyped.Properties.MetadataTableConfiguration?.S3TablesDestination.TableNamespace,
                'RUNTIME_MetadataTableConfiguration',
                `${resourceType}.Properties.MetadataTableConfiguration?.S3TablesDestination.TableNamespace`,
                ctx,
            );
        }
        if (key === 'RegionalDomainName') {
            return 'RUNTIME_RegionalDomainName';
        }
        if (key === 'WebsiteURL') {
            return 'RUNTIME_WebsiteURL';
        }

        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsS3BucketFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the ARN for an S3 Bucket.
     *
     * Constructs the ARN using the partition from the context and the bucket name generated by idGenFunc.
     * The ARN follows the format:
     *   arn:{partition}:s3:::{bucketName}
     * The generated ARN is cached on the resource object for future use.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID from the CloudFormation template.
     * @param resource - The S3 Bucket resource object.
     * @param ctx - The resolving context providing the partition information.
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
            const partition = ctx.getPartition();
            // Use the bucket name (resolved by idGenFunc) to construct the ARN.
            const bucketName = awsS3BucketFunc.idGenFunc(resourceType, logicalId, resource, ctx);
            resource._arn = `arn:${partition}:s3:::${bucketName}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an S3 Bucket.
     *
     * This function generates a unique identifier for the S3 Bucket resource by resolving the BucketName property.
     * If the BucketName is not set, it falls back to a default value generated using a short UUID.
     * The resultant unique identifier is cached on the resource for future reference.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource from the CloudFormation template.
     * @param resource - The S3 Bucket resource object.
     * @param ctx - The resolving context providing helper functions.
     * @returns The resolved unique identifier (bucket name) as a string.
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
            const resTyped = resource as AwsS3BucketResource;
            // Generate a default bucket name using a short UUID if none is provided.
            const nameDefault = `bucket-${shortUuid(ctx)}`;
            resource._id = resolveStringWithDefault(
                resTyped.Properties.BucketName,
                nameDefault,
                `${resourceType}.Properties.BucketName`,
                ctx,
            );
        }
        return resource._id;
    },
};
