import { BaseResource } from '../resources-model';

export interface LambdaFunctionModel extends BaseResource {
    functionName?: string;
    architectures?: string[];
    environmentVars?: Map<string, string>;
    memorySize?: string;
    timeout?: string;
    tracingConfig?: string;
    ephemeralStorage: string;
}
