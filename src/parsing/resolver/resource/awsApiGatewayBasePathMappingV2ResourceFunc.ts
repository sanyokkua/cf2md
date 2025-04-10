import { ApiGatewayBasePathMappingV2Resource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayBasePathMappingV2Resource extends BaseResource {
    override arnGenFunc(context: IntrinsicContext): string {
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
            const basePath = this.resourceUtils.resolveStringWithDefault(
                typedResource.Properties.BasePath,
                '',
                `${logicalId}.Properties.BasePath`,
                ctx,
                valueResolver,
            );
            resource._arn = `arn:${partition}:apigateway:${region}::/domainnames/${domainName}/basepathmappings/${basePath}`;
        }
        return resource._arn;
    }
}
