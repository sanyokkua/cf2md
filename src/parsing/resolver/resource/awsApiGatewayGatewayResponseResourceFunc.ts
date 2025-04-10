import { ApiGatewayGatewayResponseResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayGatewayResponseResource extends BaseResource {
    override getAttFunc(context: IntrinsicContext, key: string): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (key === 'ResponseType') {
            const typedResource = resource as ApiGatewayGatewayResponseResource;
            return this.resourceUtils.resolveString(
                typedResource.Properties.ResponseType,
                `${logicalId}.Properties.ResponseType`,
                ctx,
                valueResolver,
            );
        }

        return this.idGenFunc(context);
    }

    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const resType = this.getAttFunc(context, 'ResponseType');
            const resTyped = resource as ApiGatewayGatewayResponseResource;
            const apiId = this.resourceUtils.resolveString(resTyped.Properties.RestApiId, `${logicalId}.Properties.RestApiId`, ctx, valueResolver);
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${apiId}/gatewayresponses/${resType}`;
        }
        return resource._arn;
    }
}
