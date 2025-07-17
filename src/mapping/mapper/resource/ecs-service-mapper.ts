import { CfResourcesType } from '../../../parsing';
import { EcsServiceResource } from '../../../parsing/types/cloudformation-model';
import { EcsServiceModel } from '../../types/ecs/service-model';
import { MapperInput } from '../../types/mapping-model';
import { BaseResourceMapper } from './base-mapper';

export class EcsServiceModelMapper extends BaseResourceMapper {
    protected override getMapperResourceType(): string {
        return CfResourcesType.AWS_ECS_Service;
    }

    protected mapResourceSpecificProps(mapperInput: MapperInput<EcsServiceResource>): EcsServiceModel {
        const resource = mapperInput.resource;
        const serviceName = this.mapperUtils.extractString(resource._id);
        const clusterName = this.mapperUtils.extractStringOrDefault(resource.Properties.Cluster, '');
        const launchType = this.mapperUtils.extractStringOrDefault(resource.Properties.LaunchType, 'EC2');
        const desiredCount = resource.Properties.DesiredCount ? String(resource.Properties.DesiredCount) : '1';
        const platformVersion = this.mapperUtils.extractStringOrDefault(resource.Properties.PlatformVersion, 'LATEST');
        const taskDefinition = this.mapperUtils.extractStringOrDefault(resource.Properties.TaskDefinition, '');

        return {
            serviceName: serviceName,
            cluster: clusterName,
            launchType: launchType,
            desiredCount: desiredCount,
            platformVersion: platformVersion,
            taskDefinition: taskDefinition,
        } as EcsServiceModel;
    }
}
