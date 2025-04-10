import { CloudformationModelImpl } from '../../../src/mapping/model/cloudformation-model';
import { CloudFormationModelFactoryImpl } from '../../../src/mapping/model/cloudformation-model-factory';
import { CloudFormationModelConfig } from '../../../src/mapping/types/cloudformation-model';

jest.mock('../../../src/mapping/model/cloudformation-model');

describe('CloudFormationModelFactoryImpl', () => {
    let factory: CloudFormationModelFactoryImpl;

    beforeEach(() => {
        factory = new CloudFormationModelFactoryImpl();
        (CloudformationModelImpl as jest.Mock).mockClear();
    });

    describe('createCloudFormationModel', () => {
        it('should create and return an instance of CloudformationModelImpl', () => {
            const config: CloudFormationModelConfig = { resources: [] };
            const model = factory.createCloudFormationModel(config);
            expect(model).toBeInstanceOf(CloudformationModelImpl);
        });

        it('should pass the provided config to the CloudformationModelImpl constructor', () => {
            const config: CloudFormationModelConfig = {
                resources: [{ resourceType: 'Test', resourceArn: 'arn:test', physicalId: 'test', logicalId: 'Test' }],
                awsTemplateFormatVersion: '2010-09-09',
                description: 'Test Stack',
            };
            factory.createCloudFormationModel(config);
            expect(CloudformationModelImpl).toHaveBeenCalledWith(config);
        });

        it('should handle an empty config', () => {
            const config: CloudFormationModelConfig = { resources: [] };
            factory.createCloudFormationModel(config);
            expect(CloudformationModelImpl).toHaveBeenCalledWith(config);
        });

        it('should handle a config with all optional properties', () => {
            const config: CloudFormationModelConfig = {
                resources: [],
                awsTemplateFormatVersion: 'version',
                description: 'desc',
                parameters: [],
                outputs: '{}',
                mappings: [],
                conditions: [],
                metadata: '{}',
            };
            factory.createCloudFormationModel(config);
            expect(CloudformationModelImpl).toHaveBeenCalledWith(config);
        });
    });
});
