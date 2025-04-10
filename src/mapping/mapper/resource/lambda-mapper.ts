import { StringKeyValueObject } from '../../../common';
import { LambdaFunctionResource } from '../../../parsing/types/cloudformation-model';

import { CfResourcesType } from '../../../parsing';
import { MapperInput } from '../../types/mapping-model';
import { LambdaFunctionModel } from '../../types/resources-model';
import { BaseResourceMapper } from './base-mapper';

enum LambdaDefaults {
    LambdaArch = 'LambdaArch',
    EphemeralStorage = 'EphemeralStorage',
    MemorySize = 'MemorySize',
    Timeout = 'Timeout',
    TracingConfig = 'TracingConfig',
}

export class LambdaMapper extends BaseResourceMapper {
    protected override getMapperResourceType(): string {
        return CfResourcesType.AWS_Lambda_Function;
    }

    protected override getDefaultMappings(): StringKeyValueObject {
        return {
            [LambdaDefaults.LambdaArch]: 'x86_64',
            [LambdaDefaults.EphemeralStorage]: '512',
            [LambdaDefaults.MemorySize]: '128',
            [LambdaDefaults.Timeout]: '3',
            [LambdaDefaults.TracingConfig]: 'PassThrough',
        } as StringKeyValueObject;
    }

    protected mapResourceSpecificProps(mapperInput: MapperInput<LambdaFunctionResource>): LambdaFunctionModel {
        const { resource } = mapperInput;
        const architectureNode = resource.Properties.Architectures;
        const ephemeralSizeNode = resource.Properties.EphemeralStorage?.Size;
        const tracingModeNode = resource.Properties.TracingConfig?.Mode;
        const timeoutNode = resource.Properties.Timeout;
        const ramMemoryNode = resource.Properties.MemorySize;
        const envVarNode = resource.Properties.Environment?.Variables;

        const functionName = this.mapperUtils.extractString(resource._id); // Lambda PhysicalID == LambdaName
        const architectures =
            architectureNode && architectureNode.length > 0
                ? architectureNode.map((val) => this.mapperUtils.extractString(val))
                : [this.getDefaultValue(LambdaDefaults.LambdaArch)];

        const ephemeralStorage = this.getOrDefault(ephemeralSizeNode, LambdaDefaults.EphemeralStorage);
        const tracingConfig = this.getOrDefault(tracingModeNode, LambdaDefaults.TracingConfig);
        const timeout = this.getOrDefault(timeoutNode, LambdaDefaults.Timeout);
        const memorySize = this.getOrDefault(ramMemoryNode, LambdaDefaults.MemorySize);
        const environmentVars = new Map<string, string>();

        if (envVarNode && typeof envVarNode === 'object') {
            Object.keys(envVarNode).forEach((key: string) => {
                const variable = (envVarNode as unknown as Record<string, unknown>)[key];
                const value = this.mapperUtils.extractString(variable);
                environmentVars.set(key, value);
            });
        }

        return {
            architectures,
            functionName,
            memorySize,
            environmentVars,
            timeout,
            tracingConfig,
            ephemeralStorage,
        } as LambdaFunctionModel;
    }
}
