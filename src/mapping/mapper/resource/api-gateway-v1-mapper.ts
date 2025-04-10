import { JSONPath } from 'jsonpath-plus';
import { StringUtils } from '../../../common';
import { CfResourcesType } from '../../../parsing';
import {
    ApiGatewayAuthorizerResource,
    ApiGatewayMethodResource,
    ApiGatewayModelResource,
    ApiGatewayResourceResource,
    ApiGatewayRestApiResource,
    ApiGatewayStageResource,
    CloudFormationResource,
} from '../../../parsing/types/cloudformation-model';
import { MapperInput } from '../../types/mapping-model';
import { ApiGatewayEndpoint, ApiGatewayV1RestApi } from '../../types/resources-model';
import { IntegrationUriUtils, MapperUtil } from '../../types/utils-model';
import { BaseResourceMapper } from './base-mapper';

const JsonMimeType = 'application/json';
type StageFields = {
    stageName: string;
    stageTracing: string;
    stageVariables: Record<string, string>;
};

type AuthFields = {
    authorizerName: string;
    authorizerType: string;
    authorizerUri: string;
};

interface IntegrationHandler {
    handle(method: ApiGatewayMethodResource): Partial<ApiGatewayEndpoint>;
}

class AwsIntegrationHandler implements IntegrationHandler {
    constructor(
        private readonly integrationUriUtils: IntegrationUriUtils,
        private readonly mapperUtils: MapperUtil,
    ) {}

    handle(method: ApiGatewayMethodResource): Partial<ApiGatewayEndpoint> {
        const integrationUri = this.mapperUtils.extractStringOrJsonStringOrEmptyString(method.Properties.Integration?.Uri);
        if (!integrationUri) {
            return {};
        }

        const integrationUriArn = this.integrationUriUtils.parseIntegrationUri(integrationUri);
        return {
            integrationService: integrationUriArn.integrationService,
            integrationServiceRegion: integrationUriArn.integrationServiceRegion,
            integrationServiceSubdomain: integrationUriArn.integrationServiceSubdomain ?? '',
            integrationServiceActionType: integrationUriArn.integrationServiceActionType,
            integrationServiceAction: integrationUriArn.integrationServiceAction,
        };
    }
}

class HttpIntegrationHandler implements IntegrationHandler {
    constructor(private readonly mapperUtils: MapperUtil) {}

    handle(method: ApiGatewayMethodResource): Partial<ApiGatewayEndpoint> {
        const integrationUri = this.mapperUtils.extractStringOrJsonStringOrEmptyString(method.Properties.Integration?.Uri);
        return { integrationServiceAction: integrationUri };
    }
}

export class ApiGatewayV1Mapper extends BaseResourceMapper {
    private readonly handlers: Record<string, IntegrationHandler>;

    constructor(
        private readonly integrationUriUtils: IntegrationUriUtils,
        private readonly stringUtils: StringUtils,
        mapperUtils: MapperUtil,
    ) {
        super(mapperUtils);
        this.handlers = {
            AWS: new AwsIntegrationHandler(this.integrationUriUtils, this.mapperUtils),
            AWS_PROXY: new AwsIntegrationHandler(this.integrationUriUtils, this.mapperUtils),
            HTTP: new HttpIntegrationHandler(this.mapperUtils),
            HTTP_PROXY: new HttpIntegrationHandler(this.mapperUtils),
        };
    }

    private getHandler(integrationType: string): IntegrationHandler | undefined {
        return this.handlers[integrationType];
    }

    protected override getMapperResourceType(): string {
        return CfResourcesType.AWS_ApiGateway_RestApi;
    }

    protected override mapResourceSpecificProps(mapperInput: MapperInput<CloudFormationResource>): ApiGatewayV1RestApi {
        const rawRestApi = mapperInput.resource as ApiGatewayRestApiResource;

        const restApiPhysicalId = this.mapperUtils.extractString(rawRestApi._id);
        const name = this.mapperUtils.extractStringOrJsonStringOrEmptyString(rawRestApi.Properties.Name);
        const description = this.mapperUtils.extractStringOrJsonStringOrEmptyString(rawRestApi.Properties.Description);

        const { stageName, stageTracing, stageVariables } = this.getStageInfo(mapperInput, restApiPhysicalId);
        const { authorizerName, authorizerType, authorizerUri } = this.getAuthInfo(mapperInput, restApiPhysicalId);

        const endpoints = this.getEndpoints(mapperInput, restApiPhysicalId, stageVariables);

        return {
            apiName: name,
            apiDescription: description,
            stageName: stageName,
            stageTracing: stageTracing,
            authorizerName: authorizerName,
            authorizerType: authorizerType,
            authorizerUri: authorizerUri,
            apiEndpoints: endpoints,
        } as ApiGatewayV1RestApi;
    }

