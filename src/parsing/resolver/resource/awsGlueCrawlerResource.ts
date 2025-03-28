import { GlueCrawlerResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsGlueCrawlerResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const resId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:glue:${region}:${accountId}:crawler/${resId}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const typedResource = resource as GlueCrawlerResource;
            resource._id = this.resourceUtils.generateNameId(
                typedResource.Properties.Name,
                `${logicalId}.Properties.Name`,
                'glueCrawler',
                ctx,
                valueResolver,
                5,
            );
        }
        return resource._id;
    }
}
