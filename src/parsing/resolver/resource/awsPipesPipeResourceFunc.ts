import { removePrefixIfPresent } from 'coreutilsts';
import { PipesPipeResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsPipesPipeResource extends BaseResource {
    refFunc(context: IntrinsicContext): string {
        const { ctx } = context;
        const arn = this.arnGenFunc(context);
        const region = ctx.getRegion();
        const accountId = ctx.getAccountId();
        const partition = ctx.getPartition();
        const prefix = `arn:${partition}:pipes:${region}:${accountId}:pipe/`;
        return removePrefixIfPresent(arn, prefix);
    }

    getAttFunc(context: IntrinsicContext, key: string): unknown {
        if (key === 'Arn') {
            return this.arnGenFunc(context);
        }
        if (key === 'CreationTime') {
            const dateTime = new Date().toISOString();
            return dateTime;
        }
        if (key === 'CurrentState') {
            return 'RUNTIME_CurrentState';
        }
        if (key === 'LastModifiedTime') {
            const dateTime = new Date().toISOString();
            return dateTime;
        }
        if (key === 'StateReason') {
            return 'RUNTIME_StateReason';
        }

        return this.idGenFunc(context);
    }

    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const resTyped = resource as PipesPipeResource;
            const nameDefault = `pipe-${this.resourceUtils.generateAlphaNumeric(6, ctx)}`;
            const pipeName = this.resourceUtils.resolveStringWithDefault(
                resTyped.Properties.Name,
                nameDefault,
                `${logicalId}.Properties.Name`,
                ctx,
                valueResolver,
            );
            resource._arn = `arn:${partition}:pipes:${region}:${accountId}:pipe/${pipeName}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { resource } = context;
        if (!resource._id) {
            resource._id = this.arnGenFunc(context);
        }
        return resource._id;
    }
}
