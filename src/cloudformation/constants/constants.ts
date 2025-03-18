import { PseudoParam } from './enums';

/**
 * Default pseudo parameter values for AWS CloudFormation templates.
 *
 * This object maps CloudFormation pseudo parameter keys (from the `PseudoParam` enumeration)
 * to their default values. During the parsing of AWS CloudFormation templates, these defaults
 * help ensure that pseudo parameters have predictable fallback values. This is especially useful
 * for testing and development within the specific context of AWS CloudFormation.
 *
 * Note:
 * - The values provided here are representative examples and can be adjusted to suit your parser's needs.
 * - Each inline comment provides additional context for the corresponding pseudo parameter.
 *
 * @property [PseudoParam.AccountId] - Default AWS account ID used in CloudFormation templates.
 * @property [PseudoParam.NotificationARNs] - Default as an empty list; typically a list of ARN strings.
 * @property [PseudoParam.NoValue] - Indicates the removal of a property in a CloudFormation template.
 * @property [PseudoParam.Partition] - Standard AWS partition, usually 'aws'.
 * @property [PseudoParam.Region] - Default AWS region assigned for the template parser.
 * @property [PseudoParam.StackName] - Example stack name used within AWS CloudFormation.
 * @property [PseudoParam.StackId] - Example ARN representing a CloudFormation stack.
 * @property [PseudoParam.URLSuffix] - Default URL suffix common to AWS regions.
 */
export const DefaultPseudoParamValues: { [key: string]: unknown } = {
    // Provide a default AWS account ID for CloudFormation templates
    [PseudoParam.AccountId]: '123456789012', // Example AWS account ID

    // Default to an empty array, representing no notification ARNs by default
    [PseudoParam.NotificationARNs]: [], // Typically a list of ARN strings

    // Represents a special case where a property is intentionally omitted
    [PseudoParam.NoValue]: undefined,

    // The default AWS partition (usually 'aws')
    [PseudoParam.Partition]: 'aws',

    // Default AWS region, useful for local testing or fallback behavior
    [PseudoParam.Region]: 'us-west-2',

    // A placeholder stack name used for simple testing or default value contexts
    [PseudoParam.StackName]: 'teststack',

    // An example CloudFormation stack ARN providing reference for a default stack ID
    [PseudoParam.StackId]: 'arn:aws:cloudformation:us-west-2:123456789012:stack/teststack/unique-stack-id',

    // Default URL suffix commonly used in AWS regions
    [PseudoParam.URLSuffix]: 'amazonaws.com',
};
