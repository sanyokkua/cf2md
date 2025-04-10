import { StringKeyObject } from '../../common';

export type ObjectOfStringTypes = { [key: string]: StringType };

export interface CommonResource {
    _id?: string; // Created during resolving values
    _arn?: string; // Created during resolving values
    CreationPolicy?: unknown;
    DeletionPolicy?: unknown;
    DependsOn?: StringType | StringType[];
    Metadata?: Metadata;
    UpdatePolicy?: unknown;
    UpdateReplacePolicy?: unknown;
    [key: string]: unknown;
}

export interface GenericResource extends CommonResource {
    Type: string;
    Properties: {
        [propertyName: string]: unknown;
    };
}

/**
 * Type for a CloudFormation condition expression.
 * A condition can be a literal boolean, a Ref to a condition, or one of the intrinsic condition functions.
 */
export type ConditionExpression = string | boolean | FnIf | FnNot | FnAnd | FnOr | FnEquals | Ref | FnContains | StringKeyObject;

/**
 * Represents the intrinsic function Fn::Not.
 *
 * { "Fn::Not": [ condition ] }
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html#intrinsic-function-reference-conditions-not
 */
export interface FnNot {
    'Fn::Not': [ConditionExpression];
}

/**
 * Represents the intrinsic function Fn::Contains.
 *
 * "Fn::Contains" : [[list_of_strings], string]
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-rules.html#fn-contains
 */
export interface FnContains {
    'Fn::Contains': [StringType[], StringType];
}

/**
 * Represents the intrinsic function Fn::And.
 *
 * { "Fn::And": [ condition1, condition2, ... ] }
 *
 * (There must be between 2 and 10 conditions)
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html#intrinsic-function-reference-conditions-and
 */
export interface FnAnd {
    'Fn::And': ConditionExpression[];
}

/**
 * Represents the intrinsic function Fn::Or.
 *
 * { "Fn::Or": [ condition1, condition2, ... ] }
 *
 * (There must be between 2 and 10 conditions)
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html#intrinsic-function-reference-conditions-or
 */
export interface FnOr {
    'Fn::Or': ConditionExpression[];
}

/**
 * Represents the intrinsic function Fn::Equals.
 *
 * { "Fn::Equals": [ value1, value2 ] }
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html#intrinsic-function-reference-conditions-equals
 */
export interface FnEquals {
    'Fn::Equals': [StringType, StringType];
}

/**
 * Represents the intrinsic function Fn::If.
 *
 * { "Fn::If": [ "ConditionName", valueIfTrue, valueIfFalse ] }
 *
 * The two values must be of the same type.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html#intrinsic-function-reference-conditions-if
 */
export interface FnIf {
    'Fn::If': [string, unknown, unknown];
}

/**
 * Represents the intrinsic function Fn::ToJsonString.
 *
 * { "Fn::ToJsonString": value }
 *
 * Converts a value (object, list, string, etc.) to a JSON string.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-ToJsonString.html
 */
export interface FnToJsonString {
    'Fn::ToJsonString': unknown;
}

/**
 * Represents the intrinsic function Fn::GetAZs.
 *
 * { "Fn::GetAZs": "region" }
 *
 * Returns a list of Availability Zones for the specified region.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getavailabilityzones.html
 */
export interface FnGetAZs {
    'Fn::GetAZs': string | Ref;
}

/**
 * Union type for the attribute name parameter in Fn::GetAtt.
 * According to AWS documentation, you can use a literal string, or on language extensions the following functions:
 * Fn::Base64, Fn::FindInMap, Fn::If, Fn::Join, Fn::Sub, Fn::ToJsonString, or Ref.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html
 */
export type FnGetAttAttrName = string | FnBase64 | FnFindInMap | FnIf | FnJoin | FnSub | FnToJsonString | Ref;

/**
 * Represents the intrinsic function Fn::GetAtt.
 *
 * { "Fn::GetAtt": [ "logicalNameOfResource", "attributeName" ] }
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html
 */
export interface FnGetAtt {
    'Fn::GetAtt': [FnGetAttAttrName, FnGetAttAttrName];
}

/**
 * Union type for Ref parameter values.
 * According to the docs for Fn::GetAtt and others, the allowed values include:
 * literal strings, Fn::Base64, Fn::FindInMap, Fn::If, Fn::ImportValue, Fn::Join, Fn::Sub, Fn::ToJsonString, and nested Ref.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-ref.html
 */
export type RefAttr = string | FnBase64 | FnFindInMap | FnImportValue | FnJoin | FnSub | FnIf | FnToJsonString | Ref;

/**
 * Represents the intrinsic function Ref.
 *
 * { "Ref": "logicalName" }
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-ref.html
 */
export interface Ref {
    Ref: RefAttr;
}

/**
 * A union that now contains all intrinsic “string‐producing” functions.
 * (Many CloudFormation intrinsic functions may be used where a literal string is expected.)
 */
export type IntrinsicFunction = Ref | FnJoin | FnSub | FnGetAtt | FnSelect | FnBase64 | FnSplit | FnImportValue | FnFindInMap | FnToJsonString;

/**
 * A union type for any value that can evaluate to a string in CloudFormation.
 */
export type StringType = string | Ref | FnJoin | FnSub | FnGetAtt | FnSelect | FnBase64 | FnImportValue | FnFindInMap | FnToJsonString;

/**
 * Union type for Fn::FindInMap mapping keys.
 * The mapping keys must ultimately resolve to literal strings.
 */
export type FnFindInMapAttr = string | Ref | FnFindInMap;

/**
 * Represents the intrinsic function Fn::FindInMap.
 *
 * { "Fn::FindInMap": [ "MapName", "TopLevelKey", "SecondLevelKey" ] }
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-findinmap.html
 */
export interface FnFindInMap {
    'Fn::FindInMap': [string, FnFindInMapAttr, FnFindInMapAttr];
}

/**
 * Union type for values within the Fn::Sub substitution map.
 * Per AWS, the allowed functions include:
 * Fn::Base64, Fn::FindInMap, Fn::GetAtt, Fn::GetAZs, Fn::If, Fn::ImportValue, Fn::Join, Fn::Select, Fn::Sub, and Ref.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-sub.html
 */
export type FnSubAttr = string | FnBase64 | FnFindInMap | FnGetAtt | FnGetAZs | FnIf | FnImportValue | FnJoin | FnSelect | FnSub | Ref;

/**
 * Represents the intrinsic function Fn::Sub.
 *
 * { "Fn::Sub": "string" }
 * or
 * { "Fn::Sub": [ "string", { "Var1Name": Var1Value, "Var2Name": Var2Value } ] }
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-sub.html
 */
export interface FnSub {
    'Fn::Sub': string | [string, { [key: string]: FnSubAttr }];
}

/**
 * Union type for values within the Fn::ImportValue function.
 * Per AWS docs: allowed functions include Fn::Base64, Fn::FindInMap, Fn::If, Fn::Join, Fn::Select, Fn::Sub and Ref.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-importvalue.html
 */
export type FnImportValueAttr = string | FnBase64 | FnFindInMap | FnIf | FnJoin | FnSelect | FnSub | Ref;

/**
 * Represents the intrinsic function Fn::ImportValue.
 *
 * { "Fn::ImportValue": sharedValueToImport }
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-importvalue.html
 */
export interface FnImportValue {
    'Fn::ImportValue': FnImportValueAttr;
}

/**
 * Union type for the second element (the “source string”) within Fn::Split.
 * Allowed functions per docs:
 * Fn::Base64, Fn::FindInMap, Fn::GetAtt, Fn::GetAZs, Fn::If, Fn::ImportValue, Fn::Join, Fn::Select, Fn::Sub, and Ref.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-split.html
 */
export type FnSplitAttr = string | FnBase64 | FnFindInMap | FnGetAtt | FnGetAZs | FnIf | FnImportValue | FnJoin | FnSelect | FnSub | Ref;

/**
 * Represents the intrinsic function Fn::Split.
 *
 * { "Fn::Split": [ "delimiter", "source string" ] }
 *
 * For the delimiter, you must specify a literal string.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-split.html
 */
export interface FnSplit {
    'Fn::Split': [string, FnSplitAttr];
}

/**
 * Union type for values in the list (second argument) of Fn::Join.
 * Allowed functions per docs:
 * Fn::Base64, Fn::FindInMap, Fn::GetAtt, Fn::GetAZs, Fn::If, Fn::ImportValue, Fn::Join, Fn::Split, Fn::Select, Fn::Sub, and Ref.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-join.html
 */
export type FnJoinAttr = string | FnBase64 | FnFindInMap | FnGetAtt | FnGetAZs | FnIf | FnImportValue | FnJoin | FnSplit | FnSelect | FnSub | Ref;

/**
 * Represents the intrinsic function Fn::Join.
 *
 * { "Fn::Join": [ "delimiter", [ comma-delimited list of values ] ] }
 *
 * The delimiter must be a literal string.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-join.html
 */
export interface FnJoin {
    'Fn::Join': [string, FnJoinAttr[]];
}

/**
 * Union type for the index parameter of Fn::Select.
 * Allowed types include number, string, Ref, or Fn::FindInMap.
 */
export type FnSelectIndex = number | string | Ref | FnFindInMap;

/**
 * Union type for the list parameter of Fn::Select.
 * Allowed functions per docs (if not a literal array): Fn::FindInMap, Fn::GetAtt, Fn::GetAZs, Fn::If, Fn::Split, and Ref.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-select.html
 */
export type FnSelectAttr = string[] | FnFindInMap | FnGetAtt | FnGetAZs | FnIf | FnSplit | Ref;

/**
 * Represents the intrinsic function Fn::Select.
 *
 * { "Fn::Select": [ index, listOfObjects ] }
 *
 * For the index value, you can use Ref and Fn::FindInMap.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-select.html
 */
export interface FnSelect {
    'Fn::Select': [FnSelectIndex, FnSelectAttr];
}

/**
 * Represents the intrinsic function Fn::Base64.
 *
 * { "Fn::Base64": valueToEncode }
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-base64.html
 */
export interface FnBase64 {
    'Fn::Base64': StringType;
}

/**
 * Represents AWS CDK metadata attached to a CloudFormation resource.
 *
 * This metadata may include properties such as the CDK resource path and asset information.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html
 */
export interface Metadata {
    [key: string]: unknown;
}

/**
 * Represents a tag for an AWS resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-resource-tags.html
 */
export interface Tag {
    Key: string;
    Value: StringType;
}

/**
 * Represents a policy statement within an AWS IAM or resource policy.
 *
 * @see https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html
 */
export interface Statement {
    Action: string | string[];
    Effect: string;
    Principal?: Principal;
    Resource?: string | StringKeyObject | IntrinsicFunction;
    Condition?: StringKeyObject;
    Sid?: string;
}

/**
 * Represents the principal element in an AWS IAM policy statement.
 *
 * @see https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_principal.html
 */
export interface Principal {
    Service?: string | string[];
    AWS?: string | StringKeyObject | IntrinsicFunction;
}

/**
 * Represents a parameter in a CloudFormation template.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html
 */
export interface Parameter {
    Type: string;
    Default?: string | number | number[];
    Description?: string;
    AllowedValues?: string[] | number[];
    AllowedPattern?: string;
}

/**
 * Represents an assertion used in CloudFormation template rules.
 *
 * Template rules provide a validation mechanism within a CloudFormation template.
 * For more information, see:
 * https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/rules-section-structure.html
 */
export interface Assertion {
    Assert?: ConditionExpression;
    AssertDescription?: string;
}

/**
 * Represents a rule that contains one or more assertions in a CloudFormation template.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/rules-section-structure.html
 */
export interface Rule {
    Assertions?: Assertion[];
}

/**
 * Represents an IAM policy document.
 * This must follow the JSON policy schema.
 * @see https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html
 */
export interface PolicyDocument extends StringKeyObject {
    Version?: string;
    Id?: string;
    Statement?: Statement[];
}

/**
 * Represents an inline IAM policy for a role.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-iam-role.html
 */
export interface IAMRolePolicy {
    PolicyDocument: PolicyDocument;
    PolicyName: StringType;

    [key: string]: unknown;
}

/**
 * Represents an AWS IAM Role resource.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-iam-role.html
 */
