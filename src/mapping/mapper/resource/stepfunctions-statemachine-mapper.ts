import { ErrorUtils } from 'coreutilsts';
import log from 'loglevel';
import { StringUtils } from '../../../common';
import { CfResourcesType, UserProvidedParam } from '../../../parsing';
import { CloudFormationResource, StepFunctionsStateMachineResource } from '../../../parsing/types/cloudformation-model';
import { MapperInput } from '../../types/mapping-model';
import { StateMachineModel, StateMachineType } from '../../types/step-function/model';
import { StateMachineAsl, StateMachineAslState } from '../../types/step-function/state-machine';
import { MapperUtil } from '../../types/utils-model';
import { BaseResourceMapper } from './base-mapper';

export class StepFunctionMapper extends BaseResourceMapper {
    constructor(
        mapperUtils: MapperUtil,
        private readonly stringUtils: StringUtils,
        private readonly userParams: UserProvidedParam[],
    ) {
        super(mapperUtils);
    }

    protected override getMapperResourceType(): string {
        return CfResourcesType.AWS_StepFunctions_StateMachine;
    }

    private getTracingValue(tracing: string | undefined | null | boolean): string {
        if (tracing === undefined || tracing === null) {
            return 'Disabled';
        }
        if (typeof tracing === 'string') {
            const tracingValue = this.mapperUtils.extractStringOrDefault(tracing, 'false');
            if (tracingValue.toLowerCase() === 'true') {
                return 'Active';
            }
            return 'Disabled';
        }
        if (tracing) {
            return 'Active';
        }
        return 'Disabled';
    }

    private findResourceNameByArn(value: string, mapperInput: MapperInput<StepFunctionsStateMachineResource>) {
        const resourcesArn: Map<string, CloudFormationResource> = new Map<string, CloudFormationResource>();
        mapperInput.ctx.getResources().forEach((res) => {
            resourcesArn.set(res._arn ?? '', res);
        });
        if (resourcesArn.has(value)) {
            return resourcesArn.get(value)?._id ?? value;
        }
        return value;
    }

    private processStateARNsUpdate(currentState: StateMachineAslState, mapperInput: MapperInput<StepFunctionsStateMachineResource>) {
        if (currentState.Type === 'Task') {
            currentState.Resource = this.findResourceNameByArn(currentState.Resource, mapperInput);
            if (currentState.Parameters) {
                Object.keys(currentState.Parameters).forEach((key) => {
                    if (currentState.Parameters) {
                        currentState.Parameters[key] = this.findResourceNameByArn(String(currentState.Parameters[key]), mapperInput);
                    }
                });
            }
            return;
        }
        if (currentState.Type === 'Map') {
            Object.keys(currentState.Iterator.States).forEach((state) => {
                const s = currentState.Iterator.States[state];
                this.processStateARNsUpdate(s, mapperInput);
            });
        }
    }

    private replaceARNs(definitionModel: StateMachineAsl, mapperInput: MapperInput<StepFunctionsStateMachineResource>): StateMachineAsl {
        Object.keys(definitionModel.States).forEach((state) => {
            const currentState = definitionModel.States[state];
            this.processStateARNsUpdate(currentState, mapperInput);
        });
        return definitionModel;
    }

    protected mapResourceSpecificProps(mapperInput: MapperInput<StepFunctionsStateMachineResource>): StateMachineModel {
        const resource = mapperInput.resource;
        const stateMachineName = this.mapperUtils.extractStringOrDefault(
            resource.Properties.StateMachineName,
            this.mapperUtils.extractString(resource._id),
        );
        const stateMachineType: StateMachineType = this.mapperUtils.extractStringOrDefault(
            resource.Properties.StateMachineType,
            'STANDARD',
        ) as StateMachineType;
        const tracing = this.getTracingValue(resource.Properties.TracingConfiguration?.Enabled);

        let substitutions: Record<string, string> | undefined = undefined;
        if (resource.Properties.DefinitionSubstitutions) {
            substitutions = resource.Properties.DefinitionSubstitutions as Record<string, string>;
        }
        if (!substitutions) {
            substitutions = {};
        }
        const definitionString = this.mapperUtils.extractStringOrDefault(resource.Properties.DefinitionString, '');
        let definitionObj: Record<string, unknown> | undefined = undefined;
        if (resource.Properties.Definition) {
            definitionObj = resource.Properties.Definition as Record<string, unknown>;
        }
        let definition = definitionString;
        if (!definitionString && definitionObj) {
            try {
                definition = JSON.stringify(definitionObj);
            } catch (e) {
                const msg = ErrorUtils.extractErrorDetails(e);
                log.warn(msg);
            }
        }
        if (definition) {
            definition = this.stringUtils.replaceTemplateVariables(definition, substitutions);
            const customParams: Record<string, string> = {};
            this.userParams.forEach((param) => {
                customParams[param.paramKey] = String(param.paramValue);
            });
            definition = this.stringUtils.replaceTemplateVariables(definition, customParams);
        }
        let definitionModel: StateMachineAsl | undefined = undefined;
        if (definition) {
            try {
                definitionModel = JSON.parse(definition) as StateMachineAsl;
                definitionModel = this.replaceARNs(definitionModel, mapperInput);
                definition = JSON.stringify(definitionModel);
            } catch (e) {
                const msg = ErrorUtils.extractErrorDetails(e);
                log.warn(msg);
            }
        }
        let bucketName = '';
        let key = '';
        let version = '';
        if (resource.Properties.DefinitionS3Location) {
            bucketName = this.mapperUtils.extractStringOrDefault(resource.Properties.DefinitionS3Location.Bucket, '');
            key = this.mapperUtils.extractStringOrDefault(resource.Properties.DefinitionS3Location.Key, '');
            version = this.mapperUtils.extractStringOrDefault(resource.Properties.DefinitionS3Location.Version, '');
        }

        return {
            stateMachineName: stateMachineName,
            stateMachineType: stateMachineType,
            tracing: tracing,
            definitionString: definition,
            definitionSubstitutions: substitutions,
            definitionS3Location: {
                bucketName: bucketName,
                key: key,
                version: version,
            },
            stateMachineJsonModel: definitionModel,
        } as StateMachineModel;
    }
}
