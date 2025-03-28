import { ApiGatewayV2ModelResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayV2ModelResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const resTyped = resource as ApiGatewayV2ModelResource;
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const apiId = this.resourceUtils.resolveString(resTyped.Properties.ApiId, `${logicalId}.Properties.ApiId`, ctx, valueResolver);
            const modelName = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${apiId}/models/${modelName}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const typed = resource as ApiGatewayV2ModelResource;
            resource._id = this.resourceUtils.generateNameId(typed.Properties.Name, `${logicalId}.Properties.Name`, 'model', ctx, valueResolver, 4);
        }
        return resource._id;
    }
}
