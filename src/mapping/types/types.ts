import { DynamoDBModel } from './dynamodb/model';
import { EventBusModel } from './events/event-bus-model';
import { EventsRuleModel } from './events/rule-model';
import { LambdaFunctionModel } from './lambda/model';
import { BaseResource } from './resources-model';
import { S3BucketModel } from './s3/model';
import { SnsSubscriptionModel } from './sns/subscription-model';
import { SnsTopicModel } from './sns/topic-model';
import { SqsQueueModel } from './sqs/model';
import { StateMachineModel } from './step-function/model';

export type ResourceModel =
    | StateMachineModel
    | S3BucketModel
    | SqsQueueModel
    | SnsTopicModel
    | SnsSubscriptionModel
    | LambdaFunctionModel
    | EventBusModel
    | EventsRuleModel
    | DynamoDBModel
    | BaseResource;
