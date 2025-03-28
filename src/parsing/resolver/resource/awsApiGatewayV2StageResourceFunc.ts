import { ApiGatewayV2StageResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayV2StageResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const resTyped = resource as ApiGatewayV2StageResource;
            const apiId = this.resourceUtils.resolveString(resTyped.Properties.ApiId, `${logicalId}.Properties.ApiId`, ctx, valueResolver);
            const stageName = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${apiId}/stages/${stageName}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const resTyped = resource as ApiGatewayV2StageResource;
            resource._id = this.resourceUtils.generateNameId(
                resTyped.Properties.StageName,
                `${logicalId}.Properties.StageName`,
                'stage',
                ctx,
                valueResolver,
                5,
            );
        }
        return resource._id;
    }
}
