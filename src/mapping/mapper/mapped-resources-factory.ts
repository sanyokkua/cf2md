import { StringUtils } from '../../common';
import { CfResourcesType } from '../../parsing';
import { CloudFormationResource, CloudFormationTemplate } from '../../parsing/types/cloudformation-model';
import { MappedResources, MappedResourcesFactory, StringToResource, StringToResources } from '../types/mapping-model';
import { MapperUtil } from '../types/utils-model';

export class MappedResourcesFactoryImpl implements MappedResourcesFactory {
    constructor(
        private readonly stringUtils: StringUtils,
        private readonly mapperUtils: MapperUtil,
    ) {}

    createMappedResources(cft: CloudFormationTemplate): MappedResources {
        const mappedResourcesByPhysicalId: StringToResource = new Map<string, CloudFormationResource>();
        const mappedResourcesByLogicalId: StringToResource = new Map<string, CloudFormationResource>();
        const mappedByResourceType: StringToResources = new Map<string, Set<CloudFormationResource>>();
        const mappedStubs: StringToResource = new Map<string, CloudFormationResource>();

        const resourcesLogicalIds = Object.keys(cft.Resources);
        resourcesLogicalIds.forEach((logicalId: string) => {
            if (this.stringUtils.isBlankString(logicalId)) {
                throw new Error(`Invalid logical id. It can't be blank string.`);
            }
            const resource = cft.Resources[logicalId];
            const physicalId = this.mapperUtils.extractString(resource._id);
            const resourceType = this.mapperUtils.extractString(resource.Type);

            mappedResourcesByLogicalId.set(logicalId, resource); // LogicalID is always unique

            if (!mappedResourcesByPhysicalId.has(physicalId)) {
                mappedResourcesByPhysicalId.set(physicalId, resource); // Probably mocking physicalId created duplicate
            } else {
                throw new Error("Resource with physicalId '" + physicalId + "' already exists");
            }

            if (!mappedByResourceType.has(resourceType)) {
                mappedByResourceType.set(resourceType, new Set<CloudFormationResource>());
            }
            if (mappedByResourceType.has(resourceType)) {
                const resourcesSet = mappedByResourceType.get(resourceType);
                resourcesSet?.add(resource);
            }
        });

        const rootResources: CloudFormationResource = {
            Type: CfResourcesType.AWS_ApiGateway_Resource,
            Properties: {
                ParentId: '',
                PathPart: '',
                RestApiId: '',
            },
        } as CloudFormationResource;
        mappedStubs.set('STUB_RootResourceId', rootResources);
        return {
            mappedResourcesByPhysicalId,
            mappedResourcesByLogicalId,
            mappedByResourceType,
            mappedStubs,
        } as MappedResources;
    }
}
