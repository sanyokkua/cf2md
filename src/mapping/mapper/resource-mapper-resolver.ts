import { StringUtils } from '../../common';
import { CfResourcesType, UserProvidedParam } from '../../parsing';
import { ResourceMapper, ResourceMapperResolver } from '../types/mapping-model';
import { MapperUtil } from '../types/utils-model';
import { ApiGatewayV1Mapper } from './resource/api-gateway/api-gateway-v1-mapper';
import { ApiGatewayV1EndpointMapper } from './resource/api-gateway/types';
import { DynamoDBMapper } from './resource/dynamodb-mapper';
import { EcsServiceModelMapper } from './resource/ecs-service-mapper';
import { TaskDefinitionModelMapper } from './resource/ecs-task-definition-mapper';
import { EventBusMapper } from './resource/events-eventbus-mapper';
import { EventsRuleMapper } from './resource/events-rule-mapper';
import { GenericResourceMapper } from './resource/generic-resource-mapper';
import { LambdaMapper } from './resource/lambda-mapper';
import { LogsLogGroupModelMapper } from './resource/logs-log-group-mapper';
import { PipesPipeModelMapper } from './resource/pipes-pipe-mapper';
import { S3BucketMapper } from './resource/s3-bucket-mapper';
import { SnsTopicMapper } from './resource/sns-topic-mapper';
import { SnsSubscriptionMapper } from './resource/sns-topic-subscription-mapper';
import { SqsMapper } from './resource/sqs-queue-mapper';
import { StepFunctionMapper } from './resource/stepfunctions-statemachine-mapper';

export class ResourceMapperResolverImpl implements ResourceMapperResolver {
    private readonly stub: ResourceMapper;
    private readonly cache: Record<string, ResourceMapper>;
    private readonly factories: Record<string, () => ResourceMapper>;

    constructor(
        private readonly mapperUtils: MapperUtil,
        private readonly apiGatewayV1EndpointMapper: ApiGatewayV1EndpointMapper,
        private readonly stringUtils: StringUtils,
        private readonly userParams: UserProvidedParam[],
    ) {
        this.stub = new GenericResourceMapper(this.mapperUtils);
        this.cache = {};
        this.factories = {};
        this.factories[CfResourcesType.AWS_Lambda_Function] = () => new LambdaMapper(this.mapperUtils);
        this.factories[CfResourcesType.AWS_ApiGateway_RestApi] = () => new ApiGatewayV1Mapper(this.apiGatewayV1EndpointMapper, this.mapperUtils);
        this.factories[CfResourcesType.AWS_DynamoDB_Table] = () => new DynamoDBMapper(this.mapperUtils);
        this.factories[CfResourcesType.AWS_Events_EventBus] = () => new EventBusMapper(this.mapperUtils);
        this.factories[CfResourcesType.AWS_Events_Rule] = () => new EventsRuleMapper(this.mapperUtils);
        this.factories[CfResourcesType.AWS_SNS_Topic] = () => new SnsTopicMapper(this.mapperUtils);
        this.factories[CfResourcesType.AWS_SNS_Subscription] = () => new SnsSubscriptionMapper(this.mapperUtils);
        this.factories[CfResourcesType.AWS_SQS_Queue] = () => new SqsMapper(this.mapperUtils);
        this.factories[CfResourcesType.AWS_S3_Bucket] = () => new S3BucketMapper(this.mapperUtils);
        this.factories[CfResourcesType.AWS_StepFunctions_StateMachine] = () =>
            new StepFunctionMapper(this.mapperUtils, this.stringUtils, this.userParams);
        this.factories[CfResourcesType.AWS_Logs_LogGroup] = () => new LogsLogGroupModelMapper(this.mapperUtils);
        this.factories[CfResourcesType.AWS_Pipes_Pipe] = () => new PipesPipeModelMapper(this.mapperUtils);
        this.factories[CfResourcesType.AWS_ECS_TaskDefinition] = () => new TaskDefinitionModelMapper(this.mapperUtils);
        this.factories[CfResourcesType.AWS_ECS_Service] = () => new EcsServiceModelMapper(this.mapperUtils);
    }

    getResourceMapper(resourceType: string): ResourceMapper {
        if (Object.keys(this.cache).includes(resourceType)) {
            const cachedIntrinsic = this.cache[resourceType];
            return cachedIntrinsic;
        }

        if (!Object.keys(this.factories).includes(resourceType)) {
            return this.stub;
        }

        const factory = this.factories[resourceType];
        const intrinsic = factory();
        this.cache[resourceType] = intrinsic;
        return intrinsic;
    }
}
