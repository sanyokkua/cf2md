import log from 'loglevel';
import { ParserService, ParsingResult } from '../../src';

import { ParserServiceInstanceProvider } from '../../src';
import * as dynamodbTemplate from '../testdata/dynamodb-lambda.json';
import * as ecsServiceTemplate from '../testdata/ecs-service.json';
import * as gatewayTemplate from '../testdata/gateway-lambda-eventbus-rules-sns.json';
import * as kinesisTemplate from '../testdata/kinesis-pipe-event-bus.json';
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
];

describe('Parsing Module Integration Tests', () => {
    let parser: ParserService;

    beforeEach(() => {
        parser = ParserServiceInstanceProvider.createParserService();
    });

    describe.each(templateCases)('%s Template Evaluator', (templateCase) => {
        const { name, template, userParameters } = templateCase;
        // Convert the template object to a JSON string for parsing
        const templateJson = JSON.stringify(template);
        let parsingResult: ParsingResult;

        describe('parseCloudFormationTemplate', () => {
            it(`should successfully parse the ${name} without errors`, () => {
                // Act
                const result = parser.parseTemplateJsonString(templateJson);

                // Assert
                expect(result).toBeDefined();
                expect(result.hasErrors).toBe(false);
                expect(result.parsedTemplate).toBeDefined();
                expect(result.paramsToReview).toBeDefined();
            });
        });

        describe('resolveValuesInTemplate', () => {
            beforeAll(() => {
                // Arrange: parse the template once for all tests in this block
                parsingResult = parser.parseTemplateJsonString(templateJson);
            });

            it(`should resolve the ${name} with the provided user parameters`, () => {
                // Act
                const resolvedTemplate = parser.resolveValuesInTemplate(parsingResult, userParameters);
                // Assert
                expect(resolvedTemplate).toBeDefined();
            });

            it(`should assign non-empty _id and _arn values for each resource in ${name}`, () => {
                // Act
                const resolvedTemplate = parser.resolveValuesInTemplate(parsingResult, userParameters);

                // Assert
                expect(resolvedTemplate).toBeDefined();
                expect(resolvedTemplate.Resources).toBeDefined();
                const resourceKeys = Object.keys(resolvedTemplate.Resources);
                expect(resourceKeys.length).toBeGreaterThanOrEqual(1);

                resourceKeys.forEach((resourceKey) => {
                    const resource = resolvedTemplate.Resources[resourceKey];
                    expect(resource._id).toBeDefined();
                    expect(typeof resource._id).toBe('string');
                    expect(resource._id!.length).toBeGreaterThan(0);

                    expect(resource._arn).toBeDefined();
                    expect(typeof resource._arn).toBe('string');
                    expect(resource._arn!.length).toBeGreaterThan(0);
                });
            });
        });
    });
});
