import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayDocumentationPartResource extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const partition = ctx.getPartition();
            const region = ctx.getRegion();
            const typedResource = resource as { Properties: { RestApiId?: string } };
            const restApiId = this.resourceUtils.resolveStringWithDefault(
                typedResource.Properties.RestApiId,
                'default-api',
                `${logicalId}.Properties.RestApiId`,
                ctx,
                valueResolver,
            );
            const docPartId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/apis/${restApiId}/documentation/parts/${docPartId}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._id) {
            resource._id = this.resourceUtils.generatePrefixedId('docpart', 6, ctx);
        }
        return resource._id;
    }
}
