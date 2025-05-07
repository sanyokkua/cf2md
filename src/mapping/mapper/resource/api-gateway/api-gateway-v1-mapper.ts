import { CfResourcesType } from '../../../../parsing';
import {
    ApiGatewayAuthorizerResource,
    ApiGatewayMethodResource,
    ApiGatewayRestApiResource,
    ApiGatewayStageResource,
    CloudFormationResource,
} from '../../../../parsing/types/cloudformation-model';
import { MapperInput } from '../../../types/mapping-model';
import { ApiGatewayEndpoint, ApiGatewayV1RestApi } from '../../../types/resources-model';
import { MapperUtil } from '../../../types/utils-model';
import { BaseResourceMapper } from '../base-mapper';
import { ApiGatewayV1EndpointMapper, AuthFields, StageFields } from './types';

export class ApiGatewayV1Mapper extends BaseResourceMapper {
    constructor(
        private readonly apiGatewayV1EndpointMapper: ApiGatewayV1EndpointMapper,
        mapperUtils: MapperUtil,
    ) {
        super(mapperUtils);
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
        const rawStage = mapperInput.ctx.findResource({
            resourceType: CfResourcesType.AWS_ApiGateway_Stage,
            filterFunction: (res) => {
                const typed = res as ApiGatewayStageResource;
                const stageParentRestApiId = this.mapperUtils.extractString(typed.Properties.RestApiId);
                return stageParentRestApiId === restApiPhysicalId;
            },
        }) as ApiGatewayStageResource | undefined;
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

    private getAuthInfo(mapperInput: MapperInput<CloudFormationResource>, restApiPhysicalId: string): AuthFields {
        const rawAuthorizer = mapperInput.ctx.findResource({
            resourceType: CfResourcesType.AWS_ApiGateway_Authorizer,
            filterFunction: (res) => {
                const typed = res as ApiGatewayAuthorizerResource;
                const authParentRestApiId = this.mapperUtils.extractString(typed.Properties.RestApiId);
                return authParentRestApiId === restApiPhysicalId;
            },
        }) as ApiGatewayAuthorizerResource | undefined;
        const authorizerName = this.mapperUtils.extractStringOrJsonStringOrEmptyString(rawAuthorizer?.Properties.Name);
        const authorizerType = this.mapperUtils.extractStringOrJsonStringOrEmptyString(rawAuthorizer?.Properties.Type);
        const authorizerUri = this.mapperUtils.extractStringOrJsonStringOrEmptyString(rawAuthorizer?.Properties.AuthorizerUri);

        return {
            authorizerName: authorizerName,
            authorizerType: authorizerType,
            authorizerUri: authorizerUri,
        };
    }

    private getEndpoints(
        mapperInput: MapperInput<CloudFormationResource>,
        restApiPhysicalId: string,
        stageVars?: Record<string, string>,
    ): ApiGatewayEndpoint[] {
        const methods = mapperInput.ctx.findResources({
            resourceType: CfResourcesType.AWS_ApiGateway_Method,
            filterFunction: (res) => {
                const typed = res as ApiGatewayMethodResource;
                const methodParentApiId = this.mapperUtils.extractString(typed.Properties.RestApiId);
                return methodParentApiId === restApiPhysicalId;
            },
        }) as ApiGatewayMethodResource[];

        const endpoints: ApiGatewayEndpoint[] = methods.map((method) => {
            return this.apiGatewayV1EndpointMapper.getEndpoint(mapperInput, method, stageVars);
        });
        return endpoints;
    }
}
