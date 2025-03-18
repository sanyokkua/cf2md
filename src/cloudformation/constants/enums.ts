/**
 * Enum representing AWS CloudFormation pseudo parameters.
 *
 * Pseudo parameters are predefined values provided by AWS CloudFormation that allow you to reference
 * dynamic properties such as account ID, region, and stack specifics directly within your templates.
 * This parser utilizes these pseudo parameters to correctly interpret and substitute values in
 * CloudFormation templates.
 */
export enum PseudoParam {
    AccountId = 'AWS::AccountId',
    NotificationARNs = 'AWS::NotificationARNs',
    NoValue = 'AWS::NoValue',
    Partition = 'AWS::Partition',
    Region = 'AWS::Region',
    StackId = 'AWS::StackId',
    StackName = 'AWS::StackName',
    URLSuffix = 'AWS::URLSuffix',
}

/**
 * Enum listing supported AWS CloudFormation resource types.
 *
 * This enum defines a set of CloudFormation resource types that the parser is capable of processing.
 * Each resource type corresponds to specific AWS services, such as API Gateway, DynamoDB, ECS, Lambda,
 * S3, and many others. The parser uses these definitions to identify and correctly handle resources
 * when evaluating CloudFormation templates.
 */
export enum SupportedCloudFormationResources {
    AWS_ApiGatewayV2_Authorizer = 'AWS::ApiGatewayV2::Authorizer',
    AWS_ApiGatewayV2_Deployment = 'AWS::ApiGatewayV2::Deployment',
    AWS_ApiGatewayV2_Model = 'AWS::ApiGatewayV2::Model',
    AWS_ApiGatewayV2_Stage = 'AWS::ApiGatewayV2::Stage',
    AWS_ApiGateway_Authorizer = 'AWS::ApiGateway::Authorizer',
    AWS_ApiGateway_Deployment = 'AWS::ApiGateway::Deployment',
    AWS_ApiGateway_Method = 'AWS::ApiGateway::Method',
    AWS_ApiGateway_Model = 'AWS::ApiGateway::Model',
    AWS_ApiGateway_RequestValidator = 'AWS::ApiGateway::RequestValidator',
    AWS_ApiGateway_Resource = 'AWS::ApiGateway::Resource',
    AWS_ApiGateway_RestApi = 'AWS::ApiGateway::RestApi',
    AWS_ApiGateway_Stage = 'AWS::ApiGateway::Stage',
    AWS_CDK_Metadata = 'AWS::CDK::Metadata',
    AWS_DynamoDB_Table = 'AWS::DynamoDB::Table',
    AWS_ECS_Service = 'AWS::ECS::Service',
    AWS_ECS_TaskDefinition = 'AWS::ECS::TaskDefinition',
    AWS_ElasticLoadBalancingV2_ListenerRule = 'AWS::ElasticLoadBalancingV2::ListenerRule',
    AWS_ElasticLoadBalancingV2_TargetGroup = 'AWS::ElasticLoadBalancingV2::TargetGroup',
    AWS_Events_ApiDestination = 'AWS::Events::ApiDestination',
    AWS_Events_Archive = 'AWS::Events::Archive',
    AWS_Events_Connection = 'AWS::Events::Connection',
    AWS_Events_EventBus = 'AWS::Events::EventBus',
    AWS_Events_EventBusPolicy = 'AWS::Events::EventBusPolicy',
    AWS_Events_Rule = 'AWS::Events::Rule',
    AWS_IAM_Policy = 'AWS::IAM::Policy',
    AWS_IAM_Role = 'AWS::IAM::Role',
    AWS_Lambda_Function = 'AWS::Lambda::Function',
    AWS_Lambda_Permission = 'AWS::Lambda::Permission',
    AWS_Logs_LogGroup = 'AWS::Logs::LogGroup',
    AWS_Pipes_Pipe = 'AWS::Pipes::Pipe',
    AWS_SNS_Subscription = 'AWS::SNS::Subscription',
    AWS_SNS_Topic = 'AWS::SNS::Topic',
    AWS_SNS_TopicPolicy = 'AWS::SNS::TopicPolicy',
    AWS_SQS_Queue = 'AWS::SQS::Queue',
    AWS_StepFunctions_StateMachine = 'AWS::StepFunctions::StateMachine',
    AWS_S3_Bucket = 'AWS::S3::Bucket',
}

/**
 * Enum of supported AWS CloudFormation intrinsic functions.
 *
 * Intrinsic functions in CloudFormation enable you to perform evaluations, transformations, and data manipulations
 * directly within your templates. This enum provides a set of intrinsic functions recognized by the parser,
 * including functionalities like condition evaluation (`Fn::If`), string manipulation (`Fn::Sub`, `Fn::Join`),
 * and logical operations (`Fn::Not`, `Fn::And`, `Fn::Or`), among others.
 *
 * The parser leverages these definitions to correctly interpret and evaluate intrinsic function expressions.
 */
export enum SupportedIntrinsicFunctions {
    Ref = 'Ref',
    Fn_Not = 'Fn::Not',
    Fn_And = 'Fn::And',
    Fn_Or = 'Fn::Or',
    Fn_Equals = 'Fn::Equals',
    Fn_If = 'Fn::If',
    Fn_ToJsonString = 'Fn::ToJsonString',
    Fn_GetAZs = 'Fn::GetAZs',
    Fn_GetAtt = 'Fn::GetAtt',
    Fn_FindInMap = 'Fn::FindInMap',
    Fn_Sub = 'Fn::Sub',
    Fn_ImportValue = 'Fn::ImportValue',
    Fn_Split = 'Fn::Split',
    Fn_Join = 'Fn::Join',
    Fn_Select = 'Fn::Select',
    Fn_Base64 = 'Fn::Base64',
    Fn_Contains = 'Fn::Contains',
}
