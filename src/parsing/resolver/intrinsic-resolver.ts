import log from 'loglevel';
import { StringUtils } from '../../common';
import { CfIntrinsicFunctions } from '../enums/cf-enums';
import { Intrinsic, IntrinsicResolver, ResourceIntrinsicResolver } from '../types/intrinsic-types';
import { IntrinsicUtils } from '../types/util-service-types';
import {
    FnAndIntrinsic,
    FnBase64Intrinsic,
    FnContainsIntrinsic,
    FnEqualsIntrinsic,
    FnFindInMapIntrinsic,
    FnGetAttIntrinsic,
    FnGetAZsIntrinsic,
    FnIfIntrinsic,
    FnImportValueIntrinsic,
    FnJoinIntrinsic,
    FnNotIntrinsic,
    FnOrIntrinsic,
    FnRefIntrinsic,
    FnSelectIntrinsic,
    FnSplitIntrinsic,
    FnStubIntrinsic,
    FnSubIntrinsic,
    FnToJsonStringIntrinsic,
} from './intrinsic';

export class IntrinsicResolverImpl implements IntrinsicResolver {
    private readonly stub: Intrinsic;
    private readonly cache: Record<string, Intrinsic>;
    private readonly factories: Record<string, (utils: IntrinsicUtils) => Intrinsic>;

    constructor(
        private readonly intrinsicUtils: IntrinsicUtils,
        private readonly resolver: ResourceIntrinsicResolver,
        private readonly stringUtils: StringUtils,
    ) {
        log.trace('[IntrinsicResolverImpl.constructor] Entering with arguments:', { intrinsicUtils, resolver, stringUtils });
        this.stub = new FnStubIntrinsic();
        log.debug('[IntrinsicResolverImpl.constructor] Initialized stub:', this.stub);
        this.cache = {};
        log.debug('[IntrinsicResolverImpl.constructor] Initialized cache:', this.cache);
        this.factories = {};
        log.debug('[IntrinsicResolverImpl.constructor] Initialized factories:', this.factories);

        this.factories[CfIntrinsicFunctions.Ref] = (utils) => new FnRefIntrinsic(utils, this.resolver);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Ref}`);
        this.factories[CfIntrinsicFunctions.Fn_Not] = (utils) => new FnNotIntrinsic(utils);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Fn_Not}`);
        this.factories[CfIntrinsicFunctions.Fn_And] = (utils) => new FnAndIntrinsic(utils);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Fn_And}`);
        this.factories[CfIntrinsicFunctions.Fn_Contains] = (utils) => new FnContainsIntrinsic(utils);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Fn_Contains}`);
        this.factories[CfIntrinsicFunctions.Fn_Or] = (utils) => new FnOrIntrinsic(utils);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Fn_Or}`);
        this.factories[CfIntrinsicFunctions.Fn_Equals] = (utils) => new FnEqualsIntrinsic(utils);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Fn_Equals}`);
        this.factories[CfIntrinsicFunctions.Fn_If] = (utils) => new FnIfIntrinsic(utils);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Fn_If}`);
        this.factories[CfIntrinsicFunctions.Fn_ToJsonString] = (utils) => new FnToJsonStringIntrinsic(utils);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Fn_ToJsonString}`);
        this.factories[CfIntrinsicFunctions.Fn_GetAZs] = (utils) => new FnGetAZsIntrinsic(utils, this.stringUtils);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Fn_GetAZs}`);
        this.factories[CfIntrinsicFunctions.Fn_GetAtt] = (utils) => new FnGetAttIntrinsic(utils, this.resolver);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Fn_GetAtt}`);
        this.factories[CfIntrinsicFunctions.Fn_FindInMap] = (utils) => new FnFindInMapIntrinsic(utils);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Fn_FindInMap}`);
        this.factories[CfIntrinsicFunctions.Fn_Sub] = (utils) => new FnSubIntrinsic(utils);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Fn_Sub}`);
        this.factories[CfIntrinsicFunctions.Fn_ImportValue] = (utils) => new FnImportValueIntrinsic(utils);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Fn_ImportValue}`);
        this.factories[CfIntrinsicFunctions.Fn_Split] = (utils) => new FnSplitIntrinsic(utils, this.stringUtils);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Fn_Split}`);
        this.factories[CfIntrinsicFunctions.Fn_Join] = (utils) => new FnJoinIntrinsic(utils, this.stringUtils);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Fn_Join}`);
        this.factories[CfIntrinsicFunctions.Fn_Select] = (utils) => new FnSelectIntrinsic(utils);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Fn_Select}`);
        this.factories[CfIntrinsicFunctions.Fn_Base64] = (utils) => new FnBase64Intrinsic(utils);
        log.debug(`[IntrinsicResolverImpl.constructor] Registered factory for ${CfIntrinsicFunctions.Fn_Base64}`);

        log.trace('[IntrinsicResolverImpl.constructor] Exiting');
    }

    public getIntrinsic(key: string): Intrinsic {
        log.trace('[IntrinsicResolverImpl.getIntrinsic] Entering with arguments:', { key });
        if (Object.keys(this.cache).includes(key)) {
            const cachedIntrinsic = this.cache[key];
            log.debug(`[IntrinsicResolverImpl.getIntrinsic] Cache hit for key "${key}". Returning cached intrinsic:`, cachedIntrinsic);
            log.trace('[IntrinsicResolverImpl.getIntrinsic] Exiting with result:', cachedIntrinsic);
            return cachedIntrinsic;
        }

        if (!Object.keys(this.factories).includes(key)) {
            log.warn(`[IntrinsicResolverImpl.getIntrinsic] Intrinsic function "${key}" not found. Returning stub.`);
            log.trace('[IntrinsicResolverImpl.getIntrinsic] Exiting with result:', this.stub);
            return this.stub;
        }

        const factory = this.factories[key];
        log.debug(`[IntrinsicResolverImpl.getIntrinsic] Creating new intrinsic for key "${key}" using factory.`);
        const intrinsic = factory(this.intrinsicUtils);
        log.debug(`[IntrinsicResolverImpl.getIntrinsic] Created intrinsic for key "${key}":`, intrinsic);
        this.cache[key] = intrinsic;
        log.debug(`[IntrinsicResolverImpl.getIntrinsic] Cached intrinsic for key "${key}". Cache size:`, Object.keys(this.cache).length);
        log.trace('[IntrinsicResolverImpl.getIntrinsic] Exiting with result:', intrinsic);
        return intrinsic;
    }
}
