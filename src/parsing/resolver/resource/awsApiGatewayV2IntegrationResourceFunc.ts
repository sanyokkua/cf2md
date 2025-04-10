import { ApiGatewayV2IntegrationResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayV2IntegrationResource extends BaseResource {
    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const resTyped = resource as ApiGatewayV2IntegrationResource;
            const apiId = this.resourceUtils.resolveString(resTyped.Properties.ApiId, `${logicalId}.Properties.ApiId`, ctx, valueResolver);
            const httpMethod = this.resourceUtils.resolveStringWithDefault(
                resTyped.Properties.IntegrationMethod,
                'Mock',
                `${logicalId}.Properties.IntegrationMethod`,
                ctx,
                valueResolver,
            );
            const resId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${apiId}/resources/${resId}/methods/${httpMethod}/integration`;
        }
        return resource._arn;
    }
}
