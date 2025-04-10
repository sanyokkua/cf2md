import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsElasticLoadBalancingV2ListenerRule extends BaseResource {
    override refFunc(context: IntrinsicContext): string {
        return this.arnGenFunc(context);
    }

    override getAttFunc(context: IntrinsicContext, key: string): unknown {
        if (key === 'IsDefault') {
            return 'Yes/No_Stub';
        }
        if (key === 'RuleArn') {
            return this.arnGenFunc(context);
        }

        return this.idGenFunc(context);
    }

    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            // Generate three unique alphanumeric segments.
            const id1 = this.resourceUtils.generateAlphaNumeric(16, ctx);
            const id2 = this.resourceUtils.generateAlphaNumeric(16, ctx);
            const id3 = this.resourceUtils.generateAlphaNumeric(16, ctx);

            resource._arn = `arn:${partition}:elasticloadbalancing:${region}:${accountId}:listener-rule/stub-cluster/${id1}/${id2}/${id3}`;
        }
        return resource._arn;
    }

    override idGenFunc(context: IntrinsicContext): string {
        const { resource } = context;
        if (!resource._id) {
            resource._id = this.arnGenFunc(context);
        }
        return resource._id;
    }
}
