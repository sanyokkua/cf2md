import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayAccountResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const accId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/${accId}`;
        }
        return resource._arn;
    }
}
