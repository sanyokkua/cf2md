import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsCDKMetadataResource extends BaseResource {
    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource } = context;
        if (!resource._arn) {
            const partition = ctx.getPartition();
            const accountId = ctx.getAccountId();
            resource._arn = `arn:${partition}:cdk::${accountId}:${logicalId}`;
        }
        return resource._arn;
    }

    override idGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._id) {
            resource._id = this.resourceUtils.fullUuid(ctx);
        }
        return resource._id;
    }
}
