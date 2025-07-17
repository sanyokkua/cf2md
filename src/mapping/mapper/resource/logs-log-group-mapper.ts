// LogsLogGroupResource

import { CfResourcesType } from '../../../parsing';
import { LogsLogGroupResource } from '../../../parsing/types/cloudformation-model';
import { LogsLogGroupModel } from '../../types/log-group/model';
import { MapperInput } from '../../types/mapping-model';
import { BaseResourceMapper } from './base-mapper';

export class LogsLogGroupModelMapper extends BaseResourceMapper {
    protected override getMapperResourceType(): string {
        return CfResourcesType.AWS_Logs_LogGroup;
    }

    protected mapResourceSpecificProps(mapperInput: MapperInput<LogsLogGroupResource>): LogsLogGroupModel {
        const resource = mapperInput.resource;
        const name = this.mapperUtils.extractString(resource._id);
        const retentionInDays = resource.Properties.RetentionInDays ? String(resource.Properties.RetentionInDays) : 'NEVER_EXPIRE';
        const className = this.mapperUtils.extractStringOrDefault(resource.Properties.LogGroupClass, 'STANDARD');
        return {
            logGroupName: name,
            retentionInDays: retentionInDays,
            logGroupClass: className,
        } as LogsLogGroupModel;
    }
}
