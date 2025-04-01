import log from 'loglevel';
import { StringKeyObject } from '../../common';
import { PseudoParam } from '../enums/cf-enums';
import { ParsingValidationError } from '../error/parsing-errors';
import { CloudFormationTemplate } from '../types/cloudformation-model';
import { ResolvingContext } from '../types/resolving-types';
import { ParserUtils, ResourceUtils, ResultParamMap } from '../types/util-service-types';

export class ResolvingContextImpl implements ResolvingContext {
    readonly originalTemplate: CloudFormationTemplate;
    readonly lookupMapPreProcessed: StringKeyObject;
    readonly generatedIds: Set<string>;
    lookupMapDynamic: StringKeyObject;
    currentPath: string[];

    constructor(
        private readonly parserUtils: ParserUtils,
        private readonly resourceUtils: ResourceUtils,
        originalTemplate: CloudFormationTemplate,
        params: ResultParamMap,
    ) {
        log.trace('[ResolvingContextImpl.constructor] Entering with arguments:', { parserUtils, resourceUtils, originalTemplate, params });
        log.debug('[ResolvingContextImpl.constructor] Validating parameters.');
        this.parserUtils.validateParamsList(params);

        this.lookupMapPreProcessed = { ...params };
        log.debug('[ResolvingContextImpl.constructor] Initialized lookupMapPreProcessed:', this.lookupMapPreProcessed);
        this.originalTemplate = originalTemplate;
        log.debug('[ResolvingContextImpl.constructor] Stored originalTemplate.');
        this.currentPath = [];
        log.debug('[ResolvingContextImpl.constructor] Initialized currentPath:', this.currentPath);
        this.lookupMapDynamic = {};
        log.debug('[ResolvingContextImpl.constructor] Initialized lookupMapDynamic:', this.lookupMapDynamic);
        this.generatedIds = new Set();
        log.debug('[ResolvingContextImpl.constructor] Initialized generatedIds:', this.generatedIds);

        log.info('[ResolvingContextImpl.constructor] ResolvingContextImpl initialized');
        log.trace('[ResolvingContextImpl.constructor] Exiting');
    }

    addName(name: string): void {
        log.trace('[ResolvingContextImpl.addName] Entering with arguments:', { name });
        this.currentPath.push(name);
        log.debug(`[ResolvingContextImpl.addName] Added name "${name}" to path. Current path: ${this.getCurrentPath()}`);
        log.trace('[ResolvingContextImpl.addName] Exiting');
    }

    popName(): string {
        log.trace('[ResolvingContextImpl.popName] Entering');
        const popped = this.currentPath.pop() ?? '';
        log.debug(`[ResolvingContextImpl.popName] Popped name "${popped}" from path. New path: ${this.getCurrentPath()}`);
        log.trace('[ResolvingContextImpl.popName] Exiting with result:', popped);
        return popped;
    }

    getCurrentPath(): string {
        log.trace('[ResolvingContextImpl.getCurrentPath] Entering');
        const path = this.currentPath.join('.');
        log.debug(`[ResolvingContextImpl.getCurrentPath] Current path: ${path}`);
        log.trace('[ResolvingContextImpl.getCurrentPath] Exiting with result:', path);
        return path;
    }

    hasParameterName(name: string): boolean {
        log.trace('[ResolvingContextImpl.hasParameterName] Entering with arguments:', { name });
        const exists = this.isParameterInMap(name, this.lookupMapPreProcessed) || this.isParameterInMap(name, this.lookupMapDynamic);
        log.debug(`[ResolvingContextImpl.hasParameterName] Parameter "${name}" exists: ${String(exists)}`);
        log.trace('[ResolvingContextImpl.hasParameterName] Exiting with result:', exists);
        return exists;
    }

    getParameter(name: string): unknown {
        log.trace('[ResolvingContextImpl.getParameter] Entering with arguments:', { name });
        const valueFromPreProcessed = this.getParameterFromMap(name, this.lookupMapPreProcessed, 'pre-processed');
        if (valueFromPreProcessed !== undefined) {
            log.trace(`[ResolvingContextImpl.getParameter] Retrieved parameter "${name}" from pre-processed map.`);
            log.trace('[ResolvingContextImpl.getParameter] Exiting with result:', valueFromPreProcessed);
            return valueFromPreProcessed;
        }

        const valueFromDynamic = this.getParameterFromMap(name, this.lookupMapDynamic, 'dynamic');
        if (valueFromDynamic !== undefined) {
            log.trace(`[ResolvingContextImpl.getParameter] Retrieved parameter "${name}" from dynamic map.`);
            log.trace('[ResolvingContextImpl.getParameter] Exiting with result:', valueFromDynamic);
            return valueFromDynamic;
        }

        log.error(`[ResolvingContextImpl.getParameter] Parameter "${name}" is not supported or does not exist.`);
        throw new ParsingValidationError(name);
    }

