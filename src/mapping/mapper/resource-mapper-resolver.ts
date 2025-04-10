import { StringUtils } from '../../common';
import { CfResourcesType } from '../../parsing';
import { ResourceMapper, ResourceMapperResolver } from '../types/mapping-model';
import { IntegrationUriUtils, MapperUtil } from '../types/utils-model';
import { ApiGatewayV1Mapper } from './resource/api-gateway-v1-mapper';
import { GenericResourceMapper } from './resource/generic-resource-mapper';
import { LambdaMapper } from './resource/lambda-mapper';

export class ResourceMapperResolverImpl implements ResourceMapperResolver {
    private readonly stub: ResourceMapper;
    private readonly cache: Record<string, ResourceMapper>;
    private readonly factories: Record<string, () => ResourceMapper>;

    constructor(
        private readonly stringUtils: StringUtils,
        private readonly mapperUtils: MapperUtil,
        private readonly integrationUriUtils: IntegrationUriUtils,
    ) {
        this.stub = new GenericResourceMapper(this.mapperUtils);
        this.cache = {};
        this.factories = {};
        this.factories[CfResourcesType.AWS_Lambda_Function] = () => new LambdaMapper(this.mapperUtils);
        this.factories[CfResourcesType.AWS_ApiGateway_RestApi] = () =>
            new ApiGatewayV1Mapper(this.integrationUriUtils, this.stringUtils, this.mapperUtils);
    }

    getResourceMapper(resourceType: string): ResourceMapper {
        if (Object.keys(this.cache).includes(resourceType)) {
            const cachedIntrinsic = this.cache[resourceType];
            return cachedIntrinsic;
        }

        if (!Object.keys(this.factories).includes(resourceType)) {
            return this.stub;
        }

        const factory = this.factories[resourceType];
        const intrinsic = factory();
        this.cache[resourceType] = intrinsic;
        return intrinsic;
    }
}
