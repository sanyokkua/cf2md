import { GlueJobResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsGlueJobResource extends BaseResource {
    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const resId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:glue:${region}:${accountId}:job/${resId}`;
        }
        return resource._arn;
    }

    override idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const typedResource = resource as GlueJobResource;
            resource._id = this.resourceUtils.generateNameId(
                typedResource.Properties.Name,
                `${logicalId}.Properties.Name`,
                'glueJob',
                ctx,
                valueResolver,
                5,
            );
        }
        return resource._id;
    }
}
