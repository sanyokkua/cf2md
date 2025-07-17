import { BaseResource } from '../resources-model';

export interface PipesPipeModel extends BaseResource {
    pipeName: string;
    description: string;
    desiredState: string; // default RUNNING | STOPPED
    enrichmentService: string; // ARN
    sourceService: string; // ARN
    targetService: string; // ARN
}
