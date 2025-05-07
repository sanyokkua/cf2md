import { ApiGatewayEndpoint } from '../../../types/resources-model';
import { IntegrationV1Handler } from './types';

export class MockIntegrationHandler implements IntegrationV1Handler {
    handle(): Partial<ApiGatewayEndpoint> {
        return {};
    }
}
