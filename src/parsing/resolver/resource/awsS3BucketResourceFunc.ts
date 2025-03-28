import { S3BucketResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsS3BucketResource extends BaseResource {
    getAttFunc(context: IntrinsicContext, key: string): unknown {
        const { ctx, logicalId, resource, valueResolver } = context;
        const resTyped = resource as S3BucketResource;

        if (key === 'Arn') {
            return this.arnGenFunc(context);
        }
        if (key === 'DomainName') {
            return 'RUNTIME_DomainName';
        }
        if (key === 'DualStackDomainName') {
            return 'RUNTIME_DualStackDomainName';
        }
        if (key === 'MetadataTableConfiguration.S3TablesDestination.TableArn') {
            return this.resourceUtils.resolveStringWithDefault(
                resTyped.Properties.MetadataTableConfiguration?.S3TablesDestination.TableArn,
                'STUB_MetadataTableConfiguration',
                `${logicalId}.Properties.MetadataTableConfiguration?.S3TablesDestination.TableArn`,
                ctx,
                valueResolver,
            );
        }
        if (key === 'MetadataTableConfiguration.S3TablesDestination.TableNamespace') {
            return this.resourceUtils.resolveStringWithDefault(
                resTyped.Properties.MetadataTableConfiguration?.S3TablesDestination.TableNamespace,
                'STUB_MetadataTableConfiguration',
                `${logicalId}.Properties.MetadataTableConfiguration?.S3TablesDestination.TableNamespace`,
                ctx,
                valueResolver,
            );
        }
        if (key === 'RegionalDomainName') {
            return 'STUB_RegionalDomainName';
        }
        if (key === 'WebsiteURL') {
            return 'STUB_WebsiteURL';
        }

        return this.idGenFunc(context);
    }

    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const partition = ctx.getPartition();
            const bucketName = this.idGenFunc(context);
            resource._arn = `arn:${partition}:s3:::${bucketName}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const resTyped = resource as S3BucketResource;
            resource._id = this.resourceUtils.generateNameId(
                resTyped.Properties.BucketName,
                `${logicalId}.Properties.BucketName`,
                'bucket',
                ctx,
                valueResolver,
                5,
            );
        }
        return resource._id;
    }
}
