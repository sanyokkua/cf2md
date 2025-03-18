/**
 * Custom error thrown when the input provided for a CloudFormation template is invalid.
 *
 * This error indicates that the JSON string input is null, undefined, or blank,
 * rendering the template input unusable.
 */
export class InvalidTemplateInputError extends Error {
    /**
     * Constructs a new InvalidTemplateInputError.
     *
     * @param message - An optional error message. Defaults to a message stating that the
     * JSON string cannot be null, undefined, or blank.
     */
    constructor(message = 'Invalid CloudFormation template input: JSON string cannot be null, undefined, or blank.') {
        super(message);
        this.name = 'InvalidTemplateInputError';
    }
}

/**
 * Custom error thrown when an unexpected parameter is passed to a function.
 *
 * This error indicates that a parameter which the function did not anticipate has been provided,
 * potentially causing incorrect behavior.
 */
export class UnexpectedParamError extends Error {
    /**
     * Constructs a new UnexpectedParamError.
     *
     * @param message - An optional error message. Defaults to a generic message indicating
     * that an unexpected parameter was passed.
     */
    constructor(message = 'Unexpected param was passed to the function') {
        super(message);
        this.name = 'UnexpectedParamError';
    }
}
