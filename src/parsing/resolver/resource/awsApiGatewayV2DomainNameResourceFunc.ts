import { ApiGatewayV2DomainNameResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayV2DomainNameResource extends BaseResource {
    override refFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        const resTyped = resource as ApiGatewayV2DomainNameResource;
        return this.resourceUtils.resolveString(resTyped.Properties.DomainName, `${logicalId}.Properties.DomainName`, ctx, valueResolver);
    }

    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const domainName = this.refFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/domainnames/${domainName}`;
        }
        return resource._arn;
    }
}