    private getStageInfo(mapperInput: MapperInput<CloudFormationResource>, restApiPhysicalId: string): StageFields {
        const rawStage = this.findStage(mapperInput, restApiPhysicalId);
        const stageName = this.mapperUtils.extractStringOrJsonStringOrEmptyString(rawStage?.Properties.StageName);
        const stageTracing = this.mapperUtils.extractStringOrDefault(rawStage?.Properties.TracingEnabled, 'false');
        const stageVariables = rawStage?.Properties.Variables;

        const stageVars = {} as Record<string, string>;
        if (stageVariables) {
            Object.keys(stageVariables).forEach((key: string) => {
                stageVars[key] = this.mapperUtils.extractStringOrJsonStringOrEmptyString(stageVariables[key]);
            });
        }

        return {
            stageName: stageName,
            stageTracing: stageTracing,
            stageVariables: stageVars,
        };
    }

    private findStage(mapperInput: MapperInput<CloudFormationResource>, restApiPhysicalId: string): ApiGatewayStageResource | undefined {
        if (!mapperInput.ctx.isResourceTypeExists(CfResourcesType.AWS_ApiGateway_Stage)) {
            return undefined;
        }
        const stages = mapperInput.ctx.getResourcesByType(CfResourcesType.AWS_ApiGateway_Stage);
        const mappedStages = stages.map((stage) => stage as ApiGatewayStageResource);
        const foundStage = mappedStages.find((stage) => {
            const stageParentRestApiId = this.mapperUtils.extractString(stage.Properties.RestApiId);
            return stageParentRestApiId === restApiPhysicalId;
        });
        return foundStage;
    }

    private getAuthInfo(mapperInput: MapperInput<CloudFormationResource>, restApiPhysicalId: string): AuthFields {
        const rawAuthorizer = this.findAuthorizer(mapperInput, restApiPhysicalId);
        const authorizerName = this.mapperUtils.extractStringOrJsonStringOrEmptyString(rawAuthorizer?.Properties.Name);
        const authorizerType = this.mapperUtils.extractStringOrJsonStringOrEmptyString(rawAuthorizer?.Properties.Type);
        const authorizerUri = this.mapperUtils.extractStringOrJsonStringOrEmptyString(rawAuthorizer?.Properties.AuthorizerUri);

        return {
            authorizerName: authorizerName,
            authorizerType: authorizerType,
            authorizerUri: authorizerUri,
        };
    }

    private findAuthorizer(mapperInput: MapperInput<CloudFormationResource>, restApiPhysicalId: string): ApiGatewayAuthorizerResource | undefined {
        if (!mapperInput.ctx.isResourceTypeExists(CfResourcesType.AWS_ApiGateway_Authorizer)) {
            return undefined;
        }
        const authorizers = mapperInput.ctx.getResourcesByType(CfResourcesType.AWS_ApiGateway_Authorizer);
        const mappedAuthorizers = authorizers.map((authorizer) => authorizer as ApiGatewayAuthorizerResource);
        const foundAuthorizer = mappedAuthorizers.find((auth) => {
            const authParentRestApiId = this.mapperUtils.extractString(auth.Properties.RestApiId);
            return authParentRestApiId === restApiPhysicalId;
        });
        return foundAuthorizer;
    }

    private getEndpoints(
        mapperInput: MapperInput<CloudFormationResource>,
        restApiPhysicalId: string,
        stageVars?: Record<string, string>,
    ): ApiGatewayEndpoint[] {
        const methods = this.findMethods(mapperInput, restApiPhysicalId);
        const endpoints: ApiGatewayEndpoint[] = methods.map((method) => {
            return this.getEndpoint(mapperInput, method, stageVars);
        });
        return endpoints;
    }

