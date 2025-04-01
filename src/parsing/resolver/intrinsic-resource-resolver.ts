import log from 'loglevel';
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
        log.trace('[ResourceIntrinsicResolverImpl.constructor] Entering with arguments:', { intrinsicUtils });
        this.stub = new StubFunctionForUnsupported(intrinsicUtils);
        log.debug('[ResourceIntrinsicResolverImpl.constructor] Initialized stub:', this.stub);
        this.cache = {};
        log.debug('[ResourceIntrinsicResolverImpl.constructor] Initialized cache:', this.cache);
        this.factories = {};
        log.debug('[ResourceIntrinsicResolverImpl.constructor] Initialized factories:', this.factories);

        this.factories[CfResourcesType.AWS_ApiGatewayV2_Authorizer] = (utils) => new AwsApiGatewayV2AuthorizerResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGatewayV2_Authorizer}`);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_Deployment] = (utils) => new AwsApiGatewayV2DeploymentResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGatewayV2_Deployment}`);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_Model] = (utils) => new AwsApiGatewayV2ModelResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGatewayV2_Model}`);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_Stage] = (utils) => new AwsApiGatewayV2StageResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGatewayV2_Stage}`);
        this.factories[CfResourcesType.AWS_ApiGateway_Authorizer] = (utils) => new AwsApiGatewayAuthorizerResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_Authorizer}`);
        this.factories[CfResourcesType.AWS_ApiGateway_Deployment] = (utils) => new AwsApiGatewayDeploymentResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_Deployment}`);
        this.factories[CfResourcesType.AWS_ApiGateway_Method] = (utils) => new AwsApiGatewayMethodResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_Method}`);
        this.factories[CfResourcesType.AWS_ApiGateway_Model] = (utils) => new AwsApiGatewayModelResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_Model}`);
        this.factories[CfResourcesType.AWS_ApiGateway_RequestValidator] = (utils) => new AwsApiGatewayRequestValidatorResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_RequestValidator}`);
        this.factories[CfResourcesType.AWS_ApiGateway_Resource] = (utils) => new AwsApiGatewayResourceResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_Resource}`);
        this.factories[CfResourcesType.AWS_ApiGateway_RestApi] = (utils) => new AwsApiGatewayRestApiResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_RestApi}`);
        this.factories[CfResourcesType.AWS_ApiGateway_Stage] = (utils) => new AwsApiGatewayStageResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_Stage}`);
        this.factories[CfResourcesType.AWS_CDK_Metadata] = (utils) => new AwsCDKMetadataResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_CDK_Metadata}`);
        this.factories[CfResourcesType.AWS_DynamoDB_Table] = (utils) => new AwsDynamoDBTableResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_DynamoDB_Table}`);
        this.factories[CfResourcesType.AWS_ECS_Service] = (utils) => new AwsEcsServiceResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ECS_Service}`);
        this.factories[CfResourcesType.AWS_ECS_TaskDefinition] = (utils) => new AwsECSTaskDefinitionResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ECS_TaskDefinition}`);
        this.factories[CfResourcesType.AWS_ElasticLoadBalancingV2_ListenerRule] = (utils) => new AwsElasticLoadBalancingV2ListenerRule(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ElasticLoadBalancingV2_ListenerRule}`);
        this.factories[CfResourcesType.AWS_ElasticLoadBalancingV2_TargetGroup] = (utils) => new AwsElasticLoadBalancingV2TargetGroupResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ElasticLoadBalancingV2_TargetGroup}`);
        this.factories[CfResourcesType.AWS_Events_ApiDestination] = (utils) => new AwsEventsApiDestinationResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_Events_ApiDestination}`);
        this.factories[CfResourcesType.AWS_Events_Archive] = (utils) => new AwsEventsArchiveResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_Events_Archive}`);
        this.factories[CfResourcesType.AWS_Events_Connection] = (utils) => new AwsEventsConnectionResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_Events_Connection}`);
        this.factories[CfResourcesType.AWS_Events_EventBus] = (utils) => new AwsEventsEventBusResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_Events_EventBus}`);
        this.factories[CfResourcesType.AWS_Events_EventBusPolicy] = (utils) => new AwsEventsEventBusPolicyResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_Events_EventBusPolicy}`);
        this.factories[CfResourcesType.AWS_Events_Rule] = (utils) => new AwsEventsRuleResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_Events_Rule}`);
        this.factories[CfResourcesType.AWS_IAM_Policy] = (utils) => new AwsIAMPolicyResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_IAM_Policy}`);
        this.factories[CfResourcesType.AWS_IAM_Role] = (utils) => new AwsIAMRoleResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_IAM_Role}`);
        this.factories[CfResourcesType.AWS_Lambda_Function] = (utils) => new AwsLambdaFunctionResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_Lambda_Function}`);
        this.factories[CfResourcesType.AWS_Lambda_Permission] = (utils) => new AwsLambdaPermissionResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_Lambda_Permission}`);
        this.factories[CfResourcesType.AWS_Logs_LogGroup] = (utils) => new AwsLogsLogGroupResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_Logs_LogGroup}`);
        this.factories[CfResourcesType.AWS_Pipes_Pipe] = (utils) => new AwsPipesPipeResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_Pipes_Pipe}`);
        this.factories[CfResourcesType.AWS_SNS_Subscription] = (utils) => new AwsSNSSubscriptionResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_SNS_Subscription}`);
        this.factories[CfResourcesType.AWS_SNS_Topic] = (utils) => new AwsSNSTopicResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_SNS_Topic}`);
        this.factories[CfResourcesType.AWS_SNS_TopicPolicy] = (utils) => new AwsSNSTopicPolicyResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_SNS_TopicPolicy}`);
        this.factories[CfResourcesType.AWS_SQS_Queue] = (utils) => new AwsSQSQueueResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_SQS_Queue}`);
        this.factories[CfResourcesType.AWS_StepFunctions_StateMachine] = (utils) => new AwsStepFunctionsStateMachineResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_StepFunctions_StateMachine}`);
        this.factories[CfResourcesType.AWS_S3_Bucket] = (utils) => new AwsS3BucketResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_S3_Bucket}`);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_Api] = (utils) => new AwsApiGatewayV2ApiResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGatewayV2_Api}`);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_ApiGatewayManagedOverrides] = (utils) =>
            new AwsApiGatewayV2ApiGatewayManagedOverridesResource(utils);
        log.debug(
            `[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGatewayV2_ApiGatewayManagedOverrides}`,
        );
        this.factories[CfResourcesType.AWS_ApiGatewayV2_ApiMapping] = (utils) => new AwsApiGatewayV2ApiMappingResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGatewayV2_ApiMapping}`);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_DomainName] = (utils) => new AwsApiGatewayV2DomainNameResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGatewayV2_DomainName}`);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_Integration] = (utils) => new AwsApiGatewayV2IntegrationResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGatewayV2_Integration}`);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_IntegrationResponse] = (utils) => new AwsApiGatewayV2IntegrationResponseResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGatewayV2_IntegrationResponse}`);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_Route] = (utils) => new AwsApiGatewayV2RouteResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGatewayV2_Route}`);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_RouteResponse] = (utils) => new AwsApiGatewayV2RouteResponseResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGatewayV2_RouteResponse}`);
        this.factories[CfResourcesType.AWS_ApiGatewayV2_VpcLink] = (utils) => new AwsApiGatewayV2VpcLinkResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGatewayV2_VpcLink}`);
        this.factories[CfResourcesType.AWS_ApiGateway_Account] = (utils) => new AwsApiGatewayAccountResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_Account}`);
        this.factories[CfResourcesType.AWS_ApiGateway_ApiKey] = (utils) => new AwsApiGatewayApiKeyResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_ApiKey}`);
        this.factories[CfResourcesType.AWS_ApiGateway_BasePathMapping] = (utils) => new AwsApiGatewayBasePathMappingResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_BasePathMapping}`);
        this.factories[CfResourcesType.AWS_ApiGateway_BasePathMappingV2] = (utils) => new AwsApiGatewayBasePathMappingV2Resource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_BasePathMappingV2}`);
        this.factories[CfResourcesType.AWS_ApiGateway_ClientCertificate] = (utils) => new AwsApiGatewayClientCertificateResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_ClientCertificate}`);
        this.factories[CfResourcesType.AWS_ApiGateway_DocumentationPart] = (utils) => new AwsApiGatewayDocumentationPartResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_DocumentationPart}`);
        this.factories[CfResourcesType.AWS_ApiGateway_DocumentationVersion] = (utils) => new AwsApiGatewayDocumentationVersionResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_DocumentationVersion}`);
        this.factories[CfResourcesType.AWS_ApiGateway_DomainName] = (utils) => new AwsApiGatewayDomainNameResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_DomainName}`);
        this.factories[CfResourcesType.AWS_ApiGateway_DomainNameAccessAssociation] = (utils) =>
            new AwsApiGatewayDomainNameAccessAssociationResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_DomainNameAccessAssociation}`);
        this.factories[CfResourcesType.AWS_ApiGateway_GatewayResponse] = (utils) => new AwsApiGatewayGatewayResponseResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_GatewayResponse}`);
        this.factories[CfResourcesType.AWS_ApiGateway_UsagePlan] = (utils) => new AwsApiGatewayUsagePlanResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_UsagePlan}`);
        this.factories[CfResourcesType.AWS_ApiGateway_UsagePlanKey] = (utils) => new AwsApiGatewayUsagePlanKeyResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_UsagePlanKey}`);
        this.factories[CfResourcesType.AWS_ApiGateway_VpcLink] = (utils) => new AwsApiGatewayVpcLinkResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_ApiGateway_VpcLink}`);
        this.factories[CfResourcesType.AWS_Events_Endpoint] = (utils) => new AwsEventsEndpointResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_Events_Endpoint}`);
        this.factories[CfResourcesType.AWS_Glue_Job] = (utils) => new AwsGlueJobResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_Glue_Job}`);
        this.factories[CfResourcesType.AWS_Glue_Connection] = (utils) => new AWSGlueConnectionResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_Glue_Connection}`);
        this.factories[CfResourcesType.AWS_Glue_Crawler] = (utils) => new AwsGlueCrawlerResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_Glue_Crawler}`);
        this.factories[CfResourcesType.AWS_Glue_Database] = (utils) => new AWSGlueDatabaseResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_Glue_Database}`);
        this.factories[CfResourcesType.AWS_Glue_Trigger] = (utils) => new AwsGlueTriggerResource(utils);
        log.debug(`[ResourceIntrinsicResolverImpl.constructor] Registered factory for ${CfResourcesType.AWS_Glue_Trigger}`);

        log.trace('[ResourceIntrinsicResolverImpl.constructor] Exiting');
    }

    public getResourceIntrinsic(resourceType: string): ResourceIntrinsic {
        log.trace('[ResourceIntrinsicResolverImpl.getResourceIntrinsic] Entering with arguments:', { resourceType });
        if (Object.keys(this.cache).includes(resourceType)) {
            const cachedIntrinsic = this.cache[resourceType];
            log.debug(
                `[ResourceIntrinsicResolverImpl.getResourceIntrinsic] Cache hit for resource type "${resourceType}". Returning cached intrinsic:`,
                cachedIntrinsic,
            );
            log.trace('[ResourceIntrinsicResolverImpl.getResourceIntrinsic] Exiting with result:', cachedIntrinsic);
            return cachedIntrinsic;
        }

        if (!Object.keys(this.factories).includes(resourceType)) {
            log.warn(`[ResourceIntrinsicResolverImpl.getResourceIntrinsic] Resource type "${resourceType}" not found. Returning stub.`);
            log.trace('[ResourceIntrinsicResolverImpl.getResourceIntrinsic] Exiting with result:', this.stub);
            return this.stub;
        }

        const factory = this.factories[resourceType];
        log.debug(`[ResourceIntrinsicResolverImpl.getResourceIntrinsic] Creating new intrinsic for resource type "${resourceType}" using factory.`);
        const intrinsic = factory(this.intrinsicUtils);
        log.debug(`[ResourceIntrinsicResolverImpl.getResourceIntrinsic] Created intrinsic for resource type "${resourceType}":`, intrinsic);
        this.cache[resourceType] = intrinsic;
        log.debug(
            `[ResourceIntrinsicResolverImpl.getResourceIntrinsic] Cached intrinsic for resource type "${resourceType}". Cache size:`,
            Object.keys(this.cache).length,
        );
        log.trace('[ResourceIntrinsicResolverImpl.getResourceIntrinsic] Exiting with result:', intrinsic);
        return intrinsic;
    }
}
