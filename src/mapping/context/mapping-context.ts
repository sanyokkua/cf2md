import { CloudFormationResource, CloudFormationTemplate } from '../../parsing/types/cloudformation-model';
import { MappedResources, MappingContext, ResourceFilterCondition, StringToResource, StringToResources } from '../types/mapping-model';

type ResourceIdType = 'physicalId' | 'logicalId';

export class MappingContextImpl implements MappingContext {
    originalTemplate: CloudFormationTemplate;
    mappedResourcesByPhysicalId: StringToResource;
    mappedResourcesByLogicalId: StringToResource;
    mappedByResourceType: StringToResources;
    mappedStubs: StringToResource;

    constructor(originalTemplate: CloudFormationTemplate, mappedResources: MappedResources) {
        this.originalTemplate = originalTemplate;
        this.mappedResourcesByPhysicalId = mappedResources.mappedResourcesByPhysicalId;
        this.mappedResourcesByLogicalId = mappedResources.mappedResourcesByLogicalId;
        this.mappedByResourceType = mappedResources.mappedByResourceType;
        this.mappedStubs = mappedResources.mappedStubs;
    }

    private validateType(resource: CloudFormationResource, expectedType?: string) {
        if (expectedType && resource.Type !== expectedType) {
            throw new Error(`Expected type is ${expectedType} and resource has type: ${resource.Type}`);
        }
    }

    private getResourceFromMap(
        resourceMap: StringToResource,
        id: string,
        resourceIdType: ResourceIdType,
        expectedType?: string,
    ): CloudFormationResource {
        // Check before for stubs
        if (this.mappedStubs.has(id)) {
            return this.mappedStubs.get(id) as CloudFormationResource;
        }
        if (!resourceMap.has(id)) {
            throw new Error(`Resource with ${resourceIdType} '${id}' not found`);
        }
        const resource = resourceMap.get(id) as CloudFormationResource;
        this.validateType(resource, expectedType);
        return resource;
    }

    getResourceByPhysicalId(id: string, expectedType?: string): CloudFormationResource {
        return this.getResourceFromMap(this.mappedResourcesByPhysicalId, id, 'physicalId', expectedType);
    }

    getResourceByLogicalId(id: string, expectedType?: string): CloudFormationResource {
        return this.getResourceFromMap(this.mappedResourcesByLogicalId, id, 'logicalId', expectedType);
    }

    getResourcesByType(typeName: string): CloudFormationResource[] {
        if (!this.mappedByResourceType.has(typeName)) {
            throw new Error("Resources with type '" + typeName + "' not found");
        }
        const setOfValues = this.mappedByResourceType.get(typeName);

        if (!setOfValues) {
            return [];
        }
        return [...setOfValues.values()];
    }

    getResourceStub(stubId: string): CloudFormationResource {
        if (!this.mappedStubs.has(stubId)) {
            throw new Error("Resource with stub '" + stubId + "' not found");
        }
        return this.mappedStubs.get(stubId) as CloudFormationResource;
    }

    getResources(): CloudFormationResource[] {
        return Object.values(this.originalTemplate.Resources).map((res) => res);
    }

    isResourceIdInPhysicalIds(id: string): boolean {
        return this.mappedResourcesByPhysicalId.has(id);
    }

    isResourceIdInLogicalIds(id: string): boolean {
        return this.mappedResourcesByLogicalId.has(id);
    }

    isResourceTypeExists(resourceType: string): boolean {
        return this.mappedByResourceType.has(resourceType);
    }

    isResourceStub(id: string): boolean {
        return this.mappedStubs.has(id);
    }

    findResource(filterCondition: ResourceFilterCondition): CloudFormationResource | undefined {
        if (filterCondition.resourceType && !this.isResourceTypeExists(filterCondition.resourceType)) {
            return undefined;
        }
        const resources = filterCondition.resourceType ? this.getResourcesByType(filterCondition.resourceType) : this.getResources();
        const foundResource = resources.find((resource) => filterCondition.filterFunction(resource));
        return foundResource;
    }

    findResources(filterCondition: ResourceFilterCondition): CloudFormationResource[] {
        if (filterCondition.resourceType && !this.isResourceTypeExists(filterCondition.resourceType)) {
            return [];
        }
        const resources = filterCondition.resourceType ? this.getResourcesByType(filterCondition.resourceType) : this.getResources();
        const foundResources = resources.filter((resource) => filterCondition.filterFunction(resource));
        return foundResources;
    }
}
