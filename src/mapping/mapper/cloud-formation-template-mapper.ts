import {
    CloudFormationModel,
    CloudFormationModelConfig,
    CloudFormationModelFactory,
    KeyValueStringPair,
    ParameterModel,
} from '../types/cloudformation-model';
import { CloudFormationToModelMapper, MappingContext, ResourceMapperResolver } from '../types/mapping-model';
import { ResourceModel } from '../types/resources-model';
import { MapperUtil } from '../types/utils-model';

export class CloudFormationToModelMapperImpl implements CloudFormationToModelMapper {
    constructor(
        private readonly mapperUtils: MapperUtil,
        private readonly resourceMapperResolver: ResourceMapperResolver,
        private readonly cloudFormationModelFactory: CloudFormationModelFactory,
    ) {}

    mapCloudFormationToModel(mappingContext: MappingContext): CloudFormationModel {
        const resources = this.mapResources(mappingContext);
        const awsTemplateFormatVersion = this.mapAwsTemplateFormatVersion(mappingContext);
        const description = this.mapDescription(mappingContext);
        const parameters = this.mapParameters(mappingContext);
        const outputs = this.mapOutputs(mappingContext);
        const mappings = this.mapMappings(mappingContext);
        const conditions = this.mapConditions(mappingContext);
        const metadata = this.mapMetadata(mappingContext);

        const props: CloudFormationModelConfig = {
            resources: resources,
            awsTemplateFormatVersion: awsTemplateFormatVersion,
            description: description,
            parameters: parameters,
            outputs: outputs,
            mappings: mappings,
            conditions: conditions,
            metadata: metadata,
        };

        return this.cloudFormationModelFactory.createCloudFormationModel(props);
    }

    private mapResources(mappingContext: MappingContext): ResourceModel[] {
        const resultMap: ResourceModel[] = [];
        const resources = mappingContext.originalTemplate.Resources;
        Object.keys(resources).forEach((logicalId) => {
            const resource = resources[logicalId];
            const mapper = this.resourceMapperResolver.getResourceMapper(resource.Type);
            const resModel = mapper.mapResource({ resource: resource, logicalId: logicalId, ctx: mappingContext });
            resultMap.push(resModel);
        });
        return resultMap;
    }

    private mapAwsTemplateFormatVersion(mappingContext: MappingContext): string {
        return this.mapperUtils.extractStringOrDefault(mappingContext.originalTemplate.AWSTemplateFormatVersion, '');
    }

    private mapDescription(mappingContext: MappingContext): string {
        return this.mapperUtils.extractStringOrDefault(mappingContext.originalTemplate.Description, '');
    }

    private mapParameters(mappingContext: MappingContext): ParameterModel[] {
        const parameters = mappingContext.originalTemplate.Parameters;
        if (!parameters) {
            return [];
        }
        const resultParameters: ParameterModel[] = [];
        Object.keys(parameters).forEach((parameterName) => {
            const parameter = parameters[parameterName];
            resultParameters.push({
                paramName: parameterName,
                allowedPattern: this.mapperUtils.extractStringOrDefault(parameter.AllowedPattern, ''),
                allowedValues: this.mapperUtils.extractStringOrDefault(parameter.AllowedValues, ''),
                defaultValue: this.mapperUtils.extractStringOrDefault(parameter.Default, ''),
                description: this.mapperUtils.extractStringOrDefault(parameter.Description, ''),
                type: this.mapperUtils.extractStringOrDefault(parameter.Type, ''),
            });
        });
        return resultParameters;
    }

    private mapOutputs(mappingContext: MappingContext): string {
        return this.mapperUtils.extractStringOrDefault(mappingContext.originalTemplate.Outputs, '');
    }

    private mapMappings(mappingContext: MappingContext): KeyValueStringPair[] {
        const mappings = mappingContext.originalTemplate.Mappings;
        if (!mappings) {
            return [];
        }
        const resultMap: Set<KeyValueStringPair> = new Set();
        Object.keys(mappings).forEach((mapName) => {
            const mapped = mappings[mapName];
            Object.keys(mapped).forEach((lev1) => {
                const mappedLev1 = mapped[lev1];
                Object.keys(mappedLev1).forEach((lev2) => {
                    const mappedLev2 = mappedLev1[lev2];
                    resultMap.add({
                        key: `${mapName}.${lev1}.${lev2}`,
                        value: this.mapperUtils.extractStringOrDefault(mappedLev2, ''),
                    });
                });
            });
        });
        return [...resultMap.values()];
    }

    private mapConditions(mappingContext: MappingContext): KeyValueStringPair[] {
        const conditions = mappingContext.originalTemplate.Conditions;
        if (!conditions) {
            return [];
        }
        const resultMap: Set<KeyValueStringPair> = new Set<KeyValueStringPair>();
        Object.keys(conditions).forEach((conditionName) => {
            const condition = conditions[conditionName];
            resultMap.add({
                key: conditionName,
                value: this.mapperUtils.extractStringOrDefault(condition, ''),
            });
        });
        return [...resultMap.values()];
    }

    private mapMetadata(mappingContext: MappingContext): string {
        return this.mapperUtils.extractStringOrJsonStringOrEmptyString(mappingContext.originalTemplate.Metadata);
    }
}
