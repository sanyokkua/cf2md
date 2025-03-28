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
export enum CfResourcesType {
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
    AWS_ApiGatewayV2_Api = 'AWS::ApiGatewayV2::Api',
    AWS_ApiGatewayV2_ApiGatewayManagedOverrides = 'AWS::ApiGatewayV2::ApiGatewayManagedOverrides',
    AWS_ApiGatewayV2_ApiMapping = 'AWS::ApiGatewayV2::ApiMapping',
    AWS_ApiGatewayV2_DomainName = 'AWS::ApiGatewayV2::DomainName',
    AWS_ApiGatewayV2_Integration = 'AWS::ApiGatewayV2::Integration',
    AWS_ApiGatewayV2_IntegrationResponse = 'AWS::ApiGatewayV2::IntegrationResponse',
    AWS_ApiGatewayV2_Route = 'AWS::ApiGatewayV2::Route',
    AWS_ApiGatewayV2_RouteResponse = 'AWS::ApiGatewayV2::RouteResponse',
    AWS_ApiGatewayV2_VpcLink = 'AWS::ApiGatewayV2::VpcLink',
    AWS_ApiGateway_Account = 'AWS::ApiGateway::Account',
    AWS_ApiGateway_ApiKey = 'AWS::ApiGateway::ApiKey',
    AWS_ApiGateway_BasePathMapping = 'AWS::ApiGateway::BasePathMapping',
    AWS_ApiGateway_BasePathMappingV2 = 'AWS::ApiGateway::BasePathMappingV2',
    AWS_ApiGateway_ClientCertificate = 'AWS::ApiGateway::ClientCertificate',
    AWS_ApiGateway_DocumentationPart = 'AWS::ApiGateway::DocumentationPart',
    AWS_ApiGateway_DocumentationVersion = 'AWS::ApiGateway::DocumentationVersion',
    AWS_ApiGateway_DomainName = 'AWS::ApiGateway::DomainName',
    AWS_ApiGateway_DomainNameAccessAssociation = 'AWS::ApiGateway::DomainNameAccessAssociation',
    AWS_ApiGateway_GatewayResponse = 'AWS::ApiGateway::GatewayResponse',
    AWS_ApiGateway_UsagePlan = 'AWS::ApiGateway::UsagePlan',
    AWS_ApiGateway_UsagePlanKey = 'AWS::ApiGateway::UsagePlanKey',
    AWS_ApiGateway_VpcLink = 'AWS::ApiGateway::VpcLink',
    AWS_Events_Endpoint = 'AWS::Events::Endpoint',
    AWS_Glue_Job = 'AWS::Glue::Job',
    AWS_Glue_Connection = 'AWS::Glue::Connection',
    AWS_Glue_Crawler = 'AWS::Glue::Crawler',
    AWS_Glue_Database = 'AWS::Glue::Database',
    AWS_Glue_Trigger = 'AWS::Glue::Trigger',
}

/**
 * Enum of supported AWS CloudFormation intrinsic functions and Conditions.
 *
 * Intrinsic functions in CloudFormation enable you to perform evaluations, transformations, and data manipulations
 * directly within your templates. This enum provides a set of intrinsic functions recognized by the parser,
 * including functionalities like condition evaluation (`Fn::If`), string manipulation (`Fn::Sub`, `Fn::Join`),
 * and logical operations (`Fn::Not`, `Fn::And`, `Fn::Or`), among others.
 *
 * The parser leverages these definitions to correctly interpret and evaluate intrinsic function expressions.
 */
export enum CfIntrinsicFunctions {
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
