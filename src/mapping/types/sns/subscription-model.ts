import { BaseResource } from '../resources-model';

export interface SnsTopicSubscription {
    protocol: string;
    endpoint: string;
}

export interface SnsSubscriptionModel extends BaseResource {
    topicNameOrArn: string;
    protocol: string;
    endpoint: string;
}
