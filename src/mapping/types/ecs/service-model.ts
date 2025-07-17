import { BaseResource } from '../resources-model';

export interface EcsServiceModel extends BaseResource {
    serviceName: string;
    cluster: string;
    launchType: string; // EC2 | FARGATE | EXTERNAL
    desiredCount: string;
    platformVersion: string;
    taskDefinition: string;
}
