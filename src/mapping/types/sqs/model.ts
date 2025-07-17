import { BaseResource } from '../resources-model';

export interface SqsQueueModel extends BaseResource {
    contentBasedDeduplication: string;
    delaySeconds: string;
    fifoQueue: string;
    fifoThroughputLimit: string;
    maximumMessageSize: string;
    messageRetentionPeriod: string;
    queueName: string;
    receiveMessageWaitTimeSeconds: string;
    visibilityTimeout: string;
}
