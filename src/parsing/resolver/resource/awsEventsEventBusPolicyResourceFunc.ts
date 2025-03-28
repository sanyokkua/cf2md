import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsEventsEventBusPolicyResource extends BaseResource {
    refFunc(context: IntrinsicContext): string {
        return this.arnGenFunc(context);
    }

    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const policyId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:events:${region}:${accountId}:event-bus-policy/${policyId}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._id) {
            resource._id = this.resourceUtils.generatePrefixedId('policy', 6, ctx);
        }
        return resource._id;
    }
}
