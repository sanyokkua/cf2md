import { CloudFormationResource, CloudFormationTemplate } from '../../parsing/types/cloudformation-model';
import { CloudFormationModel } from './cloudformation-model';
import { ResourceModel } from './resources-model';

export type StringToResource = Map<string, CloudFormationResource>;
export type StringToResources = Map<string, Set<CloudFormationResource>>;

export interface MappingContext {
    originalTemplate: CloudFormationTemplate;
    mappedResourcesByPhysicalId: StringToResource;
    mappedResourcesByLogicalId: StringToResource;
    mappedByResourceType: StringToResources;
    mappedStubs: StringToResource;

    getResourceByPhysicalId(id: string): CloudFormationResource;
    getResourceByLogicalId(id: string): CloudFormationResource;
    getResourcesByType(typeName: string): CloudFormationResource[];
    getResources(): CloudFormationResource[];
    getResourceStub(stubId: string): CloudFormationResource;

    isResourceIdInPhysicalIds(id: string): boolean;
    isResourceIdInLogicalIds(id: string): boolean;
    isResourceTypeExists(resourceType: string): boolean;
    isResourceStub(id: string): boolean;
}

export type MapperInput<I extends CloudFormationResource> = {
    resource: I;
    logicalId: string;
    ctx: MappingContext;
};

export interface ResourceMapper {
    mapResource: (mapperInput: MapperInput<CloudFormationResource>) => ResourceModel;
}

export interface ResourceMapperResolver {
    getResourceMapper(resourceType: string): ResourceMapper;
}

export interface CloudFormationToModelMapper {
    mapCloudFormationToModel(mappingContext: MappingContext): CloudFormationModel;
}

export type MappedResources = {
    mappedResourcesByPhysicalId: StringToResource;
    mappedResourcesByLogicalId: StringToResource;
    mappedByResourceType: StringToResources;
    mappedStubs: StringToResource;
};

export interface MappedResourcesFactory {
    createMappedResources(cft: CloudFormationTemplate): MappedResources;
}
