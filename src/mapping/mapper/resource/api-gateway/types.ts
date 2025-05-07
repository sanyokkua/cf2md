import { ApiGatewayMethodResource, CloudFormationResource } from '../../../../parsing/types/cloudformation-model';
import { MapperInput } from '../../../types/mapping-model';
import { ApiGatewayEndpoint } from '../../../types/resources-model';

export const JsonMimeType = 'application/json';

export type StageFields = {
    stageName: string;
    stageTracing: string;
    stageVariables: Record<string, string>;
};

export type AuthFields = {
    authorizerName: string;
    authorizerType: string;
    authorizerUri: string;
};

export interface IntegrationV1Handler {
    handle(method: ApiGatewayMethodResource): Partial<ApiGatewayEndpoint>;
}

export interface IntegrationV1HandlerResolver {
    getHandler(integrationType: string): IntegrationV1Handler;
}

export interface ApiGatewayV1EndpointMapper {
    getEndpoint(
        mapperInput: MapperInput<CloudFormationResource>,
        method: ApiGatewayMethodResource,
        stageVars: Record<string, string> | undefined,
    ): ApiGatewayEndpoint;
}

export interface IntegrationServiceMapper {
    mapServiceName(jsonReqTemplate: string, service: string, action: string): string;
}
