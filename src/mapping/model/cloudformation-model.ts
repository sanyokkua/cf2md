import { CloudFormationModel, CloudFormationModelConfig, KeyValueStringPair, ParameterModel } from '../types/cloudformation-model';
import { ResourceModel } from '../types/resources-model';

export class CloudformationModelImpl implements CloudFormationModel {
    private readonly resources: ResourceModel[];
    private readonly awsTemplateFormatVersion?: string;
    private readonly description?: string;
    private readonly parameters?: ParameterModel[];
    private readonly outputs?: string;
    private readonly mappings?: KeyValueStringPair[];
    private readonly conditions?: KeyValueStringPair[];
    private readonly metadata?: string;

    constructor(props: CloudFormationModelConfig) {
        const { resources, awsTemplateFormatVersion, description, parameters, outputs, mappings, conditions, metadata } = props;
        this.resources = resources;
        this.awsTemplateFormatVersion = awsTemplateFormatVersion;
        this.description = description;
        this.parameters = parameters;
        this.outputs = outputs;
        this.mappings = mappings;
        this.conditions = conditions;
        this.metadata = metadata;
    }

    getResources(type?: string): readonly ResourceModel[] {
        if (!type) {
            return this.resources;
        }
        return this.resources.filter((resource: ResourceModel) => type.toLowerCase() === resource.resourceType.toLowerCase());
    }

    getResourcesCount(type?: string): readonly KeyValueStringPair[] {
        const map = new Map<string, ResourceModel[]>();
        this.resources.forEach((resource) => {
            if (map.has(resource.resourceType.toLowerCase())) {
                const newVar = map.get(resource.resourceType.toLowerCase());
                newVar?.push(resource);
            } else {
                map.set(resource.resourceType.toLowerCase(), [resource]);
            }
        });
        if (!type) {
            const resultList: KeyValueStringPair[] = [];
            map.forEach((value, key) => {
                resultList.push({ key: key, value: String(value.length) });
            });
            return resultList;
        }
        const newVar1 = map.get(type.toLowerCase());
        return [{ key: type, value: String(newVar1?.length ?? '0') }];
    }

    getAwsTemplateFormatVersion(defaultValue?: string): string {
        if (!defaultValue) {
            return this.awsTemplateFormatVersion ?? '';
        }
        return this.awsTemplateFormatVersion ?? defaultValue;
    }

    getDescription(defaultValue?: string): string {
        if (!defaultValue) {
            return this.description ?? '';
        }
        return this.description ?? defaultValue;
    }

    getParameters(): readonly ParameterModel[] {
        return this.parameters ?? [];
    }

    getOutputs(): string {
        return this.outputs ?? '';
    }

    getMappings(): readonly KeyValueStringPair[] {
        return this.mappings ?? [];
    }

    getConditions(): readonly KeyValueStringPair[] {
        return this.conditions ?? [];
    }

    getMetadata(): string {
        return this.metadata ?? '';
    }
}
