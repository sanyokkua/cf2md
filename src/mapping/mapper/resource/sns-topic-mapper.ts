import { StringKeyValueObject } from '../../../common';
import { CfResourcesType } from '../../../parsing';
import { CloudFormationResource, SNSSubscriptionResource, SNSTopicResource } from '../../../parsing/types/cloudformation-model';
import { MapperInput } from '../../types/mapping-model';
import { YesNoType } from '../../types/resources-model';
import { BaseResourceMapper } from './base-mapper';

import { SnsTopicSubscription } from '../../types/sns/subscription-model';
import { SnsTopicModel } from '../../types/sns/topic-model';

export enum SnsTopicDefaults {
    TracingConfig = 'TracingConfig',
}

export class SnsTopicMapper extends BaseResourceMapper {
    protected override getMapperResourceType(): string {
        return CfResourcesType.AWS_SNS_Topic;
    }

    protected override getDefaultMappings(): StringKeyValueObject {
        return {
            [SnsTopicDefaults.TracingConfig]: 'PassThrough',
        } as StringKeyValueObject;
    }

    protected mapResourceSpecificProps(mapperInput: MapperInput<SNSTopicResource>): SnsTopicModel {
        const resource = mapperInput.resource;
        const resourcesArn: Map<string, CloudFormationResource> = new Map<string, CloudFormationResource>();
        mapperInput.ctx.getResources().forEach((res) => {
            resourcesArn.set(res._arn ?? '', res);
        });

        const topicName = this.mapperUtils.extractString(resource._id);
        const displayName = this.mapperUtils.extractStringOrDefault(resource.Properties.DisplayName, '');
        const fifoThroughputScope = this.mapperUtils.extractStringOrDefault(resource.Properties.FifoThroughputScope, '');
        const fifoTopic: YesNoType = resource.Properties.FifoTopic ? 'Yes' : 'No';
        const contentBasedDeduplication: YesNoType = resource.Properties.ContentBasedDeduplication ? 'Yes' : 'No';
        const subscriptions: SnsTopicSubscription[] = (resource.Properties.Subscription ?? []).map((subscription) => {
            const endpoint = this.mapperUtils.extractString(subscription.Endpoint);
            let endpointName = endpoint;
            if (resourcesArn.has(endpointName)) {
                endpointName = resourcesArn.get(endpointName)?._id || endpointName;
            }
            const protocol = this.mapperUtils.extractString(subscription.Protocol);
            return {
                endpoint: endpointName,
                protocol: protocol,
            };
        });
        mapperInput.ctx
            .getResourcesByType('AWS::SNS::Subscription')
            .map((sub) => {
                return sub as unknown as SNSSubscriptionResource;
            })
            .filter((subscription) => {
                return subscription.Properties.TopicArn === resource._arn;
            })
            .forEach((subscription) => {
                const endpoint = this.mapperUtils.extractString(subscription.Properties.Endpoint);
                let endpointName = endpoint;
                if (resourcesArn.has(endpointName)) {
                    endpointName = resourcesArn.get(endpointName)?._id || endpointName;
                }
                const protocol = this.mapperUtils.extractString(subscription.Properties.Protocol);
                subscriptions.push({
                    endpoint: endpointName,
                    protocol: protocol,
                });
            });
        const tracingConfig = this.getOrDefault(resource.Properties.TracingConfig, SnsTopicDefaults.TracingConfig);

        return {
            topicName: topicName,
            displayName: displayName,
            fifoThroughputScope: fifoThroughputScope,
            fifoTopic: fifoTopic,
            contentBasedDeduplication: contentBasedDeduplication,
            subscriptions: subscriptions,
            tracingConfig: tracingConfig,
        } as SnsTopicModel;
    }
}
