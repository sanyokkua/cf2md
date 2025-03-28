import { IAMPolicyResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsIAMPolicyResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const policyName = this.idGenFunc(context);
            resource._arn = `arn:${partition}:iam::${accountId}:policy/${policyName}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const typedRes = resource as IAMPolicyResource;
            resource._id = this.resourceUtils.generateNameId(
                typedRes.Properties.PolicyName,
                `${logicalId}.Properties.PolicyName`,
                'policy',
                ctx,
                valueResolver,
                5,
            );
        }
        return resource._id;
    }
}
