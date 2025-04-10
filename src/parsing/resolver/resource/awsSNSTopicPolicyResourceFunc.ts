import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsSNSTopicPolicyResource extends BaseResource {
    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const policyId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:sns:${region}:${accountId}:topicpolicy/${policyId}`;
        }
        return resource._arn;
    }

    override idGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._id) {
            resource._id = this.resourceUtils.generatePrefixedId('policy', 6, ctx);
        }
        return resource._id;
    }
}
