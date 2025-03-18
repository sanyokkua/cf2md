/**
 * Error thrown when an intrinsic object in a CloudFormation template is invalid.
 *
 * This error indicates that the structure of an intrinsic function object does not meet expected criteria,
 * which could lead to failures during the parsing and evaluation of CloudFormation templates.
 */
export class InvalidIntrinsicObjectError extends Error {
    /**
     * Constructs a new InvalidIntrinsicObjectError.
     *
     * @param message - A descriptive message describing the error.
     */
    constructor(message: string) {
        super(message);
        this.name = 'InvalidIntrinsicObjectError';
    }
}

/**
 * Error thrown when a required key is missing in an intrinsic object within a CloudFormation template.
 *
 * This error signals that a critical component of an intrinsic function is absent, preventing proper processing
 * during the parsing of the template.
 */
export class MissingIntrinsicKeyError extends Error {
    /**
     * Constructs a new MissingIntrinsicKeyError.
     *
     * @param message - A descriptive message identifying the missing key.
     */
    constructor(message: string) {
        super(message);
        this.name = 'MissingIntrinsicKeyError';
    }
}

/**
 * Error thrown when a variable encountered during CloudFormation template parsing is of an unexpected type.
 *
 * This signifies that the format, structure, or kind of the variable does not match what the parser expects,
 * leading to potential issues in resolving intrinsic functions or parameters.
 */
export class UnexpectedVariableTypeError extends Error {
    /**
     * Constructs a new UnexpectedVariableTypeError.
     *
     * @param message - A descriptive message explaining the type mismatch.
     */
    constructor(message: string) {
        super(message);
        this.name = 'UnexpectedVariableTypeError';
    }
}

/**
 * Error thrown when there is an issue resolving context within CloudFormation template parsing.
 *
 * This serves as a base class for errors that occur during the resolution of parameters or intrinsic values,
 * providing a common handler for context-specific resolution failures.
 */
export class ResolvingContextError extends Error {
    /**
     * Constructs a new ResolvingContextError.
     *
     * @param message - A descriptive message that explains the context resolution error.
     */
    constructor(message: string) {
        super(message);
        this.name = 'ResolvingContextError';
    }
}

/**
 * Error thrown when a specific parameter is not found during CloudFormation template parsing.
 *
 * This error indicates that a parameter referenced in the template is either missing or not supported within
 * the parser's context, thereby hindering template resolution.
 *
 * @extends ResolvingContextError
 */
export class ParameterNotFoundError extends ResolvingContextError {
    /**
     * Constructs a new ParameterNotFoundError for a missing or unsupported parameter.
     *
     * @param parameterName - The name of the parameter that could not be found.
     */
    constructor(parameterName: string) {
        super(`Parameter "${parameterName}" is not supported or does not exist.`);
        this.name = 'ParameterNotFoundError';
    }
}

/**
 * Error thrown when a duplicate parameter is added into the CloudFormation template parsing context.
 *
 * This error signals that an attempt to insert a parameter with a name that already exists was made, leading
 * to ambiguity and potential conflicts during parsing.
 *
 * @extends ResolvingContextError
 */
export class DuplicateParameterError extends ResolvingContextError {
    /**
     * Constructs a new DuplicateParameterError for an already existing parameter name.
     *
     * @param parameterName - The duplicate parameter name which triggered the error.
     */
    constructor(parameterName: string) {
        super(`Cannot add parameter "${parameterName}": parameter name already exists.`);
        this.name = 'DuplicateParameterError';
    }
}

/**
 * Custom error thrown when an intrinsic function object is in an incorrect format.
 *
 * This error is used when an intrinsic function in a CloudFormation template does not conform
 * to the expected structure. It provides additional details via the explanation parameter.
 */
export class WrongIntrinsicFormatError extends Error {
    /**
     * Constructs a new WrongIntrinsicFormatError.
     *
     * If a custom message is not provided, a default message is generated using the provided explanation.
     *
     * @param explanation - A description of why the intrinsic format is considered invalid.
     * @param message - An optional custom error message. If omitted, a default message is generated.
     */
    constructor(explanation: string, message: string = '') {
        if (!message) {
            message = `Invalid Intrinsic object. Details: ${explanation}`;
        }
        super(message);
        this.name = 'WrongIntrinsicFormatError';
    }
}
