import { IAMRoleResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsIAMRoleResource extends BaseResource {
    override getAttFunc(context: IntrinsicContext, key: string): unknown {
        if (key === 'Arn') {
            return this.arnGenFunc(context);
        }
        return this.idGenFunc(context);
    }

    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const roleName = this.idGenFunc(context);
            resource._arn = `arn:${partition}:iam::${accountId}:role/${roleName}`;
        }
        return resource._arn;
    }

    override idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const typedRes = resource as IAMRoleResource;
            resource._id = this.resourceUtils.generateNameId(
                typedRes.Properties.RoleName,
                `${logicalId}.Properties.RoleName`,
                'role',
                ctx,
                valueResolver,
                6,
            );
        }
        return resource._id;
    }
}
