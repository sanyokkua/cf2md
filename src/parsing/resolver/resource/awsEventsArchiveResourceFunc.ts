import { EventsArchiveResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsEventsArchiveResource extends BaseResource {
    override getAttFunc(context: IntrinsicContext, key: string): unknown {
        if (key === 'Arn') {
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
            const archiveName = this.idGenFunc(context);
            resource._arn = `arn:${partition}:events:${region}:${accountId}:archive/${archiveName}`;
        }
        return resource._arn;
    }

    override idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const resTyped = resource as EventsArchiveResource;
            resource._id = this.resourceUtils.generateNameId(
                resTyped.Properties.ArchiveName,
                `${logicalId}.Properties.ArchiveName`,
                'archive',
                ctx,
                valueResolver,
                5,
            );
        }
        return resource._id;
    }
}
