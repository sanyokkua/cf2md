import log from 'loglevel';
import { SupportedCloudFormationResources } from '../../constants';
import { ResourceSpecificFunc, ResourceSpecificResolverFunc } from '../types/types';

// Import resource-specific utility functions for supported AWS resource types.
import { awsApiGatewayAuthorizerFunc } from './resources/awsApiGatewayAuthorizerFunc';
import { awsApiGatewayDeploymentFunc } from './resources/awsApiGatewayDeploymentFunc';
import { awsApiGatewayMethodFunc } from './resources/awsApiGatewayMethodFunc';
import { awsApiGatewayModelFunc } from './resources/awsApiGatewayModelFunc';
import { awsApiGatewayRequestValidatorFunc } from './resources/awsApiGatewayRequestValidatorFunc';
import { awsApiGatewayResourceFunc } from './resources/awsApiGatewayResourceFunc';
import { awsApiGatewayRestApiFunc } from './resources/awsApiGatewayRestApiFunc';
import { awsApiGatewayStageFunc } from './resources/awsApiGatewayStageFunc';
import { awsApiGatewayV2AuthorizerFunc } from './resources/awsApiGatewayV2AuthorizerFunc';
import { awsApiGatewayV2DeploymentFunc } from './resources/awsApiGatewayV2DeploymentFunc';
import { awsApiGatewayV2ModelFunc } from './resources/awsApiGatewayV2ModelFunc';
import { awsApiGatewayV2StageFunc } from './resources/awsApiGatewayV2StageFunc';
import { awsCdkMetadataFunc } from './resources/awsCdkMetadataFunc';
import { awsDynamoDbTableFunc } from './resources/awsDynamoDbTableFunc';
import { awsEcsServiceFunc } from './resources/awsEcsServiceFunc';
import { awsEcsTaskDefinitionFunc } from './resources/awsEcsTaskDefinitionFunc';
import { awsElasticLoadBalancingV2ListenerRuleFunc } from './resources/awsElasticLoadBalancingV2ListenerRuleFunc';
import { awsElasticLoadBalancingV2TargetGroupFunc } from './resources/awsElasticLoadBalancingV2TargetGroupFunc';
import { awsEventsApiDestinationFunc } from './resources/awsEventsApiDestinationFunc';
import { awsEventsArchiveFunc } from './resources/awsEventsArchiveFunc';
import { awsEventsConnectionFunc } from './resources/awsEventsConnectionFunc';
import { awsEventsEventBusFunc } from './resources/awsEventsEventBusFunc';
import { awsEventsEventBusPolicyFunc } from './resources/awsEventsEventBusPolicyFunc';
import { awsEventsRuleFunc } from './resources/awsEventsRuleFunc';
import { awsIamPolicyFunc } from './resources/awsIamPolicyFunc';
import { awsIamRoleFunc } from './resources/awsIamRoleFunc';
import { awsLambdaFunctionFunc } from './resources/awsLambdaFunctionFunc';
import { awsLambdaPermissionFunc } from './resources/awsLambdaPermissionFunc';
import { awsLogsLogGroupFunc } from './resources/awsLogsLogGroupFunc';
import { awsPipesPipeFunc } from './resources/awsPipesPipeFunc';
import { awsS3BucketFunc } from './resources/awsS3BucketFunc';
import { awsSnsSubscriptionFunc } from './resources/awsSnsSubscriptionFunc';
import { awsSnsTopicFunc } from './resources/awsSnsTopicFunc';
import { awsSnsTopicPolicyFunc } from './resources/awsSnsTopicPolicyFunc';
import { awsSqsQueueFunc } from './resources/awsSqsQueueFunc';
import { awsStepFunctionsStateMachineFunc } from './resources/awsStepFunctionsStateMachineFunc';
import { stubFunctionForUnsupportedResources } from './resources/stubFunctionForUnsupportedResources';

/**
 * Resolves and returns a resource-specific function based on the CloudFormation resource type.
 *
 * This function maps a given CloudFormation resource type to its corresponding
 * resource-specific utility function. The mapping is defined in a static object,
 * where each key is a supported resource type and its value is the function that
 * resolves references, attributes, and ARNs for that resource type.
 *
 * If a resource type is not supported, a stub function is returned.
 *
 * @param resourceType - The identifier of the CloudFormation resource type.
 * @returns The corresponding resource-specific function if available; otherwise, a stub function.
 */
