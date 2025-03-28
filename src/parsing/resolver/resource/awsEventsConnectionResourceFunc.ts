import { EventsConnectionResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsEventsConnectionResource extends BaseResource {
    getAttFunc(context: IntrinsicContext, key: string): unknown {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (key === 'Arn') {
            return this.arnGenFunc(context);
        }
        if (key === 'AuthParameters.ConnectivityParameters.ResourceParameters.ResourceAssociationArn') {
            const resTyped = resource as EventsConnectionResource;
            return this.resourceUtils.resolveStringWithDefault(
                resTyped.Properties.AuthParameters?.ConnectivityParameters?.ResourceParameters.ResourceAssociationArn,
                'ResourceAssociationArn',
                `${logicalId}.Properties.AuthParameters?.ConnectivityParameters?.ResourceParameters.ResourceAssociationArn`,
                ctx,
                valueResolver,
            );
        }
        if (key === 'InvocationConnectivityParameters.ResourceParameters.ResourceAssociationArn') {
            const resTyped = resource as EventsConnectionResource;
            return this.resourceUtils.resolveStringWithDefault(
                resTyped.Properties.InvocationConnectivityParameters?.ResourceParameters.ResourceAssociationArn,
                'ResourceAssociationArn',
                `${logicalId}.Properties.InvocationConnectivityParameters?.ResourceParameters.ResourceAssociationArn`,
                ctx,
                valueResolver,
            );
        }
        if (key === 'SecretArn') {
            const resTyped = resource as EventsConnectionResource;
            return this.resourceUtils.resolveStringWithDefault(
                resTyped.Properties.SecretArn,
                'SecretsArn',
                `${logicalId}.Properties.SecretArn`,
                ctx,
                valueResolver,
            );
        }
        return this.idGenFunc(context);
    }

    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const name = this.idGenFunc(context);
            resource._arn = `arn:${partition}:events:${region}:${accountId}:connection/${name}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const resTyped = resource as EventsConnectionResource;
            resource._id = this.resourceUtils.generateNameId(
                resTyped.Properties.Name,
                `${logicalId}.Properties.Name`,
                'connection',
                ctx,
                valueResolver,
                5,
            );
        }
        return resource._id;
    }
}
