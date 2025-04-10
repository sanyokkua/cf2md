import { ApiGatewayV2VpcLinkResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayV2VpcLinkResource extends BaseResource {
    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const resId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/vpclinks/${resId}`;
        }
        return resource._arn;
    }

    override idGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._id) {
            const typedRes = resource as ApiGatewayV2VpcLinkResource;
            resource._id = this.resourceUtils.generateNameId(
                typedRes.Properties.Name,
                `${context.logicalId}.Properties.Name`,
                'vpclink',
                ctx,
                context.valueResolver,
                4,
            );
        }
        return resource._id;
    }
}
