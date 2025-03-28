import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayClientCertificateResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const partition = ctx.getPartition();
            const region = ctx.getRegion();
            const certId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/clientcertificates/${certId}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._id) {
            resource._id = this.resourceUtils.generatePrefixedId('cert', 6, ctx);
        }
        return resource._id;
    }
}
