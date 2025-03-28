import { ApiGatewayV2ApiMappingResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayV2ApiMappingResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const resId = this.idGenFunc(context);
            const resTyped = resource as ApiGatewayV2ApiMappingResource;
            const domainName = this.resourceUtils.resolveString(
                resTyped.Properties.DomainName,
                `${logicalId}.Properties.DomainName`,
                ctx,
                valueResolver,
            );
            resource._arn = `arn:${partition}:apigateway:${region}::/domainnames/${domainName}/apimappings/${resId}`;
        }
        return resource._arn;
    }
}
