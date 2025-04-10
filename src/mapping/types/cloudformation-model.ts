import { ResourceModel } from './resources-model';

export type KeyValueStringPair = {
    key: string;
    value: string;
};

export type ParameterModel = {
    paramName: string;
    type: string;
    defaultValue?: string;
    description?: string;
    allowedValues?: string;
    allowedPattern?: string;
};

export interface CloudFormationModel {
    getResources(type?: string): readonly ResourceModel[];
    getResourcesCount(type?: string): readonly KeyValueStringPair[];
    getAwsTemplateFormatVersion(defaultValue?: string): string;
    getDescription(defaultValue?: string): string;
    getParameters(): readonly ParameterModel[];
    getOutputs(): string; // JsonString
    getMappings(): readonly KeyValueStringPair[];
    getConditions(): readonly KeyValueStringPair[];
    getMetadata(): string; // String | JsonString
}

export type CloudFormationModelConfig = {
    resources: ResourceModel[];
    awsTemplateFormatVersion?: string;
    description?: string;
    parameters?: ParameterModel[];
    outputs?: string; // JsonString
    mappings?: KeyValueStringPair[];
    conditions?: KeyValueStringPair[];
    metadata?: string; // JsonString
};

export interface CloudFormationModelFactory {
    createCloudFormationModel(config: CloudFormationModelConfig): CloudFormationModel;
}
