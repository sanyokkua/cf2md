import { CloudFormationTemplate } from '../../parsing/types/cloudformation-model';
import { CloudFormationModel } from './cloudformation-model';

export interface Mapper {
    mapTemplate(template: CloudFormationTemplate): CloudFormationModel;
}

export interface MapperProvider {
    createMapper(): Mapper;
}