    private findMethods(mapperInput: MapperInput<CloudFormationResource>, restApiPhysicalId: string): ApiGatewayMethodResource[] {
        if (!mapperInput.ctx.isResourceTypeExists(CfResourcesType.AWS_ApiGateway_Method)) {
            return [];
        }
        const methods = mapperInput.ctx.getResourcesByType(CfResourcesType.AWS_ApiGateway_Method);
        const mappedMethods = methods.map((method) => method as ApiGatewayMethodResource);
        const foundMethods = mappedMethods.filter((method) => {
            const methodParentApiId = this.mapperUtils.extractString(method.Properties.RestApiId);
            return methodParentApiId === restApiPhysicalId;
        });
        return foundMethods;
    }

    private getEndpoint(
        mapperInput: MapperInput<CloudFormationResource>,
        method: ApiGatewayMethodResource,
        stageVars: Record<string, string> | undefined,
    ): ApiGatewayEndpoint {
        const baseEndpoint = this.createBaseEndpoint(mapperInput, method);
        const endpointIntegrationType = this.mapperUtils.extractStringOrJsonStringOrEmptyString(method.Properties.Integration?.Type);
        // AWS | AWS_PROXY | HTTP | HTTP_PROXY | MOCK
        if (endpointIntegrationType === 'MOCK' || this.stringUtils.isBlankString(endpointIntegrationType)) {
            return {
                ...baseEndpoint,
                endpointIntegrationType,
            };
        }
        const integrationUri = this.mapperUtils.extractStringOrJsonStringOrEmptyString(method.Properties.Integration?.Uri);
        if (this.stringUtils.isBlankString(integrationUri)) {
            return {
                ...baseEndpoint,
                endpointIntegrationType,
            };
        }

        const handler = this.getHandler(endpointIntegrationType);
        const mappedByIntegrationType = handler?.handle(method) ?? {};
        const jsonReqTemplate = this.getRequestTemplateForMethod(method, stageVars);
        const requestTemplates = { [JsonMimeType]: jsonReqTemplate };
        const integrationServiceName = this.getIntegrationServiceName(mappedByIntegrationType, jsonReqTemplate);

        return {
            ...baseEndpoint,
            ...mappedByIntegrationType,
            endpointIntegrationType,
            integrationServiceName,
            requestTemplates,
        };
    }

    private getIntegrationServiceName(mappedByIntegrationType: Partial<ApiGatewayEndpoint>, jsonReqTemplate: string): string {
        const serviceName = mappedByIntegrationType.integrationService;
        if (serviceName === 'lambda' && mappedByIntegrationType.integrationServiceAction?.includes(':lambda:')) {
            const regex = /(?:.*?\/functions\/)?((arn:aws:lambda:[^:]+:[^:]+:function:[^/]+)|([^/]+))(?:\/invocations)?$/;
            const match = mappedByIntegrationType.integrationServiceAction.match(regex);
            return match ? match[1] : mappedByIntegrationType.integrationServiceAction;
        } else {
            return this.getServiceNameFromReqTemplate(jsonReqTemplate, serviceName ?? '');
        }
    }

    private createBaseEndpoint(mapperInput: MapperInput<CloudFormationResource>, method: ApiGatewayMethodResource): ApiGatewayEndpoint {
        const endpointPath = this.buildEndpointPath(mapperInput, method);
        const endpointHttpMethod = this.mapperUtils.extractString(method.Properties.HttpMethod);
        const rawModel = this.getModel(mapperInput, method);
        const endpointModelSchema = this.mapperUtils.extractStringOrJsonStringOrEmptyString(rawModel?.Properties.Schema);
        return {
            endpointIntegrationType: '',
            integrationServiceAction: '',
            integrationService: '',
            integrationServiceActionType: '',
            requestTemplates: {},
            integrationServiceName: '',
            integrationServiceRegion: '',
            integrationServiceSubdomain: '',
            endpointPath: endpointPath,
            endpointHttpMethod: endpointHttpMethod,
            endpointModelSchema: endpointModelSchema,
        };
    }

    private getRequestTemplateForMethod(method: ApiGatewayMethodResource, stageVars: Record<string, string> | undefined): string {
        let jsonReqTemplate = '';
        const requestTemplates = method.Properties.Integration?.RequestTemplates;
        if (requestTemplates && Object.keys(requestTemplates).includes(JsonMimeType)) {
            const jsonTemplate = this.mapperUtils.extractStringOrJsonStringOrEmptyString(requestTemplates[JsonMimeType]);
            if (this.stringUtils.isValidNotBlankString(jsonTemplate)) {
                const resultTemplate = this.stringUtils.renderVelocityJsonString(jsonTemplate, stageVars); // returns empty string or valid JsonString
                if (this.stringUtils.isValidNotBlankString(jsonTemplate)) {
                    jsonReqTemplate = resultTemplate;
                }
            }
        }
        return jsonReqTemplate;
    }

