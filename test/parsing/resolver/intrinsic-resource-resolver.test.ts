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

        describe.each([
            CfResourcesType.AWS_ApiGatewayV2_Authorizer,
            CfResourcesType.AWS_ApiGatewayV2_Deployment,
            CfResourcesType.AWS_ApiGatewayV2_Model,
            CfResourcesType.AWS_ApiGatewayV2_Stage,
            CfResourcesType.AWS_ApiGateway_Authorizer,
            CfResourcesType.AWS_ApiGateway_Deployment,
            CfResourcesType.AWS_ApiGateway_Method,
            CfResourcesType.AWS_ApiGateway_Model,
            CfResourcesType.AWS_ApiGateway_RequestValidator,
            CfResourcesType.AWS_ApiGateway_Resource,
            CfResourcesType.AWS_ApiGateway_RestApi,
            CfResourcesType.AWS_ApiGateway_Stage,
            CfResourcesType.AWS_CDK_Metadata,
            CfResourcesType.AWS_DynamoDB_Table,
            CfResourcesType.AWS_ECS_Service,
            CfResourcesType.AWS_ECS_TaskDefinition,
            CfResourcesType.AWS_ElasticLoadBalancingV2_ListenerRule,
            CfResourcesType.AWS_ElasticLoadBalancingV2_TargetGroup,
            CfResourcesType.AWS_Events_ApiDestination,
            CfResourcesType.AWS_Events_Archive,
            CfResourcesType.AWS_Events_Connection,
            CfResourcesType.AWS_Events_EventBus,
            CfResourcesType.AWS_Events_EventBusPolicy,
            CfResourcesType.AWS_Events_Rule,
            CfResourcesType.AWS_IAM_Policy,
            CfResourcesType.AWS_IAM_Role,
            CfResourcesType.AWS_Lambda_Function,
            CfResourcesType.AWS_Lambda_Permission,
            CfResourcesType.AWS_Logs_LogGroup,
            CfResourcesType.AWS_Pipes_Pipe,
            CfResourcesType.AWS_SNS_Subscription,
            CfResourcesType.AWS_SNS_Topic,
            CfResourcesType.AWS_SNS_TopicPolicy,
            CfResourcesType.AWS_SQS_Queue,
            CfResourcesType.AWS_StepFunctions_StateMachine,
            CfResourcesType.AWS_S3_Bucket,
            CfResourcesType.AWS_ApiGatewayV2_Api,
            CfResourcesType.AWS_ApiGatewayV2_ApiGatewayManagedOverrides,
            CfResourcesType.AWS_ApiGatewayV2_ApiMapping,
            CfResourcesType.AWS_ApiGatewayV2_DomainName,
            CfResourcesType.AWS_ApiGatewayV2_Integration,
            CfResourcesType.AWS_ApiGatewayV2_IntegrationResponse,
            CfResourcesType.AWS_ApiGatewayV2_Route,
            CfResourcesType.AWS_ApiGatewayV2_RouteResponse,
            CfResourcesType.AWS_ApiGatewayV2_VpcLink,
            CfResourcesType.AWS_ApiGateway_Account,
            CfResourcesType.AWS_ApiGateway_ApiKey,
            CfResourcesType.AWS_ApiGateway_BasePathMapping,
            CfResourcesType.AWS_ApiGateway_BasePathMappingV2,
            CfResourcesType.AWS_ApiGateway_ClientCertificate,
            CfResourcesType.AWS_ApiGateway_DocumentationPart,
            CfResourcesType.AWS_ApiGateway_DocumentationVersion,
            CfResourcesType.AWS_ApiGateway_DomainName,
            CfResourcesType.AWS_ApiGateway_DomainNameAccessAssociation,
            CfResourcesType.AWS_ApiGateway_GatewayResponse,
            CfResourcesType.AWS_ApiGateway_UsagePlan,
            CfResourcesType.AWS_ApiGateway_UsagePlanKey,
            CfResourcesType.AWS_ApiGateway_VpcLink,
            CfResourcesType.AWS_Events_Endpoint,
            CfResourcesType.AWS_Glue_Job,
            CfResourcesType.AWS_Glue_Connection,
            CfResourcesType.AWS_Glue_Crawler,
            CfResourcesType.AWS_Glue_Database,
            CfResourcesType.AWS_Glue_Trigger,
        ])('Resolver Test', (intrinsicName) => {
            it(`${intrinsicName} should be defined`, () => {
                expect(resolver.getResourceIntrinsic(intrinsicName)).toBeDefined();
            });
        });
    });
});
