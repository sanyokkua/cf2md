import { IntegrationUriArn, IntegrationUriUtils } from '../../../src/mapping/types/utils-model';
import { IntegrationUriUtilsImpl } from '../../../src/mapping/util/integration-uri-utils';

type TestCase = {
    uri: string;
    exp: IntegrationUriArn;
};

const testCases: TestCase[] = [
    {
        uri: 'arn:aws:apigateway:us-west-2:s3:action/GetObject&Bucket={bucket}&Key={key}',
        exp: {
            integrationServiceRegion: 'us-west-2',
            integrationService: 's3',
            integrationServiceSubdomain: '',
            integrationServiceActionType: 'action',
            integrationServiceAction: 'GetObject&Bucket={bucket}&Key={key}',
        },
    },
    {
        uri: 'arn:aws:apigateway:us-west-2:s3:path/{bucket}/{key}',
        exp: {
            integrationServiceRegion: 'us-west-2',
            integrationService: 's3',
            integrationServiceSubdomain: '',
            integrationServiceActionType: 'path',
            integrationServiceAction: '{bucket}/{key}',
        },
    },
    {
        uri: 'arn:aws:apigateway:us-west-2:s3:path/my-bucket/my-object.txt',
        exp: {
            integrationServiceRegion: 'us-west-2',
            integrationService: 's3',
            integrationServiceSubdomain: '',
            integrationServiceActionType: 'path',
            integrationServiceAction: 'my-bucket/my-object.txt',
        },
    },
    {
        uri: 'arn:aws:apigateway:us-west-2:sqs:path/123456789012/MyQueue',
        exp: {
            integrationServiceRegion: 'us-west-2',
            integrationService: 'sqs',
            integrationServiceSubdomain: '',
            integrationServiceActionType: 'path',
            integrationServiceAction: '123456789012/MyQueue',
        },
    },
    {
        uri: 'arn:aws:apigateway:us-east-1:dynamodb.streams:action/ListStreams',
        exp: {
            integrationServiceRegion: 'us-east-1',
            integrationService: 'dynamodb',
            integrationServiceSubdomain: 'streams',
            integrationServiceActionType: 'action',
            integrationServiceAction: 'ListStreams',
        },
    },
    {
        uri: 'arn:aws:apigateway:eu-central-1:kinesis:action/PutRecord',
        exp: {
            integrationServiceRegion: 'eu-central-1',
            integrationService: 'kinesis',
            integrationServiceSubdomain: '',
            integrationServiceActionType: 'action',
            integrationServiceAction: 'PutRecord',
        },
    },
    {
        uri: 'arn:aws:apigateway:ap-southeast-2:logs:action/PutLogEvents',
        exp: {
            integrationServiceRegion: 'ap-southeast-2',
            integrationService: 'logs',
            integrationServiceSubdomain: '',
            integrationServiceActionType: 'action',
            integrationServiceAction: 'PutLogEvents',
        },
    },
    {
        uri: 'arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:MyFunction/invocations',
        exp: {
            integrationServiceRegion: 'us-east-1',
            integrationService: 'lambda',
            integrationServiceSubdomain: '',
            integrationServiceActionType: 'path',
            integrationServiceAction: '2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:MyFunction/invocations',
        },
    },
    {
        uri: 'arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-west-1:123456789012:function:my-function/invocations',
        exp: {
            integrationServiceRegion: 'us-east-1',
            integrationService: 'lambda',
            integrationServiceSubdomain: '',
            integrationServiceActionType: 'path',
            integrationServiceAction: '2015-03-31/functions/arn:aws:lambda:us-west-1:123456789012:function:my-function/invocations',
        },
    },
    {
        uri: 'arn:aws:apigateway:us-east-1:states:action/StartSyncExecution',
        exp: {
            integrationServiceRegion: 'us-east-1',
            integrationService: 'states',
            integrationServiceSubdomain: '',
            integrationServiceActionType: 'action',
            integrationServiceAction: 'StartSyncExecution',
        },
    },
    {
        uri: 'arn:aws:apigateway:us-east-1:states:action/StartExecution',
        exp: {
            integrationServiceRegion: 'us-east-1',
            integrationService: 'states',
            integrationServiceSubdomain: '',
            integrationServiceActionType: 'action',
            integrationServiceAction: 'StartExecution',
        },
    },
    {
        uri: 'arn:aws:apigateway:us-west-1:events:action/PutEvents',
        exp: {
            integrationServiceRegion: 'us-west-1',
            integrationService: 'events',
            integrationServiceSubdomain: '',
            integrationServiceActionType: 'action',
            integrationServiceAction: 'PutEvents',
        },
    },
    {
        uri: 'arn:aws:apigateway:us-west-1:dynamodb:action/PutItem',
        exp: {
            integrationServiceRegion: 'us-west-1',
            integrationService: 'dynamodb',
            integrationServiceSubdomain: '',
            integrationServiceActionType: 'action',
            integrationServiceAction: 'PutItem',
        },
    },
];

describe('integration-uri-utils', () => {
    let utils: IntegrationUriUtils;

    beforeEach(() => {
        utils = new IntegrationUriUtilsImpl();
    });

    describe('isValidIntegrationUri', () => {
        it('returns true for valid integration uri', () => {
            utils.isValidIntegrationUri('arn:aws:apigateway:us-west-2:s3:action/GetObject&Bucket={bucket}&Key={key}');
        });

        const uriList: string[] = ['', 'arn', 'test', 'arn:aws:apigateway', 'arn:apigateway:us-west-2:s3:action/GetObject&Bucket={bucket}&Key={key}'];
        describe.each(uriList)('isValidIntegrationUri', (uri) => {
            it(`returns false for invalid integration ${uri}`, () => {
                expect(utils.isValidIntegrationUri(uri)).toBeFalsy();
            });
        });
    });

    describe.each(testCases)('parseIntegrationUri', (testCase) => {
        const { uri, exp } = testCase;

        it(`should parse ${uri}`, () => {
            // Act
            const result = utils.parseIntegrationUri(uri);

            // Assert
            expect(result).toBeDefined();
            expect(result).toStrictEqual(exp);
        });
    });

    it('returns throw Error', () => {
        expect(() => utils.parseIntegrationUri('')).toThrow();
    });
});
