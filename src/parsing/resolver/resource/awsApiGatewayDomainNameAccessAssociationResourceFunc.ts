import { ApiGatewayDomainNameAccessAssociationResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayDomainNameAccessAssociationResource extends BaseResource {
    override refFunc(context: IntrinsicContext): string {
        return this.arnGenFunc(context);
    }

    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const typedResource = resource as ApiGatewayDomainNameAccessAssociationResource;
            const vpcSrc = this.resourceUtils.resolveString(
                typedResource.Properties.AccessAssociationSource,
                `${logicalId}.Properties.AccessAssociationSource`,
                ctx,
                valueResolver,
            );

            resource._arn = `arn:${partition}:apigateway:${region}:${accountId}:/domainnameaccessassociations/domainname/domain-name/vpcesource/${vpcSrc}`;
        }
        return resource._arn;
    }
}
