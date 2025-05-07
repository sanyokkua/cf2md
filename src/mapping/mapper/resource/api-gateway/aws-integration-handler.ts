import { ApiGatewayMethodResource } from '../../../../parsing/types/cloudformation-model';
import { ApiGatewayEndpoint } from '../../../types/resources-model';
import { IntegrationUriUtils, MapperUtil } from '../../../types/utils-model';
import { IntegrationV1Handler } from './types';

export class AwsIntegrationHandler implements IntegrationV1Handler {
    constructor(
        private readonly integrationUriUtils: IntegrationUriUtils,
        private readonly mapperUtils: MapperUtil,
    ) {}

    handle(method: ApiGatewayMethodResource): Partial<ApiGatewayEndpoint> {
        const integrationUri = this.mapperUtils.extractStringOrJsonStringOrEmptyString(method.Properties.Integration?.Uri);
        if (!integrationUri) {
            return {};
        }

        const integrationUriArn = this.integrationUriUtils.parseIntegrationUri(integrationUri);
        return {
            integrationService: integrationUriArn.integrationService,
            integrationServiceRegion: integrationUriArn.integrationServiceRegion,
            integrationServiceSubdomain: integrationUriArn.integrationServiceSubdomain ?? '',
            integrationServiceActionType: integrationUriArn.integrationServiceActionType,
            integrationServiceAction: integrationUriArn.integrationServiceAction,
        };
    }
}
