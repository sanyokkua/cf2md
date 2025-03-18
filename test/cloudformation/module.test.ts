import log from 'loglevel';
import { applyUserParameters, parseCloudFormationTemplate } from '../../src';
import * as dynamodbTemplate from '../testdata/dynamodb-lambda.json';
import * as ecsServiceTemplate from '../testdata/ecs-service.json';
import * as gatewayTemplate from '../testdata/gateway-lambda-eventbus-rules-sns.json';
import * as kinesisTemplate from '../testdata/kinesis-pipe-event-bus.json';
import * as ruleLambdaDlqTemplate from '../testdata/rule-lambda-dlq.json';
import * as twoDynamoDbTemplate from '../testdata/two-dynamo-db.json';

log.setLevel('silent');

describe('CloudFormation Template Evaluator', () => {
    const templateJson = JSON.stringify(ecsServiceTemplate);

    const userParameters = [
        { paramKey: 'AccountId', paramValue: '1234567890123' },
        { paramKey: 'NotificationARNs', paramValue: [''] },
        { paramKey: 'NoValue', paramValue: '' },
        { paramKey: 'Partition', paramValue: 'aws' },
        { paramKey: 'Region', paramValue: 'us-west-1' },
        { paramKey: 'StackId', paramValue: 'My-Test-StackId' },
        { paramKey: 'StackName', paramValue: 'My-Test' },
        { paramKey: 'URLSuffix', paramValue: 'urlsuffix' },
        { paramKey: 'AWS::NoValue', paramValue: 'AWS::NoValue' },
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
    ];

    describe('parseCloudFormationTemplate', () => {
        it('should parse the ECS Service template and return a valid parsing result', () => {
            // Arrange & Act
            const parsingResult = parseCloudFormationTemplate(templateJson);

            // Assert
            expect(parsingResult).toBeDefined();
            expect(parsingResult.hasErrors).toBe(false);
            expect(parsingResult.parsedTemplate).toBeDefined();
            expect(parsingResult.paramsToReview).toBeDefined();
        });
    });

    describe('applyUserParameters', () => {
        let parsingResult: ReturnType<typeof parseCloudFormationTemplate>;

        beforeEach(() => {
            // Arrange: Parse the template once before each test
            parsingResult = parseCloudFormationTemplate(templateJson);
        });

        it('should resolve the template with the provided user parameters', () => {
            // Act
            const resolvedTemplate = applyUserParameters(parsingResult, userParameters);

            // Assert
            expect(resolvedTemplate).toBeDefined();
            // Optionally, assert that the resolved template has some expected properties based on ecsServiceTemplate.
        });
    });
});

