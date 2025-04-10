import { CloudFormationModel, CloudFormationModelConfig, CloudFormationModelFactory } from '../types/cloudformation-model';
import { CloudformationModelImpl } from './cloudformation-model';

export class CloudFormationModelFactoryImpl implements CloudFormationModelFactory {
    createCloudFormationModel(config: CloudFormationModelConfig): CloudFormationModel {
        return new CloudformationModelImpl(config);
    }
}
