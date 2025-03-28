import log from 'loglevel';
import { StringKeyObject } from '../../common';
import { PseudoParam } from '../enums/cf-enums';
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
        this.parserUtils.validateParamsList(params);

        // Initialize the pre-processed lookup map using the spread operator.
        this.lookupMapPreProcessed = { ...params };
        this.originalTemplate = originalTemplate;
        this.currentPath = [];
        this.lookupMapDynamic = {};
        this.generatedIds = new Set();

        log.trace('ResolvingContextImpl initialized');
    }

    addName(name: string): void {
        this.currentPath.push(name);
        log.trace(`Added name "${name}" to path. Current path: ${this.getCurrentPath()}`);
    }

    popName(): string {
        const popped = this.currentPath.pop() ?? '';
        log.trace(`Popped name "${popped}" from path. New path: ${this.getCurrentPath()}`);
        return popped;
    }

    getCurrentPath(): string {
        return this.currentPath.join('.');
    }

    hasParameterName(name: string): boolean {
        const isNameInPreProcessed = name in this.lookupMapPreProcessed;
        const isNameInDynamic = name in this.lookupMapDynamic;
        const exists = isNameInPreProcessed || isNameInDynamic;
        log.trace(`Parameter "${name}" exists: ${String(exists)}`);
        return exists;
    }

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
        throw new Error(name);
    }

    addParameter(name: string, value: unknown): void {
        if (this.hasParameterName(name)) {
            log.error(`Cannot add parameter "${name}": parameter name already exists.`);
            throw new Error(name);
        }
        this.lookupMapDynamic[name] = value;
        log.debug(`Added parameter "${name}" with value:`, value);
    }

    addGeneratedId(generatedId: string): void {
        this.generatedIds.add(generatedId);
        log.trace(`Added generated ID "${generatedId}". Current IDs: ${JSON.stringify(Array.from(this.generatedIds))}`);
    }

    isIdExists(idString: string): boolean {
        const exists = this.generatedIds.has(idString);
        log.trace(`Generated ID "${idString}" exists: ${String(exists)}`);
        return exists;
    }

    getAZs(region?: string): string[] {
        const targetRegion = region ?? this.getRegion();
        const azs = this.resourceUtils.generateAZs(targetRegion);
        log.debug(`Retrieved AZs for region "${targetRegion}":`, azs);
        return azs;
    }

    getAccountId(): string {
        const accountId = this.getParameter(PseudoParam.AccountId) as string;
        log.trace(`Retrieved account ID: ${accountId}`);
        return accountId;
    }

    getPartition(): string {
        const partition = this.getParameter(PseudoParam.Partition) as string;
        log.trace(`Retrieved partition: ${partition}`);
        return partition;
    }

    getRegion(): string {
        const region = this.getParameter(PseudoParam.Region) as string;
        log.trace(`Retrieved region: ${region}`);
        return region;
    }

    getStackName(): string {
        const stackName = this.getParameter(PseudoParam.StackName) as string;
        log.trace(`Retrieved stack name: ${stackName}`);
        return stackName;
    }
}
