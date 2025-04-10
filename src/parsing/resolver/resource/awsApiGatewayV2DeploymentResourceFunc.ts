import { ApiGatewayV2DeploymentResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayV2DeploymentResource extends BaseResource {
    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const resTyped = resource as ApiGatewayV2DeploymentResource;
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const apiId = this.resourceUtils.resolveString(resTyped.Properties.ApiId, `${logicalId}.Properties.ApiId`, ctx, valueResolver);
            const deploymentId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/apis/${apiId}/deployments/${deploymentId}`;
        }
        return resource._arn;
    }
}
