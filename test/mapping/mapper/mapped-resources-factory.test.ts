import { StringUtils } from '../../../src/common';
import { MappedResourcesFactoryImpl } from '../../../src/mapping/mapper/mapped-resources-factory';
import { MapperUtil } from '../../../src/mapping/types/utils-model';
import { CloudFormationResource, CloudFormationTemplate } from '../../../src/parsing/types/cloudformation-model';

describe('MappedResourcesFactoryImpl', () => {
    let mockStringUtils: jest.Mocked<StringUtils>;
    let mockMapperUtils: jest.Mocked<MapperUtil>;
    let factory: MappedResourcesFactoryImpl;

    beforeEach(() => {
        mockStringUtils = {
            isBlankString: jest.fn(),
            // @ts-ignore
            isValidNotBlankString: jest.fn(),
            parseTemplateString: jest.fn(),
            replaceTemplateVariables: jest.fn(),
            joinStrings: jest.fn(),
            splitString: jest.fn(),
        };
        mockMapperUtils = {
            extractString: jest.fn(),
            extractStringOrDefault: jest.fn(),
            extractStringOrDefaultFromMap: jest.fn(),
            extractStringOrJsonStringOrEmptyString: jest.fn(),
        };
        factory = new MappedResourcesFactoryImpl(mockStringUtils, mockMapperUtils);

        // Reset mock implementations before each test
        mockStringUtils.isBlankString.mockReset();
        mockMapperUtils.extractString.mockReset();
    });

    it('should correctly map resources when the template is valid', () => {
        const mockResource1: CloudFormationResource = { Type: 'TypeA', Properties: {}, _id: 'physicalId1' };
        const mockResource2: CloudFormationResource = { Type: 'TypeB', Properties: {}, _id: 'physicalId2' };
        const mockResource3: CloudFormationResource = { Type: 'TypeB', Properties: {}, _id: 'physicalId3' };
        const cft: CloudFormationTemplate = {
            Resources: {
                LogicalId1: mockResource1,
                LogicalId2: mockResource2,
                LogicalId3: mockResource3,
            },
        };

        mockStringUtils.isBlankString.mockReturnValue(false);
        mockMapperUtils.extractString.mockImplementation((input: any) => String(input));

        const mappedResources = factory.createMappedResources(cft);

        expect(mappedResources.mappedResourcesByPhysicalId.get('physicalId1')).toBe(mockResource1);
        expect(mappedResources.mappedResourcesByPhysicalId.get('physicalId2')).toBe(mockResource2);
        expect(mappedResources.mappedResourcesByPhysicalId.get('physicalId3')).toBe(mockResource3);
        expect(mappedResources.mappedResourcesByLogicalId.get('LogicalId1')).toBe(mockResource1);
        expect(mappedResources.mappedResourcesByLogicalId.get('LogicalId2')).toBe(mockResource2);
        expect(mappedResources.mappedResourcesByLogicalId.get('LogicalId3')).toBe(mockResource3);
        expect(mappedResources.mappedByResourceType.get('TypeA')?.has(mockResource1)).toBe(true);
        expect(mappedResources.mappedByResourceType.get('TypeB')?.has(mockResource2)).toBe(true);
        expect(mappedResources.mappedByResourceType.get('TypeB')?.has(mockResource3)).toBe(true);
    });

    it('should throw an error if a logical id is a blank string', () => {
        const mockResource: CloudFormationResource = { Type: 'TypeA', Properties: {}, _id: 'physicalId' };
        const cft: CloudFormationTemplate = {
            Resources: {
                '': mockResource,
            },
        };

        mockStringUtils.isBlankString.mockReturnValue(true);

        expect(() => factory.createMappedResources(cft)).toThrow("Invalid logical id. It can't be blank string.");
    });

    it('should throw an error if a physical id already exists', () => {
        const mockResource1: CloudFormationResource = { Type: 'TypeA', Properties: {}, _id: 'physicalId' };
        const mockResource2: CloudFormationResource = { Type: 'TypeB', Properties: {}, _id: 'physicalId' };
        const cft: CloudFormationTemplate = {
            Resources: {
                LogicalId1: mockResource1,
                LogicalId2: mockResource2,
            },
        };

        mockStringUtils.isBlankString.mockReturnValue(false);
        mockMapperUtils.extractString.mockImplementation((input: any) => String(input));

        expect(() => factory.createMappedResources(cft)).toThrow("Resource with physicalId 'physicalId' already exists");
    });

    it('should handle a template with no resources', () => {
        const cft: CloudFormationTemplate = { Resources: {} };

        const mappedResources = factory.createMappedResources(cft);

        expect(mappedResources.mappedResourcesByPhysicalId).toEqual(new Map());
        expect(mappedResources.mappedResourcesByLogicalId).toEqual(new Map());
        expect(mappedResources.mappedByResourceType).toEqual(new Map());
    });

    it('should handle resources with the same type', () => {
        const mockResource1: CloudFormationResource = { Type: 'TypeA', Properties: {}, _id: 'physicalId1' };
        const mockResource2: CloudFormationResource = { Type: 'TypeA', Properties: {}, _id: 'physicalId2' };
        const cft: CloudFormationTemplate = {
            Resources: {
                LogicalId1: mockResource1,
                LogicalId2: mockResource2,
            },
        };

        mockStringUtils.isBlankString.mockReturnValue(false);
        mockMapperUtils.extractString.mockImplementation((input: any) => String(input));

        const mappedResources = factory.createMappedResources(cft);

        expect(mappedResources.mappedByResourceType.get('TypeA')?.has(mockResource1)).toBe(true);
        expect(mappedResources.mappedByResourceType.get('TypeA')?.has(mockResource2)).toBe(true);
        expect(mappedResources.mappedByResourceType.get('TypeA')?.size).toBe(2);
    });

    it('should call stringUtils.isBlankString for each logical id', () => {
        const cft: CloudFormationTemplate = {
            Resources: {
                LogicalId1: { Type: 'TypeA', Properties: {}, _id: 'physicalId1' },
                LogicalId2: { Type: 'TypeB', Properties: {}, _id: 'physicalId2' },
            },
        };
        mockStringUtils.isBlankString.mockReturnValue(false);
        mockMapperUtils.extractString.mockImplementation((input: any) => String(input));

        factory.createMappedResources(cft);

        expect(mockStringUtils.isBlankString).toHaveBeenCalledTimes(2);
        expect(mockStringUtils.isBlankString).toHaveBeenCalledWith('LogicalId1');
        expect(mockStringUtils.isBlankString).toHaveBeenCalledWith('LogicalId2');
    });

    it('should call mapperUtils.extractString for _id and Type of each resource', () => {
        const mockResource1: CloudFormationResource = { Type: 'TypeA', Properties: {}, _id: 'physicalId1' };
        const cft: CloudFormationTemplate = {
            Resources: {
                LogicalId1: mockResource1,
            },
        };
        mockStringUtils.isBlankString.mockReturnValue(false);
        mockMapperUtils.extractString.mockImplementation((input: any) => String(input));

        factory.createMappedResources(cft);

        expect(mockMapperUtils.extractString).toHaveBeenCalledTimes(2);
        expect(mockMapperUtils.extractString).toHaveBeenCalledWith('physicalId1');
        expect(mockMapperUtils.extractString).toHaveBeenCalledWith('TypeA');
    });
});
