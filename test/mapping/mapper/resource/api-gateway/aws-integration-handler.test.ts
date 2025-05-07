import { AwsIntegrationHandler } from '../../../../../src/mapping/mapper/resource/api-gateway/aws-integration-handler';
import { IntegrationUriArn, IntegrationUriUtils, MapperUtil } from '../../../../../src/mapping/types/utils-model';
import { ApiGatewayMethodResource } from '../../../../../src/parsing/types/cloudformation-model';

describe('AwsIntegrationHandler', () => {
    let integrationUriUtilsMock: jest.Mocked<IntegrationUriUtils>;
    let mapperUtilsMock: jest.Mocked<MapperUtil>;
    let awsIntegrationHandler: AwsIntegrationHandler;

    beforeEach(() => {
        integrationUriUtilsMock = {
            parseIntegrationUri: jest.fn(),
            isValidIntegrationUri: jest.fn(),
        };
        mapperUtilsMock = {
            extractStringOrJsonStringOrEmptyString: jest.fn(),
            extractString: jest.fn(),
            extractStringOrDefault: jest.fn(),
            extractStringOrDefaultFromMap: jest.fn(),
        };
        awsIntegrationHandler = new AwsIntegrationHandler(integrationUriUtilsMock, mapperUtilsMock);
    });

    describe('handle', () => {
        it('returns an empty object when the extracted integration URI is empty', () => {
            mapperUtilsMock.extractStringOrJsonStringOrEmptyString.mockReturnValue('');

            const method: ApiGatewayMethodResource = {
                Type: 'AWS::ApiGateway::Method',
                Properties: {
                    Integration: { Uri: 'some-value' },
                },
            } as ApiGatewayMethodResource;

            const result = awsIntegrationHandler.handle(method);
            expect(result).toEqual({});

            expect(mapperUtilsMock.extractStringOrJsonStringOrEmptyString).toHaveBeenCalledWith(method.Properties.Integration?.Uri);
        });

        it('processes and returns endpoint data for a valid integration URI', () => {
            const validUri = 'arn:aws:apigateway:us-west-2:s3:action/GetObject';

            const parsedArn = {
                integrationServiceRegion: 'us-west-2',
                integrationService: 's3',
                integrationServiceActionType: 'action',
                integrationServiceAction: 'GetObject',
            } as IntegrationUriArn;

            mapperUtilsMock.extractStringOrJsonStringOrEmptyString.mockReturnValue(validUri);
            integrationUriUtilsMock.parseIntegrationUri.mockReturnValue(parsedArn);

            const method: ApiGatewayMethodResource = {
                Type: 'AWS::ApiGateway::Method',
                Properties: {
                    Integration: { Uri: validUri },
                },
            } as ApiGatewayMethodResource;

            const result = awsIntegrationHandler.handle(method);

            expect(result).toEqual({
                integrationService: parsedArn.integrationService,
                integrationServiceRegion: parsedArn.integrationServiceRegion,
                integrationServiceSubdomain: '',
                integrationServiceActionType: parsedArn.integrationServiceActionType,
                integrationServiceAction: parsedArn.integrationServiceAction,
            });
            expect(mapperUtilsMock.extractStringOrJsonStringOrEmptyString).toHaveBeenCalledWith(method.Properties.Integration?.Uri);
            expect(integrationUriUtilsMock.parseIntegrationUri).toHaveBeenCalledWith(validUri);
        });

        it('returns an empty object if the Integration property is missing', () => {
            mapperUtilsMock.extractStringOrJsonStringOrEmptyString.mockReturnValue('');

            const method: ApiGatewayMethodResource = {
                Type: 'AWS::ApiGateway::Method',
                Properties: {},
            } as ApiGatewayMethodResource;

            const result = awsIntegrationHandler.handle(method);
            expect(result).toEqual({});
            expect(mapperUtilsMock.extractStringOrJsonStringOrEmptyString).toHaveBeenCalledWith(undefined);
        });
    });
});
