import { StringUtils } from '../../common';
import { CloudFormationTemplate } from '../../parsing/types/cloudformation-model';
import { MappingContextImpl } from '../context/mapping-context';
import { CloudFormationToModelMapperImpl } from '../mapper/cloud-formation-template-mapper';
import { MappedResourcesFactoryImpl } from '../mapper/mapped-resources-factory';
import { CloudFormationModel, CloudFormationModelFactory } from '../types/cloudformation-model';
import { Mapper } from '../types/mapper-api';
import { ResourceMapperResolver } from '../types/mapping-model';
import { MapperUtil } from '../types/utils-model';

export class CloudFormationMapperFacade implements Mapper {
    constructor(
        private readonly mapperUtils: MapperUtil,
        private readonly stringUtils: StringUtils,
        private readonly resourceMapperResolver: ResourceMapperResolver,
        private readonly cloudFormationModelFactory: CloudFormationModelFactory,
    ) {}

    mapTemplate(template: CloudFormationTemplate): CloudFormationModel {
        // 1. Create mapped resources
        const mappedResourcesFactory = new MappedResourcesFactoryImpl(this.stringUtils, this.mapperUtils);
        const mappedResources = mappedResourcesFactory.createMappedResources(template);

        // 2. Build mapping context from original template and mapped resources.
        const mappingContext = new MappingContextImpl(template, mappedResources);

        // 3. Map to CloudFormationModel using the mapper implementation.
        const cfnMapper = new CloudFormationToModelMapperImpl(this.mapperUtils, this.resourceMapperResolver, this.cloudFormationModelFactory);
        return cfnMapper.mapCloudFormationToModel(mappingContext);
    }
}
