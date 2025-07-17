import { ApiGatewayEndpoint } from '../../../types/api-gateway/model';
import { IntegrationV1Handler } from './types';

export class MockIntegrationHandler implements IntegrationV1Handler {
    handle(): Partial<ApiGatewayEndpoint> {
        return {};
    }
}
