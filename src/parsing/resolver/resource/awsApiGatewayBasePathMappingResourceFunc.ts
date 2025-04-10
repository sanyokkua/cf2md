import { ApiGatewayBasePathMappingResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayBasePathMappingResource extends BaseResource {
    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const partition = ctx.getPartition();
            const region = ctx.getRegion();
            const typedResource = resource as ApiGatewayBasePathMappingResource;
            const domainName = this.resourceUtils.resolveStringWithDefault(
                typedResource.Properties.DomainName,
                'default-domain',
                `${logicalId}.Properties.DomainName`,
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

    override idGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._id) {
            resource._id = this.resourceUtils.generatePrefixedId('bpmapping', 6, ctx);
        }
        return resource._id;
    }
}
