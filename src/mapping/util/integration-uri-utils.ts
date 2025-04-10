import { IntegrationUriArn, IntegrationUriUtils } from '../types/utils-model';

export class IntegrationUriUtilsImpl implements IntegrationUriUtils {
    isValidIntegrationUri(input: string): boolean {
        return input.startsWith('arn:aws:apigateway:');
    }

    parseIntegrationUri(input: string): IntegrationUriArn {
        if (!this.isValidIntegrationUri(input)) {
            throw new Error('Invalid integration URI');
        }

        // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-apigateway-method-integration.html#cfn-apigateway-method-integration-uri
        // AWS or AWS_PROXY integrations, the URI is of the form arn:aws:apigateway:{region}:{subdomain.service|service}:path|action/{service_api}
        // Examples:
        //  S3:
        //      arn:aws:apigateway:us-west-2:s3:action/GetObject&Bucket={bucket}&Key={key}
        //      arn:aws:apigateway:us-west-2:s3:path/{bucket}/{key}
        // Lambda:
        //      arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-west-1:123456789012:function:my-function/invocations
        // StepFunction:
        //      arn:aws:apigateway:us-east-1:states:action/StartSyncExecution
        //      arn:aws:apigateway:us-east-1:states:action/StartExecution
        // EventBus:
        //      arn:aws:apigateway:us-east-1:events:action/PutEvents
        // It is expected the first five colon-separated segments to be:
        // [arn, aws, apigateway, region, serviceComponent]
        // Using split with a limit allows us to preserve the rest (which may contain colons).
        const arnParts = input.split(':');
        if (arnParts.length < 6) {
            throw new Error(`Invalid integration URI: incomplete ARN structure. ${input}`);
        }
        const region = arnParts[3];

        // Parse the service component which might be "service" or "subdomain.service"
        const serviceComponent = arnParts[4];
        const serviceComponents = serviceComponent.split('.');
        let service: string;
        let subdomain: string = '';
        if (serviceComponents.length > 1) {
            service = serviceComponents[0];
            subdomain = serviceComponents.slice(1).join('.');
        } else {
            service = serviceComponent;
        }

        // The remainder contains the integration type and the service API string.
        // Since we limited our split before, arnParts[5] contains everything after the fifth colon.
        // It should be in the format: "{type}/{serviceApi}"
        const remainder = arnParts.slice(5).join(':');
        const slashIndex = remainder.indexOf('/');
        if (slashIndex === -1) {
            throw new Error("Invalid integration URI: missing integration type and service API delimiter '/'");
        }
        const integrationType = remainder.substring(0, slashIndex);
        if (integrationType !== 'action' && integrationType !== 'path') {
            throw new Error(`Invalid integration type: expected 'action' or 'path', got '${integrationType}'`);
        }
        const serviceApi = remainder.substring(slashIndex + 1);
        if (!serviceApi) {
            throw new Error('Invalid integration URI: service API part cannot be empty.');
        }

        return {
            integrationServiceRegion: region,
            integrationService: service,
            integrationServiceSubdomain: subdomain,
            integrationServiceActionType: integrationType,
            integrationServiceAction: serviceApi,
        };
    }
}
