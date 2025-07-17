import { BaseResource } from '../resources-model';
import { StateMachineAsl } from './state-machine';

export type StateMachineType = 'STANDARD' | 'EXPRESS';

export interface StateMachineModel extends BaseResource {
    stateMachineName: string;
    stateMachineType: StateMachineType;
    tracing: string;

    definitionString: string;
    definitionSubstitutions: Record<string, string>; // Variables can be template parameter names, resource logical IDs, resource attributes, or a variable in a key-value map.
    definitionS3Location: {
        bucketName: string;
        key: string;
        version?: string;
    };
    stateMachineJsonModel?: StateMachineAsl;
}
