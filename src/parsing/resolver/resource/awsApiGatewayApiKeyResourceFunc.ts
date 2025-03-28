import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayApiKeyResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const partition = ctx.getPartition();
            const region = ctx.getRegion();
            const apiKeyId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/apikeys/${apiKeyId}`;
        }
        return resource._arn;
    }
}
