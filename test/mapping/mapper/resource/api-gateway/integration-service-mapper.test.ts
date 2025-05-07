import { StringUtilsImpl } from '../../../../../src/common';
import { IntegrationServiceMapperImpl } from '../../../../../src/mapping/mapper/resource/api-gateway/integration-service-mapper';
import { MapperUtilsImpl } from '../../../../../src/mapping/util/mapper-utils';

type TestCase = {
    service: string;
    action: string;
    template: string;
    expected: string;
};

const testCases: TestCase[] = [
    {
        service: 'lambda',
        action: '2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:MyFunction/invocations',
        template: '', // ignored for lambda
        expected: 'arn:aws:lambda:us-east-1:123456789012:function:MyFunction',
    },
    {
        service: 'lambda',
        action: 'functions/arn:aws:lambda:us-east-1:123456789012:function:MyFunction/invocations',
        template: '', // ignored for lambda
        expected: 'arn:aws:lambda:us-east-1:123456789012:function:MyFunction',
    },
    {
        service: 'lambda',
        action: 'arn:aws:lambda:us-east-1:123456789012:function:MyFunction/invocations',
        template: '', // ignored for lambda
        expected: 'arn:aws:lambda:us-east-1:123456789012:function:MyFunction',
    },
    {
        service: 'lambda',
        action: 'arn:aws:lambda:us-east-1:123456789012:function:MyFunction',
        template: '', // ignored for lambda
        expected: 'arn:aws:lambda:us-east-1:123456789012:function:MyFunction',
    },
    {
        service: 'lambda',
        action: 'MyFunction',
        template: '', // ignored for lambda
        expected: 'MyFunction',
    },
    {
        service: 'sqs',
        action: 'path',
        template: '{"QueueUrl": "https://test.sqs.com","MessageBody": "MsgBody"}',
        expected: 'https://test.sqs.com',
    },
    {
        service: 's3',
        action: 'action',
        template: '{"Bucket": "MyS3Bucket","Key":"event-001.json","Body":"body"}',
        expected: 'MyS3Bucket',
    },
    {
        service: 'dynamodb',
        action: 'action',
        template: '{"TableName":"TestTable","Key":{"id":{"S":"test"}}}',
        expected: 'TestTable',
    },
    {
        service: 'events',
        action: 'action',
        template: '{"Entries":[{"EventBusName":"MyEventBus","Source":"custom.api","DetailType":"API Event","Detail":"input.body"}]}',
        expected: 'MyEventBus',
    },
    {
        service: 'events',
        action: 'action',
        template:
            '{"Entries":[{"EventBusName":"MyEventBus","Source":"custom.api","DetailType":"API Event","Detail":"input.body"},{"EventBusName":"MyEventBus2","Source":"custom.api","DetailType":"API Event","Detail":"input.body"}]}',
        expected: '["MyEventBus","MyEventBus2"]',
    },
    {
        service: 'sns',
        action: 'action',
        template: '{"TopicArn":"MySnsTopic","Message": "input.body"}',
        expected: 'MySnsTopic',
    },
    {
        service: 'states',
        action: 'action',
        template: '{"stateMachineArn":"TestSF","input":"input.body"}',
        expected: 'TestSF',
    },
];

describe('IntegrationServiceMapperImpl', () => {
    let integrationServiceMapper: IntegrationServiceMapperImpl;

    beforeEach(() => {
        jest.resetAllMocks();
        const mapperUtilImpl = new MapperUtilsImpl();
        const stringUtilsImpl = new StringUtilsImpl();
        integrationServiceMapper = new IntegrationServiceMapperImpl(mapperUtilImpl, stringUtilsImpl);
    });

    describe.each(testCases)('mapServiceName', (templateCase) => {
        const { service, action, template, expected } = templateCase;

        it(`${service} - ${action}`, () => {
            const res = integrationServiceMapper.mapServiceName(template, service, action);
            expect(res).toEqual(expected);
        });
    });
});
