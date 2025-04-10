import { CloudformationModelImpl } from '../../../src/mapping/model/cloudformation-model';
import { CloudFormationModelConfig, KeyValueStringPair, ParameterModel } from '../../../src/mapping/types/cloudformation-model';
import { ResourceModel } from '../../../src/mapping/types/resources-model';

describe('CloudformationModelImpl', () => {
    const mockResource1: ResourceModel = {
        resourceType: 'AWS::S3::Bucket',
        resourceArn: 'arn:aws:s3:::my-bucket',
        physicalId: 'my-bucket',
        logicalId: 'MyBucket',
    };
    const mockResource2: ResourceModel = {
        resourceType: 'AWS::Lambda::Function',
        resourceArn: 'arn:aws:lambda:us-east-1:123456789012:function:my-function',
        physicalId: 'my-function',
        logicalId: 'MyFunction',
    };
    const mockParameter: ParameterModel = {
        paramName: 'Environment',
        type: 'String',
        defaultValue: 'dev',
    };
    const mockMapping: KeyValueStringPair = { key: 'Region', value: 'us-east-1' };
    const mockCondition: KeyValueStringPair = { key: 'IsProd', value: 'false' };

    describe('constructor', () => {
        it('should initialize all properties correctly', () => {
            const config: CloudFormationModelConfig = {
                resources: [mockResource1, mockResource2],
                awsTemplateFormatVersion: '2010-09-09',
                description: 'My CloudFormation Stack',
                parameters: [mockParameter],
                outputs: '{"OutputKey": {"Value": "outputValue"}}',
                mappings: [mockMapping],
                conditions: [mockCondition],
                metadata: '{"Version": "1.0"}',
            };
            const model = new CloudformationModelImpl(config);
            expect(model['resources']).toEqual([mockResource1, mockResource2]);
            expect(model['awsTemplateFormatVersion']).toBe('2010-09-09');
            expect(model['description']).toBe('My CloudFormation Stack');
            expect(model['parameters']).toEqual([mockParameter]);
            expect(model['outputs']).toBe('{"OutputKey": {"Value": "outputValue"}}');
            expect(model['mappings']).toEqual([mockMapping]);
            expect(model['conditions']).toEqual([mockCondition]);
            expect(model['metadata']).toBe('{"Version": "1.0"}');
        });

        it('should initialize with empty arrays or undefined for optional properties if not provided', () => {
            const config: CloudFormationModelConfig = {
                resources: [],
            };
            const model = new CloudformationModelImpl(config);
            expect(model['resources']).toEqual([]);
            expect(model['awsTemplateFormatVersion']).toBeUndefined();
            expect(model['description']).toBeUndefined();
            expect(model['parameters']).toBeUndefined();
            expect(model['outputs']).toBeUndefined();
            expect(model['mappings']).toBeUndefined();
            expect(model['conditions']).toBeUndefined();
            expect(model['metadata']).toBeUndefined();
        });
    });

    describe('getResources', () => {
        let model: CloudformationModelImpl;
        beforeEach(() => {
            const config: CloudFormationModelConfig = {
                resources: [mockResource1, mockResource2, { ...mockResource1, logicalId: 'MyBucket2' }],
            };
            model = new CloudformationModelImpl(config);
        });

        it('should return all resources when no type is provided', () => {
            expect(model.getResources()).toEqual([mockResource1, mockResource2, { ...mockResource1, logicalId: 'MyBucket2' }]);
        });

        it('should return an empty array when no resources exist', () => {
            const emptyModel = new CloudformationModelImpl({ resources: [] });
            expect(emptyModel.getResources()).toEqual([]);
        });

        it('should return resources of the specified type (case-insensitive)', () => {
            expect(model.getResources('AWS::S3::Bucket')).toEqual([mockResource1, { ...mockResource1, logicalId: 'MyBucket2' }]);
            expect(model.getResources('aws::s3::bucket')).toEqual([mockResource1, { ...mockResource1, logicalId: 'MyBucket2' }]);
        });

        it('should return an empty array when no resources match the specified type', () => {
            expect(model.getResources('AWS::EC2::Instance')).toEqual([]);
        });
    });

    describe('getResourcesCount', () => {
        let model: CloudformationModelImpl;
        beforeEach(() => {
            const config: CloudFormationModelConfig = {
                resources: [
                    mockResource1,
                    mockResource2,
                    { ...mockResource1, logicalId: 'MyBucket2' },
                    { ...mockResource2, logicalId: 'MyFunction2' },
                    { ...mockResource2, logicalId: 'MyFunction3' },
                ],
            };
            model = new CloudformationModelImpl(config);
        });

        it('should return a count of all resource types when no type is provided', () => {
            const expected = [
                { key: 'aws::s3::bucket', value: '2' },
                { key: 'aws::lambda::function', value: '3' },
            ];
            expect(model.getResourcesCount()).toEqual(expect.arrayContaining(expected));
            expect(model.getResourcesCount().length).toBe(expected.length);
        });

        it('should return an empty array when no resources exist', () => {
            const emptyModel = new CloudformationModelImpl({ resources: [] });
            expect(emptyModel.getResourcesCount()).toEqual([]);
        });

        it('should return the count of the specified resource type', () => {
            expect(model.getResourcesCount('AWS::S3::Bucket')).toEqual([{ key: 'AWS::S3::Bucket', value: '2' }]);
            expect(model.getResourcesCount('aws::lambda::function')).toEqual([{ key: 'aws::lambda::function', value: '3' }]);
        });

        it('should return [{ key: type, value: "0" }] when no resources match the specified type', () => {
            expect(model.getResourcesCount('AWS::EC2::Instance')).toEqual([{ key: 'AWS::EC2::Instance', value: '0' }]);
        });
    });

    describe('getAwsTemplateFormatVersion', () => {
        it('should return the awsTemplateFormatVersion when it is defined', () => {
            const config: CloudFormationModelConfig = { resources: [], awsTemplateFormatVersion: '2010-09-09' };
            const model = new CloudformationModelImpl(config);
            expect(model.getAwsTemplateFormatVersion()).toBe('2010-09-09');
        });

        it('should return an empty string when awsTemplateFormatVersion is undefined and no default is provided', () => {
            const config: CloudFormationModelConfig = { resources: [] };
            const model = new CloudformationModelImpl(config);
            expect(model.getAwsTemplateFormatVersion()).toBe('');
        });

        it('should return the defaultValue when awsTemplateFormatVersion is undefined and a default is provided', () => {
            const config: CloudFormationModelConfig = { resources: [] };
            const model = new CloudformationModelImpl(config);
            expect(model.getAwsTemplateFormatVersion('defaultVersion')).toBe('defaultVersion');
        });

        it('should return the awsTemplateFormatVersion even if a default is provided', () => {
            const config: CloudFormationModelConfig = { resources: [], awsTemplateFormatVersion: '2010-09-09' };
            const model = new CloudformationModelImpl(config);
            expect(model.getAwsTemplateFormatVersion('defaultVersion')).toBe('2010-09-09');
        });
    });

    describe('getDescription', () => {
        it('should return the description when it is defined', () => {
            const config: CloudFormationModelConfig = { resources: [], description: 'My Stack Description' };
            const model = new CloudformationModelImpl(config);
            expect(model.getDescription()).toBe('My Stack Description');
        });

        it('should return an empty string when description is undefined and no default is provided', () => {
            const config: CloudFormationModelConfig = { resources: [] };
            const model = new CloudformationModelImpl(config);
            expect(model.getDescription()).toBe('');
        });

        it('should return the defaultValue when description is undefined and a default is provided', () => {
            const config: CloudFormationModelConfig = { resources: [] };
            const model = new CloudformationModelImpl(config);
            expect(model.getDescription('defaultDescription')).toBe('defaultDescription');
        });

        it('should return the description even if a default is provided', () => {
            const config: CloudFormationModelConfig = { resources: [], description: 'My Stack Description' };
            const model = new CloudformationModelImpl(config);
            expect(model.getDescription('defaultDescription')).toBe('My Stack Description');
        });
    });

    describe('getParameters', () => {
        it('should return the parameters array when it is defined', () => {
            const config: CloudFormationModelConfig = { resources: [], parameters: [mockParameter] };
            const model = new CloudformationModelImpl(config);
            expect(model.getParameters()).toEqual([mockParameter]);
        });

        it('should return an empty array when parameters is undefined', () => {
            const config: CloudFormationModelConfig = { resources: [] };
            const model = new CloudformationModelImpl(config);
            expect(model.getParameters()).toEqual([]);
        });
    });

    describe('getOutputs', () => {
        it('should return the outputs string when it is defined', () => {
            const config: CloudFormationModelConfig = { resources: [], outputs: '{"OutputKey": "outputValue"}' };
            const model = new CloudformationModelImpl(config);
            expect(model.getOutputs()).toBe('{"OutputKey": "outputValue"}');
        });

        it('should return an empty string when outputs is undefined', () => {
            const config: CloudFormationModelConfig = { resources: [] };
            const model = new CloudformationModelImpl(config);
            expect(model.getOutputs()).toBe('');
        });
    });

    describe('getMappings', () => {
        it('should return the mappings array when it is defined', () => {
            const config: CloudFormationModelConfig = { resources: [], mappings: [mockMapping] };
            const model = new CloudformationModelImpl(config);
            expect(model.getMappings()).toEqual([mockMapping]);
        });

        it('should return an empty array when mappings is undefined', () => {
            const config: CloudFormationModelConfig = { resources: [] };
            const model = new CloudformationModelImpl(config);
            expect(model.getMappings()).toEqual([]);
        });
    });

    describe('getConditions', () => {
        it('should return the conditions array when it is defined', () => {
            const config: CloudFormationModelConfig = { resources: [], conditions: [mockCondition] };
            const model = new CloudformationModelImpl(config);
            expect(model.getConditions()).toEqual([mockCondition]);
        });

        it('should return an empty array when conditions is undefined', () => {
            const config: CloudFormationModelConfig = { resources: [] };
            const model = new CloudformationModelImpl(config);
            expect(model.getConditions()).toEqual([]);
        });
    });

    describe('getMetadata', () => {
        it('should return the metadata string when it is defined', () => {
            const config: CloudFormationModelConfig = { resources: [], metadata: '{"Version": "1.0"}' };
            const model = new CloudformationModelImpl(config);
            expect(model.getMetadata()).toBe('{"Version": "1.0"}');
        });

        it('should return an empty string when metadata is undefined', () => {
            const config: CloudFormationModelConfig = { resources: [] };
            const model = new CloudformationModelImpl(config);
            expect(model.getMetadata()).toBe('');
        });
    });
});
