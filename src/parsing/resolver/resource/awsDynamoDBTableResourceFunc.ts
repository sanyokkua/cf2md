import { DynamoDBTableResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsDynamoDBTableResource extends BaseResource {
    override getAttFunc(context: IntrinsicContext, key: string): unknown {
        const { ctx } = context;
        if (key === 'Arn') {
            return this.arnGenFunc(context);
        }
        if (key === 'StreamArn') {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const tableName = this.idGenFunc(context);
            const time = new Date().toISOString();
            return `arn:${partition}:dynamodb:${region}:${accountId}:table/${tableName}/stream/${time}`;
        }

        return this.idGenFunc(context);
    }

    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const tableName = this.idGenFunc(context);
            resource._arn = `arn:${partition}:dynamodb:${region}:${accountId}:table/${tableName}`;
        }
        return resource._arn;
    }

    override idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const resTyped = resource as DynamoDBTableResource;
            resource._id = this.resourceUtils.generateNameId(
                resTyped.Properties.TableName,
                `${logicalId}.Properties.TableName`,
                'table',
                ctx,
                valueResolver,
                5,
            );
        }
        return resource._id;
    }
}
