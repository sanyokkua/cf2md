import { MockIntegrationHandler } from '../../../../../src/mapping/mapper/resource/api-gateway/mock-integration-handler';
import { IntegrationV1Handler } from '../../../../../src/mapping/mapper/resource/api-gateway/types';
import { ApiGatewayEndpoint } from '../../../../../src/mapping/types/resources-model';
import { ApiGatewayMethodResource } from '../../../../../src/parsing/types/cloudformation-model';

describe('HttpIntegrationHandler', () => {
    let handler: IntegrationV1Handler;

    beforeEach(() => {
        handler = new MockIntegrationHandler();
    });

    describe('handle', () => {
        it('returns an empty object', () => {
            const validUri = 'arn:aws:apigateway:us-west-2:someIntegrationUri';

            const method: ApiGatewayMethodResource = {
                Type: 'AWS::ApiGateway::Method',
                Properties: {
                    Integration: { Uri: validUri },
                },
            } as ApiGatewayMethodResource;

            const result: Partial<ApiGatewayEndpoint> = handler.handle(method);

            expect(result).toEqual({});
        });
    });
});
