import { MappingContextImpl } from '../../../src/mapping/context/mapping-context';
import { MappedResources } from '../../../src/mapping/types/mapping-model';
import { CloudFormationResource, CloudFormationTemplate } from '../../../src/parsing/types/cloudformation-model';

describe('MappingContextImpl', () => {
    let originalTemplate: CloudFormationTemplate;
    let mappedResources: MappedResources;
    let context: MappingContextImpl;
    let mockResource1: CloudFormationResource;
    let mockResource2: CloudFormationResource;

    beforeEach(() => {
        mockResource1 = { Type: 'Type1', Properties: {}, _id: 'physicalId1', _arn: 'arn1' };
        mockResource2 = { Type: 'Type2', Properties: {}, _id: 'physicalId2', _arn: 'arn2' };

        originalTemplate = {
            Resources: {
                LogicalId1: mockResource1,
                LogicalId2: mockResource2,
            },
        };

        mappedResources = {
            mappedResourcesByPhysicalId: new Map<string, CloudFormationResource>([
                ['physicalId1', mockResource1],
                ['physicalId2', mockResource2],
            ]),
            mappedResourcesByLogicalId: new Map<string, CloudFormationResource>([
                ['LogicalId1', mockResource1],
                ['LogicalId2', mockResource2],
            ]),
            mappedByResourceType: new Map<string, Set<CloudFormationResource>>([
                ['Type1', new Set([mockResource1])],
                ['Type2', new Set([mockResource2])],
            ]),
            mappedStubs: new Map<string, CloudFormationResource>([['Stub', mockResource1]]),
        };

        context = new MappingContextImpl(originalTemplate, mappedResources);
    });

    describe('constructor', () => {
        it('should initialize properties correctly', () => {
            expect(context.originalTemplate).toEqual(originalTemplate);
            expect(context.mappedResourcesByPhysicalId).toEqual(mappedResources.mappedResourcesByPhysicalId);
            expect(context.mappedResourcesByLogicalId).toEqual(mappedResources.mappedResourcesByLogicalId);
            expect(context.mappedByResourceType).toEqual(mappedResources.mappedByResourceType);
        });
    });

    describe('getResourceByPhysicalId', () => {
        it('should return the resource when a valid physical ID is provided', () => {
            expect(context.getResourceByPhysicalId('physicalId1')).toEqual(mockResource1);
        });

        it('should throw an error when an invalid physical ID is provided', () => {
            expect(() => context.getResourceByPhysicalId('invalidId')).toThrow("Resource with physicalId 'invalidId' not found");
        });
    });

    describe('getResourceByLogicalId', () => {
        it('should return the resource when a valid logical ID is provided', () => {
            expect(context.getResourceByLogicalId('LogicalId1')).toEqual(mockResource1);
        });

        it('should throw an error when an invalid logical ID is provided', () => {
            expect(() => context.getResourceByLogicalId('InvalidLogicalId')).toThrow("Resource with logicalId 'InvalidLogicalId' not found");
        });
    });

    describe('Type Validation via getResourceByPhysicalId / getResourceByLogicalId', () => {
        it('should throw error when expected type does not match actual type in getResourceByPhysicalId', () => {
            expect(() => context.getResourceByPhysicalId('physicalId1', 'WrongType')).toThrow(
                `Expected type is WrongType and resource has type: ${mockResource1.Type}`,
            );
        });

        it('should throw error when expected type does not match actual type in getResourceByLogicalId', () => {
            expect(() => context.getResourceByLogicalId('LogicalId1', 'WrongType')).toThrow(
                `Expected type is WrongType and resource has type: ${mockResource1.Type}`,
            );
        });
    });

    describe('getResourcesByType', () => {
        it('should return an array of resources when a valid type name is provided', () => {
            expect(context.getResourcesByType('Type1')).toEqual([mockResource1]);
        });

        it('should return an empty array if the set of resources for the type is empty', () => {
            mappedResources.mappedByResourceType.set('Type3', new Set());
            context = new MappingContextImpl(originalTemplate, mappedResources);
            expect(context.getResourcesByType('Type3')).toEqual([]);
        });

        it('should throw an error when an invalid type name is provided', () => {
            expect(() => context.getResourcesByType('InvalidType')).toThrow("Resources with type 'InvalidType' not found");
        });

        it('should handle a scenario where the set for a type is null or undefined (should not happen with the current implementation but for robustness)', () => {
            mappedResources.mappedByResourceType.set('Type4', undefined as any);
            context = new MappingContextImpl(originalTemplate, mappedResources);
            expect(context.getResourcesByType('Type4')).toEqual([]);
        });
    });

    describe('getResources', () => {
        it('should return an array of all resources from the originalTemplate', () => {
            expect(context.getResources()).toEqual([mockResource1, mockResource2]);
        });

        it('should return an empty array if originalTemplate.Resources is empty', () => {
            const emptyTemplate: CloudFormationTemplate = { Resources: {} };
            const emptyMappedResources: MappedResources = {
                mappedResourcesByPhysicalId: new Map(),
                mappedResourcesByLogicalId: new Map(),
                mappedByResourceType: new Map(),
                mappedStubs: new Map(),
            };
            const emptyContext = new MappingContextImpl(emptyTemplate, emptyMappedResources);
            expect(emptyContext.getResources()).toEqual([]);
        });
    });

    describe('getResourceStub', () => {
        it('should return the stub resource when a valid stub ID is provided', () => {
            expect(context.getResourceStub('Stub')).toEqual(mockResource1);
        });

        it('should throw an error when an invalid stub ID is provided', () => {
            expect(() => context.getResourceStub('InvalidStub')).toThrow("Resource with stub 'InvalidStub' not found");
        });
    });

    describe('isResourceIdInPhysicalIds', () => {
        it('should return true when the physical id exists', () => {
            expect(context.isResourceIdInPhysicalIds('physicalId1')).toBe(true);
        });

        it('should return false when the physical id does not exist', () => {
            expect(context.isResourceIdInPhysicalIds('NonExistentId')).toBe(false);
        });
    });

    describe('isResourceIdInLogicalIds', () => {
        it('should return true when the logical id exists', () => {
            expect(context.isResourceIdInLogicalIds('LogicalId1')).toBe(true);
        });

        it('should return false when the logical id does not exist', () => {
            expect(context.isResourceIdInLogicalIds('NonExistentLogicalId')).toBe(false);
        });
    });

    describe('isResourceTypeExists', () => {
        it('should return true when the resource type exists', () => {
            expect(context.isResourceTypeExists('Type1')).toBe(true);
        });

        it('should return false when the resource type does not exist', () => {
            expect(context.isResourceTypeExists('NonExistentType')).toBe(false);
        });
    });

    describe('isResourceStub', () => {
        it('should return true when the stub exists', () => {
            expect(context.isResourceStub('Stub')).toBe(true);
        });

        it('should return false when the stub does not exist', () => {
            expect(context.isResourceStub('NonExistentStub')).toBe(false);
        });
    });

    describe('findResource', () => {
        it('should return undefined when the resource type does not exist', () => {
            const condition = {
                resourceType: 'NonExistentType',
                filterFunction: jest.fn(),
            };
            expect(context.findResource(condition)).toBeUndefined();
        });

        it('should return a resource matching the filter condition for a specific type', () => {
            const condition = {
                resourceType: 'Type1',
                filterFunction: (resource: CloudFormationResource) => resource._id === 'physicalId1',
            };
            expect(context.findResource(condition)).toEqual(mockResource1);
        });

        it('should return a resource matching the filter condition from all resources when type is not specified', () => {
            const condition = {
                filterFunction: (resource: CloudFormationResource) => resource._id === 'physicalId2',
            };
            expect(context.findResource(condition)).toEqual(mockResource2);
        });

        it('should return undefined if no resource matches the filter condition', () => {
            const condition = {
                filterFunction: () => false,
            };
            expect(context.findResource(condition)).toBeUndefined();
        });
    });

    describe('findResources', () => {
        it('should return an empty array when the resource type does not exist', () => {
            const condition = {
                resourceType: 'NonExistentType',
                filterFunction: jest.fn(),
            };
            expect(context.findResources(condition)).toEqual([]);
        });

        it('should return an array of resources matching the filter condition for a specific type', () => {
            const condition = {
                resourceType: 'Type1',
                filterFunction: (resource: CloudFormationResource) => resource._id === 'physicalId1',
            };
            expect(context.findResources(condition)).toEqual([mockResource1]);
        });

        it('should return an array of resources matching the filter condition for all resources when type is not specified', () => {
            const condition = {
                filterFunction: (resource: CloudFormationResource) => Object.keys(resource.Properties).length === 0,
            };
            expect(context.findResources(condition)).toEqual([mockResource1, mockResource2]);
        });

        it('should return an empty array if no resource matches the filter condition', () => {
            const condition = {
                filterFunction: () => false,
            };
            expect(context.findResources(condition)).toEqual([]);
        });
    });
});
