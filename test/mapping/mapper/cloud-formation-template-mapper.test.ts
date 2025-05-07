import { CloudFormationToModelMapperImpl } from '../../../src/mapping/mapper/cloud-formation-template-mapper';
import { CloudFormationModel, CloudFormationModelFactory } from '../../../src/mapping/types/cloudformation-model';
import { CloudFormationToModelMapper, MappingContext, ResourceMapper, ResourceMapperResolver } from '../../../src/mapping/types/mapping-model';
import { ResourceModel } from '../../../src/mapping/types/resources-model';
import { MapperUtil } from '../../../src/mapping/types/utils-model';
import { CloudFormationResource, CloudFormationTemplate } from '../../../src/parsing/types/cloudformation-model';

describe('CloudFormationToModelMapperImpl', () => {
    let mockMapperUtils: jest.Mocked<MapperUtil>;
    let mockResourceMapperResolver: jest.Mocked<ResourceMapperResolver>;
    let mockCloudFormationModelFactory: jest.Mocked<CloudFormationModelFactory>;
    let mapper: CloudFormationToModelMapper;
    let mockMappingContext: jest.Mocked<MappingContext>;
    let mockCloudFormationModel: jest.Mocked<CloudFormationModel>;
    let mockResourceMapper: jest.Mocked<ResourceMapper>;
    let mockTemplate: CloudFormationTemplate;

    beforeEach(() => {
        mockMapperUtils = {
            extractString: jest.fn(),
            extractStringOrDefault: jest.fn(),
            extractStringOrDefaultFromMap: jest.fn(),
            extractStringOrJsonStringOrEmptyString: jest.fn(),
        };
        mockResourceMapperResolver = {
            getResourceMapper: jest.fn(),
        };
        mockCloudFormationModelFactory = {
            createCloudFormationModel: jest.fn(),
        };

        mapper = new CloudFormationToModelMapperImpl(mockMapperUtils, mockResourceMapperResolver, mockCloudFormationModelFactory);

        mockMappingContext = {
            originalTemplate: {} as CloudFormationTemplate,
            mappedResourcesByPhysicalId: new Map(),
            mappedResourcesByLogicalId: new Map(),
            mappedByResourceType: new Map(),
            mappedStubs: new Map(),
            getResourceByPhysicalId: jest.fn(),
            getResourceByLogicalId: jest.fn(),
            getResourcesByType: jest.fn(),
            getResources: jest.fn(),
            getResourceStub: jest.fn(),
            isResourceIdInLogicalIds: jest.fn(),
            isResourceIdInPhysicalIds: jest.fn(),
            isResourceTypeExists: jest.fn(),
            isResourceStub: jest.fn(),
            findResource: jest.fn(),
            findResources: jest.fn(),
        };

        mockCloudFormationModel = {} as jest.Mocked<CloudFormationModel>;
        mockCloudFormationModelFactory.createCloudFormationModel.mockReturnValue(mockCloudFormationModel);

        mockResourceMapper = {
            mapResource: jest.fn(),
        };
        mockResourceMapperResolver.getResourceMapper.mockReturnValue(mockResourceMapper);

        mockTemplate = {
            Resources: {
                LogicalId1: { Type: 'Type1' } as CloudFormationResource,
            },
        };
        mockMappingContext.originalTemplate = mockTemplate;
    });

    // below (mapper as any) used to call private methods
    describe('mapCloudFormationToModel', () => {
        it('should call all mapping methods and create CloudFormationModel', () => {
            const mapResourcesSpy = jest.spyOn(mapper as any, 'mapResources').mockReturnValue([]);
            const mapAwsTemplateFormatVersionSpy = jest.spyOn(mapper as any, 'mapAwsTemplateFormatVersion').mockReturnValue('');
            const mapDescriptionSpy = jest.spyOn(mapper as any, 'mapDescription').mockReturnValue('');
            const mapParametersSpy = jest.spyOn(mapper as any, 'mapParameters').mockReturnValue([]);
            const mapOutputsSpy = jest.spyOn(mapper as any, 'mapOutputs').mockReturnValue('');
            const mapMappingsSpy = jest.spyOn(mapper as any, 'mapMappings').mockReturnValue([]);
            const mapConditionsSpy = jest.spyOn(mapper as any, 'mapConditions').mockReturnValue([]);
            const mapMetadataSpy = jest.spyOn(mapper as any, 'mapMetadata').mockReturnValue('');

            const result = mapper.mapCloudFormationToModel(mockMappingContext);

            expect(mapResourcesSpy).toHaveBeenCalledWith(mockMappingContext);
            expect(mapAwsTemplateFormatVersionSpy).toHaveBeenCalledWith(mockMappingContext);
            expect(mapDescriptionSpy).toHaveBeenCalledWith(mockMappingContext);
            expect(mapParametersSpy).toHaveBeenCalledWith(mockMappingContext);
            expect(mapOutputsSpy).toHaveBeenCalledWith(mockMappingContext);
            expect(mapMappingsSpy).toHaveBeenCalledWith(mockMappingContext);
            expect(mapConditionsSpy).toHaveBeenCalledWith(mockMappingContext);
            expect(mapMetadataSpy).toHaveBeenCalledWith(mockMappingContext);
            expect(mockCloudFormationModelFactory.createCloudFormationModel).toHaveBeenCalledWith({
                resources: [],
                awsTemplateFormatVersion: '',
                description: '',
                parameters: [],
                outputs: '',
                mappings: [],
                conditions: [],
                metadata: '',
            });
            expect(result).toBe(mockCloudFormationModel);
        });
    });

    describe('mapResources', () => {
        it('should map each resource in the template', () => {
            mockMappingContext.originalTemplate.Resources = {
                LogicalId1: { Type: 'TypeA' } as CloudFormationResource,
                LogicalId2: { Type: 'TypeB' } as CloudFormationResource,
            };
            const mockResourceModel1: ResourceModel = { resourceType: 'TypeA', resourceArn: 'arn1', physicalId: 'id1', logicalId: 'LogicalId1' };
            const mockResourceModel2: ResourceModel = { resourceType: 'TypeB', resourceArn: 'arn2', physicalId: 'id2', logicalId: 'LogicalId2' };
            mockResourceMapper.mapResource.mockReturnValueOnce(mockResourceModel1).mockReturnValueOnce(mockResourceModel2);

            const result = (mapper as any).mapResources(mockMappingContext);

            expect(mockResourceMapperResolver.getResourceMapper).toHaveBeenCalledTimes(2);
            expect(mockResourceMapperResolver.getResourceMapper).toHaveBeenCalledWith('TypeA');
            expect(mockResourceMapperResolver.getResourceMapper).toHaveBeenCalledWith('TypeB');
            expect(mockResourceMapper.mapResource).toHaveBeenCalledTimes(2);
            expect(mockResourceMapper.mapResource).toHaveBeenCalledWith({
                resource: { Type: 'TypeA' },
                logicalId: 'LogicalId1',
                ctx: mockMappingContext,
            });
            expect(mockResourceMapper.mapResource).toHaveBeenCalledWith({
                resource: { Type: 'TypeB' },
                logicalId: 'LogicalId2',
                ctx: mockMappingContext,
            });
            expect(result).toEqual([mockResourceModel1, mockResourceModel2]);
        });

        it('should return an empty array if there are no resources', () => {
            mockMappingContext.originalTemplate.Resources = {};
            const result = (mapper as any).mapResources(mockMappingContext);
            expect(result).toEqual([]);
            expect(mockResourceMapperResolver.getResourceMapper).not.toHaveBeenCalled();
            expect(mockResourceMapper.mapResource).not.toHaveBeenCalled();
        });
    });

    describe('mapAwsTemplateFormatVersion', () => {
        it('should extract the AwsTemplateFormatVersion using mapperUtils', () => {
            mockMappingContext.originalTemplate.AWSTemplateFormatVersion = '2010-09-09';
            mockMapperUtils.extractStringOrDefault.mockReturnValue('2010-09-09');

            const result = (mapper as any).mapAwsTemplateFormatVersion(mockMappingContext);

            expect(mockMapperUtils.extractStringOrDefault).toHaveBeenCalledWith('2010-09-09', '');
            expect(result).toBe('2010-09-09');
        });

        it('should return an empty string if AwsTemplateFormatVersion is not present', () => {
            mockMapperUtils.extractStringOrDefault.mockReturnValue('');
            const result = (mapper as any).mapAwsTemplateFormatVersion(mockMappingContext);
            expect(mockMapperUtils.extractStringOrDefault).toHaveBeenCalledWith(undefined, '');
            expect(result).toBe('');
        });
    });

    describe('mapDescription', () => {
        it('should extract the Description using mapperUtils', () => {
            mockMappingContext.originalTemplate.Description = 'My Description';
            mockMapperUtils.extractStringOrDefault.mockReturnValue('My Description');

            const result = (mapper as any).mapDescription(mockMappingContext);

            expect(mockMapperUtils.extractStringOrDefault).toHaveBeenCalledWith('My Description', '');
            expect(result).toBe('My Description');
        });

        it('should return an empty string if Description is not present', () => {
            mockMapperUtils.extractStringOrDefault.mockReturnValue('');
            const result = (mapper as any).mapDescription(mockMappingContext);
            expect(mockMapperUtils.extractStringOrDefault).toHaveBeenCalledWith(undefined, '');
            expect(result).toBe('');
        });
    });

    describe('mapParameters', () => {
        it('should map each parameter in the template', () => {
            mockMappingContext.originalTemplate.Parameters = {
                Param1: { Type: 'String', Default: 'value1', Description: 'desc1', AllowedValues: ['val1,val2'], AllowedPattern: 'pattern1' },
                Param2: { Type: 'Number' },
            };
            mockMapperUtils.extractStringOrDefault
                .mockReturnValueOnce('pattern1')
                .mockReturnValueOnce('val1,val2')
                .mockReturnValueOnce('value1')
                .mockReturnValueOnce('desc1')
                .mockReturnValueOnce('String')
                .mockReturnValueOnce('') // AllowedPattern for Param2
                .mockReturnValueOnce('') // AllowedValues for Param2
                .mockReturnValueOnce('') // Default for Param2
                .mockReturnValueOnce('') // Description for Param2
                .mockReturnValueOnce('Number'); // Type for Param2

            const result = (mapper as any).mapParameters(mockMappingContext);

            expect(result).toEqual([
                {
                    paramName: 'Param1',
                    type: 'String',
                    defaultValue: 'value1',
                    description: 'desc1',
                    allowedValues: 'val1,val2',
                    allowedPattern: 'pattern1',
                },
                { paramName: 'Param2', type: 'Number', defaultValue: '', description: '', allowedValues: '', allowedPattern: '' },
            ]);
            expect(mockMapperUtils.extractStringOrDefault).toHaveBeenCalledTimes(10);
        });

        it('should return an empty array if there are no parameters', () => {
            mockMappingContext.originalTemplate.Parameters = undefined;
            let result = (mapper as any).mapParameters(mockMappingContext);
            expect(result).toEqual([]);

            mockMappingContext.originalTemplate.Parameters = {};
            result = (mapper as any).mapParameters(mockMappingContext);
            expect(result).toEqual([]);

            expect(mockMapperUtils.extractStringOrDefault).not.toHaveBeenCalled();
        });
    });

    describe('mapOutputs', () => {
        it('should extract the Outputs using mapperUtils', () => {
            mockMappingContext.originalTemplate.Outputs = { Output1: { Value: 'outputValue' } };
            mockMapperUtils.extractStringOrDefault.mockReturnValue('{"Output1":{"Value":"outputValue"}}');

            const result = (mapper as any).mapOutputs(mockMappingContext);

            expect(mockMapperUtils.extractStringOrDefault).toHaveBeenCalledWith({ Output1: { Value: 'outputValue' } }, '');
            expect(result).toBe('{"Output1":{"Value":"outputValue"}}');
        });

        it('should return an empty string if Outputs is not present', () => {
            mockMapperUtils.extractStringOrDefault.mockReturnValue('');
            const result = (mapper as any).mapOutputs(mockMappingContext);
            expect(mockMapperUtils.extractStringOrDefault).toHaveBeenCalledWith(undefined, '');
            expect(result).toBe('');
        });
    });

    describe('mapMappings', () => {
        it('should map each mapping in the template', () => {
            mockMappingContext.originalTemplate.Mappings = {
                RegionMap: {
                    'us-east-1': { HVM: 'ami-xxx', PV: 'ami-yyy' },
                    'us-west-2': { HVM: 'ami-aaa', PV: 'ami-bbb' },
                },
            };
            mockMapperUtils.extractStringOrDefault
                .mockReturnValueOnce('ami-xxx')
                .mockReturnValueOnce('ami-yyy')
                .mockReturnValueOnce('ami-aaa')
                .mockReturnValueOnce('ami-bbb');

            const result = (mapper as any).mapMappings(mockMappingContext);

            expect(result).toEqual([
                { key: 'RegionMap.us-east-1.HVM', value: 'ami-xxx' },
                { key: 'RegionMap.us-east-1.PV', value: 'ami-yyy' },
                { key: 'RegionMap.us-west-2.HVM', value: 'ami-aaa' },
                { key: 'RegionMap.us-west-2.PV', value: 'ami-bbb' },
            ]);
            expect(mockMapperUtils.extractStringOrDefault).toHaveBeenCalledTimes(4);
        });

        it('should return an empty array if there are no mappings', () => {
            mockMappingContext.originalTemplate.Mappings = undefined;
            let result = (mapper as any).mapMappings(mockMappingContext);
            expect(result).toEqual([]);

            mockMappingContext.originalTemplate.Mappings = {};
            result = (mapper as any).mapMappings(mockMappingContext);
            expect(result).toEqual([]);

            expect(mockMapperUtils.extractStringOrDefault).not.toHaveBeenCalled();
        });
    });

    describe('mapConditions', () => {
        it('should map each condition in the template', () => {
            mockMappingContext.originalTemplate.Conditions = {
                IsProd: { Fn: 'Equals', Args: ['${Environment}', 'prod'] },
                IsDev: { Fn: 'Equals', Args: ['${Environment}', 'dev'] },
            };
            mockMapperUtils.extractStringOrDefault
                .mockReturnValueOnce('{"Fn":"Equals","Args":["${Environment}","prod"]}')
                .mockReturnValueOnce('{"Fn":"Equals","Args":["${Environment}","dev"]}');

            const result = (mapper as any).mapConditions(mockMappingContext);

            expect(result).toEqual([
                { key: 'IsProd', value: '{"Fn":"Equals","Args":["${Environment}","prod"]}' },
                { key: 'IsDev', value: '{"Fn":"Equals","Args":["${Environment}","dev"]}' },
            ]);
            expect(mockMapperUtils.extractStringOrDefault).toHaveBeenCalledTimes(2);
        });

        it('should return an empty array if there are no conditions', () => {
            mockMappingContext.originalTemplate.Conditions = undefined;
            let result = (mapper as any).mapConditions(mockMappingContext);
            expect(result).toEqual([]);

            mockMappingContext.originalTemplate.Conditions = {};
            result = (mapper as any).mapConditions(mockMappingContext);
            expect(result).toEqual([]);

            expect(mockMapperUtils.extractStringOrDefault).not.toHaveBeenCalled();
        });
    });

    describe('mapMetadata', () => {
        it('should extract the Metadata using mapperUtils', () => {
            mockMappingContext.originalTemplate.Metadata = { Version: '1.0' };
            mockMapperUtils.extractStringOrJsonStringOrEmptyString.mockReturnValue('{"Version":"1.0"}');

            const result = (mapper as any).mapMetadata(mockMappingContext);

            expect(mockMapperUtils.extractStringOrJsonStringOrEmptyString).toHaveBeenCalledWith({ Version: '1.0' });
            expect(result).toBe('{"Version":"1.0"}');
        });

        it('should return an empty string if Metadata is not present', () => {
            mockMapperUtils.extractStringOrJsonStringOrEmptyString.mockReturnValue('');
            const result = (mapper as any).mapMetadata(mockMappingContext);
            expect(mockMapperUtils.extractStringOrJsonStringOrEmptyString).toHaveBeenCalledWith(undefined);
            expect(result).toBe('');
        });
    });
});
