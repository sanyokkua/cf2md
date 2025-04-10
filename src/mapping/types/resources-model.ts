export interface BaseResource {
    resourceType: string;
    resourceArn: string;
    physicalId: string;
    logicalId: string;
    creationPolicy?: string;
    deletionPolicy?: string;
    dependsOn?: string;
    updatePolicy?: string;
    updateReplacePolicy?: string;
}

export interface LambdaFunctionModel extends BaseResource {
    functionName?: string;
    architectures?: string[];
    environmentVars?: Map<string, string>;
    memorySize?: string;
    timeout?: string;
    tracingConfig?: string;
    ephemeralStorage: string;
}

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

export type ResourceModel = LambdaFunctionModel | BaseResource;
