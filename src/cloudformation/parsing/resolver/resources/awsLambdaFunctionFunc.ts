import { removePrefixIfPresent } from 'coreutilsts';
import log from 'loglevel';
import { LambdaFunctionResource } from '../../../types/cloudformation-model';
import { ResourceSpecificFunc } from '../../types/types';
import { generateAlphaNumeric, resolveStringWithDefault } from '../../utils/helper-utils';

/**
 * Resource-specific functions for AWS Lambda Function resources.
 *
 * This collection of functions enables the CloudFormation parser to resolve intrinsic
 * references for AWS::Lambda::Function resources. It handles operations such as:
 *
 * - Resolving the "Ref" intrinsic by returning the function name.
 * - Resolving attributes via "Fn::GetAtt" (e.g., "Arn" and SnapStart-related keys).
 * - Generating the function's ARN based on context and resource properties.
 * - Caching unique identifiers to optimize subsequent resolutions.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-function.html#aws-resource-lambda-function-return-values
 */
export const awsLambdaFunctionFunc: ResourceSpecificFunc = {
    /**
     * Resolves the "Ref" intrinsic for an AWS Lambda Function.
     *
     * This function is invoked when a CloudFormation template uses "Ref" on a Lambda Function.
     * It calls arnGenFunc to generate the full ARN of the function and then removes the
     * expected ARN prefix, thus returning just the function name as the reference value.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The CloudFormation resource object for the Lambda function.
     * @param ctx - The resolving context that provides environment-specific details.
     * @returns The Lambda function name derived from its ARN.
     */
    refFunc: (resourceType, logicalId, resource, ctx): unknown => {
        log.trace(`Called refFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        const arn = awsLambdaFunctionFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        const region = ctx.getRegion();
        const accountId = ctx.getAccountId();
        const partition = ctx.getPartition();

        // Build the expected ARN prefix for Lambda functions.
        const prefix = `arn:${partition}:lambda:${region}:${accountId}:function:`;

        // Remove the prefix to extract the function name.
        return removePrefixIfPresent(arn, prefix);
    },

    /**
     * Resolves attributes ("Fn::GetAtt") for an AWS Lambda Function.
     *
     * Supports the following keys:
     *   - "Arn": Returns the full ARN of the Lambda function.
     *   - "SnapStartResponse.ApplyOn": Resolves the SnapStart.ApplyOn property from the function's properties.
     *   - "SnapStartResponse.OptimizationStatus": Returns a placeholder value (TODO: implement proper handling).
     *
     * For unsupported keys, a warning is logged and the unique identifier is returned.
     *
     * @param resourceType - The type of the resource.
     * @param key - The attribute key requested.
     * @param logicalId - The logical ID of the resource.
     * @param resource - The CloudFormation resource object for the Lambda function.
     * @param ctx - The resolving context providing helper methods and environment details.
     * @returns The resolved attribute value.
     */
    getAttFunc: (resourceType, key, logicalId, resource, ctx): unknown => {
        log.trace(`Called getAttFunc, for ${resourceType}, with logicalId=${logicalId}, and key=${key}`, resource, ctx);

        if (key === 'Arn') {
            return awsLambdaFunctionFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }
        if (key === 'SnapStartResponse.ApplyOn') {
            const resTyped = resource as LambdaFunctionResource;
            return resolveStringWithDefault(
                resTyped.Properties.SnapStart?.ApplyOn,
                'SnapStartResponse.ApplyOn',
                `${resourceType}.Properties?.SnapStart?.ApplyOn`,
                ctx,
            );
        }
        if (key === 'SnapStartResponse.OptimizationStatus') {
            // Return a placeholder value; proper implementation pending.
            return 'RUNTIME_SnapStartResponse.OptimizationStatus'; // TODO: Implement resolution.
        }

        log.warn(
            `Passed key ${key} for ${resourceType}, with logicalId=${logicalId} is not supported, id will be returned`,
            resource,
            ctx,
        );
        return awsLambdaFunctionFunc.idGenFunc(resourceType, logicalId, resource, ctx);
    },

    /**
     * Generates the Amazon Resource Name (ARN) for an AWS Lambda Function.
     *
     * Constructs the ARN using the function name resolved from the resource properties along with the
     * partition, region, and account ID from the resolving context. The ARN follows the format:
     *   arn:{partition}:lambda:{region}:{accountId}:function:{functionName}
     *
     * If the ARN is not already cached on the resource, it is generated and stored for future use.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID from the CloudFormation template.
     * @param resource - The CloudFormation resource object for the Lambda function.
     * @param ctx - The resolving context providing environment details.
     * @returns The generated ARN as a string.
     */
    arnGenFunc: (resourceType, logicalId, resource, ctx): string => {
        log.trace(`Called arnGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._arn) {
            const region = ctx.getRegion();
            const accountId = ctx.getAccountId();
            const partition = ctx.getPartition();
            const resTyped = resource as LambdaFunctionResource;
            // Generate a default function name if the FunctionName property is not specified.
            const nameDefault = `lambda-${generateAlphaNumeric(6, ctx)}`;
            const functionName = resolveStringWithDefault(
                resTyped.Properties.FunctionName,
                nameDefault,
                `${resourceType}.Properties.FunctionName`,
                ctx,
            );
            resource._arn = `arn:${partition}:lambda:${region}:${accountId}:function:${functionName}`;
        }
        return resource._arn;
    },

    /**
     * Generates a unique identifier for an AWS Lambda Function.
     *
     * If the resource does not already have an identifier (_id), this function uses the ARN generated by
     * arnGenFunc as the unique identifier and caches it on the resource for future retrieval.
     *
     * @param resourceType - The type of the resource.
     * @param logicalId - The logical ID of the resource in the CloudFormation template.
     * @param resource - The CloudFormation resource object for the Lambda function.
     * @param ctx - The resolving context that provides helper utilities.
     * @returns The unique identifier for the Lambda function as a string.
     */
    idGenFunc: (resourceType, logicalId, resource, ctx): string => {
        log.trace(`Called idGenFunc, for ${resourceType}, with logicalId=${logicalId}`, resource, ctx);
        if (!resource._id) {
            log.trace(`For ${logicalId} with type ${resourceType} id is not set, will be generated`);
            resource._id = awsLambdaFunctionFunc.arnGenFunc(resourceType, logicalId, resource, ctx);
        }
        return resource._id;
    },
};
