import {
    AwsApiGatewayAccountResource,
    AwsApiGatewayApiKeyResource,
    AwsApiGatewayAuthorizerResource,
    AwsApiGatewayBasePathMappingResource,
    AwsApiGatewayBasePathMappingV2Resource,
    AwsApiGatewayClientCertificateResource,
    AwsApiGatewayDeploymentResource,
    AwsApiGatewayDocumentationPartResource,
    AwsApiGatewayDocumentationVersionResource,
    AwsApiGatewayDomainNameAccessAssociationResource,
    AwsApiGatewayDomainNameResource,
    AwsApiGatewayGatewayResponseResource,
    AwsApiGatewayMethodResource,
    AwsApiGatewayModelResource,
    AwsApiGatewayRequestValidatorResource,
    AwsApiGatewayResourceResource,
    AwsApiGatewayRestApiResource,
    AwsApiGatewayStageResource,
    AwsApiGatewayUsagePlanKeyResource,
    AwsApiGatewayUsagePlanResource,
    AwsApiGatewayV2ApiGatewayManagedOverridesResource,
    AwsApiGatewayV2ApiMappingResource,
    AwsApiGatewayV2ApiResource,
    AwsApiGatewayV2AuthorizerResource,
    AwsApiGatewayV2DeploymentResource,
    AwsApiGatewayV2DomainNameResource,
    AwsApiGatewayV2IntegrationResource,
    AwsApiGatewayV2IntegrationResponseResource,
    AwsApiGatewayV2ModelResource,
    AwsApiGatewayV2RouteResource,
    AwsApiGatewayV2RouteResponseResource,
    AwsApiGatewayV2StageResource,
    AwsApiGatewayV2VpcLinkResource,
    AwsApiGatewayVpcLinkResource,
    AwsCDKMetadataResource,
    AwsDynamoDBTableResource,
    AwsEcsServiceResource,
    AwsECSTaskDefinitionResource,
    AwsElasticLoadBalancingV2ListenerRule,
    AwsElasticLoadBalancingV2TargetGroupResource,
    AwsEventsApiDestinationResource,
    AwsEventsArchiveResource,
    AwsEventsConnectionResource,
    AwsEventsEndpointResource,
    AwsEventsEventBusPolicyResource,
    AwsEventsEventBusResource,
    AwsEventsRuleResource,
    AWSGlueConnectionResource,
    AwsGlueCrawlerResource,
    AWSGlueDatabaseResource,
    AwsGlueJobResource,
    AwsGlueTriggerResource,
    AwsIAMPolicyResource,
    AwsIAMRoleResource,
    AwsLambdaFunctionResource,
    AwsLambdaPermissionResource,
    AwsLogsLogGroupResource,
    AwsPipesPipeResource,
    AwsS3BucketResource,
    AwsSNSSubscriptionResource,
    AwsSNSTopicPolicyResource,
    AwsSNSTopicResource,
    AwsSQSQueueResource,
    AwsStepFunctionsStateMachineResource,
    StubFunctionForUnsupported,
} from '../../../../src/parsing/resolver/resource';
import {
    ApiGatewayAuthorizerResource,
    ApiGatewayBasePathMappingResource,
    ApiGatewayBasePathMappingV2Resource,
    ApiGatewayDeploymentResource,
    ApiGatewayDocumentationPartResource,
    ApiGatewayDocumentationVersionResource,
    ApiGatewayDomainNameAccessAssociationResource,
    ApiGatewayDomainNameResource,
    ApiGatewayGatewayResponseResource,
    ApiGatewayMethodResource,
    ApiGatewayModelResource,
    ApiGatewayRequestValidatorResource,
    ApiGatewayResourceResource,
    ApiGatewayStageResource,
    ApiGatewayUsagePlanKeyResource,
    ApiGatewayV2ApiMappingResource,
    ApiGatewayV2AuthorizerResource,
    ApiGatewayV2DeploymentResource,
    ApiGatewayV2DomainNameResource,
    ApiGatewayV2IntegrationResource,
    ApiGatewayV2IntegrationResponseResource,
    ApiGatewayV2ModelResource,
    ApiGatewayV2RouteResource,
    ApiGatewayV2RouteResponseResource,
    ApiGatewayV2StageResource,
    ApiGatewayV2VpcLinkResource,
    ApiGatewayVpcLinkResource,
    CloudFormationResource,
    DynamoDBTableResource,
    EcsServiceResource,
    ECSTaskDefinitionResource,
    ElasticLoadBalancingV2TargetGroupResource,
    EventsApiDestinationResource,
    EventsArchiveResource,
    EventsConnectionResource,
    EventsEventBusResource,
    EventsRuleResource,
    GlueConnectionResource,
    GlueCrawlerResource,
    GlueDatabaseResource,
    GlueJobResource,
    IAMPolicyResource,
    IAMRoleResource,
    LambdaFunctionResource,
    LogsLogGroupResource,
    PipesPipeResource,
    S3BucketResource,
    SNSSubscriptionResource,
    SNSTopicResource,
    SQSQueueResource,
    StepFunctionsStateMachineResource,
} from '../../../../src/parsing/types/cloudformation-model';
import { IntrinsicContext, ResourceIntrinsic } from '../../../../src/parsing/types/intrinsic-types';
import { ResourceUtils } from '../../../../src/parsing/types/util-service-types';
import { createMockIntrinsicContext, createMockResourceUtils } from './utils';

interface GetAttExpectation {
    [key: string]: unknown;
}

interface TestCase {
    description: string;
    getInstance: (mockResourceUtils: ResourceUtils) => ResourceIntrinsic;
    idGen: string;
    arnGen: string;
    refFunc: string;
    getAttFunc: GetAttExpectation;
    resource?: CloudFormationResource;
    testMocks?: () => void;
}

