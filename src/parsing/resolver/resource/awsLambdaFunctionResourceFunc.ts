import { LambdaFunctionResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsLambdaFunctionResource extends BaseResource {
    getAttFunc(context: IntrinsicContext, key: string): unknown {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (key === 'Arn') {
            return this.arnGenFunc(context);
        }
        if (key === 'SnapStartResponse.ApplyOn') {
            const resTyped = resource as LambdaFunctionResource;
            return this.resourceUtils.resolveStringWithDefault(
                resTyped.Properties.SnapStart?.ApplyOn,
                'SnapStartResponse.ApplyOn',
                `${logicalId}.Properties?.SnapStart?.ApplyOn`,
                ctx,
                valueResolver,
            );
        }
        if (key === 'SnapStartResponse.OptimizationStatus') {
            return 'Stub_SnapStartResponse.OptimizationStatus';
        }
        return this.idGenFunc(context);
    }

    arnGenFunc(context: IntrinsicContext): string {
        const { ctx, resource } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const functionName = this.idGenFunc(context);
            resource._arn = `arn:${partition}:lambda:${region}:${accountId}:function:${functionName}`;
        }
        return resource._arn;
    }

    idGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._id) {
            const resTyped = resource as LambdaFunctionResource;
            resource._id = this.resourceUtils.generateNameId(
                resTyped.Properties.FunctionName,
                `${logicalId}.Properties.FunctionName`,
                'lambda',
                ctx,
                valueResolver,
                5,
            );
        }
        return resource._id;
    }
}
