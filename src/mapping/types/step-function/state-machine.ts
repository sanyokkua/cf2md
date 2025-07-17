export type StateType = 'Task' | 'Choice' | 'Wait' | 'Parallel' | 'Map' | 'Pass' | 'Succeed' | 'Fail';

export type QueryLanguage = 'JSONPath' | 'JSONata';

/**
 * Common fields shared by all states
 */
interface BaseStateCommon {
    Type: StateType;
    Comment?: string;
    InputPath?: string;
    OutputPath?: string;
    ResultPath?: string;
    QueryLanguage?: QueryLanguage;
}

/**
 * Retry behavior for Task states
 */
export interface RetryConfig {
    ErrorEquals: string[];
    IntervalSeconds?: number;
    MaxAttempts?: number;
    BackoffRate?: number;
    MaxDelaySeconds?: number;
    JitterStrategy?: 'NONE' | 'FULL';
}

/**
 * Catch behavior for Task, Parallel, Map, and Fail states
 */
export interface CatchConfig {
    ErrorEquals: string[];
    Next: string;
    ResultPath?: string;
    ResultSelector?: Record<string, unknown>;
    OutputPath?: string;
    /** JSONata assignment */
    Assign?: Record<string, unknown>;
}

/**
 * Fail-specific fields
 */
export interface FailStateSpecific {
    Error?: string;
    Cause?: string;
    ErrorPath?: string;
    CausePath?: string;
}

/**
 * Task state
 */
export interface TaskState extends BaseStateCommon {
    Type: 'Task';
    Resource: string;
    Parameters?: Record<string, unknown>;
    Credentials?: Record<string, unknown>;
    // Timeouts
    TimeoutSeconds?: number;
    TimeoutSecondsPath?: string;
    HeartbeatSeconds?: number;
    HeartbeatSecondsPath?: string;
    // Response shaping
    ResultSelector?: Record<string, unknown>;
    // Error handling
    Retry?: RetryConfig[];
    Catch?: CatchConfig[];
    Next?: string;
    End?: boolean;
}

/**
 * Choice rule operators (example subset)
 */
export interface BaseChoiceRule {
    Next: string;
    Variable?: string;
    And?: ChoiceRule[];
    Or?: ChoiceRule[];
    Not?: ChoiceRule;
}

export type ComparisonChoice =
    | (BaseChoiceRule & { StringEquals: string })
    | (BaseChoiceRule & { NumericGreaterThan: number })
    | (BaseChoiceRule & { NumericLessThan: number })
    | (BaseChoiceRule & { BooleanEquals: boolean })
    | (BaseChoiceRule & { TimestampGreaterThan: string });

export type ChoiceRule =
    | ComparisonChoice
    | (BaseChoiceRule & { And: ChoiceRule[] })
    | (BaseChoiceRule & { Or: ChoiceRule[] })
    | (BaseChoiceRule & { Not: ChoiceRule });

/**
 * Choice state
 */
export interface ChoiceState extends BaseStateCommon {
    Type: 'Choice';
    Choices: ChoiceRule[];
    Default?: string;
}

/**
 * Wait state
 */
export interface WaitState extends BaseStateCommon {
    Type: 'Wait';
    Seconds?: number;
    Timestamp?: string;
    SecondsPath?: string;
    TimestampPath?: string;
    Next?: string;
    End?: boolean;
}

/**
 * Parallel state
 */
export interface ParallelState extends BaseStateCommon {
    Type: 'Parallel';
    Branches: StateMachineAsl[];
    // concurrency
    MaxConcurrency?: number;
    MaxConcurrencyPath?: string;
    // JSONata shaping
    Arguments?: Record<string, unknown>;
    Output?: unknown;
    // error handling
    Retry?: RetryConfig[];
    Catch?: CatchConfig[];
    Next?: string;
    End?: boolean;
}

/**
 * Map state
 */
export interface MapState extends BaseStateCommon {
    Type: 'Map';
    Iterator: {
        StartAt: string;
        States: Record<string, StateMachineAslState>;
    };
    ItemsPath?: string;
    MaxConcurrency?: number;
    MaxConcurrencyPath?: string;
    // failure tolerance
    ToleratedFailureCount?: number;
    ToleratedFailurePercentage?: number;
    ToleratedFailureCountPath?: string;
    ToleratedFailurePercentagePath?: string;
    // reader/batcher APIs
    ItemReader?: Record<string, unknown>;
    ItemSelector?: Record<string, unknown>;
    ItemBatcher?: Record<string, unknown>;
    ResultWriter?: Record<string, unknown>;
    // error handling
    Retry?: RetryConfig[];
    Catch?: CatchConfig[];
    Next?: string;
    End?: boolean;
}

/**
 * Pass state
 */
export interface PassState extends BaseStateCommon {
    Type: 'Pass';
    Parameters?: Record<string, unknown>;
    Result?: unknown;
    ResultSelector?: Record<string, unknown>;
    ResultPath?: string;
    Next?: string;
    End?: boolean;
}

/**
 * Succeed state
 */
export interface SucceedState extends BaseStateCommon {
    Type: 'Succeed';
}

/**
 * Fail state
 */
export interface FailState extends BaseStateCommon, FailStateSpecific {
    Type: 'Fail';
}

/**
 * Union of all ASL state definitions
 */
export type StateMachineAslState = TaskState | ChoiceState | WaitState | ParallelState | MapState | PassState | SucceedState | FailState;

/**
 * Full state machine definition
 */
export interface StateMachineAsl {
    Comment?: string;
    StartAt: string;
    States: Record<string, StateMachineAslState>;
    TimeoutSeconds?: number;
    Version?: string;
    QueryLanguage?: QueryLanguage;
}
