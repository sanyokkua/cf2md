import { ApiGatewayV2RouteResponseResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayV2RouteResponseResource extends BaseResource {
    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const resTyped = resource as ApiGatewayV2RouteResponseResource;
            const apiId = this.resourceUtils.resolveString(resTyped.Properties.ApiId, `${logicalId}.Properties.ApiId`, ctx, valueResolver);
            const routeId = this.resourceUtils.resolveString(resTyped.Properties.RouteId, `${logicalId}.Properties.RouteId`, ctx, valueResolver);
            const resId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/apis/${apiId}/routes/${routeId}/routeresponses/${resId}`;
        }
        return resource._arn;
    }

    override idGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._id) {
            resource._id = this.resourceUtils.generatePrefixedId('rresp', 6, ctx);
        }
        return resource._id;
    }
}
