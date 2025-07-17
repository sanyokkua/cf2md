import { ErrorUtils } from 'coreutilsts';
import log from 'loglevel';
import { CfResourcesType } from '../../../parsing';
import { CloudFormationResource, EventsRuleResource } from '../../../parsing/types/cloudformation-model';
import { EventsRuleModel, EventsRuleTarg, RuleState } from '../../types/events/rule-model';
import { MapperInput } from '../../types/mapping-model';
import { BaseResourceMapper } from './base-mapper';

export class EventsRuleMapper extends BaseResourceMapper {
    protected override getMapperResourceType(): string {
        return CfResourcesType.AWS_Events_Rule;
    }

    private getJsonOrEmptyString(jsonString: string): string {
        if (!jsonString || jsonString.trim().length === 0) {
            return '';
        }
        try {
            const parsedObj: unknown = JSON.parse(jsonString);
            return JSON.stringify(parsedObj);
        } catch (e) {
            const msg = ErrorUtils.extractErrorDetails(e);
            log.warn(msg);
            return '';
        }
    }

    protected mapResourceSpecificProps(mapperInput: MapperInput<EventsRuleResource>): EventsRuleModel {
        const resource = mapperInput.resource;
        const resourcesArn: Map<string, CloudFormationResource> = new Map<string, CloudFormationResource>();
        mapperInput.ctx.getResources().forEach((res) => {
            resourcesArn.set(res._arn ?? '', res);
        });
        const ruleName = this.mapperUtils.extractString(resource._id);
        const rulePatternString = this.getJsonOrEmptyString(this.mapperUtils.extractStringOrDefault(resource.Properties.EventPattern, ''));
        const ruleScheduleExpression = this.mapperUtils.extractStringOrDefault(resource.Properties.ScheduleExpression, '');
        const state = this.mapperUtils.extractStringOrDefault(resource.Properties.State, 'ENABLED');
        const ruleState: RuleState = state as RuleState;
        const description = this.mapperUtils.extractStringOrDefault(resource.Properties.Description, '');
        const eventBusName = this.mapperUtils.extractStringOrDefault(resource.Properties.EventBusName, 'DEFAULT_EVENT_BUS');
        const targets: EventsRuleTarg[] = (resource.Properties.Targets ?? []).map((target) => {
            const targetId = this.mapperUtils.extractString(target.Id);
            const targetArn = this.mapperUtils.extractStringOrDefault(target.Arn, '');
            let targetName = targetArn;
            if (resourcesArn.has(targetArn)) {
                targetName = resourcesArn.get(targetArn)?._id || targetName;
            }
            const targetDlq = this.mapperUtils.extractStringOrDefault(target.DeadLetterConfig?.Arn, '');
            let targetDlqName = targetDlq;
            if (resourcesArn.has(targetDlq)) {
                targetDlqName = resourcesArn.get(targetDlq)?._id || targetDlqName;
            }
            const input = this.getJsonOrEmptyString(this.mapperUtils.extractStringOrDefault(target.Input, ''));
            const kinesisParameters = this.getJsonOrEmptyString(
                this.mapperUtils.extractStringOrDefault(target.KinesisParameters?.PartitionKeyPath, ''),
            );
            const sqsParameters = this.getJsonOrEmptyString(this.mapperUtils.extractStringOrDefault(target.SqsParameters?.MessageGroupId, ''));

            return {
                id: targetId,
                targetResource: targetName,
                targetResourceDlq: targetDlqName,
                input: input,
                kinesisParameters: kinesisParameters,
                sqsParameters: sqsParameters,
            };
        });

        return {
            ruleName: ruleName,
            description: description,
            eventBusName: eventBusName,
            eventPattern: rulePatternString,
            scheduleExpression: ruleScheduleExpression,
            state: ruleState,
            targets: targets,
        } as EventsRuleModel;
    }
}
