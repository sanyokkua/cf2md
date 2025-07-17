import { CfResourcesType } from '../../../parsing';
import { EventsEventBusResource } from '../../../parsing/types/cloudformation-model';
import { EventBusModel } from '../../types/events/event-bus-model';
import { MapperInput } from '../../types/mapping-model';
import { BaseResourceMapper } from './base-mapper';

export class EventBusMapper extends BaseResourceMapper {
    protected override getMapperResourceType(): string {
        return CfResourcesType.AWS_Events_EventBus;
    }

    protected mapResourceSpecificProps(mapperInput: MapperInput<EventsEventBusResource>): EventBusModel {
        const resource = mapperInput.resource;
        const eventBusName = this.mapperUtils.extractString(resource._id);
        const description = this.mapperUtils.extractStringOrDefault(resource.Properties.Description, '');
        const dlqArn = this.mapperUtils.extractStringOrDefault(resource.Properties.DeadLetterConfig?.Arn, '');

        return {
            eventBusName: eventBusName,
            description: description,
            deadLetterConfigArn: dlqArn,
        } as EventBusModel;
    }
}
