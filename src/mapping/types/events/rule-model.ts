import { BaseResource } from '../resources-model';

export interface EventsRuleTarg {
    id: string;
    targetResource: string;
    targetResourceDlq: string;
    input: string; // Valid JSON text
    kinesisParameters: string; // partition key
    sqsParameters: string; // msg group id
}

export type RuleState = 'DISABLED' | 'ENABLED' | 'ENABLED_WITH_ALL_CLOUDTRAIL_MANAGEMENT_EVENTS' | '';

export interface EventsRuleModel extends BaseResource {
    ruleName: string;
    description: string;
    eventBusName: string;
    eventPattern: string;
    scheduleExpression: string; // e.g., cron(0 20 * * ? *)
    state: RuleState;
    targets: EventsRuleTarg[];
}
