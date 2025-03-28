import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayUsagePlanResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const resId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/usageplans/${resId}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._id) {
            resource._id = this.resourceUtils.generatePrefixedId('usageplan', 6, ctx);
        }
        return resource._id;
    }
}