    addParameter(name: string, value: unknown): void {
        log.trace('[ResolvingContextImpl.addParameter] Entering with arguments:', { name, value });
        if (this.hasParameterName(name)) {
            log.error(`[ResolvingContextImpl.addParameter] Cannot add parameter "${name}": parameter name already exists.`);
            throw new ParsingValidationError(name);
        }
        this.lookupMapDynamic[name] = value;
        log.debug(`[ResolvingContextImpl.addParameter] Added parameter "${name}" with value:`, value);
        log.trace('[ResolvingContextImpl.addParameter] Exiting');
    }

    addGeneratedId(generatedId: string): void {
        log.trace('[ResolvingContextImpl.addGeneratedId] Entering with arguments:', { generatedId });
        this.generatedIds.add(generatedId);
        log.debug(
            `[ResolvingContextImpl.addGeneratedId] Added generated ID "${generatedId}". Current IDs: ${JSON.stringify(Array.from(this.generatedIds))}`,
        );
        log.trace('[ResolvingContextImpl.addGeneratedId] Exiting');
    }

    isIdExists(idString: string): boolean {
        log.trace('[ResolvingContextImpl.isIdExists] Entering with arguments:', { idString });
        const exists = this.generatedIds.has(idString);
        log.debug(`[ResolvingContextImpl.isIdExists] Generated ID "${idString}" exists: ${String(exists)}`);
        log.trace('[ResolvingContextImpl.isIdExists] Exiting with result:', exists);
        return exists;
    }

    getAZs(region?: string): string[] {
        log.trace('[ResolvingContextImpl.getAZs] Entering with arguments:', { region });
        const targetRegion = region ?? this.getRegion();
        log.debug(`[ResolvingContextImpl.getAZs] Target region: ${targetRegion}`);
        const azs = this.resourceUtils.generateAZs(targetRegion);
        log.debug(`[ResolvingContextImpl.getAZs] Retrieved AZs for region "${targetRegion}":`, azs);
        log.trace('[ResolvingContextImpl.getAZs] Exiting with result:', azs);
        return azs;
    }

    getAccountId(): string {
        log.trace('[ResolvingContextImpl.getAccountId] Entering');
        const accountId = this.getParameter(PseudoParam.AccountId) as string;
        log.debug(`[ResolvingContextImpl.getAccountId] Account ID: ${accountId}`);
        log.trace('[ResolvingContextImpl.getAccountId] Exiting with result:', accountId);
        return accountId;
    }

    getPartition(): string {
        log.trace('[ResolvingContextImpl.getPartition] Entering');
        const partition = this.getParameter(PseudoParam.Partition) as string;
        log.debug(`[ResolvingContextImpl.getPartition] Partition: ${partition}`);
        log.trace('[ResolvingContextImpl.getPartition] Exiting with result:', partition);
        return partition;
    }

    getRegion(): string {
        log.trace('[ResolvingContextImpl.getRegion] Entering');
        const region = this.getParameter(PseudoParam.Region) as string;
        log.debug(`[ResolvingContextImpl.getRegion] Region: ${region}`);
        log.trace('[ResolvingContextImpl.getRegion] Exiting with result:', region);
        return region;
    }

    getStackName(): string {
        log.trace('[ResolvingContextImpl.getStackName] Entering');
        const stackName = this.getParameter(PseudoParam.StackName) as string;
        log.debug(`[ResolvingContextImpl.getStackName] Stack Name: ${stackName}`);
        log.trace('[ResolvingContextImpl.getStackName] Exiting with result:', stackName);
        return stackName;
    }

    private isParameterInMap(name: string, map: StringKeyObject): boolean {
        log.trace('[ResolvingContextImpl.isParameterInMap] Entering with arguments:', { name, map });
        const exists = name in map;
        log.debug(`[ResolvingContextImpl.isParameterInMap] Parameter "${name}" exists in map: ${String(exists)}`);
        log.trace('[ResolvingContextImpl.isParameterInMap] Exiting with result:', exists);
        return exists;
    }

    private getParameterFromMap(name: string, map: StringKeyObject, mapType: 'pre-processed' | 'dynamic'): unknown {
        log.trace('[ResolvingContextImpl.getParameterFromMap] Entering with arguments:', { name, map, mapType });
        if (this.isParameterInMap(name, map)) {
            const value = map[name];
            log.debug(`[ResolvingContextImpl.getParameterFromMap] Retrieved parameter "${name}" from ${mapType} map:`, value);
            log.trace('[ResolvingContextImpl.getParameterFromMap] Exiting with result:', value);
            return value;
        }
        log.trace(`[ResolvingContextImpl.getParameterFromMap] Parameter "${name}" not found in ${mapType} map. Exiting with result: undefined`);
        return undefined;
    }
}
