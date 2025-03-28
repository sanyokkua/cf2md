import { ApiGatewayGatewayResponseResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayGatewayResponseResource extends BaseResource {
    getAttFunc(context: IntrinsicContext, key: string): unknown {
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

    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const resId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}:${accountId}:${resId}`;
        }
        return resource._arn;
    }
}
