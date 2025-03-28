import { ApiGatewayModelResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayModelResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const resTyped = resource as ApiGatewayModelResource;
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const restApiId = this.resourceUtils.resolveString(
                resTyped.Properties.RestApiId,
                `${logicalId}.Properties.RestApiId`,
                ctx,
                valueResolver,
            );
            const modelId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${restApiId}/models/${modelId}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const resTyped = resource as ApiGatewayModelResource;
            resource._id = this.resourceUtils.generateNameId(
                resTyped.Properties.Name,
                `${logicalId}.Properties.Name`,
                'model',
                ctx,
                valueResolver,
                5,
            );
        }
        return resource._id;
    }
}
