import { ApiGatewayStageResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayStageResource extends BaseResource {
    getAttFunc(context: IntrinsicContext, key: string): unknown {
        if (key === 'RootResourceId') {
            return 'STUB_RootResourceId';
        }

        return this.idGenFunc(context);
    }

    arnGenFunc(context: IntrinsicContext): string {
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

    idGenFunc(context: IntrinsicContext): string {
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
