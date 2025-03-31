import { removePrefixIfPresent } from 'coreutilsts';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class StubFunctionForUnsupported extends BaseResource {
    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const serviceNameWithoutPrefix = removePrefixIfPresent(resource.Type, 'AWS::');
            // For example AWS::ApiGateway::Resource -> ApiGateway should be returned
            let nameWithoutSuffix = serviceNameWithoutPrefix;
            if (serviceNameWithoutPrefix.includes('::')) {
                nameWithoutSuffix = serviceNameWithoutPrefix.substring(0, serviceNameWithoutPrefix.indexOf('::'));
            }
            const serviceName = nameWithoutSuffix.toLowerCase();
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const resId = this.idGenFunc(context);
            // Some generic ARN
            resource._arn = `arn:${partition}:${serviceName}:${region}:${accountId}:${resId}`;
        }
        return resource._arn;
    }
}
