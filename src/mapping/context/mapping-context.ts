import { CloudFormationResource, CloudFormationTemplate } from '../../parsing/types/cloudformation-model';
import { MappedResources, MappingContext, StringToResource, StringToResources } from '../types/mapping-model';

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

    getResourceByPhysicalId(id: string): CloudFormationResource {
        if (this.mappedStubs.has(id)) {
            return this.mappedStubs.get(id) as CloudFormationResource;
        }
        if (!this.mappedResourcesByPhysicalId.has(id)) {
            throw new Error("Resource with physicalId '" + id + "' not found");
        }
        return this.mappedResourcesByPhysicalId.get(id) as CloudFormationResource;
    }

    getResourceByLogicalId(id: string): CloudFormationResource {
        if (this.mappedStubs.has(id)) {
            return this.mappedStubs.get(id) as CloudFormationResource;
        }
        if (!this.mappedResourcesByLogicalId.has(id)) {
            throw new Error("Resource with logicalId '" + id + "' not found");
        }
        return this.mappedResourcesByLogicalId.get(id) as CloudFormationResource;
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
}