    private getServiceNameFromReqTemplate(jsonReqTemplate: string, service: string): string {
        let serviceNameFromTemplates = '';
        if (jsonReqTemplate) {
            const jsonObj = JSON.parse(jsonReqTemplate) as object;
            let resultValue = '';
            const jsonPaths: Record<string, string> = {
                events: '$.Entries[*].EventBusName',
                dynamodb: '$.TableName',
                sqs: '$.QueueUrl',
                sns: '$.TopicArn',
                states: '$.stateMachineArn',
                s3: '$.Bucket',
            };
            if (this.stringUtils.isValidNotBlankString(jsonPaths[service])) {
                const result: unknown = JSONPath({ path: jsonPaths[service], json: jsonObj });
                if (Array.isArray(result) && result.length === 1) {
                    resultValue = this.mapperUtils.extractStringOrJsonStringOrEmptyString(result[0]);
                } else {
                    resultValue = this.mapperUtils.extractStringOrJsonStringOrEmptyString(result);
                }
            }
            serviceNameFromTemplates = resultValue;
        }
        return serviceNameFromTemplates;
    }

    private buildEndpointPath(mapperInput: MapperInput<CloudFormationResource>, method: ApiGatewayMethodResource) {
        // Get top Resource for current method with its Path Part
        const topResourceId = this.mapperUtils.extractString(method.Properties.ResourceId);

        const resourceById = mapperInput.ctx.getResourceByPhysicalId(topResourceId);
        if (resourceById.Type.toLowerCase() !== CfResourcesType.AWS_ApiGateway_Resource.toLowerCase()) {
            throw new Error('Found incorrect resource type');
        }

        const topResourceAsCommonResource = resourceById as ApiGatewayResourceResource;

        // Array that will collect all found resources path parts related to this method
        const resourcesForCurrentMethod: string[] = [];

        // Add the first part of the URL to the array (will be the last element in the path)
        const pathPart = this.mapperUtils.extractString(topResourceAsCommonResource.Properties.PathPart);
        resourcesForCurrentMethod.push(pathPart);

        // Take the ID of the next (previous path part) resource
        let parentResourceId = this.mapperUtils.extractStringOrJsonStringOrEmptyString(topResourceAsCommonResource.Properties.ParentId);
        // Go through all the resources until ParentId will be empty (last element of the path)
        while (parentResourceId.length > 0) {
            const topRes = mapperInput.ctx.getResourceByPhysicalId(parentResourceId);
            if (topRes.Type.toLowerCase() !== CfResourcesType.AWS_ApiGateway_Resource.toLowerCase()) {
                throw new Error('Found incorrect resource type');
            }
            const newTop = topRes as ApiGatewayResourceResource;
            resourcesForCurrentMethod.push(this.mapperUtils.extractStringOrJsonStringOrEmptyString(newTop.Properties.PathPart));
            parentResourceId = this.mapperUtils.extractStringOrJsonStringOrEmptyString(newTop.Properties.ParentId);
        }
        // As we started search from the top resource (last item in the path) we need to reverse array to get path from start
        resourcesForCurrentMethod.reverse();

        return resourcesForCurrentMethod.join('/');
    }

    private getModel(mapperInput: MapperInput<CloudFormationResource>, method: ApiGatewayMethodResource): ApiGatewayModelResource | undefined {
        if (method.Properties.RequestModels === undefined) {
            return undefined;
        }

        const requestModels = method.Properties.RequestModels;
        if (!Object.keys(requestModels).includes(JsonMimeType)) {
            // there is no app/json models
            return undefined;
        }

        const modelId = this.mapperUtils.extractStringOrJsonStringOrEmptyString(requestModels[JsonMimeType]); // should have id of the model

        if (mapperInput.ctx.isResourceIdInPhysicalIds(modelId)) {
            return mapperInput.ctx.getResourceByPhysicalId(modelId) as ApiGatewayModelResource;
        } else if (mapperInput.ctx.isResourceIdInLogicalIds(modelId)) {
            return mapperInput.ctx.getResourceByLogicalId(modelId) as ApiGatewayModelResource;
        } else {
            return undefined;
        }
    }
}
