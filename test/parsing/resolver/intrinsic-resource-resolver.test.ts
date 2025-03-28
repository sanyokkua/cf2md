import { CfResourcesType } from '../../../src/parsing';
import { ResourceIntrinsicResolverImpl } from '../../../src/parsing/resolver/intrinsic-resource-resolver';
import { CloudFormationResource, CloudFormationTemplate } from '../../../src/parsing/types/cloudformation-model';
import { IntrinsicContext } from '../../../src/parsing/types/intrinsic-types';
import { ResolvingContext } from '../../../src/parsing/types/resolving-types';
import { ResourceUtils } from '../../../src/parsing/types/util-service-types';

const createDummyContext = (): ResolvingContext => {
    return {
        originalTemplate: {} as CloudFormationTemplate,
        lookupMapPreProcessed: {},
        generatedIds: new Set<string>(),
        lookupMapDynamic: {},
        currentPath: [],
        addName: jest.fn(),
        popName: jest.fn(() => 'dummy'),
        getCurrentPath: jest.fn(() => 'dummyPath'),
        hasParameterName: jest.fn(),
        getParameter: jest.fn(),
        addParameter: jest.fn(),
        addGeneratedId: jest.fn(),
        isIdExists: jest.fn(),
        getRegion: jest.fn(() => 'us-east-1'),
        getPartition: jest.fn(() => 'aws'),
        getAccountId: jest.fn(() => '123456789012'),
        getAZs: jest.fn(() => ['us-east-1a']),
        getStackName: jest.fn(() => 'test-stack'),
    };
};

describe('ResourceIntrinsicResolverImpl', () => {
    let resolver: ResourceIntrinsicResolverImpl;
    let mockResourceUtils: jest.Mocked<ResourceUtils>;
    let resolvingContext: ResolvingContext;

    beforeEach(() => {
        resolvingContext = createDummyContext();
        // Mock only the functions that may be used by factory functions.
        mockResourceUtils = {
            generateAZs: jest.fn(),
            generateAlphaNumeric: jest.fn(),
            shortUuid: jest.fn(),
            fullUuid: jest.fn(),
            generateGenericId: jest.fn(),
            generatePrefixedId: jest.fn(),
            generateNameId: jest.fn(),
            resolveString: jest.fn(),
            resolveStringWithDefault: jest.fn(),
        };

        resolver = new ResourceIntrinsicResolverImpl(mockResourceUtils);
        jest.clearAllMocks();
    });

    describe('getResourceIntrinsic', () => {
        test('returns a new intrinsic instance for a supported resource type and caches it', () => {
            // Arrange: use a supported resource type.
            const resourceType = CfResourcesType.AWS_ApiGateway_VpcLink;

            // Act: first call should create a new instance.
            const intrinsic1 = resolver.getResourceIntrinsic(resourceType);
            expect(intrinsic1).toBeDefined();

            // Calling it again should return the same cached instance.
            const intrinsic2 = resolver.getResourceIntrinsic(resourceType);
            expect(intrinsic2).toBe(intrinsic1);
        });

        test('returns the stub intrinsic for an unsupported resource type', () => {
            // Arrange: use an unsupported resource type.
            const unsupportedType = 'Unsupported::Resource::Type';

            // Act
            const intrinsic = resolver.getResourceIntrinsic(unsupportedType);

            mockResourceUtils.generateAlphaNumeric.mockReturnValue('stub');
            // Assert: The returned intrinsic should be the stub.

            const ctx: IntrinsicContext = {
                resource: { Type: unsupportedType } as CloudFormationResource,
                logicalId: 'LogicalID',
                ctx: resolvingContext,
                valueResolver: jest.fn(),
            };
            expect(intrinsic.refFunc(ctx)).toEqual(expect.stringContaining('stub'));
            expect(intrinsic.getAttFunc(ctx, 'any')).toEqual(expect.stringContaining('stub'));
            expect(intrinsic.arnGenFunc(ctx)).toEqual(expect.stringContaining('stub'));
            expect(intrinsic.idGenFunc(ctx)).toEqual(expect.stringContaining('stub'));

            // Subsequent calls for the unsupported type should return the same stub (cached).
            const intrinsic2 = resolver.getResourceIntrinsic(unsupportedType);
            expect(intrinsic2).toBe(intrinsic);
        });

        test('caches different intrinsics separately for different supported resource types', () => {
            // Arrange: use two different supported resource types.
            const type1 = CfResourcesType.AWS_ApiGateway_Authorizer;
            const type2 = CfResourcesType.AWS_ApiGateway_Deployment;

            // Act
            const intrinsic1 = resolver.getResourceIntrinsic(type1);
            const intrinsic2 = resolver.getResourceIntrinsic(type2);

            // Assert: They should be defined and distinct.
            expect(intrinsic1).toBeDefined();
            expect(intrinsic2).toBeDefined();
            expect(intrinsic1).not.toBe(intrinsic2);
        });
    });
});
