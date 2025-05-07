import { HttpIntegrationHandler } from '../../../../../src/mapping/mapper/resource/api-gateway/http-integration-handler';
import { ApiGatewayEndpoint } from '../../../../../src/mapping/types/resources-model';
import { MapperUtil } from '../../../../../src/mapping/types/utils-model';
import { ApiGatewayMethodResource } from '../../../../../src/parsing/types/cloudformation-model';

describe('HttpIntegrationHandler', () => {
    let mapperUtilsMock: jest.Mocked<MapperUtil>;
    let handler: HttpIntegrationHandler;

    beforeEach(() => {
        mapperUtilsMock = {
            extractStringOrJsonStringOrEmptyString: jest.fn(),
            extractString: jest.fn(),
            extractStringOrDefault: jest.fn(),
            extractStringOrDefaultFromMap: jest.fn(),
        };
        handler = new HttpIntegrationHandler(mapperUtilsMock);
    });

    describe('handle', () => {
        it('returns an object with integrationServiceAction set to the extracted URI when a valid URI is provided', () => {
            const validUri = 'arn:aws:apigateway:us-west-2:someIntegrationUri';
            mapperUtilsMock.extractStringOrJsonStringOrEmptyString.mockReturnValue(validUri);

            const method: ApiGatewayMethodResource = {
                Type: 'AWS::ApiGateway::Method',
                Properties: {
                    Integration: { Uri: validUri },
                },
            } as ApiGatewayMethodResource;

            const result: Partial<ApiGatewayEndpoint> = handler.handle(method);

            expect(result).toEqual({ integrationServiceAction: validUri });
            expect(mapperUtilsMock.extractStringOrJsonStringOrEmptyString).toHaveBeenCalledWith(method.Properties.Integration?.Uri);
        });

        it('returns an object with integrationServiceAction set to an empty string when the extracted URI is empty', () => {
            mapperUtilsMock.extractStringOrJsonStringOrEmptyString.mockReturnValue('');

            const method: ApiGatewayMethodResource = {
                Type: 'AWS::ApiGateway::Method',
                Properties: {
                    Integration: { Uri: 'not-important' },
                },
            } as ApiGatewayMethodResource;

            const result: Partial<ApiGatewayEndpoint> = handler.handle(method);

            expect(result).toEqual({ integrationServiceAction: '' });
            expect(mapperUtilsMock.extractStringOrJsonStringOrEmptyString).toHaveBeenCalledWith(method.Properties.Integration?.Uri);
        });

        it('returns an object with integrationServiceAction set to an empty string when the Integration property is missing', () => {
            mapperUtilsMock.extractStringOrJsonStringOrEmptyString.mockReturnValue('');

            const method: ApiGatewayMethodResource = {
                Type: 'AWS::ApiGateway::Method',
                Properties: {},
            } as ApiGatewayMethodResource;

            const result: Partial<ApiGatewayEndpoint> = handler.handle(method);

            expect(result).toEqual({ integrationServiceAction: '' });
            expect(mapperUtilsMock.extractStringOrJsonStringOrEmptyString).toHaveBeenCalledWith(undefined);
        });
    });
});