export interface IAMRoleResource extends CommonResource {
    Type: 'AWS::IAM::Role';
    Properties: {
        AssumeRolePolicyDocument: PolicyDocument | StringKeyObject;
        Description?: StringType;
        ManagedPolicyArns?: StringType[];
        MaxSessionDuration?: number;
        Path?: StringType;
        PermissionsBoundary?: StringType;
        Policies?: IAMRolePolicy[];
        RoleName?: string;
        Tags?: Tag[];
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an AWS IAM Policy resource.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-iam-policy.html
 */
export interface IAMPolicyResource extends CommonResource {
    Type: 'AWS::IAM::Policy';
    Properties: {
        Groups?: StringType[];
        PolicyDocument: PolicyDocument | StringKeyObject;
        PolicyName: string;
        Roles?: StringType[];
        Users?: StringType[];
        [propertyName: string]: unknown;
    };
}

/**
 * Represents the code configuration for an AWS Lambda function.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html
 */
export interface LambdaFunctionResourceCode {
    ImageUri?: StringType;
    S3Bucket?: StringType;
    S3Key?: StringType;
    S3ObjectVersion?: StringType;
    SourceKMSKeyArn?: StringType;
    ZipFile?: StringType;
}

/**
 * Represents the dead-letter configuration for an AWS Lambda function.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-deadletterconfig.html
 */
export interface LambdaFunctionResourceDlq {
    TargetArn?: StringType;
}

/**
 * Represents the environment configuration for an AWS Lambda function.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-environment.html
 */
export interface LambdaFunctionResourceEnv {
    Variables?: { [key: string]: StringType };
}

/**
 * Represents the ephemeral storage configuration for an AWS Lambda function.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-ephemeralstorage.html
 */
export interface LambdaFunctionEphemeralStorage {
    Size: number;
}

/**
 * Represents a file system configuration for an AWS Lambda function.
 * Note: The CloudFormation spec expects an array of these.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-filesystemconfig.html
 */
export interface LambdaFunctionFileSystemConfig {
    Arn: StringType;
    LocalMountPath: StringType;
}

/**
 * Represents the image configuration for a container-based AWS Lambda function.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-imageconfig.html
 */
export interface LambdaFunctionImageConfig {
    Command?: StringType[];
    EntryPoint?: StringType[];
    WorkingDirectory?: StringType;
}

/**
 * Represents the logging configuration for an AWS Lambda function.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-loggingconfig.html
 */
export interface LambdaFunctionLoggingConfig {
    ApplicationLogLevel?: StringType; // TRACE | DEBUG | INFO | WARN | ERROR | FATAL
    LogFormat?: StringType; // Text | JSON
    LogGroup?: StringType;
    SystemLogLevel?: StringType; // DEBUG | INFO | WARN
}

/**
 * Represents the runtime management configuration for an AWS Lambda function.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-runtimemanagementconfig.html
 */
export interface LambdaFunctionRuntimeManagementConfig {
    RuntimeVersionArn?: StringType;
    UpdateRuntimeOn: StringType;
}

/**
 * Represents the SnapStart configuration for an AWS Lambda function.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-snapstart.html
 */
export interface LambdaFunctionSnapStart {
    ApplyOn: StringType;
}

/**
 * Represents the tracing configuration for an AWS Lambda function.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-tracingconfig.html
 */
export interface LambdaFunctionTracingConfig {
    Mode?: string; // Active | PassThrough
}

/**
 * Represents the VPC configuration for an AWS Lambda function.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-vpcconfig.html
 */
export interface LambdaFunctionVpcConfig {
    Ipv6AllowedForDualStack?: boolean;
    SecurityGroupIds?: StringType[];
    SubnetIds?: StringType[];
}

/**
 * Represents an AWS Lambda Function resource.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-function.html
 */
export interface LambdaFunctionResource extends CommonResource {
    Type: 'AWS::Lambda::Function';
    Properties: {
        Architectures?: string[];
        Code: LambdaFunctionResourceCode;
        CodeSigningConfigArn?: StringType;
        DeadLetterConfig?: LambdaFunctionResourceDlq;
        Environment?: LambdaFunctionResourceEnv;
        EphemeralStorage?: LambdaFunctionEphemeralStorage;
        FileSystemConfigs?: LambdaFunctionFileSystemConfig[];
        FunctionName?: StringType;
        Handler?: StringType;
        ImageConfig?: LambdaFunctionImageConfig;
        KmsKeyArn?: StringType;
        Layers?: StringType[];
        LoggingConfig?: LambdaFunctionLoggingConfig;
        MemorySize?: number | string;
        PackageType?: StringType; // Image | Zip
        RecursiveLoop?: StringType; // Allow | Terminate
        ReservedConcurrentExecutions?: number | string;
        Role: StringType;
        Runtime?: StringType;
        RuntimeManagementConfig?: LambdaFunctionRuntimeManagementConfig;
        SnapStart?: LambdaFunctionSnapStart;
        Tags?: Tag[];
        Timeout?: number | string;
        TracingConfig?: LambdaFunctionTracingConfig;
        VpcConfig?: LambdaFunctionVpcConfig;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an AWS SQS Queue resource.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-sqs-queue.html
 */
export interface SQSQueueResource extends CommonResource {
    Type: 'AWS::SQS::Queue';
    Properties: {
        ContentBasedDeduplication?: boolean;
        DeduplicationScope?: StringType;
        DelaySeconds?: number;
        FifoQueue?: boolean;
        FifoThroughputLimit?: StringType;
        KmsDataKeyReusePeriodSeconds?: number;
        KmsMasterKeyId?: StringType;
        MaximumMessageSize?: number;
        MessageRetentionPeriod?: number;
        QueueName?: StringType;
        ReceiveMessageWaitTimeSeconds?: number;
        RedriveAllowPolicy?: StringKeyObject;
        RedrivePolicy?: StringKeyObject;
        SqsManagedSseEnabled?: boolean;
        Tags?: Tag[];
        VisibilityTimeout?: number;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents a Delivery Status Logging configuration for an SNS Topic.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sns-topic-loggingconfig.html
 */
export interface SNSTopicDeliveryStatusLogging {
    FailureFeedbackRoleArn?: StringType;
    Protocol: StringType;
    SuccessFeedbackRoleArn?: StringType;
    SuccessFeedbackSampleRate?: StringType;
}

/**
 * Represents a Subscription configuration for an SNS Topic.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sns-topic-subscription.html
 */
export interface SNSTopicSubscription {
    Endpoint: StringType;
    Protocol: StringType;
}

/**
 * Represents an AWS SNS Topic resource.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-sns-topic.html
 */
export interface SNSTopicResource extends CommonResource {
    Type: 'AWS::SNS::Topic';
    Properties: {
        ArchivePolicy?: StringKeyObject;
        ContentBasedDeduplication?: boolean;
        DataProtectionPolicy?: StringKeyObject;
        DeliveryStatusLogging?: SNSTopicDeliveryStatusLogging[];
        DisplayName?: StringType;
        FifoThroughputScope?: StringType;
        FifoTopic?: boolean;
        KmsMasterKeyId?: StringType;
        SignatureVersion?: StringType;
        Subscription?: SNSTopicSubscription[];
        Tags?: Tag[];
        TopicName?: StringType;
        TracingConfig?: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an AWS SNS Topic Policy resource.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-sns-topicpolicy.html
 */
export interface SNSTopicPolicyResource extends CommonResource {
    Type: 'AWS::SNS::TopicPolicy';
    Properties: {
        PolicyDocument: PolicyDocument | StringKeyObject;
        Topics: StringType[];
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an AWS SNS Subscription resource.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-sns-subscription.html
 */
export interface SNSSubscriptionResource extends CommonResource {
    Type: 'AWS::SNS::Subscription';
    Properties: {
        DeliveryPolicy?: StringKeyObject;
        Endpoint?: StringType;
        FilterPolicy?: StringKeyObject;
        FilterPolicyScope?: StringType;
        Protocol: StringType;
        RawMessageDelivery?: boolean;
        RedrivePolicy?: StringKeyObject;
        Region?: StringType;
        ReplayPolicy?: StringKeyObject;
        SubscriptionRoleArn?: StringType;
        TopicArn: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents the matcher configuration for an ELBv2 Target Group.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-targetgroup-targetdescription.html
 */
export interface TargetGroupMatcher {
    GrpcCode?: StringType;
    HttpCode?: StringType;
}

/**
 * Represents a key/value attribute for an ELBv2 Target Group.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-elasticloadbalancingv2-targetgroup.html
 */
export interface TargetGroupAttribute {
    Key?: StringType;
    Value?: StringType;
}

/**
 * Represents a target (for dynamic registration) inside an ELBv2 Target Group.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-targetgroup-targetdescription.html
 */
export interface TargetDescription {
    AvailabilityZone?: StringType;
    Id: StringType;
    Port?: number;
}

/**
 * Represents an AWS Elastic Load Balancing V2 Target Group resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-elasticloadbalancingv2-targetgroup.html
 */
export interface ElasticLoadBalancingV2TargetGroupResource extends CommonResource {
    Type: 'AWS::ElasticLoadBalancingV2::TargetGroup';
    Properties: {
        HealthCheckEnabled?: boolean;
        HealthCheckIntervalSeconds?: number | StringType;
        HealthCheckPath?: StringType;
        HealthCheckPort?: StringType;
        HealthCheckProtocol?: StringType;
        HealthCheckTimeoutSeconds?: number | StringType;
        HealthyThresholdCount?: number | StringType;
        IpAddressType?: StringType;
        Matcher?: TargetGroupMatcher;
        Name?: StringType;
        Port?: number | StringType;
        Protocol?: StringType;
        ProtocolVersion?: StringType;
        Tags?: Tag[];
        TargetGroupAttributes?: TargetGroupAttribute[];
        Targets?: TargetDescription[];
        TargetType?: StringType;
        UnhealthyThresholdCount?: number | StringType;
        VpcId?: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an AWS Lambda Permission resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-permission.html
 */
export interface LambdaPermissionResource extends CommonResource {
    Type: 'AWS::Lambda::Permission';
    Properties: {
        Action: StringType;
        EventSourceToken?: StringType;
        FunctionName: StringType;
        FunctionUrlAuthType?: StringType;
        Principal: StringType;
        PrincipalOrgID?: StringType;
        SourceAccount?: StringType;
        SourceArn?: StringType;
        [propertyName: string]: unknown;
    };

    [key: string]: unknown;
}

/**
 * Represents an AWS CloudWatch Log Group resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-logs-loggroup.html
 */
export interface LogsLogGroupResource extends CommonResource {
    Type: 'AWS::Logs::LogGroup';
    Properties: {
        DataProtectionPolicy?: StringKeyObject;
        FieldIndexPolicies?: StringKeyObject[];
        KmsKeyId?: StringType;
        LogGroupClass?: StringType;
        LogGroupName?: StringType;
        RetentionInDays?: number;
        Tags?: Tag[];
        [propertyName: string]: unknown;
    };
    UpdateReplacePolicy?: string;
    DeletionPolicy?: string;

    [key: string]: unknown;
}

/**
 * Represents the S3 location for the REST API body definition.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-restapi.html
 */
export interface ApiGatewayRestApiResourceBodyS3Location {
    Bucket?: StringType;
    ETag?: StringType;
    Key?: StringType;
    Version?: StringType;
}

/**
 * Represents the endpoint configuration for an API Gateway REST API.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-restapi.html
 */
export interface ApiGatewayRestApiResourceEndpointConfiguration {
    Types?: StringType[];
    VpcEndpointIds?: StringType[];
}

/**
 * Defines an API Gateway REST API resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-restapi.html
 */
export interface ApiGatewayRestApiResource extends CommonResource {
    Type: 'AWS::ApiGateway::RestApi';
    Properties: {
        ApiKeySourceType?: StringType;
        BinaryMediaTypes?: StringType[];
        Body?: StringKeyObject;
        BodyS3Location?: ApiGatewayRestApiResourceBodyS3Location;
        CloneFrom?: StringType;
        Description?: StringType;
        DisableExecuteApiEndpoint?: boolean;
        EndpointConfiguration?: ApiGatewayRestApiResourceEndpointConfiguration;
        FailOnWarnings?: boolean;
        MinimumCompressionSize?: number;
        Mode?: StringType;
        Name?: StringType;
        Parameters?: StringKeyObject;
        Policy?: StringKeyObject;
        Tags?: Tag[];
        [propertyName: string]: unknown;
    };
}

/**
 * Defines the deployment canary settings for an API Gateway deployment.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-deployment.html
 */
export interface ApiGatewayDeploymentResourceDeploymentCanarySettings {
    PercentTraffic?: number;
    StageVariableOverrides?: StringKeyObject;
    UseStageCache?: boolean;
}

/**
 * Describes the access log settings in an API Gateway deployment stage.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigateway-stage-accesslogsetting.html
 */
export interface ApiGatewayDeploymentResourceStageDescriptionAccessLogSetting {
    DestinationArn?: StringType;
    Format?: StringType;
}

/**
 * Describes the canary settings for an API Gateway deployment stage.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigateway-stage-canarysetting.html
 */
export interface ApiGatewayDeploymentResourceStageDescriptionCanarySetting {
    PercentTraffic?: number;
    StageVariableOverrides?: ObjectOfStringTypes;
    UseStageCache?: boolean;
}

/**
 * Defines the method settings for an API Gateway deployment stage.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-deployment.html
 */
export interface ApiGatewayDeploymentResourceStageDescriptionMethodSettings {
    CacheDataEncrypted?: boolean;
    CacheTtlInSeconds?: number;
    CachingEnabled?: boolean;
    DataTraceEnabled?: boolean;
    HttpMethod?: StringType;
    LoggingLevel?: StringType;
    MetricsEnabled?: boolean;
    ResourcePath?: StringType;
    ThrottlingBurstLimit?: number;
    ThrottlingRateLimit?: number;
}

/**
 * Defines the stage description for an API Gateway deployment.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-deployment.html
 */
export interface ApiGatewayDeploymentResourceStageDescription {
    AccessLogSetting?: ApiGatewayDeploymentResourceStageDescriptionAccessLogSetting;
    CacheClusterEnabled?: boolean;
    CacheClusterSize?: StringType;
    CacheDataEncrypted?: boolean;
    CacheTtlInSeconds?: number;
    CachingEnabled?: boolean;
    CanarySetting?: ApiGatewayDeploymentResourceStageDescriptionCanarySetting;
    ClientCertificateId?: StringType;
    DataTraceEnabled?: boolean;
    Description?: StringType;
    DocumentationVersion?: StringType;
    LoggingLevel?: StringType;
    MethodSettings?: ApiGatewayDeploymentResourceStageDescriptionMethodSettings[];
    MetricsEnabled?: boolean;
    Tags?: Tag[];
    ThrottlingBurstLimit?: number;
    ThrottlingRateLimit?: number;
    TracingEnabled?: boolean;
    Variables?: ObjectOfStringTypes;
}

/**
 * Defines an API Gateway deployment resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-deployment.html
 */
export interface ApiGatewayDeploymentResource extends CommonResource {
    Type: 'AWS::ApiGateway::Deployment';
    Properties: {
        DeploymentCanarySettings?: ApiGatewayDeploymentResourceDeploymentCanarySettings;
        Description?: StringType;
        RestApiId: StringType;
        StageDescription?: ApiGatewayDeploymentResourceStageDescription;
        StageName?: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Defines an API Gateway V2 deployment resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-deployment.html
 */
export interface ApiGatewayV2DeploymentResource extends CommonResource {
    Type: 'AWS::ApiGatewayV2::Deployment';
    Properties: {
        ApiId: StringType;
        Description?: StringType;
        StageName?: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Defines the access log settings for an API Gateway stage.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigateway-stage-accesslogsetting.html
 */
export interface ApiGatewayStageResourceAccessLogSetting {
    DestinationArn?: StringType;
    Format?: StringType;
}

/**
 * Defines the canary settings for an API Gateway stage.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigateway-stage-canarysetting.html
 */
export interface ApiGatewayStageResourceCanarySetting {
    DeploymentId?: StringType;
    PercentTraffic?: number;
    StageVariableOverrides?: ObjectOfStringTypes;
    UseStageCache?: boolean;
}

/**
 * Defines an API Gateway stage resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-stage.html
 */
export interface ApiGatewayStageResource extends CommonResource {
    Type: 'AWS::ApiGateway::Stage';
    Properties: {
        AccessLogSetting: ApiGatewayStageResourceAccessLogSetting;
        CacheClusterEnabled?: boolean;
        CacheClusterSize?: StringType;
        CanarySetting?: ApiGatewayStageResourceCanarySetting;
        ClientCertificateId?: StringType;
        DeploymentId?: StringType;
        Description?: StringType;
        DocumentationVersion?: StringType;
        MethodSettings?: ApiGatewayDeploymentResourceStageDescriptionMethodSettings[];
        RestApiId: StringType;
        StageName?: StringType;
        Tags?: Tag[];
        TracingEnabled?: boolean;
        Variables?: ObjectOfStringTypes;
        [propertyName: string]: unknown;
    };
}

/**
 * Defines the access log settings for an API Gateway V2 stage.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigatewayv2-stage-accesslogsettings.html
 */
export interface ApiGatewayV2StageResourceAccessLogSettings {
    DestinationArn?: StringType;
    Format?: StringType;
}

/**
 * Defines the default route settings for an API Gateway V2 stage.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigatewayv2-stage-routesettings.html
 */
export interface ApiGatewayV2StageResourceDefaultRouteSettings {
    DataTraceEnabled?: boolean;
    DetailedMetricsEnabled?: boolean;
    LoggingLevel?: StringType;
    ThrottlingBurstLimit?: number;
    ThrottlingRateLimit?: number;
}

/**
 * Defines an API Gateway V2 stage resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-stage.html#cfn-apigatewayv2-stage-accesslogsettings
 */
export interface ApiGatewayV2StageResource extends CommonResource {
    Type: 'AWS::ApiGatewayV2::Stage';
    Properties: {
        AccessLogSettings?: ApiGatewayV2StageResourceAccessLogSettings;
        AccessPolicyId?: StringType;
        ApiId: StringType;
        AutoDeploy?: boolean;
        ClientCertificateId?: StringType;
        DefaultRouteSettings?: ApiGatewayV2StageResourceDefaultRouteSettings;
        DeploymentId?: StringType;
        Description?: StringType;
        RouteSettings?: ObjectOfStringTypes;
        StageName: StringType;
        StageVariables?: ObjectOfStringTypes;
        Tags?: Tag[];
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an API Gateway Resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-resource.html
 */
export interface ApiGatewayResourceResource extends CommonResource {
    Type: 'AWS::ApiGateway::Resource';
    Properties: {
        ParentId: StringType;
        PathPart: StringType;
        RestApiId: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an API Gateway Method integration response configuration.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigateway-method-integrationresponse.html
 */
export interface ApiGatewayMethodResourceIntegrationIntegrationResponses {
    ContentHandling?: StringType;
    ResponseParameters?: ObjectOfStringTypes;
    ResponseTemplates?: ObjectOfStringTypes;
    SelectionPattern?: StringType;
    StatusCode: StringType;
}

/**
 * Represents the integration configuration for an API Gateway Method.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigateway-method-integration.html
 */
export interface ApiGatewayMethodResourceIntegration {
    CacheKeyParameters?: StringType[];
    CacheNamespace?: StringType;
    ConnectionId?: StringType;
    ConnectionType?: StringType;
    ContentHandling?: StringType;
    Credentials?: StringType;
    IntegrationHttpMethod?: StringType;
    IntegrationResponses?: ApiGatewayMethodResourceIntegrationIntegrationResponses[];
    PassthroughBehavior?: StringType;
    RequestParameters?: ObjectOfStringTypes;
    RequestTemplates?: ObjectOfStringTypes;
    TimeoutInMillis?: number;
    Type: StringType;
    Uri?: StringType;
}

/**
 * Represents a method response configuration for an API Gateway Method.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigateway-method-methodresponse.html
 */
export interface ApiGatewayMethodResourceMethodResponses {
    ResponseModels?: ObjectOfStringTypes;
    ResponseParameters?: ObjectOfStringTypes;
    StatusCode: StringType;
}

/**
 * Represents an API Gateway Method resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-method.html
 */
export interface ApiGatewayMethodResource extends CommonResource {
    Type: 'AWS::ApiGateway::Method';
    Properties: {
        ApiKeyRequired?: boolean;
        AuthorizationScopes?: StringType[];
        AuthorizationType?: StringType;
        AuthorizerId?: StringType;
        HttpMethod: StringType;
        Integration?: ApiGatewayMethodResourceIntegration;
        MethodResponses?: ApiGatewayMethodResourceMethodResponses[];
        OperationName?: StringType;
        RequestModels?: ObjectOfStringTypes;
        RequestParameters?: ObjectOfStringTypes;
        RequestValidatorId?: StringType;
        ResourceId: StringType;
        RestApiId: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an API Gateway Authorizer resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-authorizer.html
 */
export interface ApiGatewayAuthorizerResource extends CommonResource {
    Type: 'AWS::ApiGateway::Authorizer';
    Properties: {
        AuthorizerCredentials?: StringType;
        AuthorizerResultTtlInSeconds?: number;
        AuthorizerUri?: StringType;
        AuthType?: StringType;
        IdentitySource?: StringType;
        IdentityValidationExpression?: StringType;
        Name: StringType;
        ProviderARNs?: StringType[];
        RestApiId: StringType;
        Type: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents the JWT configuration for an API Gateway V2 Authorizer.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigatewayv2-authorizer-jwtconfiguration.html
 */
export interface ApiGatewayV2AuthorizerResourceJwtConfiguration {
    Audience?: StringType[];
    Issuer?: StringType;
}

/**
 * Represents an API Gateway V2 Authorizer resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-authorizer.html
 */
export interface ApiGatewayV2AuthorizerResource extends CommonResource {
    Type: 'AWS::ApiGatewayV2::Authorizer';
    Properties: {
        ApiId: StringType;
        AuthorizerCredentialsArn?: StringType;
        AuthorizerPayloadFormatVersion?: StringType;
        AuthorizerResultTtlInSeconds?: number;
        AuthorizerType: StringType;
        AuthorizerUri?: StringType;
        EnableSimpleResponses?: boolean;
        IdentitySource?: StringType[];
        IdentityValidationExpression?: StringType;
        JwtConfiguration?: ApiGatewayV2AuthorizerResourceJwtConfiguration;
        Name: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an API Gateway Request Validator resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-requestvalidator.html
 */
export interface ApiGatewayRequestValidatorResource extends CommonResource {
    Type: 'AWS::ApiGateway::RequestValidator';
    Properties: {
        Name?: StringType;
        RestApiId: StringType;
        ValidateRequestBody?: boolean;
        ValidateRequestParameters?: boolean;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an API Gateway Model resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-model.html
 */
export interface ApiGatewayModelResource extends CommonResource {
    Type: 'AWS::ApiGateway::Model';
    Properties: {
        ContentType?: StringType;
        Description?: StringType;
        Name?: StringType;
        RestApiId: StringType;
        Schema?: StringKeyObject;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an API Gateway V2 Model resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-model.html
 */
export interface ApiGatewayV2ModelResource extends CommonResource {
    Type: 'AWS::ApiGatewayV2::Model';
    Properties: {
        ApiId: StringType;
        ContentType?: StringType;
        Description?: StringType;
        Name: StringType;
        Schema: StringKeyObject;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents the DeadLetter configuration for an EventBus resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-eventbus-deadletterconfig.html
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-deadletterconfig.html
 */
export interface EventBusResourceDeadLetterConfig {
    Arn?: StringType;
}

/**
 * Represents the AWS CloudFormation resource for an EventBus.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-events-eventbus.html
 */
export interface EventsEventBusResource extends CommonResource {
    Type: 'AWS::Events::EventBus';
    Properties: {
        DeadLetterConfig?: EventBusResourceDeadLetterConfig;
        Description?: StringType;
        EventSourceName?: StringType;
        KmsKeyIdentifier?: StringType;
        Name: StringType;
        Policy?: PolicyDocument | StringKeyObject;
        Tags?: Tag[];
        [propertyName: string]: unknown;
    };
}

/**
 * Represents AppSync parameters for an Events Rule target.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-appsyncparameters.html
 */
export interface EventsRuleResourceTargetAppSyncParameters {
    GraphQLOperation: StringType;
}

/**
 * Represents the batch array properties for configuring BatchParameters in an Events Rule target.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-batcharrayproperties.html
 */
export interface EventsRuleResourceTargetBatchParametersArrayProperties {
    Size?: number;
}

/**
 * Represents the retry strategy for BatchParameters in an Events Rule target.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-batchretrystrategy.html
 */
export interface EventsRuleResourceTargetBatchParametersRetryStrategy {
    Attempts?: number;
}

/**
 * Represents the BatchParameters for targeting AWS Batch jobs in an Events Rule.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-batchparameters.html
 */
export interface EventsRuleResourceTargetBatchParameters {
    ArrayProperties?: EventsRuleResourceTargetBatchParametersArrayProperties;
    JobDefinition: StringType;
    JobName: StringType;
    RetryStrategy?: EventsRuleResourceTargetBatchParametersRetryStrategy;
}

/**
 * Represents a capacity provider strategy item for ECS Parameters in an Events Rule target.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-capacityproviderstrategyitem.html
 */
export interface EventsRuleResourceTargetEcsParametersCapacityProviderStrategy {
    Base?: number;
    CapacityProvider: StringType;
    Weight?: number;
}

/**
 * Represents the AWS VPC configuration for ECS Parameters in an Events Rule target.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-awsvpcconfiguration.html
 */
export interface EventsRuleResourceTargetEcsParametersNetworkConfigurationAwsVpcConfiguration {
    AssignPublicIp?: StringType;
    SecurityGroups?: StringType[];
    Subnets: StringType[];
}

/**
 * Represents the network configuration for ECS Parameters in an Events Rule target.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-networkconfiguration.html
 */
export interface EventsRuleResourceTargetEcsParametersNetworkConfiguration {
    AwsVpcConfiguration: EventsRuleResourceTargetEcsParametersNetworkConfigurationAwsVpcConfiguration;
}

/**
 * Represents placement constraints for ECS Parameters in an Events Rule target.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-placementconstraint.html
 */
export interface EventsRuleResourceTargetEcsParametersPlacementConstraints {
    Expression?: StringType;
    Type?: StringType;
}

/**
 * Represents placement strategies for ECS Parameters in an Events Rule target.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-placementstrategy.html
 */
export interface EventsRuleResourceTargetEcsParametersPlacementStrategies {
    Field?: StringType;
    Type?: StringType;
}

/**
 * Represents ECS Parameters for targeting an Amazon ECS task in an Events Rule.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-ecsparameters.html
 */
export interface EventsRuleResourceTargetEcsParameters {
    CapacityProviderStrategy?: EventsRuleResourceTargetEcsParametersCapacityProviderStrategy[];
    EnableECSManagedTags?: boolean;
    EnableExecuteCommand?: boolean;
    Group?: StringType;
    LaunchType?: StringType;
    NetworkConfiguration?: EventsRuleResourceTargetEcsParametersNetworkConfiguration;
    PlacementConstraints?: EventsRuleResourceTargetEcsParametersPlacementConstraints[];
    PlacementStrategies?: EventsRuleResourceTargetEcsParametersPlacementStrategies[];
    PlatformVersion?: StringType;
    PropagateTags?: StringType;
    ReferenceId?: StringType;
    TagList?: Tag[];
    TaskCount?: number;
    TaskDefinitionArn: StringType;
}

/**
 * Represents HTTP parameters for targeting an HTTP endpoint in an Events Rule.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-httpparameters.html
 */
export interface EventsRuleResourceTargetHttpParameters {
    HeaderParameters?: ObjectOfStringTypes;
    PathParameterValues?: StringType[];
    QueryStringParameters?: ObjectOfStringTypes;
}

/**
 * Represents the input transformer for an Events Rule target.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-inputtransformer.html
 */
export interface EventsRuleResourceTargetInputTransformer {
    InputPathsMap?: ObjectOfStringTypes;
    InputTemplate: StringType;
}

/**
 * Represents Kinesis parameters for targeting a Kinesis stream in an Events Rule.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-kinesisparameters.html
 */
export interface EventsRuleResourceTargetKinesisParameters {
    PartitionKeyPath: StringType;
}

/**
 * Represents the Redshift data parameters for targeting Amazon Redshift Data Shares in an Events Rule.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-redshiftdataparameters.html
 */
export interface EventsRuleResourceTargetRedshiftDataParameters {
    Database: StringType;
    DbUser?: StringType;
    SecretManagerArn?: StringType;
    Sql?: StringType;
    Sqls?: StringType[];
    StatementName?: StringType;
    WithEvent?: boolean;
}

/**
 * Represents the retry policy for an Events Rule target.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-retrypolicy.html
 */
export interface EventsRuleResourceTargetRetryPolicy {
    MaximumEventAgeInSeconds?: number;
    MaximumRetryAttempts?: number;
}

/**
 * Represents a single target for RunCommand parameters in an Events Rule target.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-runcommandtarget.html
 */
export interface EventsRuleResourceTargetRunCommandParametersTarget {
    Key: StringType;
    Values: StringType[];
}

/**
 * Represents the RunCommand parameters for targeting a Systems Manager Run Command in an Events Rule.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-runcommandparameters.html
 */
export interface EventsRuleResourceTargetRunCommandParameters {
    RunCommandTargets: EventsRuleResourceTargetRunCommandParametersTarget[];
}

/**
 * Represents a parameter item for SageMaker Pipeline parameters in an Events Rule target.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-sagemakerpipelineparameter.html
 */
export interface EventsRuleResourceTargetSageMakerPipelineParametersListItem {
    Name: StringType;
    Value: StringType;
}

/**
 * Represents SageMaker Pipeline parameters for targeting an AWS SageMaker Pipeline in an Events Rule.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-sagemakerpipelineparameters.html
 */
export interface EventsRuleResourceTargetSageMakerPipelineParameters {
    PipelineParameterList?: EventsRuleResourceTargetSageMakerPipelineParametersListItem[];
}

/**
 * Represents SQS parameters for targeting an Amazon SQS queue in an Events Rule.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-sqsparameters.html
 */
export interface EventsRuleResourceTargetSqsParameters {
    MessageGroupId: StringType;
}

/**
 * Represents a target for an AWS::Events::Rule CloudFormation resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-rule-target.html
 */
export interface EventsRuleResourceTarget {
    AppSyncParameters?: EventsRuleResourceTargetAppSyncParameters;
    Arn: StringType;
    BatchParameters?: EventsRuleResourceTargetBatchParameters;
    DeadLetterConfig?: EventBusResourceDeadLetterConfig;
    EcsParameters?: EventsRuleResourceTargetEcsParameters;
    HttpParameters?: EventsRuleResourceTargetHttpParameters;
    Id: StringType;
    Input?: StringType;
    InputPath?: StringType;
    InputTransformer?: EventsRuleResourceTargetInputTransformer;
    KinesisParameters?: EventsRuleResourceTargetKinesisParameters;
    RedshiftDataParameters?: EventsRuleResourceTargetRedshiftDataParameters;
    RetryPolicy?: EventsRuleResourceTargetRetryPolicy;
    RoleArn?: StringType;
    RunCommandParameters?: EventsRuleResourceTargetRunCommandParameters;
    SageMakerPipelineParameters?: EventsRuleResourceTargetSageMakerPipelineParameters;
    SqsParameters?: EventsRuleResourceTargetSqsParameters;
}

/**
 * Represents the AWS CloudFormation resource for an Events Rule.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-events-rule.html
 */
export interface EventsRuleResource extends CommonResource {
    Type: 'AWS::Events::Rule';
    Properties: {
        Description?: StringType;
        EventBusName?: StringType;
        EventPattern?: StringKeyObject;
        Name?: StringType;
        RoleArn?: StringType;
        ScheduleExpression?: StringType; // e.g., cron(0 20 * * ? *)
        State?: StringType; // DISABLED | ENABLED | ENABLED_WITH_ALL_CLOUDTRAIL_MANAGEMENT_EVENTS
        Targets?: EventsRuleResourceTarget[];
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an AWS CloudFormation Archive resource.
 *
 * This interface models the CloudFormation resource type for an Archive as defined by AWS EventBridge.
 *
 * @see [AWS::Events::Archive](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-events-archive.html)
 */
export interface EventsArchiveResource extends CommonResource {
    Type: 'AWS::Events::Archive';
    Properties: {
        ArchiveName?: StringType;
        Description?: StringType;
        EventPattern?: StringKeyObject;
        RetentionDays?: number;
        SourceArn: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Models a condition object for an EventBus Policy resource.
 *
 * This interface is used as part of the policy conditions in AWS EventBridge EventBus policies.
 *
 * @see [EventBus Policy Condition](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-eventbuspolicy-condition.html)
 */
export interface EventBusPolicyResourceCondition {
    Key?: StringType;
    Type?: StringType;
    Value?: StringType;
}

/**
 * Represents an AWS CloudFormation EventBus Policy resource.
 *
 * This interface models the properties for an EventBus Policy, along with its associated condition and statement.
 *
 * @see [AWS::Events::EventBusPolicy](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-events-eventbuspolicy.html)
 */
export interface EventsEventBusPolicyResource extends CommonResource {
    Type: 'AWS::Events::EventBusPolicy';
    Properties: {
        Action?: StringType;
        Condition?: EventBusPolicyResourceCondition;
        EventBusName?: StringType;
        Principal?: StringType;
        Statement?: PolicyDocument;
        StatementId: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents API key authentication parameters for an EventBridge Connection.
 *
 * @see [API Key Auth Parameters](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-connection-apikeyauthparameters.html)
 */
export interface ApiKeyAuthParameters {
    ApiKeyName: StringType;
    ApiKeyValue: StringType;
}

/**
 * Represents basic authentication parameters for an EventBridge Connection.
 *
 * @see [Basic Auth Parameters](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-connection-basicauthparameters.html)
 */
export interface BasicAuthParameters {
    Password: StringType;
    Username: StringType;
}

/**
 * Represents resource parameters for connectivity in an EventBridge Connection.
 *
 * @see [Resource Parameters](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-connection-resourceparameters.html)
 */
export interface ConnectivityParametersResourceParameters {
    ResourceAssociationArn?: StringType;
    ResourceConfigurationArn: StringType;
}

/**
 * Defines connectivity parameters for an EventBridge Connection.
 *
 * @see [Connectivity Parameters](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-connection-connectivityparameters.html)
 */
export interface ConnectivityParameters {
    ResourceParameters: ConnectivityParametersResourceParameters;
}

/**
 * Represents a key-value pair for HTTP parameters in an EventBridge Connection.
 *
 * @see [HTTP Parameter](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-connection-parameter.html)
 */
export interface ConnectionHttpParametersParameter {
    IsValueSecret?: boolean;
    Key: StringType;
    Value: StringType;
}

/**
 * Defines HTTP parameters for an EventBridge Connection.
 *
 * @see [Connection HTTP Parameters](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-connection-connectionhttpparameters.html)
 */
export interface ConnectionHttpParameters {
    BodyParameters?: ConnectionHttpParametersParameter[];
    HeaderParameters?: ConnectionHttpParametersParameter[];
    QueryStringParameters?: ConnectionHttpParametersParameter[];
}

/**
 * Represents client parameters for OAuth authentication in an EventBridge Connection.
 *
 * @see [OAuth Client Parameters](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-connection-clientparameters.html)
 */
export interface OAuthParametersClientParameters {
    ClientID?: StringType;
    ClientSecret?: StringType;
}

/**
 * Defines OAuth authentication parameters for an EventBridge Connection.
 *
 * @see [OAuth Parameters](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-connection-oauthparameters.html)
 */
export interface OAuthParameters {
    AuthorizationEndpoint: StringType;
    ClientParameters: OAuthParametersClientParameters;
    HttpMethod: StringType;
    OAuthHttpParameters?: ConnectionHttpParameters;
}

/**
 * Represents the authentication parameters for an EventBridge Connection resource.
 *
 * This interface aggregates various authentication schemes (API Key, Basic, OAuth, etc.) as defined in AWS.
 *
 * @see [Connection Auth Parameters](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-connection-authparameters.html)
 */
export interface EventsConnectionResourceAuthParameters {
    ApiKeyAuthParameters?: ApiKeyAuthParameters;
    BasicAuthParameters?: BasicAuthParameters;
    ConnectivityParameters?: ConnectivityParameters;
    InvocationHttpParameters?: ConnectionHttpParameters;
    OAuthParameters?: OAuthParameters;
}

/**
 * Represents invocation connectivity parameter values for an EventBridge Connection.
 *
 * @see [Resource Parameters](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-connection-resourceparameters.html)
 */
export interface EventsConnectionResourceInvocationConnectivityParametersParameter {
    ResourceAssociationArn?: StringType;
    ResourceConfigurationArn: StringType;
}

/**
 * Defines invocation connectivity parameters for an EventBridge Connection resource.
 *
 * @see [Invocation Connectivity Parameters](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-connection-invocationconnectivityparameters.html)
 */
export interface EventsConnectionResourceInvocationConnectivityParameters {
    ResourceParameters: EventsConnectionResourceInvocationConnectivityParametersParameter;
}

/**
 * Represents an AWS CloudFormation EventBridge Connection resource.
 *
 * This interface models a Connection resource for EventBridge, including authentication and connectivity configurations.
 *
 * @see [AWS::Events::Connection](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-events-connection.html)
 */
export interface EventsConnectionResource extends CommonResource {
    Type: 'AWS::Events::Connection';
    Properties: {
        AuthorizationType?: StringType; // Expected values: API_KEY, BASIC, OAUTH_CLIENT_CREDENTIALS
        AuthParameters?: EventsConnectionResourceAuthParameters;
        Description?: StringType;
        InvocationConnectivityParameters?: EventsConnectionResourceInvocationConnectivityParameters;
        Name?: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an AWS CloudFormation EventBridge API Destination resource.
 *
 * This interface models an API Destination used to invoke HTTP endpoints from EventBridge.
 *
 * @see [AWS::Events::ApiDestination](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-events-apidestination.html)
 */
export interface EventsApiDestinationResource extends CommonResource {
    Type: 'AWS::Events::ApiDestination';
    Properties: {
        ConnectionArn: StringType;
        Description?: StringType;
        HttpMethod: StringType;
        InvocationEndpoint: StringType;
        InvocationRateLimitPerSecond?: number;
        Name?: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an attribute definition for a DynamoDB table.
 *
 * @see [AWS::DynamoDB::Table - AttributeDefinition](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-attributedefinition.html)
 */
export interface AttributeDefinition {
    AttributeName: StringType;
    AttributeType: StringType; // S | N | B
}

/**
 * Models the contributor insights specification for a DynamoDB table.
 *
 * @see [AWS::DynamoDB::Table - ContributorInsightsSpecification](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-contributorinsightsspecification.html)
 */
export interface ContributorInsightsSpecification {
    Enabled: boolean | string; // ENABLE | DISABLE
}

/**
 * Represents the projection configuration for a DynamoDB table index.
 *
 * @see [AWS::DynamoDB::Table - Projection](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-projection.html)
 */
export interface Projection {
    NonKeyAttributes?: StringType[];
    ProjectionType?: StringType;
}

/**
 * Models the global secondary index configuration for a DynamoDB table.
 *
 * @see [AWS::DynamoDB::Table - GlobalSecondaryIndex](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-globalsecondaryindex.html)
 */
export interface GlobalSecondaryIndex {
    ContributorInsightsSpecification?: ContributorInsightsSpecification;
    IndexName: StringType;
    KeySchema: KeySchema[];
    OnDemandThroughput?: OnDemandThroughput;
    Projection: Projection;
    ProvisionedThroughput?: ProvisionedThroughput;
    WarmThroughput?: WarmThroughput;
}

/**
 * Represents CSV configuration options for table import.
 *
 * @see [AWS::DynamoDB::Table - Csv](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-csv.html)
 */
export interface Csv {
    Delimiter?: StringType;
    HeaderList?: StringType[];
}

/**
 * Provides input format options when importing data into a DynamoDB table.
 *
 * @see [AWS::DynamoDB::Table - InputFormatOptions](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-inputformatoptions.html)
 */
export interface InputFormatOptions {
    Csv?: Csv;
}

/**
 * Specifies the source S3 bucket details for a table import.
 *
 * @see [AWS::DynamoDB::Table - S3BucketSource](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-s3bucketsource.html)
 */
export interface S3BucketSource {
    S3Bucket: StringType;
    S3BucketOwner?: StringType;
    S3KeyPrefix?: StringType;
}

/**
 * Models the import source specification when importing data into a DynamoDB table.
 *
 * @see [AWS::DynamoDB::Table - ImportSourceSpecification](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-importsourcespecification.html)
 */
export interface ImportSourceSpecification {
    InputCompressionType?: StringType;
    InputFormat: StringType;
    InputFormatOptions?: InputFormatOptions;
    S3BucketSource: S3BucketSource;
}

/**
 * Represents the key schema for a DynamoDB table or index.
 *
 * @see [AWS::DynamoDB::Table - KeySchema](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-keyschema.html)
 */
export interface KeySchema {
    AttributeName: StringType;
    KeyType: StringType; // HASH | RANGE
}

/**
 * Models the Kinesis stream specification for a DynamoDB table.
 *
 * @see [AWS::DynamoDB::Table - KinesisStreamSpecification](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-kinesisstreamspecification.html)
 */
export interface KinesisStreamSpecification {
    ApproximateCreationDateTimePrecision?: StringType; // MICROSECOND | MILLISECOND
    StreamArn: StringType;
}

/**
 * Represents a local secondary index for a DynamoDB table.
 *
 * @see [AWS::DynamoDB::Table - LocalSecondaryIndex](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-localsecondaryindex.html)
 */
export interface LocalSecondaryIndex {
    IndexName: StringType;
    KeySchema: KeySchema[];
    Projection: Projection;
}

/**
 * Models the on-demand throughput settings for a DynamoDB table.
 *
 * @see [AWS::DynamoDB::Table - OnDemandThroughput](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-ondemandthroughput.html)
 */
export interface OnDemandThroughput {
    MaxReadRequestUnits?: number;
    MaxWriteRequestUnits?: number;
}

/**
 * Represents the point-in-time recovery configuration for a DynamoDB table.
 *
 * @see [AWS::DynamoDB::Table - PointInTimeRecoverySpecification](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-pointintimerecoveryspecification.html)
 */
export interface PointInTimeRecoverySpecification {
    PointInTimeRecoveryEnabled?: boolean;
    RecoveryPeriodInDays?: number;
}

/**
 * Models the provisioned throughput capacity for a DynamoDB table.
 *
 * @see [AWS::DynamoDB::Table - ProvisionedThroughput](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html)
 */
export interface ProvisionedThroughput {
    ReadCapacityUnits: number;
    WriteCapacityUnits: number;
}

/**
 * Represents a resource policy for a DynamoDB table.
 *
 * @see [AWS::DynamoDB::Table - ResourcePolicy](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-resourcepolicy.html)
 */
export interface ResourcePolicy {
    PolicyDocument: PolicyDocument;
}

/**
 * Models the server-side encryption (SSE) configuration for a DynamoDB table.
 *
 * @see [AWS::DynamoDB::Table - SSESpecification](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-ssespecification.html)
 */
export interface SSESpecification {
    KMSMasterKeyId?: StringType;
    SSEEnabled: boolean;
    SSEType?: StringType;
}

/**
 * Represents the stream specification for a DynamoDB table.
 *
 * @see [AWS::DynamoDB::Table - StreamSpecification](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-streamspecification.html)
 */
export interface StreamSpecification {
    ResourcePolicy?: ResourcePolicy;
    StreamViewType: StringType; // NEW_IMAGE | OLD_IMAGE | NEW_AND_OLD_IMAGES | KEYS_ONLY
}

/**
 * Models the time-to-live (TTL) configuration for a DynamoDB table.
 *
 * @see [AWS::DynamoDB::Table - TimeToLiveSpecification](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-timetolivespecification.html)
 */
export interface TimeToLiveSpecification {
    AttributeName?: StringType;
    Enabled: boolean;
}

/**
 * Represents the warm throughput configuration for a DynamoDB table.
 *
 * @see [AWS::DynamoDB::Table - WarmThroughput](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-warmthroughput.html)
 */
export interface WarmThroughput {
    ReadUnitsPerSecond?: number;
    WriteUnitsPerSecond?: number;
}

/**
 * Models an AWS CloudFormation DynamoDB Table resource.
 *
 * This interface represents the complete specification for a DynamoDB table in CloudFormation.
 *
 * @see [AWS::DynamoDB::Table](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html)
 */
export interface DynamoDBTableResource extends CommonResource {
    Type: 'AWS::DynamoDB::Table';
    Properties: {
        AttributeDefinitions?: AttributeDefinition[];
        BillingMode?: StringType; // PROVISIONED | PAY_PER_REQUEST
        ContributorInsightsSpecification?: ContributorInsightsSpecification;
        DeletionProtectionEnabled?: boolean;
        GlobalSecondaryIndexes?: GlobalSecondaryIndex[];
        ImportSourceSpecification?: ImportSourceSpecification;
        KeySchema: KeySchema[];
        KinesisStreamSpecification?: KinesisStreamSpecification;
        LocalSecondaryIndexes?: LocalSecondaryIndex[];
        OnDemandThroughput?: OnDemandThroughput;
        PointInTimeRecoverySpecification?: PointInTimeRecoverySpecification;
        ProvisionedThroughput?: ProvisionedThroughput;
        ResourcePolicy?: ResourcePolicy;
        SSESpecification?: SSESpecification;
        StreamSpecification?: StreamSpecification;
        TableClass?: StringType; // STANDARD | STANDARD_INFREQUENT_ACCESS
        TableName?: StringType;
        Tags?: Tag[];
        TimeToLiveSpecification?: TimeToLiveSpecification;
        WarmThroughput?: WarmThroughput;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents a container dependency configuration in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-containerdependency.html
 */
export interface ContainerDependency {
    Condition?: StringType; // START | COMPLETE | SUCCESS | HEALTHY
    ContainerName?: StringType;
}

/**
 * Represents a key-value pair used in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-keyvaluepair.html
 */
export interface KeyValuePair {
    Name?: StringType;
    Value?: StringType;
}

/**
 * Represents an environment file configuration for an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-environmentfile.html
 */
export interface EnvironmentFile {
    Type?: StringType;
    Value?: StringType;
}

/**
 * Represents a host entry mapping for an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-hostentry.html
 */
export interface HostEntry {
    Hostname?: StringType;
    IpAddress?: StringType;
}

/**
 * Represents the Firelens configuration for an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-firelensconfiguration.html
 */
export interface FirelensConfiguration {
    Options?: ObjectOfStringTypes;
    Type?: StringType; // fluentd | fluentbit
}

/**
 * Represents the health check configuration for a container in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-healthcheck.html
 */
export interface HealthCheck {
    Command?: StringType[];
    Interval?: number;
    Retries?: number;
    StartPeriod?: number;
    Timeout?: number;
}

/**
 * Represents kernel capability adjustments for a container in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-kernelcapabilities.html
 */
export interface KernelCapabilities {
    Add?: StringType[];
    Drop?: StringType[];
}

/**
 * Represents a device mapping for a container in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-device.html
 */
export interface Device {
    ContainerPath?: StringType;
    HostPath?: StringType;
    Permissions?: StringType[];
}

/**
 * Represents a temporary file system configuration for a container in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-tmpfs.html
 */
export interface Tmpfs {
    ContainerPath?: StringType;
    MountOptions?: StringType[];
    Size: number;
}

/**
 * Represents Linux-specific parameters for a container in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-linuxparameters.html
 */
export interface LinuxParameters {
    Capabilities?: KernelCapabilities;
    Devices?: Device[];
    InitProcessEnabled?: boolean;
    MaxSwap?: number;
    SharedMemorySize?: number;
    Swappiness?: number;
    Tmpfs?: Tmpfs[];
}

/**
 * Represents the logging configuration for a container in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-logconfiguration.html
 */
export interface LogConfiguration {
    LogDriver: StringType;
    Options?: ObjectOfStringTypes;
    SecretOptions?: Secret[];
}

/**
 * Represents a mount point configuration for a container in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-mountpoint.html
 */
export interface MountPoint {
    ContainerPath?: StringType;
    ReadOnly?: boolean;
    SourceVolume?: StringType;
}

/**
 * Represents a port mapping configuration for a container in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-portmapping.html
 */
export interface PortMapping {
    AppProtocol?: StringType;
    ContainerPort?: number;
    ContainerPortRange?: StringType;
    HostPort?: number;
    Name?: StringType;
    Protocol?: StringType;
}

/**
 * Represents repository credentials for a container in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-repositorycredentials.html
 */
export interface RepositoryCredentials {
    CredentialsParameter?: StringType;
}

/**
 * Represents a resource requirement configuration for a container in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-resourcerequirement.html
 */
export interface ResourceRequirement {
    Type: StringType;
    Value: StringType;
}

/**
 * Represents the restart policy configuration for a container in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-restartpolicy.html
 */
export interface RestartPolicy {
    Enabled?: boolean;
    IgnoredExitCodes?: number[];
    RestartAttemptPeriod?: number;
}

/**
 * Represents a secret configuration for a container in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-secret.html
 */
export interface Secret {
    Name: StringType;
    ValueFrom: StringType;
}

/**
 * Represents system control settings for a container in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-systemcontrol.html
 */
export interface SystemControl {
    Namespace?: StringType;
    Value?: StringType;
}

/**
 * Represents ulimit settings for a container in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-ulimit.html
 */
export interface Ulimit {
    HardLimit: number;
    Name: StringType;
    SoftLimit: number;
}

/**
 * Represents a volume dependency configuration for a container in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-volumefrom.html
 */
export interface VolumeFrom {
    ReadOnly?: boolean;
    SourceContainer?: StringType;
}

/**
 * Represents a container definition for an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-containerdefinition.html
 */
export interface ContainerDefinition {
    Command?: StringType[];
    Cpu?: number;
    CredentialSpecs?: StringType[];
    DependsOn?: ContainerDependency[];
    DisableNetworking?: boolean;
    DnsSearchDomains?: StringType[];
    DnsServers?: StringType[];
    DockerLabels?: ObjectOfStringTypes;
    DockerSecurityOptions?: StringType[];
    EntryPoint?: StringType[];
    Environment?: KeyValuePair[];
    EnvironmentFiles?: EnvironmentFile[];
    Essential?: boolean;
    ExtraHosts?: HostEntry[];
    FirelensConfiguration?: FirelensConfiguration;
    HealthCheck?: HealthCheck;
    Hostname?: StringType;
    Image: StringType;
    Interactive?: boolean;
    Links?: StringType[];
    LinuxParameters?: LinuxParameters;
    LogConfiguration?: LogConfiguration;
    Memory?: number;
    MemoryReservation?: number;
    MountPoints?: MountPoint[];
    Name: StringType;
    PortMappings?: PortMapping[];
    Privileged?: boolean;
    PseudoTerminal?: boolean;
    ReadonlyRootFilesystem?: boolean;
    RepositoryCredentials?: RepositoryCredentials;
    ResourceRequirements?: ResourceRequirement[];
    RestartPolicy?: RestartPolicy;
    Secrets?: Secret[];
    StartTimeout?: number;
    StopTimeout?: number;
    SystemControls?: SystemControl[];
    Ulimits?: Ulimit[];
    User?: StringType;
    VersionConsistency?: StringType;
    VolumesFrom?: VolumeFrom[];
    WorkingDirectory?: StringType;
}

/**
 * Represents the ephemeral storage configuration for an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-ephemeralstorage.html
 */
export interface EphemeralStorage {
    SizeInGiB?: number;
}

/**
 * Represents an inference accelerator configuration for an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-inferenceaccelerator.html
 */
export interface InferenceAccelerator {
    DeviceName?: StringType;
    DeviceType?: StringType;
}

/**
 * Represents a placement constraint for an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-taskdefinitionplacementconstraint.html
 */
export interface TaskDefinitionPlacementConstraint {
    Expression?: StringType;
    Type: StringType; // memberOf
}

/**
 * Represents the proxy configuration for an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-proxyconfiguration.html
 */
export interface ProxyConfiguration {
    ContainerName: StringType;
    ProxyConfigurationProperties?: KeyValuePair[];
    Type?: StringType; // APPMESH
}

/**
 * Represents the runtime platform configuration for an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-runtimeplatform.html
 */
export interface RuntimePlatform {
    CpuArchitecture?: StringType; // X86_64 | ARM64
    OperatingSystemFamily?: StringType;
}

/**
 * Represents a Docker volume configuration for an ECS Task Definition volume.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-dockervolumeconfiguration.html
 */
export interface DockerVolumeConfiguration {
    Autoprovision?: boolean;
    Driver?: StringType;
    DriverOpts?: ObjectOfStringTypes;
    Labels?: ObjectOfStringTypes;
    Scope?: StringType;
}

/**
 * Represents the authorization configuration for an EFS Volume in an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-authorizationconfig.html
 */
export interface AuthorizationConfig {
    AccessPointId?: StringType;
    IAM?: StringType;
}

/**
 * Represents an EFS volume configuration for an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-efsvolumeconfiguration.html
 */
export interface EFSVolumeConfiguration {
    AuthorizationConfig?: AuthorizationConfig;
    FilesystemId: StringType;
    RootDirectory?: StringType;
    TransitEncryption?: StringType;
    TransitEncryptionPort?: number;
}

/**
 * Represents the FSx authorization configuration for an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-fsxauthorizationconfig.html
 */
export interface FSxAuthorizationConfig {
    CredentialsParameter: StringType;
    Domain: StringType;
}

/**
 * Represents an FSx Windows File Server volume configuration for an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-fsxwindowsfileservervolumeconfiguration.html
 */
export interface FSxWindowsFileServerVolumeConfiguration {
    AuthorizationConfig?: FSxAuthorizationConfig;
    FileSystemId: StringType;
    RootDirectory: StringType;
}

/**
 * Represents the host volume properties for an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-hostvolumeproperties.html
 */
export interface HostVolumeProperties {
    SourcePath?: StringType;
}

/**
 * Represents a volume configuration for an ECS Task Definition.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-taskdefinition-volume.html
 */
export interface Volume {
    ConfiguredAtLaunch?: boolean;
    DockerVolumeConfiguration?: DockerVolumeConfiguration;
    EFSVolumeConfiguration?: EFSVolumeConfiguration;
    FSxWindowsFileServerVolumeConfiguration?: FSxWindowsFileServerVolumeConfiguration;
    Host?: HostVolumeProperties;
    Name?: StringType;
}

/**
 * Represents an AWS ECS Task Definition resource.
 * This interface models the AWS CloudFormation resource type "AWS::ECS::TaskDefinition".
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ecs-taskdefinition.html
 */
export interface ECSTaskDefinitionResource extends CommonResource {
    Type: 'AWS::ECS::TaskDefinition';
    Properties: {
        ContainerDefinitions?: ContainerDefinition[];
        Cpu?: StringType;
        EnableFaultInjection?: boolean;
        EphemeralStorage?: EphemeralStorage;
        ExecutionRoleArn?: StringType;
        Family?: StringType;
        InferenceAccelerators?: InferenceAccelerator[];
        IpcMode?: StringType; // host | task | none
        Memory?: StringType;
        NetworkMode?: StringType; // bridge | host | awsvpc | none
        PidMode?: StringType; // host | task
        PlacementConstraints?: TaskDefinitionPlacementConstraint[];
        ProxyConfiguration?: ProxyConfiguration;
        RequiresCompatibilities?: StringType[];
        RuntimePlatform?: RuntimePlatform;
        Tags?: Tag[];
        TaskRoleArn?: StringType;
        Volumes?: Volume[];
        [propertyName: string]: unknown;
    };
}

/**
 * Represents the Amazon Cognito authentication configuration for an ELBv2 listener rule.
 *
 * @see [AuthenticateCognitoConfig Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-listenerrule-authenticatecognitoconfig.html)
 */
export interface AuthenticateCognitoConfig {
    AuthenticationRequestExtraParams?: ObjectOfStringTypes;
    OnUnauthenticatedRequest?: StringType;
    Scope?: StringType;
    SessionCookieName?: StringType;
    SessionTimeout?: number;
    UserPoolArn: StringType;
    UserPoolClientId: StringType;
    UserPoolDomain: StringType;
}

/**
 * Represents the OpenID Connect (OIDC) authentication configuration for an ELBv2 listener rule.
 *
 * @see [AuthenticateOidcConfig Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-listenerrule-authenticateoidcconfig.html)
 */
export interface AuthenticateOidcConfig {
    AuthenticationRequestExtraParams?: ObjectOfStringTypes;
    AuthorizationEndpoint: StringType;
    ClientId: StringType;
    ClientSecret?: StringType;
    Issuer: StringType;
    OnUnauthenticatedRequest?: StringType;
    Scope?: StringType;
    SessionCookieName?: StringType;
    SessionTimeout?: number;
    TokenEndpoint: StringType;
    UseExistingClientSecret?: boolean;
    UserInfoEndpoint: StringType;
}

/**
 * Represents the fixed response configuration for an ELBv2 listener rule.
 *
 * @see [FixedResponseConfig Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-listenerrule-fixedresponseconfig.html)
 */
export interface FixedResponseConfig {
    ContentType?: StringType;
    MessageBody?: StringType;
    StatusCode: StringType;
}

/**
 * Represents a target group tuple used in forwarding actions for an ELBv2 listener rule.
 *
 * @see [TargetGroupTuple Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-listenerrule-targetgrouptuple.html)
 */
export interface TargetGroupTuple {
    TargetGroupArn?: StringType;
    Weight?: number;
}

/**
 * Represents the target group stickiness configuration for an ELBv2 listener rule.
 *
 * @see [TargetGroupStickinessConfig Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-listenerrule-targetgroupstickinessconfig.html)
 */
export interface TargetGroupStickinessConfig {
    DurationSeconds?: number;
    Enabled?: boolean;
}

/**
 * Represents the forward action configuration for an ELBv2 listener rule.
 *
 * @see [ForwardConfig Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-listenerrule-forwardconfig.html)
 */
export interface ForwardConfig {
    TargetGroups?: TargetGroupTuple[];
    TargetGroupStickinessConfig?: TargetGroupStickinessConfig;
}

/**
 * Represents the redirect action configuration for an ELBv2 listener rule.
 *
 * @see [RedirectConfig Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-listenerrule-redirectconfig.html)
 */
export interface RedirectConfig {
    Host?: StringType;
    Path?: StringType;
    Port?: StringType;
    Protocol?: StringType;
    Query?: StringType;
    StatusCode: StringType;
}

/**
 * Represents the action configuration for an ELBv2 listener rule.
 *
 * @see [Action Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-listenerrule-action.html)
 */
export interface Action {
    AuthenticateCognitoConfig?: AuthenticateCognitoConfig;
    AuthenticateOidcConfig?: AuthenticateOidcConfig;
    FixedResponseConfig?: FixedResponseConfig;
    ForwardConfig?: ForwardConfig;
    Order?: number;
    RedirectConfig?: RedirectConfig;
    TargetGroupArn?: StringType;
    Type?: StringType; // forward | authenticate-oidc | authenticate-cognito | redirect | fixed-response
}

/**
 * Represents the host header condition configuration for an ELBv2 listener rule.
 *
 * @see [HostHeaderConfig Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-listenerrule-hostheaderconfig.html)
 */
export interface HostHeaderConfig {
    Values?: StringType[];
}

/**
 * Represents the HTTP header condition configuration for an ELBv2 listener rule.
 *
 * @see [HttpHeaderConfig Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-listenerrule-httpheaderconfig.html)
 */
export interface HttpHeaderConfig {
    HttpHeaderName?: StringType;
    Values?: StringType[];
}

/**
 * Represents the HTTP request method condition configuration for an ELBv2 listener rule.
 *
 * @see [HttpRequestMethodConfig Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-listenerrule-httprequestmethodconfig.html)
 */
export interface HttpRequestMethodConfig {
    Values?: StringType[];
}

/**
 * Represents the path pattern condition configuration for an ELBv2 listener rule.
 *
 * @see [PathPatternConfig Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-listenerrule-pathpatternconfig.html)
 */
export interface PathPatternConfig {
    Values?: StringType[];
}

/**
 * Represents a key-value pair for query string conditions in an ELBv2 listener rule.
 *
 * @see [QueryStringKeyValue Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-listenerrule-querystringkeyvalue.html)
 */
export interface QueryStringKeyValue {
    Key?: StringType;
    Value?: StringType;
}

/**
 * Represents the query string condition configuration for an ELBv2 listener rule.
 *
 * @see [QueryStringConfig Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-listenerrule-querystringconfig.html)
 */
export interface QueryStringConfig {
    Values: QueryStringKeyValue[];
}

/**
 * Represents the source IP condition configuration for an ELBv2 listener rule.
 *
 * @see [SourceIpConfig Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-listenerrule-sourceipconfig.html)
 */
export interface SourceIpConfig {
    Values?: StringType[];
}

/**
 * Represents a condition for an ELBv2 listener rule.
 *
 * @see [RuleCondition Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-elasticloadbalancingv2-listenerrule-rulecondition.html)
 */
export interface RuleCondition {
    Field?: StringType;
    HostHeaderConfig?: HostHeaderConfig;
    HttpHeaderConfig?: HttpHeaderConfig;
    HttpRequestMethodConfig?: HttpRequestMethodConfig;
    PathPatternConfig?: PathPatternConfig;
    QueryStringConfig?: QueryStringConfig;
    SourceIpConfig?: SourceIpConfig;
    Values?: StringType[];
}

/**
 * Represents an AWS CloudFormation Elastic Load Balancing v2 Listener Rule resource.
 *
 * @see [AWS::ElasticLoadBalancingV2::ListenerRule Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-elasticloadbalancingv2-listenerrule.html)
 */
export interface ElasticLoadBalancingV2ListenerRule extends CommonResource {
    Type: 'AWS::ElasticLoadBalancingV2::ListenerRule';
    Properties: {
        Actions: Action[];
        Conditions: RuleCondition[];
        ListenerArn?: StringType;
        Priority: number;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents a capacity provider strategy item for an ECS Service.
 *
 * @see [AWS::ECS::Service CapacityProviderStrategyItem](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-capacityproviderstrategyitem.html)
 */
export interface CapacityProviderStrategyItem {
    Base?: number;
    CapacityProvider?: StringType;
    Weight?: number;
}

/**
 * Models deployment alarms configuration for an ECS Service.
 *
 * @see [AWS::ECS::Service DeploymentAlarms](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-deploymentalarms.html)
 */
export interface DeploymentAlarms {
    AlarmNames: StringType[];
    Enable: boolean;
    Rollback: boolean;
}

/**
 * Represents a deployment circuit breaker configuration for an ECS Service.
 *
 * @see [AWS::ECS::Service DeploymentCircuitBreaker](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-deploymentcircuitbreaker.html)
 */
export interface DeploymentCircuitBreaker {
    Enable: boolean;
    Rollback: boolean;
}

/**
 * Models deployment configuration settings for an ECS Service.
 *
 * @see [AWS::ECS::Service DeploymentConfiguration](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-deploymentconfiguration.html)
 */
export interface DeploymentConfiguration {
    Alarms?: DeploymentAlarms;
    DeploymentCircuitBreaker?: DeploymentCircuitBreaker;
    MaximumPercent?: number;
    MinimumHealthyPercent?: number;
}

/**
 * Defines the deployment controller configuration for an ECS Service.
 *
 * @see [AWS::ECS::Service DeploymentController](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-deploymentcontroller.html)
 */
export interface DeploymentController {
    Type?: StringType;
}

/**
 * Represents a load balancer configuration for an ECS Service.
 *
 * @see [AWS::ECS::Service LoadBalancer](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-loadbalancer.html)
 */
export interface LoadBalancer {
    ContainerName?: StringType;
    ContainerPort?: number;
    LoadBalancerName?: StringType;
    TargetGroupArn?: StringType;
}

/**
 * Models the AWS VPC configuration for an ECS Service.
 *
 * @see [AWS::ECS::Service AwsVpcConfiguration](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-awsvpcconfiguration.html)
 */
export interface AwsVpcConfiguration {
    AssignPublicIp?: StringType;
    SecurityGroups?: StringType[];
    Subnets?: StringType[];
}

/**
 * Represents the network configuration for an ECS Service.
 *
 * @see [AWS::ECS::Service NetworkConfiguration](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-networkconfiguration.html)
 */
export interface NetworkConfiguration {
    AwsvpcConfiguration?: AwsVpcConfiguration;
}

/**
 * Represents a placement constraint for an ECS Service.
 *
 * @see [AWS::ECS::Service PlacementConstraint](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-placementconstraint.html)
 */
export interface PlacementConstraint {
    Expression?: StringType;
    Type: StringType; // distinctInstance | memberOf
}

/**
 * Models a placement strategy for an ECS Service.
 *
 * @see [AWS::ECS::Service PlacementStrategy](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-placementstrategy.html)
 */
export interface PlacementStrategy {
    Field?: StringType;
    Type: StringType; // binpack | random | spread
}

/**
 * Represents a client alias for Service Connect in an ECS Service.
 *
 * @see [AWS::ECS::Service ServiceConnectClientAlias](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-serviceconnectclientalias.html)
 */
export interface ServiceConnectClientAlias {
    DnsName?: StringType;
    Port: number;
}

/**
 * Models the timeout configuration for Service Connect in an ECS Service.
 *
 * @see [AWS::ECS::Service TimeoutConfiguration](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-timeoutconfiguration.html)
 */
export interface TimeoutConfiguration {
    IdleTimeoutSeconds?: number;
    PerRequestTimeoutSeconds?: number;
}

/**
 * Represents the TLS certificate authority specification for Service Connect in an ECS Service.
 *
 * @see [AWS::ECS::Service ServiceConnectTlsCertificateAuthority](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-serviceconnecttlscertificateauthority.html)
 */
export interface ServiceConnectTlsCertificateAuthority {
    AwsPcaAuthorityArn?: StringType;
}

/**
 * Models the TLS configuration for Service Connect in an ECS Service.
 *
 * @see [AWS::ECS::Service ServiceConnectTlsConfiguration](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-serviceconnecttlsconfiguration.html)
 */
export interface ServiceConnectTlsConfiguration {
    IssuerCertificateAuthority: ServiceConnectTlsCertificateAuthority;
    KmsKey?: StringType;
    RoleArn?: StringType;
}

/**
 * Represents a Service Connect service configuration for an ECS Service.
 *
 * @see [AWS::ECS::Service ServiceConnectService](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-serviceconnectservice.html)
 */
export interface ServiceConnectService {
    ClientAliases?: ServiceConnectClientAlias[];
    DiscoveryName?: StringType;
    IngressPortOverride?: number;
    PortName: StringType;
    Timeout?: TimeoutConfiguration;
    Tls?: ServiceConnectTlsConfiguration;
}

/**
 * Models the Service Connect configuration for an ECS Service.
 *
 * @see [AWS::ECS::Service ServiceConnectConfiguration](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-serviceconnectconfiguration.html)
 */
export interface ServiceConnectConfiguration {
    Enabled: boolean;
    LogConfiguration?: LogConfiguration;
    Namespace?: StringType;
    Services?: ServiceConnectService[];
}

/**
 * Represents a service registry configuration for an ECS Service.
 *
 * @see [AWS::ECS::Service ServiceRegistry](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-serviceregistry.html)
 */
export interface ServiceRegistry {
    ContainerName?: StringType;
    ContainerPort?: number;
    Port?: number;
    RegistryArn?: StringType;
}

/**
 * Models an EBS tag specification for an ECS Service.
 *
 * @see [AWS::ECS::Service EBSTagSpecification](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-ebstagspecification.html)
 */
export interface EBSTagSpecification {
    PropagateTags?: StringType;
    ResourceType: StringType; // volume
    Tags?: Tag[];
}

/**
 * Represents the managed EBS volume configuration for an ECS Service.
 *
 * @see [AWS::ECS::Service ServiceManagedEBSVolumeConfiguration](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-servicemanagedebsvolumeconfiguration.html)
 */
export interface ServiceManagedEBSVolumeConfiguration {
    Encrypted?: boolean;
    FilesystemType?: StringType;
    Iops?: number;
    KmsKeyId?: StringType;
    RoleArn: StringType;
    SizeInGiB?: number;
    SnapshotId?: StringType;
    TagSpecifications?: EBSTagSpecification[];
    Throughput?: number;
    VolumeType?: StringType;
}

/**
 * Models a service volume configuration for an ECS Service.
 *
 * @see [AWS::ECS::Service ServiceVolumeConfiguration](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-servicevolumeconfiguration.html)
 */
export interface ServiceVolumeConfiguration {
    ManagedEBSVolume?: ServiceManagedEBSVolumeConfiguration;
    Name: StringType;
}

/**
 * Represents a VPC Lattice configuration for an ECS Service.
 *
 * @see [AWS::ECS::Service VpcLatticeConfiguration](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ecs-service-vpclatticeconfiguration.html)
 */
export interface VpcLatticeConfiguration {
    PortName: StringType;
    RoleArn: StringType;
    TargetGroupArn: StringType;
}

/**
 * Models an AWS::ECS::Service CloudFormation resource.
 *
 * This interface represents the complete specification for an ECS Service resource in CloudFormation.
 *
 * @see [AWS::ECS::Service](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ecs-service.html)
 */
export interface EcsServiceResource extends CommonResource {
    Type: 'AWS::ECS::Service';
    Properties: {
        AvailabilityZoneRebalancing?: StringType;
        CapacityProviderStrategy?: CapacityProviderStrategyItem[];
        Cluster?: StringType;
        DeploymentConfiguration?: DeploymentConfiguration;
        DeploymentController?: DeploymentController;
        DesiredCount?: number;
        EnableECSManagedTags?: boolean;
        EnableExecuteCommand?: boolean;
        HealthCheckGracePeriodSeconds?: number;
        LaunchType?: StringType;
        LoadBalancers?: LoadBalancer[];
        NetworkConfiguration?: NetworkConfiguration;
        PlacementConstraints?: PlacementConstraint[];
        PlacementStrategies?: PlacementStrategy[];
        PlatformVersion?: StringType;
        PropagateTags?: StringType;
        Role?: StringType;
        SchedulingStrategy?: StringType;
        ServiceConnectConfiguration?: ServiceConnectConfiguration;
        ServiceName?: StringType;
        ServiceRegistries?: ServiceRegistry[];
        Tags?: Tag[];
        TaskDefinition?: StringType;
        VolumeConfigurations?: ServiceVolumeConfiguration[];
        VpcLatticeConfigurations?: VpcLatticeConfiguration[];
        [propertyName: string]: unknown;
    };
}

/**
 * Represents HTTP parameters for pipe enrichment in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipeenrichmenthttpparameters.html
 */
export interface PipeEnrichmentHttpParameters {
    HeaderParameters: ObjectOfStringTypes;
    PathParameterValues: StringType[];
    QueryStringParameters: ObjectOfStringTypes;
}

/**
 * Represents enrichment parameters for AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipeenrichmentparameters.html
 */
export interface PipeEnrichmentParameters {
    HttpParameters?: PipeEnrichmentHttpParameters;
    InputTemplate?: StringType;
}

/**
 * Represents the CloudWatch Logs log destination configuration for AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-cloudwatchlogslogdestination.html
 */
export interface CloudwatchLogsLogDestination {
    LogGroupArn?: StringType;
}

/**
 * Represents the Firehose log destination configuration for AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-firehoselogdestination.html
 */
export interface FirehoseLogDestination {
    DeliveryStreamArn?: StringType;
}

/**
 * Represents the S3 log destination configuration for AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-s3logdestination.html
 */
export interface S3LogDestination {
    BucketName?: StringType;
    BucketOwner?: StringType;
    OutputFormat?: StringType;
    Prefix?: StringType;
}

/**
 * Represents the log configuration for AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipelogconfiguration.html
 */
export interface PipeLogConfiguration {
    CloudwatchLogsLogDestination?: CloudwatchLogsLogDestination;
    FirehoseLogDestination?: FirehoseLogDestination;
    IncludeExecutionData?: StringType[];
    Level?: StringType;
    S3LogDestination?: S3LogDestination;
}

/**
 * Represents broker access credentials used by AWS Pipes for ActiveMQ or RabbitMQ.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-mqbrokeraccesscredentials.html
 */
export interface MQBrokerAccessCredentials {
    BasicAuth: StringType;
}

/**
 * Represents parameters for an ActiveMQ broker source in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipesourceactivemqbrokerparameters.html
 */
export interface PipeSourceActiveMQBrokerParameters {
    BatchSize?: number;
    Credentials: MQBrokerAccessCredentials;
    MaximumBatchingWindowInSeconds?: number;
    QueueName: StringType;
}

/**
 * Represents the dead letter configuration for a source pipe in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-deadletterconfig.html
 */
export interface PipeDeadLetterConfig {
    Arn?: StringType;
}

/**
 * Represents parameters for a DynamoDB stream source in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipesourcedynamodbstreamparameters.html
 */
export interface PipeSourceDynamoDBStreamParameters {
    BatchSize?: number;
    DeadLetterConfig?: PipeDeadLetterConfig;
    MaximumBatchingWindowInSeconds?: number;
    MaximumRecordAgeInSeconds?: number;
    MaximumRetryAttempts?: number;
    OnPartialBatchItemFailure?: StringType;
    ParallelizationFactor?: number;
    StartingPosition: StringType; // TRIM_HORIZON | LATEST
}

/**
 * Represents a filter used to process events in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-filter.html
 */
export interface PipeFilter {
    Pattern?: StringType;
}

/**
 * Represents the criteria used for filtering events in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-filtercriteria.html
 */
export interface FilterCriteria {
    Filters?: PipeFilter[];
}

/**
 * Represents parameters for a Kinesis stream source in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipesourcekinesisstreamparameters.html
 */
export interface PipeSourceKinesisStreamParameters {
    BatchSize?: number;
    DeadLetterConfig?: PipeDeadLetterConfig;
    MaximumBatchingWindowInSeconds?: number;
    MaximumRecordAgeInSeconds?: number;
    MaximumRetryAttempts?: number;
    OnPartialBatchItemFailure?: StringType;
    ParallelizationFactor?: number;
    StartingPosition: StringType; // TRIM_HORIZON | LATEST | AT_TIMESTAMP
    StartingPositionTimestamp?: StringType;
}

/**
 * Represents access credentials for an MSK (Managed Streaming for Kafka) broker in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-mskaccesscredentials.html
 */
export interface MSKAccessCredentials {
    ClientCertificateTlsAuth?: StringType;
    SaslScram512Auth?: StringType;
}

/**
 * Represents parameters for a managed streaming Kafka source in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipesourcemanagedstreamingkafkaparameters.html
 */
export interface PipeSourceManagedStreamingKafkaParameters {
    BatchSize?: number;
    ConsumerGroupID?: StringType;
    Credentials?: MSKAccessCredentials;
    MaximumBatchingWindowInSeconds?: number;
    StartingPosition?: StringType;
    TopicName: StringType;
}

/**
 * Represents parameters for a RabbitMQ broker source in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipesourcerabbitmqbrokerparameters.html
 */
export interface PipeSourceRabbitMQBrokerParameters {
    BatchSize?: number;
    Credentials: MQBrokerAccessCredentials;
    MaximumBatchingWindowInSeconds?: number;
    QueueName: StringType;
    VirtualHost?: StringType;
}

/**
 * Represents credentials for self-managed Kafka access configuration in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-selfmanagedkafkaaccessconfigurationcredentials.html
 */
export interface SelfManagedKafkaAccessConfigurationCredentials {
    BasicAuth?: StringType;
    ClientCertificateTlsAuth?: StringType;
    SaslScram256Auth?: StringType;
    SaslScram512Auth?: StringType;
}

/**
 * Represents VPC configuration for self-managed Kafka access in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-selfmanagedkafkaaccessconfigurationvpc.html
 */
export interface SelfManagedKafkaAccessConfigurationVpc {
    SecurityGroup?: StringType[];
    Subnets?: StringType[];
}

/**
 * Represents parameters for a self-managed Kafka source in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipesourceselfmanagedkafkaparameters.html
 */
export interface PipeSourceSelfManagedKafkaParameters {
    AdditionalBootstrapServers?: StringType[];
    BatchSize?: number;
    ConsumerGroupID?: StringType;
    Credentials?: SelfManagedKafkaAccessConfigurationCredentials;
    MaximumBatchingWindowInSeconds?: number;
    ServerRootCaCertificate?: StringType;
    StartingPosition?: StringType; // TRIM_HORIZON | LATEST
    TopicName: StringType;
    Vpc?: SelfManagedKafkaAccessConfigurationVpc;
}

/**
 * Represents parameters for an SQS queue source in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipesourcesqsqueueparameters.html
 */
export interface PipeSourceSqsQueueParameters {
    BatchSize?: number;
    MaximumBatchingWindowInSeconds?: number;
}

/**
 * Represents source parameters for AWS Pipes, supporting multiple source types.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipesourceparameters.html
 */
export interface PipeSourceParameters {
    ActiveMQBrokerParameters?: PipeSourceActiveMQBrokerParameters;
    DynamoDBStreamParameters?: PipeSourceDynamoDBStreamParameters;
    FilterCriteria?: FilterCriteria;
    KinesisStreamParameters?: PipeSourceKinesisStreamParameters;
    ManagedStreamingKafkaParameters?: PipeSourceManagedStreamingKafkaParameters;
    RabbitMQBrokerParameters?: PipeSourceRabbitMQBrokerParameters;
    SelfManagedKafkaParameters?: PipeSourceSelfManagedKafkaParameters;
    SqsQueueParameters?: PipeSourceSqsQueueParameters;
}

/**
 * Represents array properties for batch job target parameters in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-batcharrayproperties.html
 */
export interface BatchArrayProperties {
    Size?: number;
}

/**
 * Represents an environment variable for batch job target parameters in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-batchenvironmentvariable.html
 */
export interface BatchEnvironmentVariable {
    Name?: StringType;
    Value?: StringType;
}

/**
 * Represents a resource requirement for batch job target parameters in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-batchresourcerequirement.html
 */
export interface BatchResourceRequirement {
    Type: StringType; // GPU | MEMORY | VCPU
    Value: StringType;
}

/**
 * Represents container override settings for batch job target parameters in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-batchcontaineroverrides.html
 */
export interface BatchContainerOverrides {
    Command?: StringType[];
    Environment?: BatchEnvironmentVariable[];
    InstanceType?: StringType;
    ResourceRequirements?: BatchResourceRequirement[];
}

/**
 * Represents a job dependency for batch job target parameters in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-batchjobdependency.html
 */
export interface BatchJobDependency {
    JobId?: StringType;
    Type?: StringType;
}

/**
 * Represents the retry strategy for batch job target parameters in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-batchretrystrategy.html
 */
export interface BatchRetryStrategy {
    Attempts?: number;
}

/**
 * Represents batch job target parameters for AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipetargetbatchjobparameters.html
 */
export interface PipeTargetBatchJobParameters {
    ArrayProperties?: BatchArrayProperties;
    ContainerOverrides?: BatchContainerOverrides;
    DependsOn?: BatchJobDependency[];
    JobDefinition: StringType;
    JobName: StringType;
    Parameters?: ObjectOfStringTypes;
    RetryStrategy?: BatchRetryStrategy;
}

/**
 * Represents CloudWatch Logs target parameters for AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipetargetcloudwatchlogsparameters.html
 */
export interface PipeTargetCloudWatchLogsParameters {
    LogStreamName?: StringType;
    Timestamp?: StringType;
}

/**
 * Represents an ECS environment variable for task override parameters in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-ecsenvironmentvariable.html
 */
export interface EcsEnvironmentVariable {
    Name?: StringType;
    Value?: StringType;
}

/**
 * Represents an ECS environment file for task override parameters in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-ecsenvironmentfile.html
 */
export interface EcsEnvironmentFile {
    Type: StringType;
    Value: StringType;
}

/**
 * Represents a resource requirement for ECS task override parameters in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-ecsresourcerequirement.html
 */
export interface EcsResourceRequirement {
    Type: StringType;
    Value: StringType;
}

/**
 * Represents container override settings for ECS task target parameters in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-ecscontaineroverride.html
 */
export interface EcsContainerOverride {
    Command?: StringType[];
    Cpu?: number;
    Environment?: EcsEnvironmentVariable[];
    EnvironmentFiles?: EcsEnvironmentFile[];
    Memory?: number;
    MemoryReservation?: number;
    Name?: StringType;
    ResourceRequirements?: EcsResourceRequirement[];
}

/**
 * Represents ephemeral storage settings for an ECS task in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-ecsephemeralstorage.html
 */
export interface EcsEphemeralStorage {
    SizeInGiB: number;
}

/**
 * Represents inference accelerator override settings for an ECS task in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-ecsinferenceacceleratoroverride.html
 */
export interface EcsInferenceAcceleratorOverride {
    DeviceName?: StringType;
    DeviceType?: StringType;
}

/**
 * Represents task override parameters for an ECS task in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-ecstaskoverride.html
 */
export interface EcsTaskOverride {
    ContainerOverrides?: EcsContainerOverride[];
    Cpu?: StringType;
    EphemeralStorage?: EcsEphemeralStorage;
    ExecutionRoleArn?: StringType;
    InferenceAcceleratorOverrides?: EcsInferenceAcceleratorOverride[];
    Memory?: StringType;
    TaskRoleArn?: StringType;
}

/**
 * Represents target parameters for an ECS task in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipetargetecstaskparameters.html
 */
export interface PipeTargetEcsTaskParameters {
    CapacityProviderStrategy?: CapacityProviderStrategyItem[];
    EnableECSManagedTags?: boolean;
    EnableExecuteCommand?: boolean;
    Group?: StringType;
    LaunchType?: StringType;
    NetworkConfiguration?: NetworkConfiguration;
    Overrides?: EcsTaskOverride;
    PlacementConstraints?: PlacementConstraint[];
    PlacementStrategy?: PlacementStrategy[];
    PlatformVersion?: StringType;
    PropagateTags?: StringType;
    ReferenceId?: StringType;
    Tags?: Tag[];
    TaskCount?: number;
    TaskDefinitionArn?: StringType;
}

/**
 * Represents target parameters for an EventBridge event bus in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipetargeteventbridgeeventbusparameters.html
 */
export interface PipeTargetEventBridgeEventBusParameters {
    DetailType?: StringType;
    EndpointId?: StringType;
    Resources?: StringType[];
    Source?: StringType;
    Time?: StringType;
}

/**
 * Represents target parameters for an HTTP endpoint in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipetargethttpparameters.html
 */
export interface PipeTargetHttpParameters {
    HeaderParameters?: ObjectOfStringTypes;
    PathParameterValues?: StringType[];
    QueryStringParameters?: ObjectOfStringTypes;
}

/**
 * Represents target parameters for a Kinesis stream in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipetargetkinesisstreamparameters.html
 */
export interface PipeTargetKinesisStreamParameters {
    PartitionKey: StringType;
}

/**
 * Represents target parameters for a Lambda function in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipetargetlambdafunctionparameters.html
 */
export interface PipeTargetLambdaFunctionParameters {
    InvocationType?: StringType; // REQUEST_RESPONSE | FIRE_AND_FORGET
}

/**
 * Represents target parameters for Redshift data in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipetargetredshiftdataparameters.html
 */
export interface PipeTargetRedshiftDataParameters {
    Database: StringType;
    DbUser?: StringType;
    SecretManagerArn?: StringType;
    Sqls: StringType[];
    StatementName?: StringType;
    WithEvent?: boolean;
}

/**
 * Represents a parameter for a SageMaker pipeline in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-sagemakerpipelineparameter.html
 */
export interface SageMakerPipelineParameter {
    Name: StringType;
    Value: StringType;
}

/**
 * Represents target parameters for a SageMaker pipeline in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipetargetsagemakerpipelineparameters.html
 */
export interface PipeTargetSageMakerPipelineParameters {
    PipelineParameterList: SageMakerPipelineParameter[];
}

/**
 * Represents target parameters for an SQS queue in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipetargetsqsqueueparameters.html
 */
export interface PipeTargetSqsQueueParameters {
    MessageDeduplicationId?: StringType;
    MessageGroupId?: StringType;
}

/**
 * Represents target parameters for a Step Functions state machine in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipetargetstatemachineparameters.html
 */
export interface PipeTargetStateMachineParameters {
    InvocationType?: StringType; // REQUEST_RESPONSE | FIRE_AND_FORGET
}

/**
 * Represents a dimension mapping for Timestream target parameters in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-dimensionmapping.html
 */
export interface DimensionMapping {
    DimensionName: StringType;
    DimensionValue: StringType;
    DimensionValueType: StringType;
}

/**
 * Represents a multi-measure attribute mapping for Timestream target parameters in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-multimeasureattributemapping.html
 */
export interface MultiMeasureAttributeMapping {
    MeasureValue: StringType;
    MeasureValueType: StringType;
    MultiMeasureAttributeName: StringType;
}

/**
 * Represents a multi-measure mapping for Timestream target parameters in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-multimeasuremapping.html
 */
export interface MultiMeasureMapping {
    MultiMeasureAttributeMappings: MultiMeasureAttributeMapping[];
    MultiMeasureName: StringType;
}

/**
 * Represents a single measure mapping for Timestream target parameters in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-singlemeasuremapping.html
 */
export interface SingleMeasureMapping {
    MeasureName: StringType;
    MeasureValue: StringType;
    MeasureValueType: StringType;
}

/**
 * Represents target parameters for Timestream in AWS Pipes.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipetargettimestreamparameters.html
 */
export interface PipeTargetTimestreamParameters {
    DimensionMappings: DimensionMapping[];
    EpochTimeUnit?: StringType;
    MultiMeasureMappings?: MultiMeasureMapping[];
    SingleMeasureMappings?: SingleMeasureMapping[];
    TimeFieldType?: StringType;
    TimestampFormat?: StringType;
    TimeValue: StringType;
    VersionValue: StringType;
}

/**
 * Represents target parameters for AWS Pipes, supporting various target types.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipetargetparameters.html
 */
export interface PipeTargetParameters {
    BatchJobParameters?: PipeTargetBatchJobParameters;
    CloudWatchLogsParameters?: PipeTargetCloudWatchLogsParameters;
    EcsTaskParameters?: PipeTargetEcsTaskParameters;
    EventBridgeEventBusParameters?: PipeTargetEventBridgeEventBusParameters;
    HttpParameters?: PipeTargetHttpParameters;
    InputTemplate?: StringType;
    KinesisStreamParameters?: PipeTargetKinesisStreamParameters;
    LambdaFunctionParameters?: PipeTargetLambdaFunctionParameters;
    RedshiftDataParameters?: PipeTargetRedshiftDataParameters;
    SageMakerPipelineParameters?: PipeTargetSageMakerPipelineParameters;
    SqsQueueParameters?: PipeTargetSqsQueueParameters;
    StepFunctionStateMachineParameters?: PipeTargetStateMachineParameters;
    TimestreamParameters?: PipeTargetTimestreamParameters;
}

/**
 * Represents an AWS Pipes Pipe resource in a CloudFormation template.
 * This interface models the CloudFormation resource type "AWS::Pipes::Pipe".
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-pipes-pipe.html
 */
export interface PipesPipeResource extends CommonResource {
    Type: 'AWS::Pipes::Pipe';
    Properties: {
        Description?: StringType;
        DesiredState?: StringType;
        Enrichment?: StringType;
        EnrichmentParameters?: PipeEnrichmentParameters;
        KmsKeyIdentifier?: StringType;
        LogConfiguration?: PipeLogConfiguration;
        Name?: StringType;
        RoleArn: StringType;
        Source: StringType;
        SourceParameters?: PipeSourceParameters;
        Tags?: Tag[];
        Target: StringType;
        TargetParameters?: PipeTargetParameters;
        [propertyName: string]: unknown;
    };

    [key: string]: unknown;
}

/**
 * Represents the S3 location for a Step Functions state machine definition.
 *
 * @see [AWS::StepFunctions::StateMachine S3Location](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-stepfunctions-statemachine-s3location.html)
 */
export interface S3Location {
    Bucket?: StringType;
    Key?: StringType;
    Version: StringType;
}

/**
 * Models the encryption configuration for a Step Functions state machine.
 *
 * @see [AWS::StepFunctions::StateMachine EncryptionConfiguration](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-stepfunctions-statemachine-encryptionconfiguration.html)
 */
export interface EncryptionConfiguration {
    KmsDataKeyReusePeriodSeconds?: number;
    KmsKeyId?: StringType;
    Type: StringType; // CUSTOMER_MANAGED_KMS_KEY | AWS_OWNED_KEY
}

/**
 * Represents a CloudWatch Logs log group configuration for a Step Functions state machine.
 *
 * @see [AWS::StepFunctions::StateMachine CloudWatchLogsLogGroup](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-stepfunctions-statemachine-cloudwatchlogsloggroup.html)
 */
export interface CloudWatchLogsLogGroup {
    LogGroupArn?: StringType;
}

/**
 * Models a log destination for a Step Functions state machine.
 *
 * @see [AWS::StepFunctions::StateMachine LogDestination](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-stepfunctions-statemachine-logdestination.html)
 */
export interface LogDestination {
    CloudWatchLogsLogGroup?: CloudWatchLogsLogGroup;
}

/**
 * Represents the logging configuration for a Step Functions state machine.
 *
 * @see [AWS::StepFunctions::StateMachine LoggingConfiguration](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-stepfunctions-statemachine-loggingconfiguration.html)
 */
export interface LoggingConfiguration {
    Destinations?: LogDestination[];
    IncludeExecutionData?: boolean;
    Level?: StringType; // ALL | ERROR | FATAL | OFF
}

/**
 * Models the tracing configuration for a Step Functions state machine.
 *
 * @see [AWS::StepFunctions::StateMachine TracingConfiguration](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-stepfunctions-statemachine-tracingconfiguration.html)
 */
export interface TracingConfiguration {
    Enabled?: boolean;
}

/**
 * Represents a Step Functions state machine resource in AWS CloudFormation.
 *
 * @see [AWS::StepFunctions::StateMachine](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-stepfunctions-statemachine.html)
 */
export interface StepFunctionsStateMachineResource extends CommonResource {
    Type: 'AWS::StepFunctions::StateMachine';
    Properties: {
        Definition?: StringKeyObject;
        DefinitionS3Location?: S3Location;
        DefinitionString?: StringType;
        DefinitionSubstitutions?: ObjectOfStringTypes;
        EncryptionConfiguration?: EncryptionConfiguration;
        LoggingConfiguration?: LoggingConfiguration;
        RoleArn?: StringType;
        StateMachineName?: StringType;
        StateMachineType?: StringType;
        Tags?: Tag[];
        TracingConfiguration?: TracingConfiguration;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents a CDK metadata resource used within AWS CloudFormation templates.
 */
export interface CDKMetadataResource extends CommonResource {
    Type: 'AWS::CDK::Metadata';
    Properties: {
        Analytics: string;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents the accelerate configuration of an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-accelerateconfiguration.html
 */
export interface AccelerateConfiguration {
    AccelerationStatus: StringType; // Enabled | Suspended
}

/**
 * Represents the destination settings used for data export and inventory in an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-destination.html
 */
export interface Destination {
    BucketAccountId?: StringType;
    BucketArn: StringType;
    Format: StringType;
    Prefix?: StringType;
}

/**
 * Represents the data export configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-dataexport.html
 */
export interface DataExport {
    Destination: Destination;
    OutputSchemaVersion: StringType;
}

/**
 * Represents the storage class analysis configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-storageclassanalysis.html
 */
export interface StorageClassAnalysis {
    DataExport: DataExport;
}

/**
 * Represents an analytics configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-analyticsconfiguration.html
 */
export interface AnalyticsConfiguration {
    Id: StringType;
    Prefix?: StringType;
    StorageClassAnalysis: StorageClassAnalysis;
    TagFilters?: Tag[];
}

/**
 * Represents the default server-side encryption settings for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-serversideencryptionbydefault.html
 */
export interface ServerSideEncryptionByDefault {
    KMSMasterKeyID?: StringType;
    SSEAlgorithm: StringType; // aws:kms | AES256 | aws:kms:dsse
}

/**
 * Represents a server-side encryption rule for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-serversideencryptionrule.html
 */
export interface ServerSideEncryptionRule {
    BucketKeyEnabled?: boolean;
    ServerSideEncryptionByDefault?: ServerSideEncryptionByDefault;
}

/**
 * Represents the bucket encryption configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-bucketencryption.html
 */
export interface BucketEncryption {
    ServerSideEncryptionConfiguration: ServerSideEncryptionRule[];
}

/**
 * Represents a CORS rule configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-corsrule.html
 */
export interface CorsRule {
    AllowedHeaders?: StringType[];
    AllowedMethods: StringType[]; // GET | PUT | HEAD | POST | DELETE
    AllowedOrigins: StringType[];
    ExposedHeaders?: StringType[];
    Id?: StringType;
    MaxAge?: number;
}

/**
 * Represents the overall CORS configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-corsconfiguration.html
 */
export interface CorsConfiguration {
    CorsRules: CorsRule[];
}

/**
 * Represents the tiering configuration used for intelligent tiering of S3 objects.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-tiering.html
 */
export interface Tiering {
    AccessTier: StringType;
    Days: number;
}

/**
 * Represents the intelligent tiering configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-intelligenttieringconfiguration.html
 */
export interface IntelligentTieringConfiguration {
    Id: StringType;
    Prefix?: StringType;
    Status: StringType;
    TagFilters?: Tag[];
    Tierings: Tiering[];
}

/**
 * Represents the inventory configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-inventoryconfiguration.html
 */
export interface InventoryConfiguration {
    Destination: Destination;
    Enabled: boolean;
    Id: StringType;
    IncludedObjectVersions?: StringType;
    OptionalFields?: StringType[];
    Prefix: StringType;
    ScheduleFrequency: StringType;
}

/**
 * Represents the configuration to abort incomplete multipart uploads for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-abortincompletemultipartupload.html
 */
export interface AbortIncompleteMultipartUpload {
    DaysAfterInitiation: number;
}

/**
 * Represents the noncurrent version expiration configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-noncurrentversionexpiration.html
 */
export interface NoncurrentVersionExpiration {
    NewerNoncurrentVersions?: number;
    NoncurrentDays: number;
}

/**
 * Represents the noncurrent version transition configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-noncurrentversiontransition.html
 */
export interface NoncurrentVersionTransition {
    NewerNoncurrentVersions?: number;
    StorageClass: StringType;
    TransitionInDays: number;
}

/**
 * Represents the transition configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-transition.html
 */
export interface Transition {
    StorageClass: StringType;
    TransitionDate?: StringType;
    TransitionInDays?: number;
}

/**
 * Represents a lifecycle rule for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-rule.html
 */
export interface S3Rule {
    AbortIncompleteMultipartUpload?: AbortIncompleteMultipartUpload;
    ExpirationDate?: StringType;
    ExpirationInDays?: number;
    ExpiredObjectDeleteMarker?: boolean;
    Id?: StringType;
    NoncurrentVersionExpiration?: NoncurrentVersionExpiration;
    NoncurrentVersionExpirationInDays?: number;
    NoncurrentVersionTransition?: NoncurrentVersionTransition;
    NoncurrentVersionTransitions?: NoncurrentVersionTransition[];
    ObjectSizeGreaterThan?: StringType;
    ObjectSizeLessThan?: StringType;
    Prefix?: StringType;
    Status: StringType;
    TagFilters?: Tag[];
    Transition?: Transition;
    Transitions?: Transition[];
}

/**
 * Represents the lifecycle configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-lifecycleconfiguration.html
 */
export interface LifecycleConfiguration {
    Rules: S3Rule[];
    TransitionDefaultMinimumObjectSize: StringType;
}

/**
 * Represents a partitioned prefix for object key formatting in an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-partitionedprefix.html
 */
export interface PartitionedPrefix {
    PartitionDateSource?: StringType;
}

/**
 * Represents the target object key format configuration for S3 bucket logging.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-targetobjectkeyformat.html
 */
export interface TargetObjectKeyFormat {
    PartitionedPrefix?: PartitionedPrefix;
    SimplePrefix?: StringKeyObject;
}

/**
 * Represents the logging configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-loggingconfiguration.html
 */
export interface S3LoggingConfiguration {
    DestinationBucketName?: StringType;
    LogFilePrefix?: StringType;
    TargetObjectKeyFormat?: TargetObjectKeyFormat;
}

/**
 * Represents the S3 Tables destination configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-s3tablesdestination.html
 */
export interface S3TablesDestination {
    TableArn?: StringType;
    TableBucketArn: StringType;
    TableName: StringType;
    TableNamespace?: StringType;
}

/**
 * Represents the metadata table configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-metadatatableconfiguration.html
 */
export interface MetadataTableConfiguration {
    S3TablesDestination: S3TablesDestination;
}

/**
 * Represents the metrics configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-metricsconfiguration.html
 */
export interface MetricsConfiguration {
    AccessPointArn?: StringType;
    Id: StringType;
    Prefix?: StringType;
    TagFilters?: Tag[];
}

/**
 * Represents the EventBridge configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-eventbridgeconfiguration.html
 */
export interface EventBridgeConfiguration {
    EventBridgeEnabled: boolean;
}

/**
 * Represents a filter rule for S3 key filtering.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-filterrule.html
 */
export interface FilterRule {
    Name: StringType;
    Value: StringType;
}

/**
 * Represents the S3 key filter configuration used for notifications.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-s3keyfilter.html
 */
export interface S3KeyFilter {
    Rules: FilterRule[];
}

/**
 * Represents the notification filter configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-notificationfilter.html
 */
export interface NotificationFilter {
    S3Key: S3KeyFilter;
}

/**
 * Represents a Lambda configuration for S3 bucket notifications.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-lambdaconfiguration.html
 */
export interface LambdaConfiguration {
    Event: StringType;
    Filter?: NotificationFilter;
    Function: StringType;
}

/**
 * Represents a queue configuration for S3 bucket notifications.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-queueconfiguration.html
 */
export interface QueueConfiguration {
    Event: StringType;
    Filter?: NotificationFilter;
    Queue: StringType;
}

/**
 * Represents a topic configuration for S3 bucket notifications.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-topicconfiguration.html
 */
export interface TopicConfiguration {
    Event: StringType;
    Filter?: NotificationFilter;
    Topic: StringType;
}

/**
 * Represents the notification configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-notificationconfiguration.html
 */
export interface NotificationConfiguration {
    EventBridgeConfiguration?: EventBridgeConfiguration;
    LambdaConfigurations?: LambdaConfiguration[];
    QueueConfigurations?: QueueConfiguration[];
    TopicConfigurations?: TopicConfiguration[];
}

/**
 * Represents the default retention settings for S3 Object Lock.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-defaultretention.html
 */
export interface DefaultRetention {
    Days?: number;
    Mode?: StringType;
    Years?: number;
}

/**
 * Represents the object lock rule for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-objectlockrule.html
 */
export interface ObjectLockRule {
    DefaultRetention?: DefaultRetention;
}

/**
 * Represents the object lock configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-objectlockconfiguration.html
 */
export interface ObjectLockConfiguration {
    ObjectLockEnabled: StringType;
    Rule?: ObjectLockRule;
}

/**
 * Represents an ownership controls rule for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-ownershipcontrolsrule.html
 */
export interface OwnershipControlsRule {
    ObjectOwnership?: StringType;
}

/**
 * Represents the ownership controls configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-ownershipcontrols.html
 */
export interface OwnershipControls {
    Rules: OwnershipControlsRule[];
}

/**
 * Represents the public access block configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-publicaccessblockconfiguration.html
 */
export interface PublicAccessBlockConfiguration {
    BlockPublicAcls?: boolean;
    BlockPublicPolicy?: boolean;
    IgnorePublicAcls?: boolean;
    RestrictPublicBuckets?: boolean;
}

/**
 * Represents the delete marker replication configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-deletemarkerreplication.html
 */
export interface DeleteMarkerReplication {
    Status?: StringType;
}

/**
 * Represents the access control translation configuration for S3 bucket replication.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-accesscontroltranslation.html
 */
export interface AccessControlTranslation {
    Owner: StringType;
}

/**
 * Represents the replication time value for S3 bucket replication.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-replicationtimevalue.html
 */
export interface ReplicationTimeValue {
    Minutes: number;
}

/**
 * Represents replication metrics for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-metrics.html
 */
export interface Metrics {
    EventThreshold?: ReplicationTimeValue;
    Status: StringType;
}

/**
 * Represents the replication time configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-replicationtime.html
 */
export interface ReplicationTime {
    Status: StringType;
    Time: ReplicationTimeValue;
}

/**
 * Represents the replication destination configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-replicationdestination.html
 */
export interface ReplicationDestination {
    AccessControlTranslation?: AccessControlTranslation;
    Account?: StringType;
    Bucket: StringType;
    EncryptionConfiguration?: {
        ReplicaKmsKeyID: StringType;
    };
    Metrics?: Metrics;
    ReplicationTime?: ReplicationTime;
    StorageClass?: StringType;
}

/**
 * Represents the 'and' operator used within a replication rule filter.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-replicationruleandoperator.html
 */
export interface ReplicationRuleAndOperator {
    Prefix?: StringType;
    TagFilters?: Tag[];
}

/**
 * Represents the replication rule filter for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-replicationrulefilter.html
 */
export interface ReplicationRuleFilter {
    And?: ReplicationRuleAndOperator;
    Prefix?: StringType;
    TagFilter?: Tag;
}

/**
 * Represents the replica modifications configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-replicamodifications.html
 */
export interface ReplicaModifications {
    Status: StringType;
}

/**
 * Represents the S3 SSE-KMS encrypted objects configuration for replication.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-ssekmsencryptedobjects.html
 */
export interface SseKmsEncryptedObjects {
    Status: StringType;
}

/**
 * Represents the source selection criteria for S3 bucket replication.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-sourceselectioncriteria.html
 */
export interface SourceSelectionCriteria {
    ReplicaModifications?: ReplicaModifications;
    SseKmsEncryptedObjects?: SseKmsEncryptedObjects;
}

/**
 * Represents a replication rule for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-replicationrule.html
 */
export interface ReplicationRule {
    DeleteMarkerReplication?: DeleteMarkerReplication;
    Destination: ReplicationDestination;
    Filter?: ReplicationRuleFilter;
    Id?: StringType;
    Prefix?: StringType;
    Priority?: number;
    SourceSelectionCriteria?: SourceSelectionCriteria;
    Status: StringType;
}

/**
 * Represents the replication configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-replicationconfiguration.html
 */
export interface ReplicationConfiguration {
    Role: StringType;
    Rules: ReplicationRule[];
}

/**
 * Represents the versioning configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-versioningconfiguration.html
 */
export interface VersioningConfiguration {
    Status: StringType;
}

/**
 * Represents the redirection of all requests for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-redirectallrequeststo.html
 */
export interface RedirectAllRequestsTo {
    HostName: StringType;
    Protocol?: StringType;
}

/**
 * Represents a redirection rule for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-redirectrule.html
 */
export interface RedirectRule {
    HostName?: StringType;
    HttpRedirectCode?: StringType;
    Protocol?: StringType;
    ReplaceKeyPrefixWith?: StringType;
    ReplaceKeyWith?: StringType;
}

/**
 * Represents the condition for a routing rule for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-routingrulecondition.html
 */
export interface RoutingRuleCondition {
    HttpErrorCodeReturnedEquals?: StringType;
    KeyPrefixEquals?: StringType;
}

/**
 * Represents a routing rule for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-routingrule.html
 */
export interface RoutingRule {
    RedirectRule: RedirectRule;
    RoutingRuleCondition?: RoutingRuleCondition;
}

/**
 * Represents the website configuration for an S3 bucket.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-websiteconfiguration.html
 */
export interface WebsiteConfiguration {
    ErrorDocument?: StringType;
    IndexDocument?: StringType;
    RedirectAllRequestsTo?: RedirectAllRequestsTo;
    RoutingRules?: RoutingRule[];
}

/**
 * Represents an AWS::S3::Bucket CloudFormation resource.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-s3-bucket.html
 */
export interface S3BucketResource extends CommonResource {
    Type: 'AWS::S3::Bucket';
    Properties: {
        AccelerateConfiguration?: AccelerateConfiguration;
        AccessControl?: StringType;
        AnalyticsConfigurations?: AnalyticsConfiguration[];
        BucketEncryption?: BucketEncryption;
        BucketName?: StringType;
        CorsConfiguration?: CorsConfiguration;
        IntelligentTieringConfigurations?: IntelligentTieringConfiguration[];
        InventoryConfigurations?: InventoryConfiguration[];
        LifecycleConfiguration?: LifecycleConfiguration;
        LoggingConfiguration?: S3LoggingConfiguration;
        MetadataTableConfiguration?: MetadataTableConfiguration;
        MetricsConfigurations?: MetricsConfiguration[];
        NotificationConfiguration?: NotificationConfiguration;
        ObjectLockConfiguration?: ObjectLockConfiguration;
        ObjectLockEnabled?: boolean;
        OwnershipControls?: OwnershipControls;
        PublicAccessBlockConfiguration?: PublicAccessBlockConfiguration;
        ReplicationConfiguration?: ReplicationConfiguration;
        Tags?: Tag[];
        VersioningConfiguration?: VersioningConfiguration;
        WebsiteConfiguration?: WebsiteConfiguration;
        [propertyName: string]: unknown;
    };

    [key: string]: unknown;
}

export interface ApiGatewayV2ApiBodyS3Location {
    Bucket?: StringType;
    Etag?: StringType;
    Key?: StringType;
    Version?: StringType;
}

export interface ApiGatewayV2ApiCors {
    AllowCredentials?: boolean;
    AllowHeaders?: StringType[];
    AllowMethods?: StringType[];
    AllowOrigins?: StringType[];
    ExposeHeaders?: StringType[];
    MaxAge?: number;
}

/**
 * Defines an API Gateway V2 API resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-api.html
 */
export interface ApiGatewayV2ApiResource extends CommonResource {
    Type: 'AWS::ApiGatewayV2::Api';
    Properties: {
        ApiKeySelectionExpression?: StringType;
        BasePath?: StringType;
        Body?: StringKeyObject;
        BodyS3Location?: ApiGatewayV2ApiBodyS3Location;
        CorsConfiguration?: ApiGatewayV2ApiCors;
        CredentialsArn?: StringType;
        Description?: StringType;
        DisableExecuteApiEndpoint?: boolean;
        DisableSchemaValidation?: boolean;
        FailOnWarnings?: boolean;
        Name?: StringType;
        ProtocolType?: StringType;
        RouteKey?: StringType;
        RouteSelectionExpression?: StringType;
        Tags?: ObjectOfStringTypes;
        Target?: StringType;
        Version?: StringType;
        [propertyName: string]: unknown;
    };
}

export interface ApiGatewayV2ApiGatewayManagedOverridesResourceIntegrationOverrides {
    Description?: StringType;
    IntegrationMethod?: StringType;
    PayloadFormatVersion?: StringType;
    TimeoutInMillis?: number;
}

export interface ApiGatewayV2ApiGatewayManagedOverridesResourceRouteOverrides {
    AuthorizationScopes?: StringType[];
    AuthorizationType?: StringType;
    AuthorizerId?: StringType;
    OperationName?: StringType;
    Target?: StringType;
}

export interface ApiGatewayV2ApiGatewayManagedOverridesResourceStageOverrides {
    AccessLogSettings?: {
        DestinationArn?: StringType;
        Format?: StringType;
    };
    AutoDeploy?: boolean;
    DefaultRouteSettings?: {
        DataTraceEnabled?: boolean;
        DetailedMetricsEnabled?: boolean;
        LoggingLevel?: StringType;
        ThrottlingBurstLimit?: number;
        ThrottlingRateLimit?: number;
    };
    Description?: StringType;
    RouteSettings?: StringKeyObject;
    StageVariables?: StringKeyObject;
}

/**
 * Defines an Api Gateway V2 Api Gateway Managed Overrides Resource
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-apigatewaymanagedoverrides.html
 */
export interface ApiGatewayV2ApiGatewayManagedOverridesResource extends CommonResource {
    Type: 'AWS::ApiGatewayV2::ApiGatewayManagedOverrides';
    Properties: {
        ApiId: StringType;
        Integration?: ApiGatewayV2ApiGatewayManagedOverridesResourceIntegrationOverrides;
        Route?: ApiGatewayV2ApiGatewayManagedOverridesResourceRouteOverrides;
        Stage?: ApiGatewayV2ApiGatewayManagedOverridesResourceStageOverrides;
        [propertyName: string]: unknown;
    };
}

/**
 * Defines an AWS ApiGatewayV2 ApiMapping
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-apimapping.html
 */
export interface ApiGatewayV2ApiMappingResource extends CommonResource {
    Type: 'AWS::ApiGatewayV2::ApiMapping';
    Properties: {
        ApiId: StringType;
        ApiMappingKey?: StringType;
        DomainName: StringType;
        Stage: StringType;
    };
}

/**
 * Defines an AWS ApiGatewayV2 DomainName
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-domainname.html
 */
export interface ApiGatewayV2DomainNameResource extends CommonResource {
    Type: 'AWS::ApiGatewayV2::DomainName';
    Properties: {
        ApiId: StringType;
        ApiMappingKey?: StringType;
        DomainName: StringType;
        Stage: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Defines an AWS ApiGatewayV2 Integration
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-integration.html
 */
export interface ApiGatewayV2IntegrationResource extends CommonResource {
    Type: 'AWS::ApiGatewayV2::Integration';
    Properties: {
        ApiId: StringType;
        ConnectionId?: StringType;
        ConnectionType?: StringType;
        ContentHandlingStrategy?: StringType;
        CredentialsArn?: StringType;
        Description?: StringType;
        IntegrationMethod?: StringType;
        IntegrationSubtype?: StringType;
        IntegrationType: StringType;
        IntegrationUri?: StringType;
        PassthroughBehavior?: StringType;
        PayloadFormatVersion?: StringType;
        RequestParameters?: ObjectOfStringTypes;
        RequestTemplates?: ObjectOfStringTypes;
        ResponseParameters?: ObjectOfStringTypes;
        TemplateSelectionExpression?: StringType;
        TimeoutInMillis?: number;
        TlsConfig?: {
            ServerNameToVerify?: StringType;
        };

        [propertyName: string]: unknown;
    };
}

/**
 * Defines an AWS ApiGatewayV2 IntegrationResponse
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-integrationresponse.html
 */
export interface ApiGatewayV2IntegrationResponseResource extends CommonResource {
    Type: 'AWS::ApiGatewayV2::IntegrationResponse';
    Properties: {
        ApiId: StringType;
        ContentHandlingStrategy?: StringType;
        IntegrationId: StringType;
        IntegrationResponseKey: StringType;
        ResponseParameters?: StringKeyObject;
        ResponseTemplates?: StringKeyObject;
        TemplateSelectionExpression?: StringType;

        [propertyName: string]: unknown;
    };
}

/**
 * Defines an AWS ApiGatewayV2 Route
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-route.html
 */
export interface ApiGatewayV2RouteResource extends CommonResource {
    Type: 'AWS::ApiGatewayV2::Route';
    Properties: {
        ApiId: StringType;
        ApiKeyRequired?: boolean;
        AuthorizationScopes?: StringType[];
        AuthorizationType?: StringType;
        AuthorizerId?: StringType;
        ModelSelectionExpression?: StringType;
        OperationName?: StringType;
        RequestModels?: StringKeyObject;
        RequestParameters?: StringKeyObject;
        RouteKey: StringType;
        RouteResponseSelectionExpression?: StringType;
        Target?: StringType;

        [propertyName: string]: unknown;
    };
}

/**
 * Defines an AWS ApiGatewayV2 RouteResponse
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-routeresponse.html
 */
export interface ApiGatewayV2RouteResponseResource extends CommonResource {
    Type: 'AWS::ApiGatewayV2::RouteResponse';
    Properties: {
        ApiId: StringType;
        ModelSelectionExpression?: StringType;
        ResponseModels?: StringKeyObject;
        ResponseParameters?: {
            Required: boolean;
        };
        RouteId: StringType;
        RouteResponseKey: StringType;

        [propertyName: string]: unknown;
    };
}

/**
 * Defines an AWS ApiGatewayV2 VpcLink
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-vpclink.html
 */
export interface ApiGatewayV2VpcLinkResource extends CommonResource {
    Type: 'AWS::ApiGatewayV2::VpcLink';
    Properties: {
        Name: StringType;
        SecurityGroupIds?: StringType[];
        SubnetIds: StringType[];
        Tags?: ObjectOfStringTypes;

        [propertyName: string]: unknown;
    };
}

/**
 * Represents the AWS CloudFormation resource for an Endpoint.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-events-endpoint.html
 */
export interface EventsEndpointResource extends CommonResource {
    Type: 'AWS::Events::Endpoint';
    Properties: {
        Description?: StringType;
        EventBuses: {
            EventBusArn: StringType;
        }[];
        Name?: StringType;
        ReplicationConfig?: EndpointReplicationConfig;
        RoleArn?: StringType;
        RoutingConfig: EndpointRoutingConfig;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents the routing configuration for an Endpoint resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-events-endpoint.html
 */
export interface EndpointRoutingConfig {
    FailoverConfig: EndpointFailoverConfig;

    [propertyName: string]: unknown;
}

/**
 * Represents the failover configuration for an Endpoint resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-events-endpoint.html
 */
export interface EndpointFailoverConfig {
    Primary: EndpointRoutingConfigPrimary;
    Secondary: EndpointRoutingConfigSecondary;

    [propertyName: string]: unknown;
}

export interface EndpointRoutingConfigPrimary {
    HealthCheck: StringType;
}

export interface EndpointRoutingConfigSecondary {
    Route: StringType;
}

/**
 * Represents the replication configuration for an Endpoint resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-events-endpoint.html
 */
export interface EndpointReplicationConfig {
    ReplicationDestination: EndpointReplicationConfigDestination[];

    [propertyName: string]: unknown;
}

/**
 * Represents a replication destination in the replication configuration.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-events-endpoint.html
 */
export interface EndpointReplicationConfigDestination {
    Region: StringType;
    EventBusName: StringType;

    [propertyName: string]: unknown;
}

/**
 * Represents the DeadLetter configuration for an EventBus resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-events-eventbus-deadletterconfig.html
 */
export interface EventBusResourceDeadLetterConfig {
    Arn?: StringType;
}

/**
 * Represents an API Gateway Account resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-account.html
 */
export interface ApiGatewayAccountResource extends CommonResource {
    Type: 'AWS::ApiGateway::Account';
    Properties: {
        CloudWatchRoleArn?: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an API Gateway ApiKey resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-apikey.html
 */
export interface ApiGatewayApiKeyResource extends CommonResource {
    Type: 'AWS::ApiGateway::ApiKey';
    Properties: {
        CustomerId?: StringType;
        Description?: StringType;
        Enabled?: boolean;
        GenerateDistinctId?: boolean;
        Name?: StringType;
        StageKeys?: ApiGatewayApiKeyStageKey[];
        Value?: StringType;
        Tags?: Tag[];
        [propertyName: string]: unknown;
    };
}

/**
 * Represents a StageKey for the API Gateway ApiKey resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigateway-apikey-stagekey.html
 */
export interface ApiGatewayApiKeyStageKey {
    RestApiId?: StringType;
    StageName?: StringType;

    [propertyName: string]: unknown;
}

/**
 * Represents an API Gateway BasePathMapping resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-basepathmapping.html
 */
export interface ApiGatewayBasePathMappingResource extends CommonResource {
    Type: 'AWS::ApiGateway::BasePathMapping';
    Properties: {
        BasePath?: StringType;
        DomainName: StringType;
        RestApiId?: StringType;
        Stage?: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an API Gateway BasePathMappingV2 resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-basepathmappingv2.html
 */
export interface ApiGatewayBasePathMappingV2Resource extends CommonResource {
    Type: 'AWS::ApiGateway::BasePathMappingV2';
    Properties: {
        BasePath?: StringType;
        DomainNameArn: StringType;
        RestApiId: StringType;
        Stage?: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an API Gateway ClientCertificate resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-clientcertificate.html
 */
export interface ApiGatewayClientCertificateResource extends CommonResource {
    Type: 'AWS::ApiGateway::ClientCertificate';
    Properties: {
        Description?: StringType;
        Tags?: Tag[];
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an API Gateway DocumentationPart resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-documentationpart.html
 */
export interface ApiGatewayDocumentationPartResource extends CommonResource {
    Type: 'AWS::ApiGateway::DocumentationPart';
    Properties: {
        Location: ApiGatewayDocumentationPartResourceLocation;
        Properties: StringType;
        RestApiId: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents the Location property for a DocumentationPart resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigateway-documentationpart-location.html
 */
export interface ApiGatewayDocumentationPartResourceLocation {
    Method?: StringType;
    Name?: StringType;
    Path?: StringType;
    StatusCode?: StringType;
    Type?: StringType;

    [propertyName: string]: unknown;
}

/**
 * Represents an API Gateway DocumentationVersion resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-documentationversion.html
 */
export interface ApiGatewayDocumentationVersionResource extends CommonResource {
    Type: 'AWS::ApiGateway::DocumentationVersion';
    Properties: {
        Description?: StringType;
        DocumentationVersion: StringType;
        RestApiId: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an API Gateway DomainName resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-domainname.html
 */
export interface ApiGatewayDomainNameResource extends CommonResource {
    Type: 'AWS::ApiGateway::DomainName';
    Properties: {
        CertificateArn?: StringType;
        DomainName?: StringType;
        EndpointConfiguration?: ApiGatewayDomainNameResourceEndpointConfiguration;
        MutualTlsAuthentication?: {
            TruststoreUri?: StringType;
            TruststoreVersion?: StringType;
        };
        OwnershipVerificationCertificateArn?: StringType;
        RegionalCertificateArn?: StringType;
        SecurityPolicy?: StringType;
        Tags?: Tag[];
        [propertyName: string]: unknown;
    };
}

/**
 * Represents the EndpointConfiguration property for a DomainName resource.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-domainname.html
 */
export interface ApiGatewayDomainNameResourceEndpointConfiguration {
    Types?: StringType[];

    [propertyName: string]: unknown;
}

/**
 * Represents an API Gateway DomainNameAccessAssociation resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-domainnameaccessassociation.html
 */
export interface ApiGatewayDomainNameAccessAssociationResource extends CommonResource {
    Type: 'AWS::ApiGateway::DomainNameAccessAssociation';
    Properties: {
        AccessAssociationSource: StringType;
        AccessAssociationSourceType: StringType;
        DomainNameArn: StringType;
        Tags?: Tag[];
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an API Gateway DomainNameV2 resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-domainnamev2.html
 */
export interface ApiGatewayDomainNameV2Resource extends CommonResource {
    Type: 'AWS::ApiGateway::DomainNameV2';
    Properties: {
        CertificateArn?: StringType;
        DomainName?: StringType;
        EndpointConfiguration?: ApiGatewayDomainNameResourceEndpointConfiguration;
        Policy?: StringKeyObject;
        SecurityPolicy?: StringType;
        Tags?: Tag[];
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an API Gateway GatewayResponse resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-gatewayresponse.html
 */
export interface ApiGatewayGatewayResponseResource extends CommonResource {
    Type: 'AWS::ApiGateway::GatewayResponse';
    Properties: {
        ResponseParameters?: ObjectOfStringTypes;
        ResponseTemplates?: ObjectOfStringTypes;
        ResponseType: StringType;
        RestApiId: StringType;
        StatusCode?: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an API Gateway UsagePlan resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-usageplan.html
 */
export interface ApiGatewayUsagePlanResource extends CommonResource {
    Type: 'AWS::ApiGateway::UsagePlan';
    Properties: {
        ApiStages?: ApiGatewayUsagePlanResourceApiStage[];
        Description?: StringType;
        Quota?: ApiGatewayUsagePlanResourceQuotaSettings;
        Tags?: Tag[];
        Throttle?: ApiGatewayUsagePlanResourceThrottleSettings;
        UsagePlanName?: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an ApiStage within a UsagePlan.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigateway-usageplan-apistage.html
 */
export interface ApiGatewayUsagePlanResourceApiStage {
    ApiId?: StringType;
    Stage?: StringType;
    Throttle?: ObjectOfStringTypes;

    [propertyName: string]: unknown;
}

/**
 * Represents the Quota settings for a UsagePlan.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigateway-usageplan-quota.html
 */
export interface ApiGatewayUsagePlanResourceQuotaSettings {
    Limit?: number;
    Offset?: number;
    Period?: StringType;

    [propertyName: string]: unknown;
}

/**
 * Represents the Throttle settings for a UsagePlan.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigateway-usageplan-throttle.html
 */
export interface ApiGatewayUsagePlanResourceThrottleSettings {
    BurstLimit?: number;
    RateLimit?: number;

    [propertyName: string]: unknown;
}

/**
 * Represents an API Gateway UsagePlanKey resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-usageplankey.html
 */
export interface ApiGatewayUsagePlanKeyResource extends CommonResource {
    Type: 'AWS::ApiGateway::UsagePlanKey';
    Properties: {
        KeyId: StringType;
        KeyType: StringType;
        UsagePlanId: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an API Gateway VpcLink resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-vpclink.html
 */
export interface ApiGatewayVpcLinkResource extends CommonResource {
    Type: 'AWS::ApiGateway::VpcLink';
    Properties: {
        Description?: StringType;
        Name: StringType;
        Tags?: Tag[];
        TargetArn: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an AWS Glue Job resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-glue-job.html
 */
export interface GlueJobResource extends CommonResource {
    Type: 'AWS::Glue::Job';
    Properties: {
        AllocatedCapacity?: number;
        Command: {
            Name?: StringType;
            PythonVersion?: StringType;
            Runtime?: StringType;
            ScriptLocation?: StringType;
        };
        Connections?: {
            Connections?: StringType[];
        };
        DefaultArguments?: StringKeyObject;
        Description?: StringType;
        ExecutionClass?: StringType;
        ExecutionProperty?: {
            MaxConcurrentRuns?: number;
        };
        GlueVersion?: StringType;
        JobMode?: StringType;
        JobRunQueuingEnabled?: boolean;
        LogUri?: StringType;
        MaintenanceWindow?: StringType;
        MaxCapacity?: number;
        MaxRetries?: number;
        Name?: StringType;
        NonOverridableArguments?: StringKeyObject;
        NotificationProperty?: {
            NotifyDelayAfter?: number;
        };
        NumberOfWorkers?: number;
        Role: StringType;
        SecurityConfiguration?: StringType;
        Tags?: Tag[];
        Timeout?: number;
        WorkerType?: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an AWS Glue Connection resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-glue-connection.html
 */
export interface GlueConnectionResource extends CommonResource {
    Type: 'AWS::Glue::Connection';
    Properties: {
        CatalogId: StringType;
        ConnectionInput: {
            AthenaProperties?: StringKeyObject;
            AuthenticationConfiguration?: {
                AuthenticationType: StringKeyObject;
                BasicAuthenticationCredentials?: {
                    Password?: StringKeyObject;
                    Username?: StringKeyObject;
                };
                CustomAuthenticationCredentials?: StringKeyObject;
                KmsKeyArn?: StringKeyObject;
                OAuth2Properties?: {
                    AuthorizationCodeProperties?: {
                        AuthorizationCode?: StringKeyObject;
                        RedirectUri?: StringKeyObject;
                    };
                    OAuth2ClientApplication?: {
                        AWSManagedClientApplicationReference?: StringKeyObject;
                        UserManagedClientApplicationClientId?: StringKeyObject;
                    };
                    OAuth2Credentials?: {
                        AccessToken?: StringKeyObject;
                        JwtToken?: StringKeyObject;
                        RefreshToken?: StringKeyObject;
                        UserManagedClientApplicationClientSecret?: StringKeyObject;
                    };
                    OAuth2GrantType?: StringKeyObject;
                    TokenUrl?: StringKeyObject;
                    TokenUrlParametersMap?: StringKeyObject;
                };
                SecretArn?: StringKeyObject;
            };
            ConnectionProperties?: StringKeyObject;
            ConnectionType: StringType;
            Description?: StringType;
            MatchCriteria?: StringType[];
            Name?: StringType;
            PhysicalConnectionRequirements?: {
                AvailabilityZone: StringKeyObject;
                SecurityGroupIdList: StringKeyObject[];
                SubnetId: StringKeyObject;
            };
            PythonProperties?: StringKeyObject;
            SparkProperties?: StringKeyObject;
            ValidateCredentials?: boolean;
            ValidateForComputeEnvironments?: StringType[];
        };

        [propertyName: string]: unknown;
    };
}

/**
 * Represents an AWS Glue Crawler resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-glue-crawler.html
 */
export interface GlueCrawlerResource extends CommonResource {
    Type: 'AWS::Glue::Crawler';
    Properties: {
        Classifiers?: StringType[];
        Configuration?: StringType;
        CrawlerSecurityConfiguration?: StringType;
        DatabaseName?: StringType;
        Description?: StringType;
        LakeFormationConfiguration?: {
            AccountId?: StringType;
            UseLakeFormationCredentials?: boolean;
        };
        Name?: StringType;
        RecrawlPolicy?: {
            RecrawlBehavior?: StringType;
        };
        Role: StringType;
        Schedule?: {
            ScheduleExpression?: StringType;
        };
        SchemaChangePolicy?: {
            DeleteBehavior?: StringType;
            UpdateBehavior?: StringType;
        };
        TablePrefix?: StringType;
        Tags?: Tag[];
        Targets: {
            CatalogTargets?: {
                ConnectionName?: StringType;
                DatabaseName?: StringType;
                DlqEventQueueArn?: StringType;
                EventQueueArn?: StringType;
                Tables?: StringType[];
            }[];
            DeltaTargets?: {
                ConnectionName?: StringType;
                CreateNativeDeltaTable?: boolean;
                DeltaTables?: StringType[];
                WriteManifest?: boolean;
            }[];
            DynamoDBTargets?: {
                Path?: StringType;
            }[];
            HudiTargets?: {
                ConnectionName?: StringType;
                Exclusions?: StringType[];
                MaximumTraversalDepth?: number;
                Paths?: StringType[];
            }[];
            IcebergTargets?: {
                ConnectionName?: StringType;
                Exclusions?: StringType[];
                MaximumTraversalDepth?: number;
                Paths?: StringType[];
            }[];
            JdbcTargets?: {
                ConnectionName?: StringType;
                EnableAdditionalMetadata?: StringType[];
                Exclusions?: StringType[];
                Path?: StringType;
            }[];
            MongoDBTargets?: {
                ConnectionName?: StringType;
                Path?: StringType;
            }[];
            S3Targets?: {
                ConnectionName?: StringType;
                DlqEventQueueArn?: StringType;
                EventQueueArn?: StringType;
                Exclusions?: StringType[];
                Path?: StringType;
                SampleSize?: number;
            }[];
        };
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an AWS Glue Database resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-glue-database.html
 */
export interface GlueDatabaseResource extends CommonResource {
    Type: 'AWS::Glue::Database';
    Properties: {
        CatalogId: StringType;
        DatabaseInput: {
            CreateTableDefaultPermissions?: {
                Permissions?: StringType[];
                Principal?: {
                    DataLakePrincipalIdentifier?: StringType;
                };
            }[];
            Description?: StringType;
            FederatedDatabase?: {
                ConnectionName?: StringType;
                Identifier?: StringType;
            };
            LocationUri?: StringType;
            Name?: StringType;
            Parameters?: StringKeyObject;
            TargetDatabase?: {
                CatalogId?: StringType;
                DatabaseName?: StringType;
                Region?: StringType;
            };
        };
        DatabaseName?: StringType;
        [propertyName: string]: unknown;
    };
}

/**
 * Represents an AWS Glue Trigger resource in CloudFormation.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-glue-trigger.html
 */
export interface GlueTriggerResource extends CommonResource {
    Type: 'AWS::Glue::Trigger';
    Properties: {
        Actions: {
            Arguments?: StringKeyObject;
            CrawlerName?: StringType;
            JobName?: StringType;
            NotificationProperty?: {
                NotifyDelayAfter?: number;
            };
            SecurityConfiguration?: StringType;
            Timeout?: number;
        }[];
        Description?: StringType;
        EventBatchingCondition?: {
            BatchSize: number;
            BatchWindow?: number;
        };
        Name?: StringType;
        Predicate?: {
            Conditions?: {
                CrawlerName?: StringType;
                CrawlState?: StringType;
                JobName?: StringType;
                LogicalOperator?: StringType;
                State?: StringType;
            }[];
            Logical?: StringType;
        };
        Schedule?: StringType;
        StartOnCreation?: boolean;
        Tags?: Tag[];
        Type: StringType;
        WorkflowName?: StringType;
        [propertyName: string]: unknown;
    };
}

export type CloudFormationResource =
    | ApiGatewayV2VpcLinkResource
    | ApiGatewayAccountResource
    | ApiGatewayApiKeyResource
    | ApiGatewayAuthorizerResource
    | ApiGatewayBasePathMappingResource
    | ApiGatewayBasePathMappingV2Resource
    | ApiGatewayClientCertificateResource
    | ApiGatewayDeploymentResource
    | ApiGatewayDocumentationPartResource
    | ApiGatewayDocumentationVersionResource
    | ApiGatewayDomainNameAccessAssociationResource
    | ApiGatewayDomainNameResource
    | ApiGatewayDomainNameV2Resource
    | ApiGatewayGatewayResponseResource
    | ApiGatewayMethodResource
    | ApiGatewayModelResource
    | ApiGatewayRequestValidatorResource
    | ApiGatewayResourceResource
    | ApiGatewayRestApiResource
    | ApiGatewayStageResource
    | ApiGatewayUsagePlanKeyResource
    | ApiGatewayUsagePlanResource
    | ApiGatewayV2ApiGatewayManagedOverridesResource
    | ApiGatewayV2ApiMappingResource
    | ApiGatewayV2ApiResource
    | ApiGatewayV2AuthorizerResource
    | ApiGatewayV2DeploymentResource
    | ApiGatewayV2DomainNameResource
    | ApiGatewayV2IntegrationResource
    | ApiGatewayV2IntegrationResponseResource
    | ApiGatewayV2ModelResource
    | ApiGatewayV2RouteResource
    | ApiGatewayV2RouteResponseResource
    | ApiGatewayV2StageResource
    | ApiGatewayVpcLinkResource
    | CDKMetadataResource
    | DynamoDBTableResource
    | ECSTaskDefinitionResource
    | EcsServiceResource
    | ElasticLoadBalancingV2ListenerRule
    | ElasticLoadBalancingV2TargetGroupResource
    | EventsApiDestinationResource
    | EventsArchiveResource
    | EventsConnectionResource
    | EventsEndpointResource
    | EventsEventBusPolicyResource
    | EventsEventBusResource
    | EventsRuleResource
    | IAMPolicyResource
    | IAMRoleResource
    | LambdaFunctionResource
    | LambdaPermissionResource
    | LogsLogGroupResource
    | PipesPipeResource
    | S3BucketResource
    | SNSSubscriptionResource
    | SNSTopicPolicyResource
    | SNSTopicResource
    | SQSQueueResource
    | StepFunctionsStateMachineResource
    | GlueJobResource
    | GlueConnectionResource
    | GlueCrawlerResource
    | GlueDatabaseResource
    | GlueTriggerResource
    | GenericResource;

export interface MappingsType {
    [mapName: string]: {
        [lev1key: string]: {
            [lev2key: string]: unknown;
        };
    };
}

/**
 * Represents an AWS CloudFormation template.
 *
 * This interface models the top-level structure of a CloudFormation template, including sections such as
 * the template format version, description, metadata, resources, parameters, rules, outputs, mappings,
 * conditions, and transform. For more details on each section, refer to the AWS CloudFormation documentation.
 *
 * @see [Template Format Version](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/format-version-structure.html)
 * @see [Template Description](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-description-structure.html)
 * @see [Metadata Section](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html)
 * @see [Resources Section](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resources-section-structure.html)
 * @see [Parameters Section](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html)
 * @see [Rules Section](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/rules-section-structure.html)
 * @see [Outputs Section](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/outputs-section-structure.html)
 * @see [Mappings Section](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/mappings-section-structure.html)
 * @see [Conditions Section](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/conditions-section-structure.html)
 * @see [Transform Section](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html)
 */
export interface CloudFormationTemplate {
    AWSTemplateFormatVersion?: string;
    Description?: string;
    Metadata?: unknown;
    Resources: { [resourceName: string]: CloudFormationResource };
    Parameters?: { [parameterName: string]: Parameter };
    Rules?: { [ruleName: string]: Rule };
    Outputs?: { [outputName: string]: unknown };
    Mappings?: MappingsType;
    Conditions?: { [conditionName: string]: ConditionExpression };
    Transform?: unknown;

    [key: string]: unknown;
}
