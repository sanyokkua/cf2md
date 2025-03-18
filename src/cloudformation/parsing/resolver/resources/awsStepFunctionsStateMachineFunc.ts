import log from 'loglevel';
import { CloudFormationResource, StepFunctionsStateMachineResource } from '../../../types/cloudformation-model';
import { ResolvingContext, ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveStringWithDefault } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS Step Functions State Machine resources.
 *
 * This object provides methods used by the CloudFormation parser to resolve intrinsic references
 * for AWS::StepFunctions::StateMachine resources. It handles operations such as generating unique identifiers,
 * constructing Amazon Resource Names (ARNs), and resolving attribute values using the provided resource properties
 * and environment context (e.g., region, account ID, partition).
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-stepfunctions-statemachine.html#aws-resource-stepfunctions-statemachine-return-values
 */
export const awsStepFunctionsStateMachineFunc: ResourceSpecificFunc = {
    /**
     * Resolves the "Ref" intrinsic for an AWS Step Functions State Machine resource.
     *
     * When a CloudFormation template refers to a state machine with the "Ref" intrinsic, this function is invoked.
     * It logs the call and then delegates to arnGenFunc to generate the full ARN of the state machine,
     * which is used as the unique reference.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object representing the state machine.
     * @param ctx - The resolving context that provides environment specifics and helper functions.
     * @returns The unique reference (ARN) of the state machine.
     */
    refFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        // Delegate to arnGenFunc to resolve the unique identifier (ARN).
        return awsStepFunctionsStateMachineFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Resolves an attribute intrinsic ("Fn::GetAtt") for an AWS Step Functions State Machine resource.
     *
     * This function processes attribute resolution using "Fn::GetAtt". For:
     * - Key "Arn": It returns the generated ARN by calling arnGenFunc.
     * - Key "Name": It extracts the state machine name from the ARN by removing the expected prefix.
     * - Key "StateMachineRevisionId": A placeholder value is returned (to be implemented).
     *
     * For unsupported keys, a warning is logged and the unique identifier is returned.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object representing the state machine.
     * @param ctx - The resolving context providing environment details.
     * @returns The resolved attribute value.
     */
    getAttFunc: (
        resourceType: string,
        key: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): unknown => {
        log.trace(`Called getAttFunc, for ${resourceType}, with logicalId=${logicalId}, and key=${key}`, resource, ctx);

        if (key === 'Arn') {
            return awsStepFunctionsStateMachineFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }
        if (key === 'Name') {
            // Get the full ARN, then remove the expected prefix to extract the state machine name.
            const arn = awsStepFunctionsStateMachineFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const prefix = `arn:${partition}:states:${region}:${accountId}:stateMachine:`;
            return arn.replace(prefix, '');
        }
        if (key === 'StateMachineRevisionId') {
            // TODO: Implement correct resolution for StateMachineRevisionId.
            return 'RUNTIME_StateMachineRevisionId';
        }

        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsStepFunctionsStateMachineFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the ARN for an AWS Step Functions State Machine resource.
     *
     * This function constructs the ARN using the partition, region, and account ID from the resolving context,
     * combined with the state machine name resolved from the resource properties. The ARN follows the format:
     *   arn:{partition}:states:{region}:{accountId}:stateMachine:{stateMachineName}
     * The generated ARN is cached on the resource for efficiency.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID from the CloudFormation template.
     * @param resource - The CloudFormation resource object representing the state machine.
     * @param ctx - The resolving context supplying environment details.
     * @returns The generated ARN as a string.
     */
    arnGenFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): string => {
        log.trace(`Called arnGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();

            // Cast the resource to StepFunctionsStateMachineResource to access the StateMachineName property.
            const resTyped = resource as StepFunctionsStateMachineResource;
            // Use a default state machine name if none is provided.
            const nameDefault = `sf-${generateAlphaNumeric(6, ctx)}`;
            const stateMachineName = resolveStringWithDefault(
                resTyped.Properties.StateMachineName,
                nameDefault,
                `${resourceType}.Properties.StateMachineName`,
                ctx,
            );

            resource._arn = `arn:${partition}:states:${region}:${accountId}:stateMachine:${stateMachineName}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an AWS Step Functions State Machine resource.
     *
     * This function checks if the resource already has an assigned unique identifier (_id). If not,
     * it generates one by using the ARN produced by arnGenFunc as the identifier. The identifier is cached
     * on the resource object for future reference.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID from the CloudFormation template.
     * @param resource - The CloudFormation resource object.
     * @param ctx - The resolving context providing additional helper methods.
     * @returns The unique identifier for the state machine as a string.
     */
    idGenFunc: (
        resourceType: string,
        logicalId: string,
        resource: CloudFormationResource,
        ctx: ResolvingContext,
    ): string => {
        log.trace(`Called idGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._id) {
            log.trace(`For ${logicalId} with type ${resourceType} id is not set, will be generated`);
            resource._id = awsStepFunctionsStateMachineFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }
        return resource._id;
    },
};
