import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayV2ApiResource extends BaseResource {
    override getAttFunc(context: IntrinsicContext, key: string): unknown {
        const { ctx } = context;
        if (key === 'ApiEndpoint') {
            const region = ctx.getRegion();
            const resId = this.idGenFunc(context);
            return `https://${resId}.execute-api.${region}.amazonaws.com`;
        }

        return this.idGenFunc(context);
    }

    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const resId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/apis/${resId}`;
        }
        return resource._arn;
    }
}
