import { BaseResource, YesNoType } from '../resources-model';
import { SnsTopicSubscription } from './subscription-model';

export interface SnsTopicModel extends BaseResource {
    topicName: string;
    displayName: string;
    fifoThroughputScope: string;
    fifoTopic: YesNoType;
    contentBasedDeduplication: YesNoType;
    subscriptions: SnsTopicSubscription[];
    tracingConfig: string; // PassThrough default, Active
}
