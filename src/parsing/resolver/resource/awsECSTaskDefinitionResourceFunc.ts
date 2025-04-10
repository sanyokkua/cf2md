import { ECSTaskDefinitionResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsECSTaskDefinitionResource extends BaseResource {
    override refFunc(context: IntrinsicContext): string {
        return this.arnGenFunc(context);
    }

    override getAttFunc(context: IntrinsicContext, key: string): unknown {
        if (key === 'TaskDefinitionArn') {
            return this.arnGenFunc(context);
        }

        return this.idGenFunc(context);
    }

    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const resTyped = resource as ECSTaskDefinitionResource;
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const taskDefinitionFamily = this.resourceUtils.generateNameId(
                resTyped.Properties.Family,
                `${logicalId}.Properties.Family`,
                'tf',
                ctx,
                valueResolver,
                4,
            );
            resource._arn = `arn:${partition}:ecs:${region}:${accountId}:task-definition/${taskDefinitionFamily}:1`;
        }
        return resource._arn;
    }

    override idGenFunc(context: IntrinsicContext): string {
        const { resource } = context;
        if (!resource._id) {
            resource._id = this.arnGenFunc(context);
        }
        return resource._id;
    }
}
