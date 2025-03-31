import { removePrefixIfPresent } from 'coreutilsts';
import { SQSQueueResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsSQSQueueResource extends BaseResource {
    getAttFunc(context: IntrinsicContext, key: string): unknown {
        const { ctx } = context;
        if (key === 'Arn') {
            return this.arnGenFunc(context);
        }
        if (key === 'QueueName') {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const queueUrl = this.idGenFunc(context);
            const prefix = `https://sqs.${region}.amazonaws.com/${accountId}/`;
            return removePrefixIfPresent(queueUrl, prefix);
        }
        return this.idGenFunc(context);
    }

    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const queueUrl = this.idGenFunc(context);
            const prefix = `https://sqs.${region}.amazonaws.com/${accountId}/`;
            const queueName = removePrefixIfPresent(queueUrl, prefix);
            resource._arn = `arn:${partition}:sqs:${region}:${accountId}:${queueName}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const resTyped = resource as SQSQueueResource;
            const queueName = this.resourceUtils.generateNameId(
                resTyped.Properties.QueueName,
                `${logicalId}.Properties.QueueName`,
                'sqs',
                ctx,
                valueResolver,
                5,
            );
            resource._id = `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;
        }
        return resource._id;
    }
}
