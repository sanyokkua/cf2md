import { ApiGatewayMethodResource } from '../../../../parsing/types/cloudformation-model';
import { ApiGatewayEndpoint } from '../../../types/resources-model';
import { MapperUtil } from '../../../types/utils-model';
import { IntegrationV1Handler } from './types';

export class HttpIntegrationHandler implements IntegrationV1Handler {
    constructor(private readonly mapperUtils: MapperUtil) {}

    handle(method: ApiGatewayMethodResource): Partial<ApiGatewayEndpoint> {
        const integrationUri = this.mapperUtils.extractStringOrJsonStringOrEmptyString(method.Properties.Integration?.Uri);
        return { integrationServiceAction: integrationUri };
    }
}
