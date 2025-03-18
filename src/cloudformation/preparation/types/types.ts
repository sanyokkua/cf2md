/**
 * Represents a parameter extracted from a CloudFormation template.
 */
export type TemplateParam = {
    /** The key/name of the parameter. */
    paramKey: string;
    /** The type of the parameter (e.g., String, Number). */
    paramType: string;
    /** The default value or provided value of the parameter. */
    paramValue: unknown;
    /** Indicates whether the parameter is required. */
    isRequired: boolean;
    /** A generated stub that can be used if no value is provided. */
    generatedStub: unknown;
};

/**
 * Represents a parameter provided by the user.
 */
export type UserProvidedParam = {
    /** The key/name of the parameter. */
    paramKey: string;
    /** The value provided by the user. */
    paramValue: unknown;
};

/**
 * A mapping of parameter keys to their resolved values.
 */
export type ResultParamMap = {
    [key: string]: unknown;
};

/**
 * Statistics collected during parameter merge process.
 */
export type MergeStatistics = {
    /** The total number of parameters processed. */
    totalParamsProcessed: number;
    /** The list of parameters that were overridden by user input. */
    overriddenParams: string[];
    /** The count of parameters that were changed during merge. */
    changedCount: number;
    /** The list of required parameters that were missing values. */
    missingRequiredParams: string[];
};