describe('ResourceIntrinsic Implementations', () => {
    let mockContext: jest.Mocked<IntrinsicContext>;
    let mockResourceUtils: jest.Mocked<ResourceUtils>;
    let instance: ResourceIntrinsic;

    beforeEach(() => {
        jest.clearAllMocks();
        mockContext = createMockIntrinsicContext();
        mockResourceUtils = createMockResourceUtils();
    });

    const testCases: TestCase[] = [
        {
            description: 'AwsApiGatewayAccountResource',
            getInstance: (utils) => new AwsApiGatewayAccountResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/abcdef',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
        },
        {
            description: 'AwsApiGatewayApiKeyResource',
            getInstance: (utils) => new AwsApiGatewayApiKeyResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/apikeys/abcdef',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
        },
        {
            description: 'AwsApiGatewayAuthorizerResource',
            getInstance: (utils) => new AwsApiGatewayAuthorizerResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/restApiId/authorizers/abcdef',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: { Properties: { RestApiId: 'restApiId' } } as ApiGatewayAuthorizerResource,
        },
        {
            description: 'AwsApiGatewayBasePathMappingResource',
            getInstance: (utils) => new AwsApiGatewayBasePathMappingResource(utils),
            idGen: 'bpmapping-abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/domainnames/mydomain/basepathmappings/path',
            refFunc: 'bpmapping-abcdef',
            getAttFunc: {
                '': 'bpmapping-abcdef',
            },
            resource: { Properties: { DomainName: 'mydomain', BasePath: 'path' } } as ApiGatewayBasePathMappingResource,
        },
        {
            description: 'AwsApiGatewayBasePathMappingV2Resource',
            getInstance: (utils) => new AwsApiGatewayBasePathMappingV2Resource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/domainnames/mydomain:arn/basepathmappings/path',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: { Properties: { DomainNameArn: 'mydomain:arn', BasePath: 'path' } } as ApiGatewayBasePathMappingV2Resource,
        },
        {
            description: 'AwsApiGatewayClientCertificateResource',
            getInstance: (utils) => new AwsApiGatewayClientCertificateResource(utils),
            idGen: 'cert-abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/clientcertificates/cert-abcdef',
            refFunc: 'cert-abcdef',
            getAttFunc: { '': 'cert-abcdef' },
        },
        {
            description: 'AwsApiGatewayDeploymentResource',
            getInstance: (utils) => new AwsApiGatewayDeploymentResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/restApiId123/deployments/abcdef',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: {
                Properties: {
                    RestApiId: 'restApiId123',
                },
            } as ApiGatewayDeploymentResource,
        },
        {
            description: 'AwsApiGatewayDocumentationPartResource',
            getInstance: (utils) => new AwsApiGatewayDocumentationPartResource(utils),
            idGen: 'docpart-abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/apis/test-api/documentation/parts/docpart-abcdef',
            refFunc: 'docpart-abcdef',
            getAttFunc: {
                '': 'docpart-abcdef',
            },
            resource: {
                Properties: {
                    RestApiId: 'test-api',
                },
            } as ApiGatewayDocumentationPartResource,
        },
        {
            description: 'AwsApiGatewayDocumentationVersionResource',
            getInstance: (utils: any) => new AwsApiGatewayDocumentationVersionResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1:123456789012:/apis/api-123/documentation/versions/v1.0',
            refFunc: 'v1.0',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: {
                Properties: {
                    DocumentationVersion: 'v1.0',
                    RestApiId: 'api-123',
                },
            } as ApiGatewayDocumentationVersionResource,
        },
        {
            description: 'AwsApiGatewayDomainNameAccessAssociationResource',
            getInstance: (utils: any) => new AwsApiGatewayDomainNameAccessAssociationResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1:123456789012:/domainnameaccessassociations/domainname/domain-name/vpcesource/AccessAssociationSource',
            refFunc:
                'arn:aws:apigateway:us-east-1:123456789012:/domainnameaccessassociations/domainname/domain-name/vpcesource/AccessAssociationSource',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: {
                Properties: {
                    AccessAssociationSource: 'AccessAssociationSource',
                },
            } as ApiGatewayDomainNameAccessAssociationResource,
        },
        {
            description: 'AwsApiGatewayDomainNameResource',
            getInstance: (utils) => new AwsApiGatewayDomainNameResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/domainnames/TestDomain',
            refFunc: 'abcdef',
            getAttFunc: {
                'DistributionDomainName': 'd111111abcdef8.cloudfront.net',
                'DistributionHostedZoneId': 'Z2FDTNDATAQYW2',
                'RegionalDomainName': 'RegionalDomainName',
                'RegionalHostedZoneId': 'RegionalHostedZoneId',
                '': 'abcdef',
            },
            resource: { Properties: { DomainName: 'TestDomain' } } as ApiGatewayDomainNameResource,
        },
        {
            description: 'AwsApiGatewayDomainNameResource without domain name',
            getInstance: (utils) => new AwsApiGatewayDomainNameResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/domainnames/domain',
            refFunc: 'abcdef',
            getAttFunc: {
                'DistributionDomainName': 'd111111abcdef8.cloudfront.net',
                'DistributionHostedZoneId': 'Z2FDTNDATAQYW2',
                'RegionalDomainName': 'RegionalDomainName',
                'RegionalHostedZoneId': 'RegionalHostedZoneId',
                '': 'abcdef',
            },
        },
        {
            description: 'AwsApiGatewayGatewayResponseResource',
            getInstance: (utils) => new AwsApiGatewayGatewayResponseResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/TestRestApiId/gatewayresponses/ResponseType',
            refFunc: 'abcdef',
            getAttFunc: {
                'ResponseType': 'ResponseType',
                '': 'abcdef',
            },
            resource: {
                Properties: {
                    RestApiId: 'TestRestApiId',
                    ResponseType: 'ResponseType',
                },
            } as ApiGatewayGatewayResponseResource,
        },
        {
            description: 'AwsApiGatewayMethodResource',
            getInstance: (utils) => new AwsApiGatewayMethodResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/RestApiId/resources/ResourceId/methods/HttpMethod',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: {
                Properties: {
                    RestApiId: 'RestApiId',
                    ResourceId: 'ResourceId',
                    HttpMethod: 'HttpMethod',
                },
            } as ApiGatewayMethodResource,
        },
        {
            description: 'AwsApiGatewayModelResource',
            getInstance: (utils) => new AwsApiGatewayModelResource(utils),
            idGen: 'Name',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/RestApiId/models/Name',
            refFunc: 'Name',
            getAttFunc: {
                '': 'Name',
            },
            resource: {
                Properties: {
                    RestApiId: 'RestApiId',
                    Name: 'Name',
                },
            } as ApiGatewayModelResource,
        },
        {
            description: 'AwsApiGatewayModelResource without Name',
            getInstance: (utils) => new AwsApiGatewayModelResource(utils),
            idGen: 'model',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/RestApiId/models/model',
            refFunc: 'model',
            getAttFunc: {
                '': 'model',
            },
            resource: {
                Properties: {
                    RestApiId: 'RestApiId',
                },
            } as ApiGatewayModelResource,
        },
        {
            description: 'AwsApiGatewayRequestValidatorResource',
            getInstance: (utils) => new AwsApiGatewayRequestValidatorResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/RestApiId/requestvalidators/abcdef',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: {
                Properties: {
                    RestApiId: 'RestApiId',
                },
            } as ApiGatewayRequestValidatorResource,
        },
        {
            description: 'AwsApiGatewayResourceResource',
            getInstance: (utils) => new AwsApiGatewayResourceResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/RestApiId/resources/abcdef',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: {
                Properties: {
                    RestApiId: 'RestApiId',
                },
            } as ApiGatewayResourceResource,
        },
        {
            description: 'AwsApiGatewayRestApiResource',
            getInstance: (utils) => new AwsApiGatewayRestApiResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/abcdef',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
                'RootResourceId': 'STUB_RootResourceId',
            },
        },
        {
            description: 'AwsApiGatewayStageResource',
            getInstance: (utils) => new AwsApiGatewayStageResource(utils),
            idGen: 'StageName',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/RestApiId/stages/StageName',
            refFunc: 'StageName',
            getAttFunc: {
                '': 'StageName',
            },
            resource: {
                Properties: {
                    RestApiId: 'RestApiId',
                    StageName: 'StageName',
                },
            } as ApiGatewayStageResource,
        },
        {
            description: 'AwsApiGatewayStageResource Without StageName',
            getInstance: (utils) => new AwsApiGatewayStageResource(utils),
            idGen: 'stage',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/RestApiId/stages/stage',
            refFunc: 'stage',
            getAttFunc: {
                '': 'stage',
            },
            resource: {
                Properties: {
                    RestApiId: 'RestApiId',
                },
            } as ApiGatewayStageResource,
        },
        {
            description: 'AwsApiGatewayUsagePlanKeyResource',
            getInstance: (utils) => new AwsApiGatewayUsagePlanKeyResource(utils),
            idGen: 'plankey-abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/usageplans/UsagePlanId/keys/KeyId',
            refFunc: 'plankey-abcdef',
            getAttFunc: {
                '': 'plankey-abcdef',
            },
            resource: {
                Properties: {
                    KeyId: 'KeyId',
                    UsagePlanId: 'UsagePlanId',
                },
            } as ApiGatewayUsagePlanKeyResource,
        },
        {
            description: 'AwsApiGatewayUsagePlanResource',
            getInstance: (utils) => new AwsApiGatewayUsagePlanResource(utils),
            idGen: 'usageplan-abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/usageplans/usageplan-abcdef',
            refFunc: 'usageplan-abcdef',
            getAttFunc: {
                '': 'usageplan-abcdef',
            },
        },
        {
            description: 'AwsApiGatewayV2ApiGatewayManagedOverridesResource',
            getInstance: (utils) => new AwsApiGatewayV2ApiGatewayManagedOverridesResource(utils),
            idGen: 'mgo-abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1:123456789012:mgo-abcdef',
            refFunc: 'mgo-abcdef',
            getAttFunc: {
                '': 'mgo-abcdef',
            },
        },
        {
            description: 'AwsApiGatewayV2ApiMappingResource',
            getInstance: (utils) => new AwsApiGatewayV2ApiMappingResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/domainnames/TestName/apimappings/abcdef',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: { Properties: { DomainName: 'TestName' } } as ApiGatewayV2ApiMappingResource,
        },
        {
            description: 'AwsApiGatewayV2ApiResource',
            getInstance: (utils) => new AwsApiGatewayV2ApiResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/apis/abcdef',
            refFunc: 'abcdef',
            getAttFunc: {
                'ApiEndpoint': 'https://abcdef.execute-api.us-east-1.amazonaws.com',
                '': 'abcdef',
            },
        },
        {
            description: 'AwsApiGatewayV2AuthorizerResource',
            getInstance: (utils) => new AwsApiGatewayV2AuthorizerResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/apis/TestApiId/authorizers/abcdef',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: {
                Properties: {
                    ApiId: 'TestApiId',
                },
            } as ApiGatewayV2AuthorizerResource,
        },
        {
            description: 'AwsApiGatewayV2DeploymentResource',
            getInstance: (utils) => new AwsApiGatewayV2DeploymentResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/apis/TestApiId/deployments/abcdef',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: {
                Properties: {
                    ApiId: 'TestApiId',
                },
            } as ApiGatewayV2DeploymentResource,
        },
        {
            description: 'AwsApiGatewayV2DomainNameResource',
            getInstance: (utils) => new AwsApiGatewayV2DomainNameResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/domainnames/TestDomainName',
            refFunc: 'TestDomainName',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: {
                Properties: {
                    DomainName: 'TestDomainName',
                },
            } as ApiGatewayV2DomainNameResource,
        },
        {
            description: 'AwsApiGatewayV2IntegrationResource',
            getInstance: (utils) => new AwsApiGatewayV2IntegrationResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/TestApiId/resources/abcdef/methods/POST/integration',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: {
                Properties: {
                    ApiId: 'TestApiId',
                    IntegrationMethod: 'POST',
                },
            } as ApiGatewayV2IntegrationResource,
        },
        {
            description: 'AwsApiGatewayV2IntegrationResource',
            getInstance: (utils) => new AwsApiGatewayV2IntegrationResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/TestApiId/resources/abcdef/methods/POST/integration',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: {
                Properties: {
                    ApiId: 'TestApiId',
                    IntegrationMethod: 'POST',
                },
            } as ApiGatewayV2IntegrationResource,
        },
        {
            description: 'AwsApiGatewayV2IntegrationResponseResource',
            getInstance: (utils) => new AwsApiGatewayV2IntegrationResponseResource(utils),
            idGen: 'iresp-abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/TestApiId/resources/iresp-abcdef/methods/http-method/integration/responses/IntegrationResponseKey',
            refFunc: 'iresp-abcdef',
            getAttFunc: {
                '': 'iresp-abcdef',
            },
            resource: {
                Properties: {
                    ApiId: 'TestApiId',
                    IntegrationResponseKey: 'IntegrationResponseKey',
                },
            } as ApiGatewayV2IntegrationResponseResource,
        },
        {
            description: 'AwsApiGatewayV2ModelResource',
            getInstance: (utils) => new AwsApiGatewayV2ModelResource(utils),
            idGen: 'TestName',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/TestApiId/models/TestName',
            refFunc: 'TestName',
            getAttFunc: {
                '': 'TestName',
            },
            resource: {
                Properties: {
                    ApiId: 'TestApiId',
                    Name: 'TestName',
                },
            } as ApiGatewayV2ModelResource,
        },
        {
            description: 'AwsApiGatewayV2ModelResource without Name',
            getInstance: (utils) => new AwsApiGatewayV2ModelResource(utils),
            idGen: 'model',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/TestApiId/models/model',
            refFunc: 'model',
            getAttFunc: {
                '': 'model',
            },
            resource: {
                Properties: {
                    ApiId: 'TestApiId',
                },
            } as ApiGatewayV2ModelResource,
        },
        {
            description: 'AwsApiGatewayV2RouteResource',
            getInstance: (utils) => new AwsApiGatewayV2RouteResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/apis/TestApiId/routes/abcdef',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: {
                Properties: {
                    ApiId: 'TestApiId',
                },
            } as ApiGatewayV2RouteResource,
        },
        {
            description: 'AwsApiGatewayV2RouteResponseResource',
            getInstance: (utils) => new AwsApiGatewayV2RouteResponseResource(utils),
            idGen: 'rresp-abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1::/apis/TestApiId/routes/TestRouteId/routeresponses/rresp-abcdef',
            refFunc: 'rresp-abcdef',
            getAttFunc: {
                '': 'rresp-abcdef',
            },
            resource: {
                Properties: {
                    ApiId: 'TestApiId',
                    RouteId: 'TestRouteId',
                },
            } as ApiGatewayV2RouteResponseResource,
        },
        {
            description: 'AwsApiGatewayV2StageResource',
            getInstance: (utils) => new AwsApiGatewayV2StageResource(utils),
            idGen: 'TestStageName',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/TestApiId/stages/TestStageName',
            refFunc: 'TestStageName',
            getAttFunc: {
                '': 'TestStageName',
            },
            resource: {
                Properties: {
                    ApiId: 'TestApiId',
                    StageName: 'TestStageName',
                },
            } as ApiGatewayV2StageResource,
        },
        {
            description: 'AwsApiGatewayV2StageResource without StageName',
            getInstance: (utils) => new AwsApiGatewayV2StageResource(utils),
            idGen: 'stage',
            arnGen: 'arn:aws:apigateway:us-east-1::/restapis/TestApiId/stages/stage',
            refFunc: 'stage',
            getAttFunc: {
                '': 'stage',
            },
            resource: {
                Properties: {
                    ApiId: 'TestApiId',
                },
            } as ApiGatewayV2StageResource,
        },
        {
            description: 'AwsApiGatewayV2VpcLinkResource',
            getInstance: (utils) => new AwsApiGatewayV2VpcLinkResource(utils),
            idGen: 'TestName',
            arnGen: 'arn:aws:apigateway:us-east-1::/vpclinks/TestName',
            refFunc: 'TestName',
            getAttFunc: {
                '': 'TestName',
            },
            resource: {
                Properties: {
                    Name: 'TestName',
                },
            } as ApiGatewayV2VpcLinkResource,
        },
        {
            description: 'AwsApiGatewayV2VpcLinkResource without Name',
            getInstance: (utils) => new AwsApiGatewayV2VpcLinkResource(utils),
            idGen: 'vpclink',
            arnGen: 'arn:aws:apigateway:us-east-1::/vpclinks/vpclink',
            refFunc: 'vpclink',
            getAttFunc: {
                '': 'vpclink',
            },
            resource: {
                Properties: {
                    Name: 'vpclink',
                },
            } as ApiGatewayV2VpcLinkResource,
        },
        {
            description: 'AwsApiGatewayVpcLinkResource',
            getInstance: (utils) => new AwsApiGatewayVpcLinkResource(utils),
            idGen: 'TestName',
            arnGen: 'arn:aws:apigateway:us-east-1::/vpclinks/TestName',
            refFunc: 'TestName',
            getAttFunc: {
                '': 'TestName',
            },
            resource: {
                Properties: {
                    Name: 'TestName',
                },
            } as ApiGatewayVpcLinkResource,
        },
        {
            description: 'AwsApiGatewayVpcLinkResource without Name',
            getInstance: (utils) => new AwsApiGatewayVpcLinkResource(utils),
            idGen: 'vpclink',
            arnGen: 'arn:aws:apigateway:us-east-1::/vpclinks/vpclink',
            refFunc: 'vpclink',
            getAttFunc: {
                '': 'vpclink',
            },
            resource: {
                Properties: {
                    Name: 'vpclink',
                },
            } as ApiGatewayVpcLinkResource,
        },
        {
            description: 'AwsCDKMetadataResource',
            getInstance: (utils) => new AwsCDKMetadataResource(utils),
            idGen: 'full-uid-number',
            arnGen: 'arn:aws:cdk::123456789012:testResource',
            refFunc: 'full-uid-number',
            getAttFunc: {
                '': 'full-uid-number',
            },
        },
        {
            description: 'AwsDynamoDBTableResource',
            getInstance: (utils) => new AwsDynamoDBTableResource(utils),
            idGen: 'TestTable',
            arnGen: 'arn:aws:dynamodb:us-east-1:123456789012:table/TestTable',
            refFunc: 'TestTable',
            getAttFunc: {
                'Arn': 'arn:aws:dynamodb:us-east-1:123456789012:table/TestTable',
                'StreamArn': 'arn:aws:dynamodb:us-east-1:123456789012:table/TestTable/stream/2025-03-31T18:09:10.000Z',
                '': 'TestTable',
            },
            resource: {
                Properties: {
                    TableName: 'TestTable',
                },
            } as DynamoDBTableResource,
            testMocks: () => {
                const mockedTime = '2025-03-31T18:09:10.000Z';
                jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockedTime);
            },
        },
        {
            description: 'AwsDynamoDBTableResource without TableName',
            getInstance: (utils) => new AwsDynamoDBTableResource(utils),
            idGen: 'table',
            arnGen: 'arn:aws:dynamodb:us-east-1:123456789012:table/table',
            refFunc: 'table',
            getAttFunc: {
                'Arn': 'arn:aws:dynamodb:us-east-1:123456789012:table/table',
                'StreamArn': 'arn:aws:dynamodb:us-east-1:123456789012:table/table/stream/2025-03-31T18:09:10.000Z',
                '': 'table',
            },
            testMocks: () => {
                const mockedTime = '2025-03-31T18:09:10.000Z';
                jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockedTime);
            },
        },
        {
            description: 'AwsEcsServiceResource',
            getInstance: (utils) => new AwsEcsServiceResource(utils),
            idGen: 'TestService',
            arnGen: 'arn:aws:ecs:us-east-1:123456789012:service/test-cluster/TestService',
            refFunc: 'arn:aws:ecs:us-east-1:123456789012:service/test-cluster/TestService',
            getAttFunc: {
                'ServiceArn': 'arn:aws:ecs:us-east-1:123456789012:service/test-cluster/TestService',
                '': 'TestService',
            },
            resource: {
                Properties: {
                    Cluster: 'test-cluster',
                    ServiceName: 'TestService',
                },
            } as EcsServiceResource,
        },
        {
            description: 'AwsEcsServiceResource without ServiceName',
            getInstance: (utils) => new AwsEcsServiceResource(utils),
            idGen: 'sn',
            arnGen: 'arn:aws:ecs:us-east-1:123456789012:service/test-cluster/sn',
            refFunc: 'arn:aws:ecs:us-east-1:123456789012:service/test-cluster/sn',
            getAttFunc: {
                'ServiceArn': 'arn:aws:ecs:us-east-1:123456789012:service/test-cluster/sn',
                '': 'sn',
            },
            resource: {
                Properties: {
                    Cluster: 'test-cluster',
                },
            } as EcsServiceResource,
        },
        {
            description: 'AwsEcsServiceResource without ServiceName and Cluster',
            getInstance: (utils) => new AwsEcsServiceResource(utils),
            idGen: 'sn',
            arnGen: 'arn:aws:ecs:us-east-1:123456789012:service/default/sn',
            refFunc: 'arn:aws:ecs:us-east-1:123456789012:service/default/sn',
            getAttFunc: {
                'ServiceArn': 'arn:aws:ecs:us-east-1:123456789012:service/default/sn',
                '': 'sn',
            },
        },
        {
            description: 'AwsECSTaskDefinitionResource with Family',
            getInstance: (utils) => new AwsECSTaskDefinitionResource(utils),
            idGen: 'arn:aws:ecs:us-east-1:123456789012:task-definition/my-family:1',
            arnGen: 'arn:aws:ecs:us-east-1:123456789012:task-definition/my-family:1',
            refFunc: 'arn:aws:ecs:us-east-1:123456789012:task-definition/my-family:1',
            getAttFunc: {
                'TaskDefinitionArn': 'arn:aws:ecs:us-east-1:123456789012:task-definition/my-family:1',
                '': 'arn:aws:ecs:us-east-1:123456789012:task-definition/my-family:1',
            },
            resource: {
                Properties: {
                    Family: 'my-family',
                },
            } as ECSTaskDefinitionResource,
        },
        {
            description: 'AwsECSTaskDefinitionResource without Family',
            getInstance: (utils) => new AwsECSTaskDefinitionResource(utils),
            idGen: 'arn:aws:ecs:us-east-1:123456789012:task-definition/tf-abcd:1',
            arnGen: 'arn:aws:ecs:us-east-1:123456789012:task-definition/tf-abcd:1',
            refFunc: 'arn:aws:ecs:us-east-1:123456789012:task-definition/tf-abcd:1',
            getAttFunc: {
                'TaskDefinitionArn': 'arn:aws:ecs:us-east-1:123456789012:task-definition/tf-abcd:1',
                '': 'arn:aws:ecs:us-east-1:123456789012:task-definition/tf-abcd:1',
            },
            resource: {
                Properties: {},
            } as ECSTaskDefinitionResource,
            testMocks: () => {
                mockResourceUtils.generateNameId.mockImplementation((val) => (val === undefined ? 'tf-abcd' : String(val)));
            },
        },
        {
            description: 'AwsElasticLoadBalancingV2ListenerRule',
            getInstance: (utils) => new AwsElasticLoadBalancingV2ListenerRule(utils),
            idGen: 'arn:aws:elasticloadbalancing:us-east-1:123456789012:listener-rule/stub-cluster/STUB_ALPHANUMERIC_1/STUB_ALPHANUMERIC_2/STUB_ALPHANUMERIC_3',
            arnGen: 'arn:aws:elasticloadbalancing:us-east-1:123456789012:listener-rule/stub-cluster/STUB_ALPHANUMERIC_1/STUB_ALPHANUMERIC_2/STUB_ALPHANUMERIC_3',
            refFunc:
                'arn:aws:elasticloadbalancing:us-east-1:123456789012:listener-rule/stub-cluster/STUB_ALPHANUMERIC_1/STUB_ALPHANUMERIC_2/STUB_ALPHANUMERIC_3',
            getAttFunc: {
                'IsDefault': 'Yes/No_Stub',
                'RuleArn':
                    'arn:aws:elasticloadbalancing:us-east-1:123456789012:listener-rule/stub-cluster/STUB_ALPHANUMERIC_1/STUB_ALPHANUMERIC_2/STUB_ALPHANUMERIC_3',
                '': 'arn:aws:elasticloadbalancing:us-east-1:123456789012:listener-rule/stub-cluster/STUB_ALPHANUMERIC_1/STUB_ALPHANUMERIC_2/STUB_ALPHANUMERIC_3',
            },
            testMocks: () => {
                mockResourceUtils.generateAlphaNumeric
                    .mockReturnValueOnce('STUB_ALPHANUMERIC_1')
                    .mockReturnValueOnce('STUB_ALPHANUMERIC_2')
                    .mockReturnValueOnce('STUB_ALPHANUMERIC_3')
                    .mockReturnValueOnce('STUB_ALPHANUMERIC_1') // For idGenFunc call in getAtt
                    .mockReturnValueOnce('STUB_ALPHANUMERIC_2')
                    .mockReturnValueOnce('STUB_ALPHANUMERIC_3');
            },
        },
        {
            description: 'AwsElasticLoadBalancingV2TargetGroupResource with Name',
            getInstance: (utils) => new AwsElasticLoadBalancingV2TargetGroupResource(utils),
            idGen: 'arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/MyTa/STUB_ALPHANUMERIC',
            arnGen: 'arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/MyTa/STUB_ALPHANUMERIC',
            refFunc: 'arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/MyTa/STUB_ALPHANUMERIC',
            getAttFunc: {
                'LoadBalancerArns': 'LoadBalancerArns',
                'TargetGroupArn': 'arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/MyTa/STUB_ALPHANUMERIC',
                'TargetGroupFullName': 'targetgroup/MyTa/STUB_ALPHANUMERIC',
                'TargetGroupName': 'MyTa',
                '': 'arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/MyTa/STUB_ALPHANUMERIC',
            },
            resource: {
                Properties: {
                    Name: 'MyTargetGroup',
                },
            } as ElasticLoadBalancingV2TargetGroupResource,
            testMocks: () => {
                mockResourceUtils.generateNameId.mockReturnValue('MyTa');
                mockResourceUtils.generateAlphaNumeric.mockReturnValue('STUB_ALPHANUMERIC');
            },
        },
        {
            description: 'AwsElasticLoadBalancingV2TargetGroupResource without Name',
            getInstance: (utils) => new AwsElasticLoadBalancingV2TargetGroupResource(utils),
            idGen: 'arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/tgabcd/STUB_ALPHANUMERIC',
            arnGen: 'arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/tgabcd/STUB_ALPHANUMERIC',
            refFunc: 'arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/tgabcd/STUB_ALPHANUMERIC',
            getAttFunc: {
                'LoadBalancerArns': 'LoadBalancerArns',
                'TargetGroupArn': 'arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/tgabcd/STUB_ALPHANUMERIC',
                'TargetGroupFullName': 'targetgroup/tgabcd/STUB_ALPHANUMERIC',
                'TargetGroupName': 'tgabcd',
                '': 'arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/tgabcd/STUB_ALPHANUMERIC',
            },
            testMocks: () => {
                mockResourceUtils.generateNameId.mockReturnValue('tgabcd');
                mockResourceUtils.generateAlphaNumeric.mockReturnValue('STUB_ALPHANUMERIC');
            },
        },
        {
            description: 'AwsEventsApiDestinationResource with Name',
            getInstance: (utils) => new AwsEventsApiDestinationResource(utils),
            idGen: 'MyDestination',
            arnGen: 'arn:aws:events:us-east-1:123456789012:api-destination/MyDestination',
            refFunc: 'MyDestination',
            getAttFunc: {
                'Arn': 'arn:aws:events:us-east-1:123456789012:api-destination/MyDestination',
                '': 'MyDestination',
            },
            resource: {
                Properties: {
                    Name: 'MyDestination',
                },
            } as EventsApiDestinationResource,
        },
        {
            description: 'AwsEventsApiDestinationResource without Name',
            getInstance: (utils) => new AwsEventsApiDestinationResource(utils),
            idGen: 'destination',
            arnGen: 'arn:aws:events:us-east-1:123456789012:api-destination/destination',
            refFunc: 'destination',
            getAttFunc: {
                'Arn': 'arn:aws:events:us-east-1:123456789012:api-destination/destination',
                '': 'destination',
            },
        },
        {
            description: 'AwsEventsArchiveResource with ArchiveName',
            getInstance: (utils) => new AwsEventsArchiveResource(utils),
            idGen: 'MyArchive',
            arnGen: 'arn:aws:events:us-east-1:123456789012:archive/MyArchive',
            refFunc: 'MyArchive',
            getAttFunc: {
                'Arn': 'arn:aws:events:us-east-1:123456789012:archive/MyArchive',
                '': 'MyArchive',
            },
            resource: {
                Properties: {
                    ArchiveName: 'MyArchive',
                },
            } as EventsArchiveResource,
        },
        {
            description: 'AwsEventsArchiveResource without ArchiveName',
            getInstance: (utils) => new AwsEventsArchiveResource(utils),
            idGen: 'archive',
            arnGen: 'arn:aws:events:us-east-1:123456789012:archive/archive',
            refFunc: 'archive',
            getAttFunc: {
                'Arn': 'arn:aws:events:us-east-1:123456789012:archive/archive',
                '': 'archive',
            },
        },
        {
            description: 'AwsEventsConnectionResource with Name',
            getInstance: (utils) => new AwsEventsConnectionResource(utils),
            idGen: 'MyConnection',
            arnGen: 'arn:aws:events:us-east-1:123456789012:connection/MyConnection',
            refFunc: 'MyConnection',
            getAttFunc: {
                'Arn': 'arn:aws:events:us-east-1:123456789012:connection/MyConnection',
                'AuthParameters.ConnectivityParameters.ResourceParameters.ResourceAssociationArn': 'testRAArn1',
                'InvocationConnectivityParameters.ResourceParameters.ResourceAssociationArn': 'testRAArn2',
                'SecretArn': 'STUB_SecretArn',
                '': 'MyConnection',
            },
            resource: {
                Properties: {
                    Name: 'MyConnection',
                    AuthParameters: {
                        ConnectivityParameters: {
                            ResourceParameters: {
                                ResourceAssociationArn: 'testRAArn1',
                            },
                        },
                    },
                    InvocationConnectivityParameters: {
                        ResourceParameters: {
                            ResourceAssociationArn: 'testRAArn2',
                        },
                    },
                },
            } as EventsConnectionResource,
        },
        {
            description: 'AwsEventsConnectionResource without Name',
            getInstance: (utils) => new AwsEventsConnectionResource(utils),
            idGen: 'connection',
            arnGen: 'arn:aws:events:us-east-1:123456789012:connection/connection',
            refFunc: 'connection',
            getAttFunc: {
                'Arn': 'arn:aws:events:us-east-1:123456789012:connection/connection',
                'AuthParameters.ConnectivityParameters.ResourceParameters.ResourceAssociationArn': 'testRAArn1',
                'InvocationConnectivityParameters.ResourceParameters.ResourceAssociationArn': 'testRAArn2',
                'SecretArn': 'STUB_SecretArn',
                '': 'connection',
            },
            resource: {
                Properties: {
                    AuthParameters: {
                        ConnectivityParameters: {
                            ResourceParameters: {
                                ResourceAssociationArn: 'testRAArn1',
                            },
                        },
                    },
                    InvocationConnectivityParameters: {
                        ResourceParameters: {
                            ResourceAssociationArn: 'testRAArn2',
                        },
                    },
                },
            } as EventsConnectionResource,
        },
        {
            description: 'AwsEventsConnectionResource getAtt AuthParameters.ConnectivityParameters.ResourceParameters.ResourceAssociationArn',
            getInstance: (utils) => new AwsEventsConnectionResource(utils),
            idGen: 'connection',
            arnGen: 'arn:aws:events:us-east-1:123456789012:connection/connection',
            refFunc: 'connection',
            getAttFunc: {
                'AuthParameters.ConnectivityParameters.ResourceParameters.ResourceAssociationArn': 'testRAArn',
                'InvocationConnectivityParameters.ResourceParameters.ResourceAssociationArn': 'ResourceAssociationArn',
            },
            resource: {
                Properties: {
                    AuthParameters: {
                        ConnectivityParameters: {
                            ResourceParameters: {
                                ResourceAssociationArn: 'testRAArn',
                            },
                        },
                    },
                },
            } as EventsConnectionResource,
        },
        {
            description: 'AwsEventsConnectionResource getAtt InvocationConnectivityParameters.ResourceParameters.ResourceAssociationArn',
            getInstance: (utils) => new AwsEventsConnectionResource(utils),
            idGen: 'connection',
            arnGen: 'arn:aws:events:us-east-1:123456789012:connection/connection',
            refFunc: 'connection',
            getAttFunc: {
                'InvocationConnectivityParameters.ResourceParameters.ResourceAssociationArn': 'testInvocationRAArn',
                'AuthParameters.ConnectivityParameters.ResourceParameters.ResourceAssociationArn': 'ResourceAssociationArn',
            },
            resource: {
                Properties: {
                    InvocationConnectivityParameters: {
                        ResourceParameters: {
                            ResourceAssociationArn: 'testInvocationRAArn',
                        },
                    },
                },
            } as EventsConnectionResource,
        },
        {
            description: 'AwsEventsConnectionResource getAtt SecretArn',
            getInstance: (utils) => new AwsEventsConnectionResource(utils),
            idGen: 'connection',
            arnGen: 'arn:aws:events:us-east-1:123456789012:connection/connection',
            refFunc: 'connection',
            getAttFunc: {
                'SecretArn': 'STUB_SecretArn',
                'AuthParameters.ConnectivityParameters.ResourceParameters.ResourceAssociationArn': 'ResourceAssociationArn',
                'InvocationConnectivityParameters.ResourceParameters.ResourceAssociationArn': 'ResourceAssociationArn',
            },
        },
        {
            description: 'AwsEventsEndpointResource',
            getInstance: (utils) => new AwsEventsEndpointResource(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:events:us-east-1:123456789012:endpoint/abcdef',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
        },
        {
            description: 'AwsEventsEventBusPolicyResource',
            getInstance: (utils) => new AwsEventsEventBusPolicyResource(utils),
            idGen: 'policy-abcdef',
            arnGen: 'arn:aws:events:us-east-1:123456789012:event-bus-policy/policy-abcdef',
            refFunc: 'arn:aws:events:us-east-1:123456789012:event-bus-policy/policy-abcdef',
            getAttFunc: {
                '': 'policy-abcdef',
            },
        },
        {
            description: 'AwsEventsEventBusResource with Name',
            getInstance: (utils) => new AwsEventsEventBusResource(utils),
            idGen: 'MyEventBus',
            arnGen: 'arn:aws:events:us-east-1:123456789012:event-bus/MyEventBus',
            refFunc: 'MyEventBus',
            getAttFunc: {
                'Arn': 'arn:aws:events:us-east-1:123456789012:event-bus/MyEventBus',
                '': 'MyEventBus',
            },
            resource: {
                Properties: {
                    Name: 'MyEventBus',
                },
            } as EventsEventBusResource,
        },
        {
            description: 'AwsEventsEventBusResource without Name',
            getInstance: (utils) => new AwsEventsEventBusResource(utils),
            idGen: 'eventbus',
            arnGen: 'arn:aws:events:us-east-1:123456789012:event-bus/eventbus',
            refFunc: 'eventbus',
            getAttFunc: {
                'Arn': 'arn:aws:events:us-east-1:123456789012:event-bus/eventbus',
                '': 'eventbus',
            },
        },
        {
            description: 'AwsEventsRuleResource with Name',
            getInstance: (utils) => new AwsEventsRuleResource(utils),
            idGen: 'MyRule',
            arnGen: 'arn:aws:events:us-east-1:123456789012:rule/MyRule',
            refFunc: 'MyRule',
            getAttFunc: {
                'Arn': 'arn:aws:events:us-east-1:123456789012:rule/MyRule',
                '': 'MyRule',
            },
            resource: {
                Properties: {
                    Name: 'MyRule',
                },
            } as EventsRuleResource,
        },
        {
            description: 'AwsEventsRuleResource without Name',
            getInstance: (utils) => new AwsEventsRuleResource(utils),
            idGen: 'rule',
            arnGen: 'arn:aws:events:us-east-1:123456789012:rule/rule',
            refFunc: 'rule',
            getAttFunc: {
                'Arn': 'arn:aws:events:us-east-1:123456789012:rule/rule',
                '': 'rule',
            },
        },
        {
            description: 'AWSGlueConnectionResource with ConnectionInput.Name',
            getInstance: (utils) => new AWSGlueConnectionResource(utils),
            idGen: 'MyConnection',
            arnGen: 'arn:aws:glue:us-east-1:123456789012:connection/MyConnection',
            refFunc: 'MyConnection',
            getAttFunc: {
                '': 'MyConnection',
            },
            resource: {
                Properties: {
                    ConnectionInput: {
                        Name: 'MyConnection',
                    },
                },
            } as GlueConnectionResource,
        },
        {
            description: 'AWSGlueConnectionResource without ConnectionInput.Name',
            getInstance: (utils) => new AWSGlueConnectionResource(utils),
            idGen: 'glueConn',
            arnGen: 'arn:aws:glue:us-east-1:123456789012:connection/glueConn',
            refFunc: 'glueConn',
            getAttFunc: {
                '': 'glueConn',
            },
            resource: { Properties: { ConnectionInput: {} } } as GlueConnectionResource,
        },
        {
            description: 'AwsGlueCrawlerResource with Name',
            getInstance: (utils) => new AwsGlueCrawlerResource(utils),
            idGen: 'MyCrawler',
            arnGen: 'arn:aws:glue:us-east-1:123456789012:crawler/MyCrawler',
            refFunc: 'MyCrawler',
            getAttFunc: {
                '': 'MyCrawler',
            },
            resource: {
                Properties: {
                    Name: 'MyCrawler',
                },
            } as GlueCrawlerResource,
        },
        {
            description: 'AwsGlueCrawlerResource without Name',
            getInstance: (utils) => new AwsGlueCrawlerResource(utils),
            idGen: 'glueCrawler',
            arnGen: 'arn:aws:glue:us-east-1:123456789012:crawler/glueCrawler',
            refFunc: 'glueCrawler',
            getAttFunc: {
                '': 'glueCrawler',
            },
        },
        {
            description: 'AWSGlueDatabaseResource with Name',
            getInstance: (utils) => new AWSGlueDatabaseResource(utils),
            idGen: 'TestDbName',
            arnGen: 'arn:aws:glue:us-east-1:123456789012:database/TestDbName',
            refFunc: 'TestDbName',
            getAttFunc: {
                '': 'TestDbName',
            },
            resource: {
                Properties: {
                    DatabaseName: 'TestDbName',
                },
            } as GlueDatabaseResource,
        },
        {
            description: 'AWSGlueDatabaseResource without Name',
            getInstance: (utils) => new AWSGlueDatabaseResource(utils),
            idGen: 'glueDb',
            arnGen: 'arn:aws:glue:us-east-1:123456789012:database/glueDb',
            refFunc: 'glueDb',
            getAttFunc: {
                '': 'glueDb',
            },
        },
        {
            description: 'AwsGlueJobResource with Name',
            getInstance: (utils) => new AwsGlueJobResource(utils),
            idGen: 'TestJobName',
            arnGen: 'arn:aws:glue:us-east-1:123456789012:job/TestJobName',
            refFunc: 'TestJobName',
            getAttFunc: {
                '': 'TestJobName',
            },
            resource: {
                Properties: {
                    Name: 'TestJobName',
                },
            } as GlueJobResource,
        },
        {
            description: 'AwsGlueJobResource without Name',
            getInstance: (utils) => new AwsGlueJobResource(utils),
            idGen: 'glueJob',
            arnGen: 'arn:aws:glue:us-east-1:123456789012:job/glueJob',
            refFunc: 'glueJob',
            getAttFunc: {
                '': 'glueJob',
            },
        },
        {
            description: 'AwsGlueTriggerResource with Name',
            getInstance: (utils) => new AwsGlueTriggerResource(utils),
            idGen: 'TestTriggerName',
            arnGen: 'arn:aws:glue:us-east-1:123456789012:trigger/TestTriggerName',
            refFunc: 'TestTriggerName',
            getAttFunc: {
                '': 'TestTriggerName',
            },
            resource: {
                Properties: {
                    Name: 'TestTriggerName',
                },
            } as GlueJobResource,
        },
        {
            description: 'AwsGlueTriggerResource without Name',
            getInstance: (utils) => new AwsGlueTriggerResource(utils),
            idGen: 'glueTrg',
            arnGen: 'arn:aws:glue:us-east-1:123456789012:trigger/glueTrg',
            refFunc: 'glueTrg',
            getAttFunc: {
                '': 'glueTrg',
            },
        },
        {
            description: 'AwsIAMPolicyResource with PolicyName',
            getInstance: (utils) => new AwsIAMPolicyResource(utils),
            idGen: 'MyPolicy',
            arnGen: 'arn:aws:iam::123456789012:policy/MyPolicy',
            refFunc: 'MyPolicy',
            getAttFunc: {
                '': 'MyPolicy',
            },
            resource: {
                Properties: {
                    PolicyName: 'MyPolicy',
                },
            } as IAMPolicyResource,
        },
        {
            description: 'AwsIAMPolicyResource without PolicyName',
            getInstance: (utils) => new AwsIAMPolicyResource(utils),
            idGen: 'policy',
            arnGen: 'arn:aws:iam::123456789012:policy/policy',
            refFunc: 'policy',
            getAttFunc: {
                '': 'policy',
            },
        },
        {
            description: 'AwsIAMRoleResource with RoleName',
            getInstance: (utils) => new AwsIAMRoleResource(utils),
            idGen: 'MyRole',
            arnGen: 'arn:aws:iam::123456789012:role/MyRole',
            refFunc: 'MyRole',
            getAttFunc: {
                'Arn': 'arn:aws:iam::123456789012:role/MyRole',
                '': 'MyRole',
            },
            resource: {
                Properties: {
                    RoleName: 'MyRole',
                },
            } as IAMRoleResource,
        },
        {
            description: 'AwsIAMRoleResource without RoleName',
            getInstance: (utils) => new AwsIAMRoleResource(utils),
            idGen: 'role',
            arnGen: 'arn:aws:iam::123456789012:role/role',
            refFunc: 'role',
            getAttFunc: {
                'Arn': 'arn:aws:iam::123456789012:role/role',
                '': 'role',
            },
        },
        {
            description: 'AwsLambdaFunctionResource with FunctionName',
            getInstance: (utils) => new AwsLambdaFunctionResource(utils),
            idGen: 'MyFunction',
            arnGen: 'arn:aws:lambda:us-east-1:123456789012:function:MyFunction',
            refFunc: 'MyFunction',
            getAttFunc: {
                'Arn': 'arn:aws:lambda:us-east-1:123456789012:function:MyFunction',
                'SnapStartResponse.ApplyOn': 'PublishedVersions',
                'SnapStartResponse.OptimizationStatus': 'Stub_SnapStartResponse.OptimizationStatus',
                '': 'MyFunction',
            },
            resource: {
                Properties: {
                    FunctionName: 'MyFunction',
                    SnapStart: {
                        ApplyOn: 'PublishedVersions',
                    },
                },
            } as LambdaFunctionResource,
        },
        {
            description: 'AwsLambdaFunctionResource without FunctionName',
            getInstance: (utils) => new AwsLambdaFunctionResource(utils),
            idGen: 'lambda',
            arnGen: 'arn:aws:lambda:us-east-1:123456789012:function:lambda',
            refFunc: 'lambda',
            getAttFunc: {
                'Arn': 'arn:aws:lambda:us-east-1:123456789012:function:lambda',
                'SnapStartResponse.ApplyOn': 'SnapStartResponse.ApplyOn',
                'SnapStartResponse.OptimizationStatus': 'Stub_SnapStartResponse.OptimizationStatus',
                '': 'lambda',
            },
            resource: {
                Properties: {
                    SnapStart: {},
                },
            } as LambdaFunctionResource,
        },
        {
            description: 'AwsLambdaFunctionResource getAtt SnapStartResponse.ApplyOn with value',
            getInstance: (utils) => new AwsLambdaFunctionResource(utils),
            idGen: 'lambda',
            arnGen: 'arn:aws:lambda:us-east-1:123456789012:function:lambda',
            refFunc: 'lambda',
            getAttFunc: {
                'SnapStartResponse.ApplyOn': 'PublishedVersions',
            },
            resource: {
                Properties: {
                    SnapStart: {
                        ApplyOn: 'PublishedVersions',
                    },
                },
            } as LambdaFunctionResource,
        },
        {
            description: 'AwsLambdaFunctionResource getAtt SnapStartResponse.ApplyOn without value',
            getInstance: (utils) => new AwsLambdaFunctionResource(utils),
            idGen: 'lambda',
            arnGen: 'arn:aws:lambda:us-east-1:123456789012:function:lambda',
            refFunc: 'lambda',
            getAttFunc: {
                'SnapStartResponse.ApplyOn': 'SnapStartResponse.ApplyOn',
            },
        },
        {
            description: 'AwsLambdaFunctionResource getAtt SnapStartResponse.OptimizationStatus',
            getInstance: (utils) => new AwsLambdaFunctionResource(utils),
            idGen: 'lambda',
            arnGen: 'arn:aws:lambda:us-east-1:123456789012:function:lambda',
            refFunc: 'lambda',
            getAttFunc: {
                'SnapStartResponse.OptimizationStatus': 'Stub_SnapStartResponse.OptimizationStatus',
            },
        },
        {
            description: 'AwsLambdaPermissionResource',
            getInstance: (utils) => new AwsLambdaPermissionResource(utils),
            idGen: 'lambda-permission-abcdef',
            arnGen: 'arn:aws:lambda:us-east-1:123456789012:permission:lambda-permission-abcdef',
            refFunc: 'lambda-permission-abcdef',
            getAttFunc: {
                '': 'lambda-permission-abcdef',
            },
        },
        {
            description: 'AwsLogsLogGroupResource with LogGroupName',
            getInstance: (utils) => new AwsLogsLogGroupResource(utils),
            idGen: 'MyLogGroup',
            arnGen: 'arn:aws:logs:us-east-1:123456789012:log-group:MyLogGroup:*',
            refFunc: 'MyLogGroup',
            getAttFunc: {
                'Arn': 'arn:aws:logs:us-east-1:123456789012:log-group:MyLogGroup:*',
                '': 'MyLogGroup',
            },
            resource: {
                Properties: {
                    LogGroupName: 'MyLogGroup',
                },
            } as LogsLogGroupResource,
        },
        {
            description: 'AwsLogsLogGroupResource without LogGroupName',
            getInstance: (utils) => new AwsLogsLogGroupResource(utils),
            idGen: 'log-group',
            arnGen: 'arn:aws:logs:us-east-1:123456789012:log-group:log-group:*',
            refFunc: 'log-group',
            getAttFunc: {
                'Arn': 'arn:aws:logs:us-east-1:123456789012:log-group:log-group:*',
                '': 'log-group',
            },
        },
        {
            description: 'AwsPipesPipeResource with Name',
            getInstance: (utils) => new AwsPipesPipeResource(utils),
            idGen: 'arn:aws:pipes:us-east-1:123456789012:pipe/my-pipe',
            arnGen: 'arn:aws:pipes:us-east-1:123456789012:pipe/my-pipe',
            refFunc: 'my-pipe',
            getAttFunc: {
                'Arn': 'arn:aws:pipes:us-east-1:123456789012:pipe/my-pipe',
                'CreationTime': '2025-03-31T18:09:10.000Z',
                'CurrentState': 'STUB_CurrentState',
                'LastModifiedTime': '2025-03-31T18:09:10.000Z',
                'StateReason': 'STUB_StateReason',
                '': 'arn:aws:pipes:us-east-1:123456789012:pipe/my-pipe',
            },
            resource: {
                Properties: {
                    Name: 'my-pipe',
                },
            } as PipesPipeResource,
            testMocks: () => {
                const mockedTime = '2025-03-31T18:09:10.000Z';
                jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockedTime);
            },
        },
        {
            description: 'AwsPipesPipeResource without Name',
            getInstance: (utils) => new AwsPipesPipeResource(utils),
            idGen: 'arn:aws:pipes:us-east-1:123456789012:pipe/pipe-abcdef',
            arnGen: 'arn:aws:pipes:us-east-1:123456789012:pipe/pipe-abcdef',
            refFunc: 'pipe-abcdef',
            getAttFunc: {
                'Arn': 'arn:aws:pipes:us-east-1:123456789012:pipe/pipe-abcdef',
                'CreationTime': '2025-03-31T18:09:10.000Z',
                'CurrentState': 'STUB_CurrentState',
                'LastModifiedTime': '2025-03-31T18:09:10.000Z',
                'StateReason': 'STUB_StateReason',
                '': 'arn:aws:pipes:us-east-1:123456789012:pipe/pipe-abcdef',
            },
            resource: {
                Properties: {},
            } as PipesPipeResource,
            testMocks: () => {
                const mockedTime = '2025-03-31T18:09:10.000Z';
                jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockedTime);
            },
        },
        {
            description: 'AwsS3BucketResource with BucketName',
            getInstance: (utils) => new AwsS3BucketResource(utils),
            idGen: 'MyBucket',
            arnGen: 'arn:aws:s3:::MyBucket',
            refFunc: 'MyBucket',
            getAttFunc: {
                'Arn': 'arn:aws:s3:::MyBucket',
                'DomainName': 'STUB_DomainName',
                'DualStackDomainName': 'STUB_DualStackDomainName',
                'MetadataTableConfiguration.S3TablesDestination.TableArn': 'STUB_MetadataTableConfiguration',
                'MetadataTableConfiguration.S3TablesDestination.TableNamespace': 'STUB_MetadataTableConfiguration',
                'RegionalDomainName': 'STUB_RegionalDomainName',
                'WebsiteURL': 'STUB_WebsiteURL',
                '': 'MyBucket',
            },
            resource: {
                Properties: {
                    BucketName: 'MyBucket',
                },
            } as S3BucketResource,
        },
        {
            description: 'AwsS3BucketResource without BucketName',
            getInstance: (utils) => new AwsS3BucketResource(utils),
            idGen: 'bucket',
            arnGen: 'arn:aws:s3:::bucket',
            refFunc: 'bucket',
            getAttFunc: {
                'Arn': 'arn:aws:s3:::bucket',
                'DomainName': 'STUB_DomainName',
                'DualStackDomainName': 'STUB_DualStackDomainName',
                'MetadataTableConfiguration.S3TablesDestination.TableArn': 'STUB_MetadataTableConfiguration',
                'MetadataTableConfiguration.S3TablesDestination.TableNamespace': 'STUB_MetadataTableConfiguration',
                'RegionalDomainName': 'STUB_RegionalDomainName',
                'WebsiteURL': 'STUB_WebsiteURL',
                '': 'bucket',
            },
        },
        {
            description: 'AwsS3BucketResource getAtt MetadataTableConfiguration.S3TablesDestination.TableArn with value',
            getInstance: (utils) => new AwsS3BucketResource(utils),
            idGen: 'bucket',
            arnGen: 'arn:aws:s3:::bucket',
            refFunc: 'bucket',
            getAttFunc: {
                'MetadataTableConfiguration.S3TablesDestination.TableArn': 'arn:aws:glue:us-east-1:123456789012:table/mydatabase/mytable',
            },
            resource: {
                Properties: {
                    MetadataTableConfiguration: {
                        S3TablesDestination: {
                            TableArn: 'arn:aws:glue:us-east-1:123456789012:table/mydatabase/mytable',
                        },
                    },
                },
            } as S3BucketResource,
        },
        {
            description: 'AwsS3BucketResource getAtt MetadataTableConfiguration.S3TablesDestination.TableArn without value',
            getInstance: (utils) => new AwsS3BucketResource(utils),
            idGen: 'bucket',
            arnGen: 'arn:aws:s3:::bucket',
            refFunc: 'bucket',
            getAttFunc: {
                'MetadataTableConfiguration.S3TablesDestination.TableArn': 'STUB_MetadataTableConfiguration',
            },
            resource: {
                Properties: {
                    MetadataTableConfiguration: {
                        S3TablesDestination: {},
                    },
                },
            } as S3BucketResource,
        },
        {
            description: 'AwsS3BucketResource getAtt MetadataTableConfiguration.S3TablesDestination.TableNamespace with value',
            getInstance: (utils) => new AwsS3BucketResource(utils),
            idGen: 'bucket',
            arnGen: 'arn:aws:s3:::bucket',
            refFunc: 'bucket',
            getAttFunc: {
                'MetadataTableConfiguration.S3TablesDestination.TableNamespace': 'mytablenamespace',
            },
            resource: {
                Properties: {
                    MetadataTableConfiguration: {
                        S3TablesDestination: {
                            TableNamespace: 'mytablenamespace',
                        },
                    },
                },
            } as S3BucketResource,
        },
        {
            description: 'AwsS3BucketResource getAtt MetadataTableConfiguration.S3TablesDestination.TableNamespace without value',
            getInstance: (utils) => new AwsS3BucketResource(utils),
            idGen: 'bucket',
            arnGen: 'arn:aws:s3:::bucket',
            refFunc: 'bucket',
            getAttFunc: {
                'MetadataTableConfiguration.S3TablesDestination.TableNamespace': 'STUB_MetadataTableConfiguration',
            },
            resource: {
                Properties: {
                    MetadataTableConfiguration: {
                        S3TablesDestination: {},
                    },
                },
            } as S3BucketResource,
        },
        {
            description: 'AwsS3BucketResource getAtt RegionalDomainName',
            getInstance: (utils) => new AwsS3BucketResource(utils),
            idGen: 'bucket',
            arnGen: 'arn:aws:s3:::bucket',
            refFunc: 'bucket',
            getAttFunc: {
                RegionalDomainName: 'STUB_RegionalDomainName',
            },
            resource: {
                Properties: {},
            } as S3BucketResource,
        },
        {
            description: 'AwsS3BucketResource getAtt WebsiteURL',
            getInstance: (utils) => new AwsS3BucketResource(utils),
            idGen: 'bucket',
            arnGen: 'arn:aws:s3:::bucket',
            refFunc: 'bucket',
            getAttFunc: {
                WebsiteURL: 'STUB_WebsiteURL',
            },
        },
        {
            description: 'AwsSNSSubscriptionResource with full TopicArn',
            getInstance: (utils) => new AwsSNSSubscriptionResource(utils),
            idGen: 'full-uid-number',
            arnGen: 'arn:aws:sns:us-east-1:123456789012:MyTopic:/full-uid-number',
            refFunc: 'full-uid-number',
            getAttFunc: {
                'Arn': 'arn:aws:sns:us-east-1:123456789012:MyTopic:/full-uid-number',
                '': 'full-uid-number',
            },
            resource: {
                Properties: {
                    TopicArn: 'arn:aws:sns:us-east-1:123456789012:MyTopic',
                },
            } as SNSSubscriptionResource,
        },
        {
            description: 'AwsSNSSubscriptionResource with TopicArn without prefix',
            getInstance: (utils) => new AwsSNSSubscriptionResource(utils),
            idGen: 'full-uid-number',
            arnGen: 'arn:aws:sns:us-east-1:123456789012:JustTheTopic:/full-uid-number',
            refFunc: 'full-uid-number',
            getAttFunc: {
                'Arn': 'arn:aws:sns:us-east-1:123456789012:JustTheTopic:/full-uid-number',
                '': 'full-uid-number',
            },
            resource: {
                Properties: {
                    TopicArn: 'JustTheTopic',
                },
            } as SNSSubscriptionResource,
        },
        {
            description: 'AwsSNSTopicPolicyResource',
            getInstance: (utils) => new AwsSNSTopicPolicyResource(utils),
            idGen: 'policy-abcdef',
            arnGen: 'arn:aws:sns:us-east-1:123456789012:topicpolicy/policy-abcdef',
            refFunc: 'policy-abcdef',
            getAttFunc: {
                '': 'policy-abcdef',
            },
        },
        {
            description: 'AwsSNSTopicResource with TopicName',
            getInstance: (utils) => new AwsSNSTopicResource(utils),
            idGen: 'MyTopic',
            arnGen: 'arn:aws:sns:us-east-1:123456789012:MyTopic',
            refFunc: 'arn:aws:sns:us-east-1:123456789012:MyTopic',
            getAttFunc: {
                'TopicArn': 'arn:aws:sns:us-east-1:123456789012:MyTopic',
                'TopicName': 'MyTopic',
                '': 'MyTopic',
            },
            resource: {
                Properties: {
                    TopicName: 'MyTopic',
                },
            } as SNSTopicResource,
        },
        {
            description: 'AwsSNSTopicResource without TopicName',
            getInstance: (utils) => new AwsSNSTopicResource(utils),
            idGen: 'topic',
            arnGen: 'arn:aws:sns:us-east-1:123456789012:topic',
            refFunc: 'arn:aws:sns:us-east-1:123456789012:topic',
            getAttFunc: {
                'TopicArn': 'arn:aws:sns:us-east-1:123456789012:topic',
                'TopicName': 'topic',
                '': 'topic',
            },
        },
        {
            description: 'AwsSQSQueueResource with QueueName',
            getInstance: (utils) => new AwsSQSQueueResource(utils),
            idGen: 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue',
            arnGen: 'arn:aws:sqs:us-east-1:123456789012:MyQueue',
            refFunc: 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue',
            getAttFunc: {
                'Arn': 'arn:aws:sqs:us-east-1:123456789012:MyQueue',
                'QueueName': 'MyQueue',
                '': 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue',
            },
            resource: {
                Properties: {
                    QueueName: 'MyQueue',
                },
            } as SQSQueueResource,
        },
        {
            description: 'AwsSQSQueueResource without QueueName',
            getInstance: (utils) => new AwsSQSQueueResource(utils),
            idGen: 'https://sqs.us-east-1.amazonaws.com/123456789012/sqs',
            arnGen: 'arn:aws:sqs:us-east-1:123456789012:sqs',
            refFunc: 'https://sqs.us-east-1.amazonaws.com/123456789012/sqs',
            getAttFunc: {
                'Arn': 'arn:aws:sqs:us-east-1:123456789012:sqs',
                'QueueName': 'sqs',
                '': 'https://sqs.us-east-1.amazonaws.com/123456789012/sqs',
            },
        },
        {
            description: 'AwsStepFunctionsStateMachineResource with StateMachineName',
            getInstance: (utils) => new AwsStepFunctionsStateMachineResource(utils),
            idGen: 'arn:aws:states:us-east-1:123456789012:stateMachine:MyStateMachine',
            arnGen: 'arn:aws:states:us-east-1:123456789012:stateMachine:MyStateMachine',
            refFunc: 'arn:aws:states:us-east-1:123456789012:stateMachine:MyStateMachine',
            getAttFunc: {
                'Arn': 'arn:aws:states:us-east-1:123456789012:stateMachine:MyStateMachine',
                'Name': 'MyStateMachine',
                'StateMachineRevisionId': 'STUB_StateMachineRevisionId',
                '': 'arn:aws:states:us-east-1:123456789012:stateMachine:MyStateMachine',
            },
            resource: {
                Properties: {
                    StateMachineName: 'MyStateMachine',
                },
            } as StepFunctionsStateMachineResource,
        },
        {
            description: 'AwsStepFunctionsStateMachineResource without StateMachineName',
            getInstance: (utils) => new AwsStepFunctionsStateMachineResource(utils),
            idGen: 'arn:aws:states:us-east-1:123456789012:stateMachine:sf',
            arnGen: 'arn:aws:states:us-east-1:123456789012:stateMachine:sf',
            refFunc: 'arn:aws:states:us-east-1:123456789012:stateMachine:sf',
            getAttFunc: {
                'Arn': 'arn:aws:states:us-east-1:123456789012:stateMachine:sf',
                'Name': 'sf',
                'StateMachineRevisionId': 'STUB_StateMachineRevisionId',
                '': 'arn:aws:states:us-east-1:123456789012:stateMachine:sf',
            },
        },
        {
            description: 'StubFunctionForUnsupported with standard resource Type (AWS::ApiGateway::Resource)->apigateway',
            getInstance: (utils) => new StubFunctionForUnsupported(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:apigateway:us-east-1:123456789012:abcdef',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: {
                Type: 'AWS::ApiGateway::Resource',
            } as CloudFormationResource,
        },
        {
            description: 'StubFunctionForUnsupported with standard resource Type (Custom::Resource)->custom',
            getInstance: (utils) => new StubFunctionForUnsupported(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:custom:us-east-1:123456789012:abcdef',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: {
                Type: 'Custom::Resource',
            } as CloudFormationResource,
        },
        {
            description: 'StubFunctionForUnsupported with standard resource Type (Custom)->custom',
            getInstance: (utils) => new StubFunctionForUnsupported(utils),
            idGen: 'abcdef',
            arnGen: 'arn:aws:custom:us-east-1:123456789012:abcdef',
            refFunc: 'abcdef',
            getAttFunc: {
                '': 'abcdef',
            },
            resource: {
                Type: 'Custom',
            } as CloudFormationResource,
        },
    ];

    describe.each(testCases)('Resource Test', (templateCase) => {
        const { description, getInstance, idGen, arnGen, refFunc, getAttFunc, resource, testMocks } = templateCase;
        describe(description, () => {
            beforeEach(() => {
                instance = getInstance(mockResourceUtils);
                if (resource) {
                    mockContext.resource = resource;
                }
                if (testMocks) {
                    testMocks();
                }
            });

            it('idGenFunc should return the expected ID', () => {
                expect(instance.idGenFunc(mockContext)).toBe(idGen);
            });

            it('arnGenFunc should return the expected ARN', () => {
                expect(instance.arnGenFunc(mockContext)).toBe(arnGen);
            });

            it('refFunc should return the expected value', () => {
                expect(instance.refFunc(mockContext)).toBe(refFunc);
            });

            describe('getAttFunc', () => {
                const params: { key: string; value: unknown }[] = [];
                for (const key in getAttFunc) {
                    params.push({ key, value: getAttFunc[key] });
                }
                describe.each(params)('Resource Test', (param) => {
                    const { key, value } = param;
                    it(`should return '${String(value)}' for attribute '${key}'`, () => {
                        expect(instance.getAttFunc(mockContext, key)).toBe(value);
                    });
                });
            });
        });
    });
});
