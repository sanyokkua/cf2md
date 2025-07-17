import { CfResourcesType } from '../../../parsing';
import { CloudFormationResource, PipesPipeResource } from '../../../parsing/types/cloudformation-model';
import { MapperInput } from '../../types/mapping-model';
import { PipesPipeModel } from '../../types/pipes/model';
import { BaseResourceMapper } from './base-mapper';

export class PipesPipeModelMapper extends BaseResourceMapper {
    protected override getMapperResourceType(): string {
        return CfResourcesType.AWS_Pipes_Pipe;
    }

    protected mapResourceSpecificProps(mapperInput: MapperInput<PipesPipeResource>): PipesPipeModel {
        const resource = mapperInput.resource;
        const pipeName = this.mapperUtils.extractString(resource._id);

        const description = this.mapperUtils.extractStringOrDefault(resource.Properties.Description, '');
        const desiredState = this.mapperUtils.extractStringOrDefault(resource.Properties.DesiredState, 'RUNNING');
        const enrichmentServiceArn = this.mapperUtils.extractStringOrDefault(resource.Properties.EnrichmentService, '');
        const sourceServiceArn = this.mapperUtils.extractString(resource.Properties.Source);
        const targetServiceArn = this.mapperUtils.extractString(resource.Properties.Target);

        const resourcesArn: Map<string, CloudFormationResource> = new Map<string, CloudFormationResource>();
        mapperInput.ctx.getResources().forEach((res) => {
            resourcesArn.set(res._arn ?? '', res);
        });

        let enrichmentService = enrichmentServiceArn;
        if (resourcesArn.has(enrichmentServiceArn)) {
            enrichmentService = resourcesArn.get(enrichmentServiceArn)?._id || enrichmentService;
        }
        let sourceService = sourceServiceArn;
        if (resourcesArn.has(sourceServiceArn)) {
            sourceService = resourcesArn.get(sourceServiceArn)?._id || sourceService;
        }
        let targetService = targetServiceArn;
        if (resourcesArn.has(targetServiceArn)) {
            targetService = resourcesArn.get(targetServiceArn)?._id || targetService;
        }
        return {
            pipeName: pipeName,
            description: description,
            desiredState: desiredState,
            enrichmentService: enrichmentService,
            sourceService: sourceService,
            targetService: targetService,
        } as PipesPipeModel;
    }
}
