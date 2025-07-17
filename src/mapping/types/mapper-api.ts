import { UserProvidedParam } from '../../parsing';
import { CloudFormationTemplate } from '../../parsing/types/cloudformation-model';
import { CloudFormationModel } from './cloudformation-model';

export interface Mapper {
    mapTemplate(template: CloudFormationTemplate): CloudFormationModel;
}

export interface MapperProvider {
    createMapper(userParams: UserProvidedParam[]): Mapper;
}
