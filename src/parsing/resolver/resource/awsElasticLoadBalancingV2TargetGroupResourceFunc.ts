import { removePrefixIfPresent } from 'coreutilsts';
import { ElasticLoadBalancingV2TargetGroupResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsElasticLoadBalancingV2TargetGroupResource extends BaseResource {
    refFunc(context: IntrinsicContext): string {
        return this.arnGenFunc(context);
    }

    getAttFunc(context: IntrinsicContext, key: string): unknown {
        const { ctx } = context;
        if (key === 'LoadBalancerArns') {
            return 'LoadBalancerArns';
        }
        if (key === 'TargetGroupArn') {
            return this.arnGenFunc(context);
        }
        if (key === 'TargetGroupFullName') {
            const arn = this.arnGenFunc(context);
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const prefix = `arn:${partition}:elasticloadbalancing:${region}:${accountId}:`;
            return removePrefixIfPresent(arn, prefix);
        }
        if (key === 'TargetGroupName') {
            const arn = this.arnGenFunc(context);
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const prefix = `arn:${partition}:elasticloadbalancing:${region}:${accountId}:targetgroup/`;
            const withoutPrefix = removePrefixIfPresent(arn, prefix);
            return withoutPrefix.substring(0, withoutPrefix.indexOf('/'));
        }

        return this.idGenFunc(context);
    }

    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const resTyped = resource as ElasticLoadBalancingV2TargetGroupResource;
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const targetGroupName = this.resourceUtils.generateNameId(
                resTyped.Properties.Name,
                `${logicalId}.Properties.Name`,
                'tg',
                ctx,
                valueResolver,
                4,
            );
            const targetGroupId = this.resourceUtils.generateAlphaNumeric(16, ctx);

            resource._arn = `arn:${partition}:elasticloadbalancing:${region}:${accountId}:targetgroup/${targetGroupName}/${targetGroupId}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { resource } = context;
        if (!resource._id) {
            resource._id = this.arnGenFunc(context);
        }
        return resource._id;
    }
}
