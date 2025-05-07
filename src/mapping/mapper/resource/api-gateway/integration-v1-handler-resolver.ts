import { IntegrationUriUtils, MapperUtil } from '../../../types/utils-model';
import { AwsIntegrationHandler } from './aws-integration-handler';
import { HttpIntegrationHandler } from './http-integration-handler';
import { MockIntegrationHandler } from './mock-integration-handler';
import { IntegrationV1Handler, IntegrationV1HandlerResolver } from './types';

export class IntegrationV1HandlerResolverImpl implements IntegrationV1HandlerResolver {
    private readonly handlers: Record<string, IntegrationV1Handler>;

    constructor(
        private readonly integrationUriUtils: IntegrationUriUtils,
        private readonly mapperUtils: MapperUtil,
    ) {
        this.handlers = {
            MOCK: new MockIntegrationHandler(),
            AWS: new AwsIntegrationHandler(this.integrationUriUtils, this.mapperUtils),
            AWS_PROXY: new AwsIntegrationHandler(this.integrationUriUtils, this.mapperUtils),
            HTTP: new HttpIntegrationHandler(this.mapperUtils),
            HTTP_PROXY: new HttpIntegrationHandler(this.mapperUtils),
        };
    }

    getHandler(integrationType: string): IntegrationV1Handler {
        if (!Object.keys(this.handlers).includes(integrationType)) {
            return this.handlers.MOCK;
        }
        return this.handlers[integrationType];
    }
}
