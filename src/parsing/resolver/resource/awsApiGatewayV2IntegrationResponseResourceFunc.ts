import { ApiGatewayV2IntegrationResponseResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayV2IntegrationResponseResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const resTyped = resource as ApiGatewayV2IntegrationResponseResource;
            const apiId = this.resourceUtils.resolveString(resTyped.Properties.ApiId, `${logicalId}.Properties.ApiId`, ctx, valueResolver);
            const respKey = this.resourceUtils.resolveString(
                resTyped.Properties.IntegrationResponseKey,
                `${logicalId}.Properties.IntegrationResponseKey`,
                ctx,
                valueResolver,
            );
            const resId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${apiId}/resources/${resId}/methods/http-method/integration/responses/${respKey}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._id) {
            resource._id = this.resourceUtils.generatePrefixedId('iresp', 6, ctx);
        }
        return resource._id;
    }
}
