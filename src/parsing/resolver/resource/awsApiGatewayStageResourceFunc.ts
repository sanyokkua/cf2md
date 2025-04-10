import { ApiGatewayStageResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayStageResource extends BaseResource {
    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const resTyped = resource as ApiGatewayStageResource;
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const restApiId = this.resourceUtils.resolveString(
                resTyped.Properties.RestApiId,
                `${logicalId}.Properties.RestApiId`,
                ctx,
                valueResolver,
            );
            const stageName = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${restApiId}/stages/${stageName}`;
        }
        return resource._arn;
    }

    override idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const resTyped = resource as ApiGatewayStageResource;
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
