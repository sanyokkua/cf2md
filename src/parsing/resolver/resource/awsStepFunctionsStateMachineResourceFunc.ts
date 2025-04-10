import { StepFunctionsStateMachineResource } from '../../types/cloudformation-model';
import { IntrinsicContext } from '../../types/intrinsic-types';
import { BaseResource } from './BaseResourceImpl';

export class AwsStepFunctionsStateMachineResource extends BaseResource {
    override refFunc(context: IntrinsicContext): string {
        return this.arnGenFunc(context);
    }

    override getAttFunc(context: IntrinsicContext, key: string): unknown {
        const { ctx } = context;
        if (key === 'Arn') {
            return this.arnGenFunc(context);
        }
        if (key === 'Name') {
            const arn = this.arnGenFunc(context);
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const prefix = `arn:${partition}:states:${region}:${accountId}:stateMachine:`;
            return arn.replace(prefix, '');
        }
        if (key === 'StateMachineRevisionId') {
            return 'STUB_StateMachineRevisionId';
        }
        return this.idGenFunc(context);
    }

    override arnGenFunc(context: IntrinsicContext): string {
        const { ctx, logicalId, resource, valueResolver } = context;
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const resTyped = resource as StepFunctionsStateMachineResource;
            const stateMachineName = this.resourceUtils.generateNameId(
                resTyped.Properties.StateMachineName,
                `${logicalId}.Properties.StateMachineName`,
                'sf',
                ctx,
                valueResolver,
                5,
            );

            resource._arn = `arn:${partition}:states:${region}:${accountId}:stateMachine:${stateMachineName}`;
        }
        return resource._arn;
    }

    override idGenFunc(context: IntrinsicContext): string {
        const { resource } = context;
        if (!resource._id) {
            resource._id = this.arnGenFunc(context);
        }
        return resource._id;
    }
}
