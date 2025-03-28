import log from 'loglevel';
import { StringUtils, StringUtilsImpl } from '../../src/common';
import { ParserUtilsImpl } from '../../src/parsing/param/param-utils';
import { CfModelParserImpl } from '../../src/parsing/parser/cf-model-parser';
import { RandomUtilsImpl } from '../../src/parsing/random/random-utils';
import { IntrinsicResolverImpl } from '../../src/parsing/resolver/intrinsic-resolver';
import { ResourceIntrinsicResolverImpl } from '../../src/parsing/resolver/intrinsic-resource-resolver';
import { IntrinsicUtilsImpl } from '../../src/parsing/resolver/util/intrinsic-utils';
import { ResourceUtilsImpl } from '../../src/parsing/resolver/util/resource-utils';
import { ValueResolverImpl } from '../../src/parsing/resolver/value-resolver';
import { IntrinsicResolver, ResourceIntrinsicResolver } from '../../src/parsing/types/intrinsic-types';
import { ParserService, ParsingResult } from '../../src/parsing/types/parsing-types';
import { ValueResolver } from '../../src/parsing/types/resolving-types';
import { IntrinsicUtils, ParserUtils, RandomUtils, ResourceUtils } from '../../src/parsing/types/util-service-types';

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
    let stringUtils: StringUtils;
    let randomUtils: RandomUtils;
    let intrinsicUtils: IntrinsicUtils;
    let resourceUtils: ResourceUtils;
    let resourceIntrinsicResolver: ResourceIntrinsicResolver;
    let intrinsicResolver: IntrinsicResolver;
    let valueResolver: ValueResolver;
    let parserUtils: ParserUtils;
    let parser: ParserService;

    beforeEach(() => {
        stringUtils = new StringUtilsImpl();
        randomUtils = new RandomUtilsImpl();
        intrinsicUtils = new IntrinsicUtilsImpl();
        resourceUtils = new ResourceUtilsImpl(stringUtils, randomUtils);
        resourceIntrinsicResolver = new ResourceIntrinsicResolverImpl(resourceUtils);
        intrinsicResolver = new IntrinsicResolverImpl(intrinsicUtils, resourceIntrinsicResolver, stringUtils);
        valueResolver = new ValueResolverImpl(intrinsicUtils, intrinsicResolver);
        parserUtils = new ParserUtilsImpl(randomUtils);
        parser = new CfModelParserImpl(stringUtils, parserUtils, valueResolver, resourceUtils, resourceIntrinsicResolver);
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
