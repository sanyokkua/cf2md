import { BaseResource } from '../resources-model';

export interface EventBusModel extends BaseResource {
    eventBusName: string;
    description: string;
    deadLetterConfigArn: string;
}
