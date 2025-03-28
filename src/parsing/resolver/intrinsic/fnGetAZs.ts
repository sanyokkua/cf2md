import log from 'loglevel';
import { StringUtils } from '../../../common';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnGetAZs } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnGetAZsIntrinsic implements Intrinsic {
    constructor(
        private readonly intrinsicUtils: IntrinsicUtils,
        private readonly stringUtils: StringUtils,
    ) {}

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('fnGetAZs is called');
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_GetAZs);
        const value = object as FnGetAZs;

        const region = resolveValue(value['Fn::GetAZs'], ctx);
        if (typeof region !== 'string' || this.stringUtils.isBlankString(region)) {
            log.trace('fnGetAZs: Region is blank or not a string, using default AZs');
            return ctx.getAZs();
        }

        log.trace(`fnGetAZs: Region resolved as "${region}", fetching AZs for region`);
        return ctx.getAZs(region);
    }
}
