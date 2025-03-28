import { ApiGatewayUsagePlanKeyResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayUsagePlanKeyResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const typed = resource as ApiGatewayUsagePlanKeyResource;
            const usagePlanId = this.resourceUtils.resolveString(
                typed.Properties.UsagePlanId,
                `${logicalId}.Properties.UsagePlanId`,
                ctx,
                valueResolver,
            );
            const usagePlanKeyId = this.resourceUtils.resolveString(typed.Properties.KeyId, `${logicalId}.Properties.KeyId`, ctx, valueResolver);
            resource._arn = `arn:${partition}:apigateway:${region}::/usageplans/${usagePlanId}/keys/${usagePlanKeyId}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._id) {
            resource._id = this.resourceUtils.generatePrefixedId('plankey', 6, ctx);
        }
        return resource._id;
    }
}
