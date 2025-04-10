import { ApiGatewayDomainNameResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsApiGatewayDomainNameResource extends BaseResource {
    override getAttFunc(context: IntrinsicContext, key: string): unknown {
        if (key === 'DistributionDomainName') {
            // DistributionDomainName
            // The Amazon CloudFront distribution domain name that's mapped to the custom domain name.
            // This is only applicable for endpoints whose type is EDGE.
            //
            // Example: d111111abcdef8.cloudfront.net
            return 'd111111abcdef8.cloudfront.net';
        }
        if (key === 'DistributionHostedZoneId') {
            // DistributionHostedZoneId
            // The region-agnostic Amazon Route 53 Hosted Zone ID of the edge-optimized endpoint.
            // The only valid value is Z2FDTNDATAQYW2 for all regions.
            return 'Z2FDTNDATAQYW2';
        }
        if (key === 'RegionalDomainName') {
            // RegionalDomainName
            // The domain name associated with the regional endpoint for this custom domain name.
            // You set up this association by adding a DNS record that points the custom domain name
            // to this regional domain name.
            return 'RegionalDomainName';
        }
        if (key === 'RegionalHostedZoneId') {
            // RegionalHostedZoneId
            // The region-specific Amazon Route 53 Hosted Zone ID of the regional endpoint.
            return 'RegionalHostedZoneId';
        }
        return this.idGenFunc(context);
    }

    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const partition = ctx.getPartition();
            const typedRes = resource as ApiGatewayDomainNameResource;
            const domName = this.resourceUtils.generateNameId(
                typedRes.Properties.DomainName,
                `${logicalId}.Properties.DomainName`,
                'domain',
                ctx,
                valueResolver,
                4,
            );
            resource._arn = `arn:${partition}:apigateway:${region}::/domainnames/${domName}`;
        }
        return resource._arn;
    }
}
