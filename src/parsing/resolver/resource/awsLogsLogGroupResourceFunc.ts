import { LogsLogGroupResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsLogsLogGroupResource extends BaseResource {
    getAttFunc(context: IntrinsicContext, key: string): unknown {
        if (key === 'Arn') {
            return this.arnGenFunc(context);
        }
        return this.idGenFunc(context);
    }

    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const logGroupName = this.idGenFunc(context);
            resource._arn = `arn:${partition}:logs:${region}:${accountId}:log-group:${logGroupName}:*`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const resTyped = resource as LogsLogGroupResource;
            resource._id = this.resourceUtils.generateNameId(
                resTyped.Properties.LogGroupName,
                `${logicalId}.Properties.LogGroupName`,
                'log-group',
                ctx,
                valueResolver,
                5,
            );
        }
        return resource._id;
    }
}
