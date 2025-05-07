import { StringUtils } from '../../../../common';
import { CfResourcesType } from '../../../../parsing';
import {
    ApiGatewayMethodResource,
    ApiGatewayModelResource,
    ApiGatewayResourceResource,
    CloudFormationResource,
} from '../../../../parsing/types/cloudformation-model';
import { MapperInput } from '../../../types/mapping-model';
import { ApiGatewayEndpoint } from '../../../types/resources-model';
import { MapperUtil } from '../../../types/utils-model';
import { ApiGatewayV1EndpointMapper, IntegrationServiceMapper, IntegrationV1HandlerResolver, JsonMimeType } from './types';

export class ApiGatewayV1EndpointMapperImpl implements ApiGatewayV1EndpointMapper {
    constructor(
        private readonly mapperUtils: MapperUtil,
        private readonly stringUtils: StringUtils,
        private readonly resolver: IntegrationV1HandlerResolver,
        private readonly integrationServiceMapper: IntegrationServiceMapper,
    ) {}

    getEndpoint(
        mapperInput: MapperInput<CloudFormationResource>,
        method: ApiGatewayMethodResource,
        stageVars: Record<string, string> | undefined,
    ): ApiGatewayEndpoint {
        const baseEndpoint = this.createBaseEndpoint(mapperInput, method);

        // AWS | AWS_PROXY | HTTP | HTTP_PROXY | MOCK
        const endpointIntegrationType = this.mapperUtils.extractStringOrJsonStringOrEmptyString(method.Properties.Integration?.Type);
        const handler = this.resolver.getHandler(endpointIntegrationType);
        const mappedEndpointPartByIntegrationType = handler.handle(method);

        const jsonReqTemplate = this.getRequestTemplateForMethod(method, stageVars);
        const requestTemplates = { [JsonMimeType]: jsonReqTemplate }; // Support only Json
        const integrationServiceName = this.integrationServiceMapper.mapServiceName(
            jsonReqTemplate,
            mappedEndpointPartByIntegrationType.integrationService ?? '',
            mappedEndpointPartByIntegrationType.integrationServiceAction ?? '',
        );

        return {
            ...baseEndpoint,
            ...mappedEndpointPartByIntegrationType,
            endpointIntegrationType,
            requestTemplates,
            integrationServiceName,
        };
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
                if (this.stringUtils.isValidNotBlankString(resultTemplate)) {
                    jsonReqTemplate = resultTemplate;
                }
            }
        }
        return jsonReqTemplate;
    }

    private buildEndpointPath(mapperInput: MapperInput<CloudFormationResource>, method: ApiGatewayMethodResource) {
        // Get top Resource for current method with its Path Part
        const topResourceId = this.mapperUtils.extractString(method.Properties.ResourceId);
        const topResource = mapperInput.ctx.getResourceByPhysicalId(topResourceId, CfResourcesType.AWS_ApiGateway_Resource);
        const topResourceTyped = topResource as ApiGatewayResourceResource;

        // Array that will collect all found resources path parts related to this method
        const resourcesForCurrentMethod: string[] = [];

        // Add the first part of the URL to the array (will be the last element in the path)
        const pathPart = this.mapperUtils.extractString(topResourceTyped.Properties.PathPart);
        resourcesForCurrentMethod.push(pathPart);

        // Take the ID of the next (previous path part) resource
        let parentResourceId = this.mapperUtils.extractStringOrJsonStringOrEmptyString(topResourceTyped.Properties.ParentId);
        // Go through all the resources until ParentId will be empty (last element of the path)
        while (this.stringUtils.isValidNotBlankString(parentResourceId)) {
            const topRes = mapperInput.ctx.getResourceByPhysicalId(parentResourceId, CfResourcesType.AWS_ApiGateway_Resource);
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

        // Model ID can be model name, what is LogicalID, but in theory can be a physical id
        const modelId = this.mapperUtils.extractStringOrJsonStringOrEmptyString(requestModels[JsonMimeType]); // should have id of the model

        if (mapperInput.ctx.isResourceIdInLogicalIds(modelId)) {
            return mapperInput.ctx.getResourceByLogicalId(modelId) as ApiGatewayModelResource;
        } else if (mapperInput.ctx.isResourceIdInPhysicalIds(modelId)) {
            return mapperInput.ctx.getResourceByPhysicalId(modelId) as ApiGatewayModelResource;
        } else {
            return undefined;
        }
    }
}
