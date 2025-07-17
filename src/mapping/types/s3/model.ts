import { BaseResource } from '../resources-model';

export interface S3BucketModel extends BaseResource {
    bucketName: string;
}
