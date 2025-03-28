import { removePrefixIfPresent } from 'coreutilsts';
import { SNSSubscriptionResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsSNSSubscriptionResource extends BaseResource {
    getAttFunc(context: IntrinsicContext, key: string): unknown {
        if (key === 'Arn') {
            return this.arnGenFunc(context);
        }
        return this.idGenFunc(context);
    }

    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const typed = resource as SNSSubscriptionResource;
            const arn = this.resourceUtils.resolveString(typed.Properties.TopicArn, `${logicalId}.Properties.TopicArn`, ctx, valueResolver);
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const prefix = `arn:${partition}:sns:${region}:${accountId}:`;
            const topicName = removePrefixIfPresent(arn, prefix);
            const subscriptionId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:sns:${region}:${accountId}:${topicName}:/${subscriptionId}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._id) {
            resource._id = this.resourceUtils.fullUuid(ctx);
        }
        return resource._id;
    }
}
