import log from 'loglevel';
import { Mapper, MapperInstanceProvider, ParserService, ParserServiceInstanceProvider } from '../../src';
import * as aiGen1 from '../testdata/ai-gen-1.json';
import * as dynamodbTemplate from '../testdata/dynamodb-lambda.json';
import * as ecsServiceTemplate from '../testdata/ecs-service.json';
import * as gatewayTemplate from '../testdata/gateway-lambda-eventbus-rules-sns.json';
import * as kinesisTemplate from '../testdata/kinesis-pipe-event-bus.json';
import * as offLambdaEx1 from '../testdata/off-lambda-ex-1.json';
import * as offLambdaEx2 from '../testdata/off-lambda-ex-2.json';
import * as ruleLambdaDlqTemplate from '../testdata/rule-lambda-dlq.json';
import * as twoDynamoDbTemplate from '../testdata/two-dynamo-db.json';

log.setLevel('silent');

type TemplateCase = {
    name: string;
    template: any;
    userParameters: Array<{ paramKey: string; paramValue: any }>;
};

// Define the common parameter set used by most templates
const commonUserParameters = [
    { paramKey: 'AccountId', paramValue: '1234567890123' },
    { paramKey: 'NotificationARNs', paramValue: [''] },
    { paramKey: 'NoValue', paramValue: '' },
    { paramKey: 'Partition', paramValue: 'aws' },
    { paramKey: 'Region', paramValue: 'us-west-1' },
    { paramKey: 'StackId', paramValue: 'My-Test-StackId' },
    { paramKey: 'StackName', paramValue: 'My-Test' },
    { paramKey: 'URLSuffix', paramValue: 'urlsuffix' },
    { paramKey: 'AWS::NoValue', paramValue: 'AWS::NoValue' },
];

// Define the test cases
const templateCases: TemplateCase[] = [
    {
        name: 'ecsServiceTemplate',
        template: ecsServiceTemplate,
        userParameters: [
            ...commonUserParameters,
            { paramKey: 'EcrAccountId', paramValue: 'EcrAccountId' },
            { paramKey: 'DemoDynAgent', paramValue: 'DemoDynAgent' },
            { paramKey: 'DemoDynAgentVersion', paramValue: 'DemoDynAgentVersion' },
            { paramKey: 'DemoDynTier', paramValue: 'DemoDynTier' },
            { paramKey: 'DemoSSLCertificateArn', paramValue: 'DemoSSLCertificateArn' },
            { paramKey: 'BaseStackName', paramValue: 'BaseStackName' },
            { paramKey: 'SharedSecurityGroupStackName', paramValue: 'SharedSecurityGroupStackName' },
            { paramKey: 'SharedIamRoleStackName', paramValue: 'SharedIamRoleStackName' },
            { paramKey: 'ApisVpcCidrIp', paramValue: 'ApisVpcCidrIp' },
            { paramKey: 'EnterpriseServicesVpcCidrIp', paramValue: 'EnterpriseServicesVpcCidrIp' },
            { paramKey: 'DockerRepoName', paramValue: 'DockerRepoName' },
            { paramKey: 'EnvironmentTag', paramValue: 'dev' },
            { paramKey: 'EnvTagCompliance', paramValue: 'EnvTagCompliance' },
            { paramKey: 'DemoServiceCustomTemplate', paramValue: 'DemoServiceCustomTemplate' },
            { paramKey: 'DemoServiceTemplate', paramValue: 'DemoServiceTemplate' },
        ],
    },
    {
        name: 'twoDynamoDbTemplate',
        template: twoDynamoDbTemplate,
        userParameters: commonUserParameters,
    },
    {
        name: 'ruleLambdaDlqTemplate',
        template: ruleLambdaDlqTemplate,
        userParameters: commonUserParameters,
    },
    {
        name: 'kinesisTemplate',
        template: kinesisTemplate,
        userParameters: commonUserParameters,
    },
    {
        name: 'dynamodbTemplate',
        template: dynamodbTemplate,
        userParameters: commonUserParameters,
    },
    {
        name: 'gatewayTemplate',
        template: gatewayTemplate,
        userParameters: commonUserParameters,
    },
    {
        name: 'offLambdaEx1',
        template: offLambdaEx1,
        userParameters: commonUserParameters,
    },
    {
        name: 'offLambdaEx2',
        template: offLambdaEx2,
        userParameters: commonUserParameters,
    },
    {
        name: 'aiGen1',
        template: aiGen1,
        userParameters: commonUserParameters,
    },
];

describe('Parsing Module Integration Tests', () => {
    let parser: ParserService;
    let mapper: Mapper;

    beforeEach(() => {
        parser = ParserServiceInstanceProvider.createParserService();
        mapper = MapperInstanceProvider.createMapper();
    });

    describe.each(templateCases)('%s Template Evaluator', (templateCase) => {
        const { name, template, userParameters } = templateCase;
        // Convert the template object to a JSON string for parsing
        const templateJson = JSON.stringify(template);

        describe('parseCloudFormationTemplate', () => {
            it(`should successfully parse the ${name} without errors`, () => {
                // Act
                const result = parser.parseTemplateJsonString(templateJson);

                // Assert
                expect(result).toBeDefined();
                expect(result.hasErrors).toBe(false);
                expect(result.parsedTemplate).toBeDefined();
                expect(result.paramsToReview).toBeDefined();

                const resolvedTemplate = parser.resolveValuesInTemplate(result, userParameters);
                expect(resolvedTemplate).toBeDefined();

                const cloudFormationModel = mapper.mapTemplate(resolvedTemplate);
                expect(cloudFormationModel).toBeDefined();
            });
        });
    });
});
