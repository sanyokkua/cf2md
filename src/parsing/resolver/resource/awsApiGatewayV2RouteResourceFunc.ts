import { ApiGatewayV2RouteResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayV2RouteResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const resTyped = resource as ApiGatewayV2RouteResource;
            const apiId = this.resourceUtils.resolveString(resTyped.Properties.ApiId, `${logicalId}.Properties.ApiId`, ctx, valueResolver);
            const resId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/apis/${apiId}/routes/${resId}`;
        }
        return resource._arn;
    }
}
