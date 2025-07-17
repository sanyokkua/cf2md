import { BaseResource } from '../resources-model';

export interface ApiGatewayEndpoint {
    endpointPath: string; // Build based on the AwsApiGatewayResource.Properties.PathPart
    endpointHttpMethod: string; // AwsApiGatewayMethod.Properties.HttpMethod
    endpointIntegrationType: string; // AwsApiGatewayMethod.Properties.Integration.Type
    integrationService: string; // Should be built by joining of AwsApiGatewayMethod.Properties.Integration.Uri
    integrationServiceSubdomain: string;
    integrationServiceAction: string; // Should be built by joining of AwsApiGatewayMethod.Properties.Integration.Uri
    integrationServiceActionType: string; // Should be built by joining of AwsApiGatewayMethod.Properties.Integration.Uri
    integrationServiceName: string;
    integrationServiceRegion: string;
    endpointModelSchema: string; // AwsApiGatewayMethod.Properties.* There is a ref to AwsApiGatewayModel.Properties.Schema
    requestTemplates: Record<string, string>; // MIME type -> Velocity Template Language, "application/json"->""
}

export interface ApiGatewayV1RestApi extends BaseResource {
    apiName?: string;
    apiDescription?: string;
    stageName?: string;
    stageTracing?: string;
    authorizerName?: string;
    authorizerType?: string;
    authorizerUri?: string;
    apiEndpoints?: ApiGatewayEndpoint[];
}
