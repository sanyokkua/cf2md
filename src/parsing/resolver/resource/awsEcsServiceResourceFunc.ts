import { EcsServiceResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsEcsServiceResource extends BaseResource {
    refFunc(context: IntrinsicContext): string {
        return this.arnGenFunc(context);
    }

    getAttFunc(context: IntrinsicContext, key: string): unknown {
        if (key === 'ServiceArn') {
            return this.arnGenFunc(context);
        }

        return this.idGenFunc(context);
    }

    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();

            const resTyped = resource as EcsServiceResource;
            const cluster = this.resourceUtils.resolveStringWithDefault(
                resTyped.Properties.Cluster,
                'default',
                `${logicalId}.Properties.Cluster`,
                ctx,
                valueResolver,
            );
            const serviceName = this.idGenFunc(context);
            resource._arn = `arn:${partition}:ecs:${region}:${accountId}:service/${cluster}/${serviceName}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const resTyped = resource as EcsServiceResource;
            resource._id = this.resourceUtils.generateNameId(
                resTyped.Properties.ServiceName,
                `${logicalId}.Properties.ServiceName`,
                'sn',
                ctx,
                valueResolver,
                5,
            );
        }
        return resource._id;
    }
}
