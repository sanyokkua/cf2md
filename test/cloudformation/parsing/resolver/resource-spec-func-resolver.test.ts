import log from 'loglevel';

import { SupportedCloudFormationResources } from '../../../../src/cloudformation/constants';
import { resourceSpecificResolverFunc } from '../../../../src/cloudformation/parsing/resolver/resource-spec-func-resolver';
import { awsApiGatewayAuthorizerFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsApiGatewayAuthorizerFunc';
import { awsApiGatewayDeploymentFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsApiGatewayDeploymentFunc';
import { awsApiGatewayMethodFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsApiGatewayMethodFunc';
import { awsApiGatewayModelFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsApiGatewayModelFunc';
import { awsApiGatewayRequestValidatorFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsApiGatewayRequestValidatorFunc';
import { awsApiGatewayResourceFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsApiGatewayResourceFunc';
import { awsApiGatewayRestApiFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsApiGatewayRestApiFunc';
import { awsApiGatewayStageFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsApiGatewayStageFunc';
import { awsApiGatewayV2AuthorizerFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsApiGatewayV2AuthorizerFunc';
import { awsApiGatewayV2DeploymentFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsApiGatewayV2DeploymentFunc';
import { awsApiGatewayV2ModelFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsApiGatewayV2ModelFunc';
import { awsApiGatewayV2StageFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsApiGatewayV2StageFunc';
import { awsCdkMetadataFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsCdkMetadataFunc';
import { awsDynamoDbTableFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsDynamoDbTableFunc';
import { awsEcsServiceFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsEcsServiceFunc';
import { awsEcsTaskDefinitionFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsEcsTaskDefinitionFunc';
import { awsElasticLoadBalancingV2ListenerRuleFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsElasticLoadBalancingV2ListenerRuleFunc';
import { awsElasticLoadBalancingV2TargetGroupFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsElasticLoadBalancingV2TargetGroupFunc';
import { awsEventsApiDestinationFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsEventsApiDestinationFunc';
import { awsEventsArchiveFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsEventsArchiveFunc';
import { awsEventsConnectionFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsEventsConnectionFunc';
import { awsEventsEventBusFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsEventsEventBusFunc';
import { awsEventsEventBusPolicyFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsEventsEventBusPolicyFunc';
import { awsEventsRuleFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsEventsRuleFunc';
import { awsIamPolicyFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsIamPolicyFunc';
import { awsIamRoleFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsIamRoleFunc';
import { awsLambdaFunctionFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsLambdaFunctionFunc';
import { awsLambdaPermissionFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsLambdaPermissionFunc';
import { awsLogsLogGroupFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsLogsLogGroupFunc';
import { awsPipesPipeFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsPipesPipeFunc';
import { awsS3BucketFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsS3BucketFunc';
import { awsSnsSubscriptionFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsSnsSubscriptionFunc';
import { awsSnsTopicFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsSnsTopicFunc';
import { awsSnsTopicPolicyFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsSnsTopicPolicyFunc';
import { awsSqsQueueFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsSqsQueueFunc';
import { awsStepFunctionsStateMachineFunc } from '../../../../src/cloudformation/parsing/resolver/resources/awsStepFunctionsStateMachineFunc';
import { stubFunctionForUnsupportedResources } from '../../../../src/cloudformation/parsing/resolver/resources/stubFunctionForUnsupportedResources';
import { ResourceSpecificFunc } from '../../../../src/cloudformation/parsing/types/types';

describe('resourceSpecificResolverFunc', () => {
    let logTraceSpy: jest.SpyInstance;
    let logWarnSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        logTraceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
        logWarnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        logTraceSpy.mockRestore();
        logWarnSpy.mockRestore();
    });

    it.each([
        [SupportedCloudFormationResources.AWS_ApiGatewayV2_Authorizer, awsApiGatewayV2AuthorizerFunc],
        [SupportedCloudFormationResources.AWS_ApiGatewayV2_Deployment, awsApiGatewayV2DeploymentFunc],
        [SupportedCloudFormationResources.AWS_ApiGatewayV2_Model, awsApiGatewayV2ModelFunc],
        [SupportedCloudFormationResources.AWS_ApiGatewayV2_Stage, awsApiGatewayV2StageFunc],
        [SupportedCloudFormationResources.AWS_ApiGateway_Authorizer, awsApiGatewayAuthorizerFunc],
        [SupportedCloudFormationResources.AWS_ApiGateway_Deployment, awsApiGatewayDeploymentFunc],
        [SupportedCloudFormationResources.AWS_ApiGateway_Method, awsApiGatewayMethodFunc],
        [SupportedCloudFormationResources.AWS_ApiGateway_Model, awsApiGatewayModelFunc],
        [SupportedCloudFormationResources.AWS_ApiGateway_RequestValidator, awsApiGatewayRequestValidatorFunc],
        [SupportedCloudFormationResources.AWS_ApiGateway_Resource, awsApiGatewayResourceFunc],
        [SupportedCloudFormationResources.AWS_ApiGateway_RestApi, awsApiGatewayRestApiFunc],
        [SupportedCloudFormationResources.AWS_ApiGateway_Stage, awsApiGatewayStageFunc],
        [SupportedCloudFormationResources.AWS_CDK_Metadata, awsCdkMetadataFunc],
        [SupportedCloudFormationResources.AWS_DynamoDB_Table, awsDynamoDbTableFunc],
        [SupportedCloudFormationResources.AWS_ECS_Service, awsEcsServiceFunc],
        [SupportedCloudFormationResources.AWS_ECS_TaskDefinition, awsEcsTaskDefinitionFunc],
        [
            SupportedCloudFormationResources.AWS_ElasticLoadBalancingV2_ListenerRule,
            awsElasticLoadBalancingV2ListenerRuleFunc,
        ],
        [
            SupportedCloudFormationResources.AWS_ElasticLoadBalancingV2_TargetGroup,
            awsElasticLoadBalancingV2TargetGroupFunc,
        ],
        [SupportedCloudFormationResources.AWS_Events_ApiDestination, awsEventsApiDestinationFunc],
        [SupportedCloudFormationResources.AWS_Events_Archive, awsEventsArchiveFunc],
        [SupportedCloudFormationResources.AWS_Events_Connection, awsEventsConnectionFunc],
        [SupportedCloudFormationResources.AWS_Events_EventBus, awsEventsEventBusFunc],
        [SupportedCloudFormationResources.AWS_Events_EventBusPolicy, awsEventsEventBusPolicyFunc],
        [SupportedCloudFormationResources.AWS_Events_Rule, awsEventsRuleFunc],
        [SupportedCloudFormationResources.AWS_IAM_Policy, awsIamPolicyFunc],
        [SupportedCloudFormationResources.AWS_IAM_Role, awsIamRoleFunc],
        [SupportedCloudFormationResources.AWS_Lambda_Function, awsLambdaFunctionFunc],
        [SupportedCloudFormationResources.AWS_Lambda_Permission, awsLambdaPermissionFunc],
        [SupportedCloudFormationResources.AWS_Logs_LogGroup, awsLogsLogGroupFunc],
        [SupportedCloudFormationResources.AWS_Pipes_Pipe, awsPipesPipeFunc],
        [SupportedCloudFormationResources.AWS_SNS_Subscription, awsSnsSubscriptionFunc],
        [SupportedCloudFormationResources.AWS_SNS_Topic, awsSnsTopicFunc],
        [SupportedCloudFormationResources.AWS_SNS_TopicPolicy, awsSnsTopicPolicyFunc],
        [SupportedCloudFormationResources.AWS_SQS_Queue, awsSqsQueueFunc],
        [SupportedCloudFormationResources.AWS_StepFunctions_StateMachine, awsStepFunctionsStateMachineFunc],
        [SupportedCloudFormationResources.AWS_S3_Bucket, awsS3BucketFunc],
    ])(
        'should return the correct resource-specific function for a supported resource type: "%s"',
        (resourceKey: string, expectedFn: ResourceSpecificFunc) => {
            const result = resourceSpecificResolverFunc(resourceKey);

            expect(result).toBe(expectedFn);
            expect(logTraceSpy).toHaveBeenCalledWith(`Resolving resource-specific function for type: ${resourceKey}`);
            expect(logTraceSpy).toHaveBeenCalledWith(`Found resource function for type: ${resourceKey}`);
        },
    );

    it('should return the correct resource-specific function for a supported resource type', () => {
        // Example: AWS::ApiGatewayV2::Authorizer is supported.
        const resourceType = SupportedCloudFormationResources.AWS_ApiGatewayV2_Authorizer; // e.g. "AWS::ApiGatewayV2::Authorizer"
        const result = resourceSpecificResolverFunc(resourceType);

        expect(result).toBe(awsApiGatewayV2AuthorizerFunc);
        expect(logTraceSpy).toHaveBeenCalledWith(`Resolving resource-specific function for type: ${resourceType}`);
        expect(logTraceSpy).toHaveBeenCalledWith(`Found resource function for type: ${resourceType}`);
    });

    it('should return the stub function for an unsupported resource type', () => {
        const unsupportedType = 'AWS::Some::UnsupportedResource';
        const result = resourceSpecificResolverFunc(unsupportedType);

        expect(result).toBe(stubFunctionForUnsupportedResources);
        expect(logTraceSpy).toHaveBeenCalledWith(`Resolving resource-specific function for type: ${unsupportedType}`);
        expect(logWarnSpy).toHaveBeenCalledWith(
            `No resource function implemented for type: ${unsupportedType}. Returning stub function.`,
        );
    });
});
