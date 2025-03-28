import { ApiGatewayAuthorizerResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayAuthorizerResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const resTyped = resource as ApiGatewayAuthorizerResource;
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const restApiId = this.resourceUtils.resolveString(
                resTyped.Properties.RestApiId,
                `${logicalId}.Properties.RestApiId`,
                ctx,
                valueResolver,
            );
            const authorizerId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${restApiId}/authorizers/${authorizerId}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._id) {
            resource._id = this.resourceUtils.generateAlphaNumeric(10, ctx);
        }
        return resource._id;
    }
}
