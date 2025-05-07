import { JSONPath } from 'jsonpath-plus';
import { StringUtils } from '../../../../common';
import { MapperUtil } from '../../../types/utils-model';
import { IntegrationServiceMapper } from './types';

const JsonPathsForServices: Record<string, string> = {
    events: '$.Entries[*].EventBusName',
    dynamodb: '$.TableName',
    sqs: '$.QueueUrl',
    sns: '$.TopicArn',
    states: '$.stateMachineArn',
    s3: '$.Bucket',
};

export class IntegrationServiceMapperImpl implements IntegrationServiceMapper {
    constructor(
        private readonly mapperUtils: MapperUtil,
        private readonly stringUtils: StringUtils,
    ) {}

    mapServiceName(jsonReqTemplate: string, service: string, action: string): string {
        if (service === 'lambda' && action.includes(':lambda:')) {
            const regex = /(?:.*?\/functions\/)?((arn:aws:lambda:[^:]+:[^:]+:function:[^/]+)|([^/]+))(?:\/invocations)?$/;
            const match = action.match(regex);
            return match ? match[1] : action;
        } else {
            return this.getServiceNameFromReqTemplate(jsonReqTemplate, service, action);
        }
    }

    private getServiceNameFromReqTemplate(jsonReqTemplate: string, service: string, action: string): string {
        if (jsonReqTemplate) {
            const jsonObj = JSON.parse(jsonReqTemplate) as object;
            if (this.stringUtils.isValidNotBlankString(JsonPathsForServices[service])) {
                const result: unknown = JSONPath({ path: JsonPathsForServices[service], json: jsonObj });
                if (Array.isArray(result) && result.length === 1) {
                    return this.mapperUtils.extractStringOrJsonStringOrEmptyString(result[0]);
                } else {
                    return this.mapperUtils.extractStringOrJsonStringOrEmptyString(result);
                }
            }
        }
        return action;
    }
}
