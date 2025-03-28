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
    ) {
        this.stub = new FnStubIntrinsic();
        this.cache = {};
        this.factories = {};

        this.factories[CfIntrinsicFunctions.Ref] = (utils) => new FnRefIntrinsic(utils, this.resolver);
        this.factories[CfIntrinsicFunctions.Fn_Not] = (utils) => new FnNotIntrinsic(utils);
        this.factories[CfIntrinsicFunctions.Fn_And] = (utils) => new FnAndIntrinsic(utils);
        this.factories[CfIntrinsicFunctions.Fn_Contains] = (utils) => new FnContainsIntrinsic(utils);
        this.factories[CfIntrinsicFunctions.Fn_Or] = (utils) => new FnOrIntrinsic(utils);
        this.factories[CfIntrinsicFunctions.Fn_Equals] = (utils) => new FnEqualsIntrinsic(utils);
        this.factories[CfIntrinsicFunctions.Fn_If] = (utils) => new FnIfIntrinsic(utils);
        this.factories[CfIntrinsicFunctions.Fn_ToJsonString] = (utils) => new FnToJsonStringIntrinsic(utils);
        this.factories[CfIntrinsicFunctions.Fn_GetAZs] = (utils) => new FnGetAZsIntrinsic(utils);
        this.factories[CfIntrinsicFunctions.Fn_GetAtt] = (utils) => new FnGetAttIntrinsic(utils, this.resolver);
        this.factories[CfIntrinsicFunctions.Fn_FindInMap] = (utils) => new FnFindInMapIntrinsic(utils);
        this.factories[CfIntrinsicFunctions.Fn_Sub] = (utils) => new FnSubIntrinsic(utils);
        this.factories[CfIntrinsicFunctions.Fn_ImportValue] = (utils) => new FnImportValueIntrinsic(utils);
        this.factories[CfIntrinsicFunctions.Fn_Split] = (utils) => new FnSplitIntrinsic(utils);
        this.factories[CfIntrinsicFunctions.Fn_Join] = (utils) => new FnJoinIntrinsic(utils);
        this.factories[CfIntrinsicFunctions.Fn_Select] = (utils) => new FnSelectIntrinsic(utils);
        this.factories[CfIntrinsicFunctions.Fn_Base64] = (utils) => new FnBase64Intrinsic(utils);
    }

    public getIntrinsic(key: string): Intrinsic {
        if (Object.keys(this.cache).includes(key)) {
            return this.cache[key];
        }

        if (!Object.keys(this.factories).includes(key)) {
            return this.stub;
        }

        const factory = this.factories[key];

        const intrinsic = factory(this.intrinsicUtils);
        this.cache[key] = intrinsic;
        return intrinsic;
    }
}
