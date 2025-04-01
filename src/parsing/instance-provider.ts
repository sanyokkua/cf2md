import { StringUtils, StringUtilsImpl } from '../common';
import { ParserUtilsImpl } from './param/param-utils';
import { CfModelParserImpl } from './parser/cf-model-parser';
import { RandomUtilsImpl } from './random/random-utils';
import { IntrinsicResolverImpl } from './resolver/intrinsic-resolver';
import { ResourceIntrinsicResolverImpl } from './resolver/intrinsic-resource-resolver';
import { IntrinsicUtilsImpl } from './resolver/util/intrinsic-utils';
import { ResourceUtilsImpl } from './resolver/util/resource-utils';
import { ValueResolverImpl } from './resolver/value-resolver';
import { IntrinsicResolver, ResourceIntrinsicResolver } from './types/intrinsic-types';
import { ParserService, ParserServiceInstanceProvider } from './types/parsing-types';
import { ValueResolver } from './types/resolving-types';
import { IntrinsicUtils, ParserUtils, RandomUtils, ResourceUtils } from './types/util-service-types';

class ParserServiceInstanceProviderImpl implements ParserServiceInstanceProvider {
    createParserService(): ParserService {
        const stringUtils: StringUtils = new StringUtilsImpl();
        const randomUtils: RandomUtils = new RandomUtilsImpl();
        const intrinsicUtils: IntrinsicUtils = new IntrinsicUtilsImpl();
        const resourceUtils: ResourceUtils = new ResourceUtilsImpl(stringUtils, randomUtils);
        const resourceIntrinsicResolver: ResourceIntrinsicResolver = new ResourceIntrinsicResolverImpl(resourceUtils);
        const intrinsicResolver: IntrinsicResolver = new IntrinsicResolverImpl(intrinsicUtils, resourceIntrinsicResolver, stringUtils);
        const valueResolver: ValueResolver = new ValueResolverImpl(intrinsicUtils, intrinsicResolver);
        const parserUtils: ParserUtils = new ParserUtilsImpl(randomUtils);

        return new CfModelParserImpl(stringUtils, parserUtils, valueResolver, resourceUtils, resourceIntrinsicResolver);
    }
}

export const parserServiceInstanceProvider: ParserServiceInstanceProvider = new ParserServiceInstanceProviderImpl();
