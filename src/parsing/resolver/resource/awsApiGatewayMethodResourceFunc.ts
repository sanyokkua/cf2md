import { ApiGatewayMethodResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayMethodResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const resTyped = resource as ApiGatewayMethodResource;
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const restApiId = this.resourceUtils.resolveString(
                resTyped.Properties.RestApiId,
                `${logicalId}.Properties.RestApiId`,
                ctx,
                valueResolver,
            );
            const resourceId = this.resourceUtils.resolveString(
                resTyped.Properties.ResourceId,
                `${logicalId}.Properties.ResourceId`,
                ctx,
                valueResolver,
            );
            const httpMethod = this.resourceUtils.resolveString(
                resTyped.Properties.HttpMethod,
                `${logicalId}.Properties.HttpMethod`,
                ctx,
                valueResolver,
            );
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${restApiId}/resources/${resourceId}/methods/${httpMethod}`;
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
