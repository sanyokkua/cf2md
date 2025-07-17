import { CfResourcesType } from '../../../parsing';
import { CloudFormationResource, SNSSubscriptionResource } from '../../../parsing/types/cloudformation-model';
import { MapperInput } from '../../types/mapping-model';
import { SnsSubscriptionModel } from '../../types/sns/subscription-model';
import { BaseResourceMapper } from './base-mapper';

export class SnsSubscriptionMapper extends BaseResourceMapper {
    protected override getMapperResourceType(): string {
        return CfResourcesType.AWS_SNS_Subscription;
    }

    protected mapResourceSpecificProps(mapperInput: MapperInput<SNSSubscriptionResource>): SnsSubscriptionModel {
        const resource = mapperInput.resource;
        const resourcesArn: Map<string, CloudFormationResource> = new Map<string, CloudFormationResource>();
        mapperInput.ctx.getResources().forEach((res) => {
            resourcesArn.set(res._arn ?? '', res);
        });

        const topicArn = this.mapperUtils.extractString(resource.Properties.TopicArn);
        let topicName = topicArn;
        if (resourcesArn.has(topicArn)) {
            topicName = this.mapperUtils.extractStringOrDefault(resourcesArn.get(topicArn)?._id, topicName);
        }
        let endpointName = this.mapperUtils.extractStringOrDefault(resource.Properties.Endpoint, '');
        if (resourcesArn.has(endpointName)) {
            endpointName = resourcesArn.get(endpointName)?._id || endpointName;
        }
        const protocol = this.mapperUtils.extractString(resource.Properties.Protocol);

        return {
            topicNameOrArn: topicName,
            protocol: protocol,
            endpoint: endpointName,
        } as SnsSubscriptionModel;
    }
}
