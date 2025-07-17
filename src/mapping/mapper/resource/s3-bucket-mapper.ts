import { CfResourcesType } from '../../../parsing';
import { S3BucketResource } from '../../../parsing/types/cloudformation-model';
import { MapperInput } from '../../types/mapping-model';
import { S3BucketModel } from '../../types/s3/model';
import { BaseResourceMapper } from './base-mapper';

export class S3BucketMapper extends BaseResourceMapper {
    protected override getMapperResourceType(): string {
        return CfResourcesType.AWS_S3_Bucket;
    }

    protected mapResourceSpecificProps(mapperInput: MapperInput<S3BucketResource>): S3BucketModel {
        const resource = mapperInput.resource;
        const bucketName = this.mapperUtils.extractString(resource._id);

        return {
            bucketName: bucketName,
        } as S3BucketModel;
    }
}
