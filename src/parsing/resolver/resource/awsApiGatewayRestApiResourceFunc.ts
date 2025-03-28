import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayRestApiResource extends BaseResource {
    getAttFunc(context: IntrinsicContext, key: string): unknown {
        if (key === 'RootResourceId') {
            return 'STUB_RootResourceId';
        }
        return this.idGenFunc(context);
    }

    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const restApiId = this.idGenFunc(context);
            resource._arn = `arn:${partition}:apigateway:${region}::/restapis/${restApiId}`;
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
