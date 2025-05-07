import { StringUtils, StringUtilsImpl } from '../../common';
import { ResourceMapperResolverImpl } from '../mapper/resource-mapper-resolver';
import { ApiGatewayV1EndpointMapperImpl } from '../mapper/resource/api-gateway/api-gateway-v1-endpoint-mapper';
import { IntegrationServiceMapperImpl } from '../mapper/resource/api-gateway/integration-service-mapper';
import { IntegrationV1HandlerResolverImpl } from '../mapper/resource/api-gateway/integration-v1-handler-resolver';
import { IntegrationV1HandlerResolver } from '../mapper/resource/api-gateway/types';
import { CloudFormationModelFactoryImpl } from '../model/cloudformation-model-factory';
import { CloudFormationModelFactory } from '../types/cloudformation-model';
import { Mapper, MapperProvider } from '../types/mapper-api';
import { ResourceMapperResolver } from '../types/mapping-model';
import { IntegrationUriUtils, MapperUtil } from '../types/utils-model';
import { IntegrationUriUtilsImpl } from '../util/integration-uri-utils';
import { MapperUtilsImpl } from '../util/mapper-utils';
import { CloudFormationMapperFacade } from './cloud-formation-mapper-facade';

export class MapperProviderImpl implements MapperProvider {
    createMapper(): Mapper {
        const mapperUtils: MapperUtil = new MapperUtilsImpl();
        const stringUtils: StringUtils = new StringUtilsImpl();
        const integrationUtils: IntegrationUriUtils = new IntegrationUriUtilsImpl();
        const integrationV1HandlerResolver: IntegrationV1HandlerResolver = new IntegrationV1HandlerResolverImpl(integrationUtils, mapperUtils);
        const integrationServiceMapper = new IntegrationServiceMapperImpl(mapperUtils, stringUtils);
        const apiv1EndpointMapper = new ApiGatewayV1EndpointMapperImpl(
            mapperUtils,
            stringUtils,
            integrationV1HandlerResolver,
            integrationServiceMapper,
        );
        const resourceMapperResolver: ResourceMapperResolver = new ResourceMapperResolverImpl(mapperUtils, apiv1EndpointMapper);
        const cloudFormationModelFactory: CloudFormationModelFactory = new CloudFormationModelFactoryImpl();

        return new CloudFormationMapperFacade(mapperUtils, stringUtils, resourceMapperResolver, cloudFormationModelFactory);
    }
}

export const MapperInstanceProvider = new MapperProviderImpl();
