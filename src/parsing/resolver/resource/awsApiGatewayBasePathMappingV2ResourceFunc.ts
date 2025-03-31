import { ApiGatewayBasePathMappingV2Resource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayBasePathMappingV2Resource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const partition = ctx.getPartition();
            const region = ctx.getRegion();
            const typedResource = resource as ApiGatewayBasePathMappingV2Resource;
            const domainName = this.resourceUtils.resolveStringWithDefault(
                typedResource.Properties.DomainNameArn,
                'default-domain',
                `${logicalId}.Properties.DomainNameArn`,
                ctx,
                valueResolver,
            );

            const mappingId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/domainnames/${domainName}/apimappings/${mappingId}`;
        }
        return resource._arn;
    }
}
