import log from 'loglevel';
import { PseudoParam } from '../../constants';
import { ResultParamMap, validateParamsList } from '../../preparation';
import { CloudFormationTemplate } from '../../types/cloudformation-model';
import { DuplicateParameterError, ParameterNotFoundError } from '../errors/errors';
import { ResolvingContext, StringKeyObject } from '../types/types';
import { generateAZs } from '../utils/helper-utils';

/**
 * Resource-specific functions for resolving CloudFormation templates.
 *
 * This module contains an implementation of the ResolvingContext interface, which is responsible for
 * processing CloudFormation templates and resolving parameters. It validates parameters, maintains a
 * set of dynamically added parameters, handles resolution paths for debugging purposes, and provides
 * helper methods for obtaining environment-specific values such as region, account, and partition.
 * Additionally, it generates unique IDs and ensures that generated identifiers are unique across the template.
 *
 * The ResolvingContextImpl is used across the CloudFormation parser to resolve intrinsic functions.
 *
 * @example
 * const context = new ResolvingContextImpl(template, params);
 * const accountId = context.getAccountId();
 */
export class ResolvingContextImpl implements ResolvingContext {
    /** The original CloudFormation template to be processed. */
    readonly originalTemplate: CloudFormationTemplate;

    /** A pre-processed lookup map containing initial parameter values. */
    readonly lookupMapPreProcessed: StringKeyObject;

    /** A set to store generated IDs and ensure each ID is unique. */
    readonly generatedIds: Set<string>;

    /** A dynamic lookup map to store parameters resolved or added after pre-processing. */
    lookupMapDynamic: StringKeyObject;

    /** The current resolution path used for debugging and tracking recursive resolution. */
    currentPath: string[];

    /**
     * Creates an instance of ResolvingContextImpl.
     *
     * This constructor validates the provided parameters, initializes the pre-processed lookup map,
     * and sets up an empty dynamic lookup map, empty current path, and an empty set for generated IDs.
     *
     * @param originalTemplate - The CloudFormation template to be processed.
     * @param params - A mapping of parameter names to their initial values.
     *
     * @throws ResolvingContextError If parameter validation fails.
     */
    constructor(originalTemplate: CloudFormationTemplate, params: ResultParamMap) {
        // Validate parameters before processing.
        validateParamsList(params);

        // Initialize the pre-processed lookup map using the spread operator.
        this.lookupMapPreProcessed = { ...params };
        this.originalTemplate = originalTemplate;
        this.currentPath = [];
        this.lookupMapDynamic = {};
        this.generatedIds = new Set();

        log.trace('ResolvingContextImpl initialized');
    }

    /**
     * Adds a name to the current resolution path.
     *
     * This method is used to track the resolution path of intrinsic functions, which aids in debugging.
     *
     * @param name - The name to add to the resolution path.
     */
    addName(name: string): void {
        this.currentPath.push(name);
        log.trace(`Added name "${name}" to path. Current path: ${this.getCurrentPath()}`);
    }

    /**
     * Removes and returns the most recently added name from the resolution path.
     *
     * This helps in backtracking the resolution process during the parsing of CloudFormation templates.
     *
     * @returns The removed name if available; otherwise, an empty string.
     */
    popName(): string {
        const popped = this.currentPath.pop() ?? '';
        log.trace(`Popped name "${popped}" from path. New path: ${this.getCurrentPath()}`);
        return popped;
    }

    /**
     * Returns the current resolution path as a dot-separated string.
     *
     * This representation is useful for debugging complex intrinsic resolution paths.
     *
     * @returns The current resolution path as a string.
     */
    getCurrentPath(): string {
        return this.currentPath.join('.');
    }

    /**
     * Checks if a parameter name exists within the pre-processed or dynamic lookup maps.
     *
     * This method determines whether a parameter has already been defined either at the
     * pre-processing stage or dynamically during parsing.
     *
     * @param name - The parameter name to check.
     * @returns True if the parameter exists; otherwise, false.
     */
    hasParameterName(name: string): boolean {
        const isNameInPreProcessed = name in this.lookupMapPreProcessed;
        const isNameInDynamic = name in this.lookupMapDynamic;
        const exists = isNameInPreProcessed || isNameInDynamic;
        log.trace(`Parameter "${name}" exists: ${String(exists)}`);
        return exists;
    }

