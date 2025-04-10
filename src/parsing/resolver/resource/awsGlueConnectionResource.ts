import { GlueConnectionResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AWSGlueConnectionResource extends BaseResource {
    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const resId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:glue:${region}:${accountId}:connection/${resId}`;
        }
        return resource._arn;
    }

    override idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const typedResource = resource as GlueConnectionResource;
            resource._id = this.resourceUtils.generateNameId(
                typedResource.Properties.ConnectionInput.Name,
                `${logicalId}.Properties.ConnectionInput.Name`,
                'glueConn',
                ctx,
                valueResolver,
                5,
            );
        }
        return resource._id;
    }
}
