import { removePrefixIfPresent } from 'coreutilsts';
import { SNSTopicResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsSNSTopicResource extends BaseResource {
    refFunc(context: IntrinsicContext): string {
        return this.arnGenFunc(context);
    }

    getAttFunc(context: IntrinsicContext, key: string): unknown {
        const { ctx } = context;
        if (key === 'TopicArn') {
            return this.arnGenFunc(context);
        }
        if (key === 'TopicName') {
            const arn = this.arnGenFunc(context);
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const prefix = `arn:${partition}:sns:${region}:${accountId}:`;
            return removePrefixIfPresent(arn, prefix);
        }

        return this.idGenFunc(context);
    }

    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const topicName = this.idGenFunc(context);
            resource._arn = `arn:${partition}:sns:${region}:${accountId}:${topicName}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const resTyped = resource as SNSTopicResource;
            resource._id = this.resourceUtils.generateNameId(
                resTyped.Properties.TopicName,
                `${logicalId}.Properties.Topic`,
                'topic',
                ctx,
                valueResolver,
                5,
            );
        }
        return resource._id;
    }
}
