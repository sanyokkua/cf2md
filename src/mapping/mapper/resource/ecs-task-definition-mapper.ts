// ECSTaskDefinitionResource

import { CfResourcesType } from '../../../parsing';
import { ECSTaskDefinitionResource } from '../../../parsing/types/cloudformation-model';
import { Container, TaskDefinitionModel } from '../../types/ecs/task-model';
import { MapperInput } from '../../types/mapping-model';
import { BaseResourceMapper } from './base-mapper';

export class TaskDefinitionModelMapper extends BaseResourceMapper {
    protected override getMapperResourceType(): string {
        return CfResourcesType.AWS_ECS_TaskDefinition;
    }

    protected mapResourceSpecificProps(mapperInput: MapperInput<ECSTaskDefinitionResource>): TaskDefinitionModel {
        const resource = mapperInput.resource;
        const containerDefinitions = (resource.Properties.ContainerDefinitions || []).map((container) => {
            const containerName = this.mapperUtils.extractString(container.Name);
            const image = this.mapperUtils.extractString(container.Image);
            const cpu = this.mapperUtils.extractStringOrDefault(container.Cpu, '');
            const memory = this.mapperUtils.extractStringOrDefault(container.Memory, '');
            return {
                containerName: containerName,
                cpu: cpu,
                image: image,
                memory: memory,
            } as Container;
        });
        const cpu = this.mapperUtils.extractStringOrDefault(resource.Properties.Cpu, '');
        const ephemeralStorageSize = resource.Properties.EphemeralStorage?.SizeInGiB ? String(resource.Properties.EphemeralStorage.SizeInGiB) : '';
        const family = this.mapperUtils.extractStringOrDefault(resource.Properties.Family, '');
        const memory = this.mapperUtils.extractStringOrDefault(resource.Properties.Memory, '21GiB');
        const cpuArch = this.mapperUtils.extractStringOrDefault(resource.Properties.RuntimePlatform?.CpuArchitecture, 'X86_64');
        const os = this.mapperUtils.extractStringOrDefault(resource.Properties.RuntimePlatform?.OperatingSystemFamily, 'LINUX');
        return {
            containerDefinitions: containerDefinitions,
            cpu: cpu,
            ephemeralStorageSize: ephemeralStorageSize,
            family: family,
            memory: memory,
            runtimePlatform: {
                cpuArchitecture: cpuArch,
                operatingSystemFamily: os,
            },
        } as TaskDefinitionModel;
    }
}