export const resourceSpecificResolverFunc: ResourceSpecificResolverFunc = (
    resourceType: string,
): ResourceSpecificFunc => {
    log.trace(`Resolving resource-specific function for type: ${resourceType}`);

    // Mapping between CloudFormation resource types and their implementation functions.
    const resourceFunctionMap: Record<string, ResourceSpecificFunc> = {
        [SupportedCloudFormationResources.AWS_ApiGatewayV2_Authorizer]: awsApiGatewayV2AuthorizerFunc,
        [SupportedCloudFormationResources.AWS_ApiGatewayV2_Deployment]: awsApiGatewayV2DeploymentFunc,
        [SupportedCloudFormationResources.AWS_ApiGatewayV2_Model]: awsApiGatewayV2ModelFunc,
        [SupportedCloudFormationResources.AWS_ApiGatewayV2_Stage]: awsApiGatewayV2StageFunc,
        [SupportedCloudFormationResources.AWS_ApiGateway_Authorizer]: awsApiGatewayAuthorizerFunc,
        [SupportedCloudFormationResources.AWS_ApiGateway_Deployment]: awsApiGatewayDeploymentFunc,
        [SupportedCloudFormationResources.AWS_ApiGateway_Method]: awsApiGatewayMethodFunc,
        [SupportedCloudFormationResources.AWS_ApiGateway_Model]: awsApiGatewayModelFunc,
        [SupportedCloudFormationResources.AWS_ApiGateway_RequestValidator]: awsApiGatewayRequestValidatorFunc,
        [SupportedCloudFormationResources.AWS_ApiGateway_Resource]: awsApiGatewayResourceFunc,
        [SupportedCloudFormationResources.AWS_ApiGateway_RestApi]: awsApiGatewayRestApiFunc,
        [SupportedCloudFormationResources.AWS_ApiGateway_Stage]: awsApiGatewayStageFunc,
        [SupportedCloudFormationResources.AWS_CDK_Metadata]: awsCdkMetadataFunc,
        [SupportedCloudFormationResources.AWS_DynamoDB_Table]: awsDynamoDbTableFunc,
        [SupportedCloudFormationResources.AWS_ECS_Service]: awsEcsServiceFunc,
        [SupportedCloudFormationResources.AWS_ECS_TaskDefinition]: awsEcsTaskDefinitionFunc,
        [SupportedCloudFormationResources.AWS_ElasticLoadBalancingV2_ListenerRule]:
            awsElasticLoadBalancingV2ListenerRuleFunc,
        [SupportedCloudFormationResources.AWS_ElasticLoadBalancingV2_TargetGroup]:
            awsElasticLoadBalancingV2TargetGroupFunc,
        [SupportedCloudFormationResources.AWS_Events_ApiDestination]: awsEventsApiDestinationFunc,
        [SupportedCloudFormationResources.AWS_Events_Archive]: awsEventsArchiveFunc,
        [SupportedCloudFormationResources.AWS_Events_Connection]: awsEventsConnectionFunc,
        [SupportedCloudFormationResources.AWS_Events_EventBus]: awsEventsEventBusFunc,
        [SupportedCloudFormationResources.AWS_Events_EventBusPolicy]: awsEventsEventBusPolicyFunc,
        [SupportedCloudFormationResources.AWS_Events_Rule]: awsEventsRuleFunc,
        [SupportedCloudFormationResources.AWS_IAM_Policy]: awsIamPolicyFunc,
        [SupportedCloudFormationResources.AWS_IAM_Role]: awsIamRoleFunc,
        [SupportedCloudFormationResources.AWS_Lambda_Function]: awsLambdaFunctionFunc,
        [SupportedCloudFormationResources.AWS_Lambda_Permission]: awsLambdaPermissionFunc,
        [SupportedCloudFormationResources.AWS_Logs_LogGroup]: awsLogsLogGroupFunc,
        [SupportedCloudFormationResources.AWS_Pipes_Pipe]: awsPipesPipeFunc,
        [SupportedCloudFormationResources.AWS_SNS_Subscription]: awsSnsSubscriptionFunc,
        [SupportedCloudFormationResources.AWS_SNS_Topic]: awsSnsTopicFunc,
        [SupportedCloudFormationResources.AWS_SNS_TopicPolicy]: awsSnsTopicPolicyFunc,
        [SupportedCloudFormationResources.AWS_SQS_Queue]: awsSqsQueueFunc,
        [SupportedCloudFormationResources.AWS_StepFunctions_StateMachine]: awsStepFunctionsStateMachineFunc,
        [SupportedCloudFormationResources.AWS_S3_Bucket]: awsS3BucketFunc,
    };

    // Check if the provided resource type is defined in the mapping.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (resourceFunctionMap[resourceType]) {
        log.trace(`Found resource function for type: ${resourceType}`);
        return resourceFunctionMap[resourceType];
    }

    // If the resource type is not supported, log a warning and return the stub function.
    log.warn(`No resource function implemented for type: ${resourceType}. Returning stub function.`);
    return stubFunctionForUnsupportedResources;
};
