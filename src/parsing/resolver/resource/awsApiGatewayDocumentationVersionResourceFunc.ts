import { ApiGatewayDocumentationVersionResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayDocumentationVersionResource extends BaseResource {
    override refFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        const typedResource = resource as ApiGatewayDocumentationVersionResource;
        return this.resourceUtils.resolveString(
            typedResource.Properties.DocumentationVersion,
            `${logicalId}.Properties.DocumentationVersion`,
            ctx,
            valueResolver,
        );
    }

    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const typedResource = resource as ApiGatewayDocumentationVersionResource;
            const partition = ctx.getPartition();
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const apiId = this.resourceUtils.resolveString(
                typedResource.Properties.RestApiId,
                `${logicalId}.Properties.RestApiId`,
                ctx,
                valueResolver,
            );
            const version = this.refFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}:${accountId}:/apis/${apiId}/documentation/versions/${version}`;
        }
        return resource._arn;
    }
}