    /**
     * Retrieves the value for a parameter with the specified name.
     *
     * Searches for the parameter in both the pre-processed and dynamic lookup maps. If the parameter
     * exists, its value is returned; otherwise, a ParameterNotFoundError is thrown.
     *
     * @param name - The name of the parameter to retrieve.
     * @returns The value of the parameter.
     *
     * @throws ParameterNotFoundError If the parameter is not found in either lookup map.
     */
    getParameter(name: string): unknown {
        if (this.hasParameterName(name)) {
            if (name in this.lookupMapPreProcessed) {
                const value = this.lookupMapPreProcessed[name];
                log.trace(`Retrieved parameter "${name}" from pre-processed map:`, value);
                return value;
            }
            if (name in this.lookupMapDynamic) {
                const value = this.lookupMapDynamic[name];
                log.trace(`Retrieved parameter "${name}" from dynamic map:`, value);
                return value;
            }
        }
        log.error(`Parameter "${name}" is not supported or does not exist.`);
        throw new ParameterNotFoundError(name);
    }

    /**
     * Adds a new parameter to the dynamic lookup map.
     *
     * This method allows parameters that are resolved during parsing to be added to the dynamic map.
     * It throws a DuplicateParameterError if the parameter already exists.
     *
     * @param name - The name of the parameter to add.
     * @param value - The value of the parameter.
     *
     * @throws DuplicateParameterError If the parameter already exists.
     */
    addParameter(name: string, value: unknown): void {
        if (this.hasParameterName(name)) {
            log.error(`Cannot add parameter "${name}": parameter name already exists.`);
            throw new DuplicateParameterError(name);
        }
        this.lookupMapDynamic[name] = value;
        log.debug(`Added parameter "${name}" with value:`, value);
    }

    /**
     * Records a generated ID to ensure it is unique.
     *
     * The generated ID is added to a set to track all unique IDs produced during parsing.
     *
     * @param generatedId - The ID that was generated.
     */
    addGeneratedId(generatedId: string): void {
        this.generatedIds.add(generatedId);
        log.trace(`Added generated ID "${generatedId}". Current IDs: ${JSON.stringify(Array.from(this.generatedIds))}`);
    }

    /**
     * Checks whether a generated ID already exists.
     *
     * This method verifies if the given ID is already part of the set of generated IDs.
     *
     * @param idString - The generated ID to check.
     * @returns True if the ID exists; otherwise, false.
     */
    isIdExists(idString: string): boolean {
        const exists = this.generatedIds.has(idString);
        log.trace(`Generated ID "${idString}" exists: ${String(exists)}`);
        return exists;
    }

    /**
     * Retrieves the list of Availability Zones (AZs) for a specified region.
     *
     * If no region is provided, the region from the current context is used.
     *
     * @param region - (Optional) The AWS region for which to retrieve AZs.
     * @returns An array of AZ identifiers.
     */
    getAZs(region?: string): string[] {
        const targetRegion = region ?? this.getRegion();
        const azs = generateAZs(targetRegion);
        log.debug(`Retrieved AZs for region "${targetRegion}":`, azs);
        return azs;
    }

    /**
     * Retrieves the AWS account ID from the current context.
     *
     * @returns The account ID as a string.
     *
     * @throws ParameterNotFoundError If the account ID is missing or invalid.
     */
    getAccountId(): string {
        const accountId = this.getParameter(PseudoParam.AccountId) as string;
        log.trace(`Retrieved account ID: ${accountId}`);
        return accountId;
    }

    /**
     * Retrieves the AWS partition from the current context (e.g., "aws", "aws-cn").
     *
     * @returns The partition as a string.
     *
     * @throws ParameterNotFoundError If the partition is missing or invalid.
     */
    getPartition(): string {
        const partition = this.getParameter(PseudoParam.Partition) as string;
        log.trace(`Retrieved partition: ${partition}`);
        return partition;
    }

    /**
     * Retrieves the AWS region from the current context.
     *
     * @returns The region as a string.
     *
     * @throws ParameterNotFoundError If the region is missing or invalid.
     */
    getRegion(): string {
        const region = this.getParameter(PseudoParam.Region) as string;
        log.trace(`Retrieved region: ${region}`);
        return region;
    }
}
