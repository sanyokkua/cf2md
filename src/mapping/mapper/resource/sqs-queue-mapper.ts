import { StringKeyValueObject } from '../../../common';
import { CfResourcesType } from '../../../parsing';
import { SQSQueueResource } from '../../../parsing/types/cloudformation-model';
import { MapperInput } from '../../types/mapping-model';
import { SqsQueueModel } from '../../types/sqs/model';
import { BaseResourceMapper } from './base-mapper';

export enum SqsDefaults {
    DelaySecondsDefault = 'DelaySecondsDefault',
    MsgRetentionPeriodDefault = 'MsgRetentionPeriodDefault',
    VisibilityTimeoutDefault = 'VisibilityTimeoutDefault',
    FifoDefault = 'FifoDefault',
    ContentDeduplicationDefault = 'ContentDeduplicationDefault',
}

export class SqsMapper extends BaseResourceMapper {
    protected override getMapperResourceType(): string {
        return CfResourcesType.AWS_SQS_Queue;
    }

    protected override getDefaultMappings(): StringKeyValueObject {
        return {
            [SqsDefaults.DelaySecondsDefault]: '0',
            [SqsDefaults.MsgRetentionPeriodDefault]: '345600',
            [SqsDefaults.VisibilityTimeoutDefault]: '30',
            [SqsDefaults.FifoDefault]: 'No',
            [SqsDefaults.ContentDeduplicationDefault]: 'No',
        } as StringKeyValueObject;
    }

    protected mapResourceSpecificProps(mapperInput: MapperInput<SQSQueueResource>): SqsQueueModel {
        const resource = mapperInput.resource;
        const queueName = this.mapperUtils.extractString(resource._id);
        const contentBasedDeduplicationRaw = this.getOrDefault(
            resource.Properties.ContentBasedDeduplication,
            SqsDefaults.ContentDeduplicationDefault,
        );
        const contentBasedDeduplication = this.getYesNoValue(contentBasedDeduplicationRaw);
        const delaySeconds = this.getOrDefault(resource.Properties.DelaySeconds, SqsDefaults.DelaySecondsDefault);
        const fifoQueueRaw = this.getOrDefault(resource.Properties.FifoQueue, SqsDefaults.FifoDefault);
        const fifoQueue = this.getYesNoValue(fifoQueueRaw);
        const fifoThroughputLimit = this.mapperUtils.extractStringOrDefault(resource.Properties.FifoThroughputLimit, '');
        const maximumMessageSize = this.mapperUtils.extractStringOrDefault(resource.Properties.MaximumMessageSize, '');
        const messageRetentionPeriod = this.getOrDefault(resource.Properties.MessageRetentionPeriod, SqsDefaults.MsgRetentionPeriodDefault);
        const receiveMessageWaitTimeSeconds = this.mapperUtils.extractStringOrDefault(resource.Properties.ReceiveMessageWaitTimeSeconds, '');
        const visibilityTimeout = this.getOrDefault(resource.Properties.VisibilityTimeout, SqsDefaults.VisibilityTimeoutDefault);
        return {
            queueName: queueName,
            contentBasedDeduplication: contentBasedDeduplication,
            delaySeconds: delaySeconds,
            fifoQueue: fifoQueue,
            fifoThroughputLimit: fifoThroughputLimit,
            maximumMessageSize: maximumMessageSize,
            messageRetentionPeriod: messageRetentionPeriod,
            receiveMessageWaitTimeSeconds: receiveMessageWaitTimeSeconds,
            visibilityTimeout: visibilityTimeout,
        } as SqsQueueModel;
    }
}