describe('CloudFormation Template Evaluator Service 2', () => {
    const templateJson = JSON.stringify(twoDynamoDbTemplate);

    const userParameters = [
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

    describe('parseCloudFormationTemplate', () => {
        it('should parse the ECS Service template and return a valid parsing result', () => {
            // Arrange & Act
            const parsingResult = parseCloudFormationTemplate(templateJson);

            // Assert
            expect(parsingResult).toBeDefined();
            expect(parsingResult.hasErrors).toBe(false);
            expect(parsingResult.parsedTemplate).toBeDefined();
            expect(parsingResult.paramsToReview).toBeDefined();
        });
    });

    describe('applyUserParameters', () => {
        let parsingResult: ReturnType<typeof parseCloudFormationTemplate>;

        beforeEach(() => {
            // Arrange: Parse the template once before each test
            parsingResult = parseCloudFormationTemplate(templateJson);
        });

        it('should resolve the template with the provided user parameters', () => {
            // Act
            const resolvedTemplate = applyUserParameters(parsingResult, userParameters);

            // Assert
            expect(resolvedTemplate).toBeDefined();
            // Optionally, assert that the resolved template has some expected properties based on ecsServiceTemplate.
        });
    });
});

describe('CloudFormation Template Evaluator Service 3', () => {
    const templateJson = JSON.stringify(ruleLambdaDlqTemplate);

    const userParameters = [
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

    describe('parseCloudFormationTemplate', () => {
        it('should parse the ECS Service template and return a valid parsing result', () => {
            // Arrange & Act
            const parsingResult = parseCloudFormationTemplate(templateJson);

            // Assert
            expect(parsingResult).toBeDefined();
            expect(parsingResult.hasErrors).toBe(false);
            expect(parsingResult.parsedTemplate).toBeDefined();
            expect(parsingResult.paramsToReview).toBeDefined();
        });
    });

    describe('applyUserParameters', () => {
        let parsingResult: ReturnType<typeof parseCloudFormationTemplate>;

        beforeEach(() => {
            // Arrange: Parse the template once before each test
            parsingResult = parseCloudFormationTemplate(templateJson);
        });

        it('should resolve the template with the provided user parameters', () => {
            // Act
            const resolvedTemplate = applyUserParameters(parsingResult, userParameters);

            // Assert
            expect(resolvedTemplate).toBeDefined();
            // Optionally, assert that the resolved template has some expected properties based on ecsServiceTemplate.
        });
    });
});

describe('CloudFormation Template Evaluator Service 4', () => {
    const templateJson = JSON.stringify(kinesisTemplate);

    const userParameters = [
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

    describe('parseCloudFormationTemplate', () => {
        it('should parse the ECS Service template and return a valid parsing result', () => {
            // Arrange & Act
            const parsingResult = parseCloudFormationTemplate(templateJson);

            // Assert
            expect(parsingResult).toBeDefined();
            expect(parsingResult.hasErrors).toBe(false);
            expect(parsingResult.parsedTemplate).toBeDefined();
            expect(parsingResult.paramsToReview).toBeDefined();
        });
    });

    describe('applyUserParameters', () => {
        let parsingResult: ReturnType<typeof parseCloudFormationTemplate>;

        beforeEach(() => {
            // Arrange: Parse the template once before each test
            parsingResult = parseCloudFormationTemplate(templateJson);
        });

        it('should resolve the template with the provided user parameters', () => {
            // Act
            const resolvedTemplate = applyUserParameters(parsingResult, userParameters);

            // Assert
            expect(resolvedTemplate).toBeDefined();
            // Optionally, assert that the resolved template has some expected properties based on ecsServiceTemplate.
        });
    });
});

describe('CloudFormation Template Evaluator Service 5', () => {
    const templateJson = JSON.stringify(dynamodbTemplate);

    const userParameters = [
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

    describe('parseCloudFormationTemplate', () => {
        it('should parse the ECS Service template and return a valid parsing result', () => {
            // Arrange & Act
            const parsingResult = parseCloudFormationTemplate(templateJson);

            // Assert
            expect(parsingResult).toBeDefined();
            expect(parsingResult.hasErrors).toBe(false);
            expect(parsingResult.parsedTemplate).toBeDefined();
            expect(parsingResult.paramsToReview).toBeDefined();
        });
    });

    describe('applyUserParameters', () => {
        let parsingResult: ReturnType<typeof parseCloudFormationTemplate>;

        beforeEach(() => {
            // Arrange: Parse the template once before each test
            parsingResult = parseCloudFormationTemplate(templateJson);
        });

        it('should resolve the template with the provided user parameters', () => {
            // Act
            const resolvedTemplate = applyUserParameters(parsingResult, userParameters);

            // Assert
            expect(resolvedTemplate).toBeDefined();
            // Optionally, assert that the resolved template has some expected properties based on ecsServiceTemplate.
        });
    });
});

describe('CloudFormation Template Evaluator Service 6', () => {
    const templateJson = JSON.stringify(gatewayTemplate);

    const userParameters = [
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

    describe('parseCloudFormationTemplate', () => {
        it('should parse the ECS Service template and return a valid parsing result', () => {
            // Arrange & Act
            const parsingResult = parseCloudFormationTemplate(templateJson);

            // Assert
            expect(parsingResult).toBeDefined();
            expect(parsingResult.hasErrors).toBe(false);
            expect(parsingResult.parsedTemplate).toBeDefined();
            expect(parsingResult.paramsToReview).toBeDefined();
        });
    });

    describe('applyUserParameters', () => {
        let parsingResult: ReturnType<typeof parseCloudFormationTemplate>;

        beforeEach(() => {
            // Arrange: Parse the template once before each test
            parsingResult = parseCloudFormationTemplate(templateJson);
        });

        it('should resolve the template with the provided user parameters', () => {
            // Act
            const resolvedTemplate = applyUserParameters(parsingResult, userParameters);

            // Assert
            expect(resolvedTemplate).toBeDefined();
            // Optionally, assert that the resolved template has some expected properties based on ecsServiceTemplate.
        });
    });
});
