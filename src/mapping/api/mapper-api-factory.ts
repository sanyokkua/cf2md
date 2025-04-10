import { StringUtils, StringUtilsImpl } from '../../common';
import { ResourceMapperResolverImpl } from '../mapper/resource-mapper-resolver';
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
        const resourceMapperResolver: ResourceMapperResolver = new ResourceMapperResolverImpl(stringUtils, mapperUtils, integrationUtils);
        const cloudFormationModelFactory: CloudFormationModelFactory = new CloudFormationModelFactoryImpl();

        return new CloudFormationMapperFacade(mapperUtils, stringUtils, resourceMapperResolver, cloudFormationModelFactory);
    }
}

export const MapperInstanceProvider = new MapperProviderImpl();
