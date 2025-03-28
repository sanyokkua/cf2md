import { ApiGatewayV2AuthorizerResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayV2AuthorizerResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const resTyped = resource as ApiGatewayV2AuthorizerResource;
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const apiId = this.resourceUtils.resolveString(resTyped.Properties.ApiId, `${logicalId}.Properties.ApiId`, ctx, valueResolver);
            const authorizerId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/apis/${apiId}/authorizers/${authorizerId}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._id) {
            resource._id = this.resourceUtils.generateAlphaNumeric(9, ctx);
        }
        return resource._id;
    }
}
