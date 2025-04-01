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
    ) {
        log.trace('[FnGetAZsIntrinsic.constructor] Entering constructor.');
        log.trace('[FnGetAZsIntrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnGetAZsIntrinsic.constructor] stringUtils:', this.stringUtils);
        log.trace('[FnGetAZsIntrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnGetAZsIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_GetAZs);
        const value = object as FnGetAZs;

        log.trace('[FnGetAZsIntrinsic.resolveValue] Resolving the region value.');
        const region = resolveValue(value['Fn::GetAZs'], ctx);
        log.debug('[FnGetAZsIntrinsic.resolveValue] Resolved region:', region);

        if (typeof region !== 'string' || this.stringUtils.isBlankString(region)) {
            log.trace('[FnGetAZsIntrinsic.resolveValue] Region is blank or not a string, using default AZs.');
            const defaultAZs = ctx.getAZs();
            log.debug('[FnGetAZsIntrinsic.resolveValue] Default AZs:', defaultAZs);
            log.trace('[FnGetAZsIntrinsic.resolveValue] Exiting, returning default AZs:', defaultAZs);
            return defaultAZs;
        }

        log.trace(`[FnGetAZsIntrinsic.resolveValue] Region resolved as "${region}", fetching AZs for region.`);
        const regionalAZs = ctx.getAZs(region);
        log.debug('[FnGetAZsIntrinsic.resolveValue] AZs for region:', region, ':', regionalAZs);
        log.trace('[FnGetAZsIntrinsic.resolveValue] Exiting, returning regional AZs:', regionalAZs);
        return regionalAZs;
    }
}
