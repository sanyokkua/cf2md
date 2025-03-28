import { CfResourcesType } from '../enums/cf-enums';
import { ResourceIntrinsic, ResourceIntrinsicResolver } from '../types/intrinsic-types';
import { ResourceUtils } from '../types/util-service-types';
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
} from './resource';

export class ResourceIntrinsicResolverImpl implements ResourceIntrinsicResolver {
    private readonly stub: ResourceIntrinsic;
    private readonly cache: Record<string, ResourceIntrinsic>;
    private readonly factories: Record<string, (utils: ResourceUtils) => ResourceIntrinsic>;

    constructor(private readonly intrinsicUtils: ResourceUtils) {
        this.stub = new StubFunctionForUnsupported(intrinsicUtils);
        this.cache = {};
        this.factories = {};

        this.factories[CfResourcesType.AWS_ApiGatewayV2_Authorizer] = (utils) => new AwsApiGatewayV2AuthorizerResource(utils);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_Deployment] = (utils) => new AwsApiGatewayV2DeploymentResource(utils);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_Model] = (utils) => new AwsApiGatewayV2ModelResource(utils);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_Stage] = (utils) => new AwsApiGatewayV2StageResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_Authorizer] = (utils) => new AwsApiGatewayAuthorizerResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_Deployment] = (utils) => new AwsApiGatewayDeploymentResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_Method] = (utils) => new AwsApiGatewayMethodResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_Model] = (utils) => new AwsApiGatewayModelResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_RequestValidator] = (utils) => new AwsApiGatewayRequestValidatorResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_Resource] = (utils) => new AwsApiGatewayResourceResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_RestApi] = (utils) => new AwsApiGatewayRestApiResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_Stage] = (utils) => new AwsApiGatewayStageResource(utils);
        this.factories[CfResourcesType.AWS_CDK_Metadata] = (utils) => new AwsCDKMetadataResource(utils);
        this.factories[CfResourcesType.AWS_DynamoDB_Table] = (utils) => new AwsDynamoDBTableResource(utils);
        this.factories[CfResourcesType.AWS_ECS_Service] = (utils) => new AwsEcsServiceResource(utils);
        this.factories[CfResourcesType.AWS_ECS_TaskDefinition] = (utils) => new AwsECSTaskDefinitionResource(utils);
        this.factories[CfResourcesType.AWS_ElasticLoadBalancingV2_ListenerRule] = (utils) => new AwsElasticLoadBalancingV2ListenerRule(utils);
        this.factories[CfResourcesType.AWS_ElasticLoadBalancingV2_TargetGroup] = (utils) => new AwsElasticLoadBalancingV2TargetGroupResource(utils);
        this.factories[CfResourcesType.AWS_Events_ApiDestination] = (utils) => new AwsEventsApiDestinationResource(utils);
        this.factories[CfResourcesType.AWS_Events_Archive] = (utils) => new AwsEventsArchiveResource(utils);
        this.factories[CfResourcesType.AWS_Events_Connection] = (utils) => new AwsEventsConnectionResource(utils);
        this.factories[CfResourcesType.AWS_Events_EventBus] = (utils) => new AwsEventsEventBusResource(utils);
        this.factories[CfResourcesType.AWS_Events_EventBusPolicy] = (utils) => new AwsEventsEventBusPolicyResource(utils);
        this.factories[CfResourcesType.AWS_Events_Rule] = (utils) => new AwsEventsRuleResource(utils);
        this.factories[CfResourcesType.AWS_IAM_Policy] = (utils) => new AwsIAMPolicyResource(utils);
        this.factories[CfResourcesType.AWS_IAM_Role] = (utils) => new AwsIAMRoleResource(utils);
        this.factories[CfResourcesType.AWS_Lambda_Function] = (utils) => new AwsLambdaFunctionResource(utils);
        this.factories[CfResourcesType.AWS_Lambda_Permission] = (utils) => new AwsLambdaPermissionResource(utils);
        this.factories[CfResourcesType.AWS_Logs_LogGroup] = (utils) => new AwsLogsLogGroupResource(utils);
        this.factories[CfResourcesType.AWS_Pipes_Pipe] = (utils) => new AwsPipesPipeResource(utils);
        this.factories[CfResourcesType.AWS_SNS_Subscription] = (utils) => new AwsSNSSubscriptionResource(utils);
        this.factories[CfResourcesType.AWS_SNS_Topic] = (utils) => new AwsSNSTopicResource(utils);
        this.factories[CfResourcesType.AWS_SNS_TopicPolicy] = (utils) => new AwsSNSTopicPolicyResource(utils);
        this.factories[CfResourcesType.AWS_SQS_Queue] = (utils) => new AwsSQSQueueResource(utils);
        this.factories[CfResourcesType.AWS_StepFunctions_StateMachine] = (utils) => new AwsStepFunctionsStateMachineResource(utils);
        this.factories[CfResourcesType.AWS_S3_Bucket] = (utils) => new AwsS3BucketResource(utils);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_Api] = (utils) => new AwsApiGatewayV2ApiResource(utils);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_ApiGatewayManagedOverrides] = (utils) =>
            new AwsApiGatewayV2ApiGatewayManagedOverridesResource(utils);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_ApiMapping] = (utils) => new AwsApiGatewayV2ApiMappingResource(utils);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_DomainName] = (utils) => new AwsApiGatewayV2DomainNameResource(utils);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_Integration] = (utils) => new AwsApiGatewayV2IntegrationResource(utils);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_IntegrationResponse] = (utils) => new AwsApiGatewayV2IntegrationResponseResource(utils);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_Route] = (utils) => new AwsApiGatewayV2RouteResource(utils);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_RouteResponse] = (utils) => new AwsApiGatewayV2RouteResponseResource(utils);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_VpcLink] = (utils) => new AwsApiGatewayV2VpcLinkResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_Account] = (utils) => new AwsApiGatewayAccountResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_ApiKey] = (utils) => new AwsApiGatewayApiKeyResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_BasePathMapping] = (utils) => new AwsApiGatewayBasePathMappingResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_BasePathMappingV2] = (utils) => new AwsApiGatewayBasePathMappingV2Resource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_ClientCertificate] = (utils) => new AwsApiGatewayClientCertificateResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_DocumentationPart] = (utils) => new AwsApiGatewayDocumentationPartResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_DocumentationVersion] = (utils) => new AwsApiGatewayDocumentationVersionResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_DomainName] = (utils) => new AwsApiGatewayDomainNameResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_DomainNameAccessAssociation] = (utils) =>
            new AwsApiGatewayDomainNameAccessAssociationResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_GatewayResponse] = (utils) => new AwsApiGatewayGatewayResponseResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_UsagePlan] = (utils) => new AwsApiGatewayUsagePlanResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_UsagePlanKey] = (utils) => new AwsApiGatewayUsagePlanKeyResource(utils);
        this.factories[CfResourcesType.AWS_ApiGateway_VpcLink] = (utils) => new AwsApiGatewayVpcLinkResource(utils);
        this.factories[CfResourcesType.AWS_Events_Endpoint] = (utils) => new AwsEventsEndpointResource(utils);
        this.factories[CfResourcesType.AWS_Glue_Job] = (utils) => new AwsGlueJobResource(utils);
        this.factories[CfResourcesType.AWS_Glue_Connection] = (utils) => new AWSGlueConnectionResource(utils);
        this.factories[CfResourcesType.AWS_Glue_Crawler] = (utils) => new AwsGlueCrawlerResource(utils);
        this.factories[CfResourcesType.AWS_Glue_Database] = (utils) => new AWSGlueDatabaseResource(utils);
        this.factories[CfResourcesType.AWS_Glue_Trigger] = (utils) => new AwsGlueTriggerResource(utils);
    }

    public getResourceIntrinsic(resourceType: string): ResourceIntrinsic {
        if (Object.keys(this.cache).includes(resourceType)) {
            return this.cache[resourceType];
        }

        if (!Object.keys(this.factories).includes(resourceType)) {
            return this.stub;
        }

        const factory = this.factories[resourceType];

        const intrinsic = factory(this.intrinsicUtils);
        this.cache[resourceType] = intrinsic;
        return intrinsic;
    }
}
