import { CloudFormationResource } from '../../../parsing/types/cloudformation-model';

import { StringKeyValueObject } from '../../../common';
import { MapperInput, ResourceMapper } from '../../types/mapping-model';
import { ResourceModel } from '../../types/resources-model';
import { MapperUtil } from '../../types/utils-model';

export abstract class BaseResourceMapper implements ResourceMapper {
    constructor(protected readonly mapperUtils: MapperUtil) {}

    protected validate(): boolean {
        return true;
    }

    mapResource(input: MapperInput<CloudFormationResource>): ResourceModel {
        if (this.validate() && input.resource.Type.toLowerCase() !== this.getMapperResourceType().toLowerCase()) {
            throw new Error('Mapper called for incorrect resource type');
        }
        const mappedResource = this.mapResourceSpecificProps(input);
        const result = this.mapCommonProperties(input, mappedResource);
        return result;
    }

    protected mapCommonProperties(mapperInput: MapperInput<CloudFormationResource>, mappedResource: ResourceModel): ResourceModel {
        const { resource, logicalId } = mapperInput;
        const physicalId: string = this.mapperUtils.extractString(resource._id);
        const resourceArn: string = this.mapperUtils.extractString(resource._arn);
        const creationPolicy: string = this.mapperUtils.extractStringOrJsonStringOrEmptyString(resource.CreationPolicy);
        const deletionPolicy: string = this.mapperUtils.extractStringOrJsonStringOrEmptyString(resource.DeletionPolicy);
        const dependsOn: string = this.mapperUtils.extractStringOrJsonStringOrEmptyString(resource.DependsOn);
        const updatePolicy: string = this.mapperUtils.extractStringOrJsonStringOrEmptyString(resource.UpdatePolicy);
        const updateReplacePolicy: string = this.mapperUtils.extractStringOrJsonStringOrEmptyString(resource.UpdateReplacePolicy);

        mappedResource.logicalId = logicalId;
        mappedResource.physicalId = physicalId;
        mappedResource.resourceArn = resourceArn;
        mappedResource.resourceType = resource.Type;
        mappedResource.creationPolicy = creationPolicy;
        mappedResource.deletionPolicy = deletionPolicy;
        mappedResource.dependsOn = dependsOn;
        mappedResource.updatePolicy = updatePolicy;
        mappedResource.updateReplacePolicy = updateReplacePolicy;

        return mappedResource;
    }

    protected getDefaultMappings(): StringKeyValueObject {
        return {};
    }

    protected getDefaultValue(key: string): string {
        const defaultMappings = this.getDefaultMappings();
        return defaultMappings[key];
    }

    protected getOrDefault(input: unknown, defaultValueKey: string): string {
        return this.mapperUtils.extractStringOrDefaultFromMap(input, defaultValueKey, this.getDefaultMappings());
    }

    protected abstract mapResourceSpecificProps(mapperInput: MapperInput<CloudFormationResource>): ResourceModel;

    protected abstract getMapperResourceType(): string;
}
