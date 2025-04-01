import log from 'loglevel';
import { CfIntrinsicFunctions } from '../../enums/cf-enums';
import { FnFindInMap } from '../../types/cloudformation-model';
import { Intrinsic } from '../../types/intrinsic-types';
import { ResolvingContext, ValueResolverFunc } from '../../types/resolving-types';
import { IntrinsicUtils } from '../../types/util-service-types';

export class FnFindInMapIntrinsic implements Intrinsic {
    constructor(private readonly intrinsicUtils: IntrinsicUtils) {
        log.trace('[FnFindInMapIntrinsic.constructor] Entering constructor.');
        log.trace('[FnFindInMapIntrinsic.constructor] intrinsicUtils:', this.intrinsicUtils);
        log.trace('[FnFindInMapIntrinsic.constructor] Exiting constructor.');
    }

    resolveValue(object: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc): unknown {
        log.trace('[FnFindInMapIntrinsic.resolveValue] Entering with arguments:', { object, ctx });
        this.intrinsicUtils.validateIntrinsic(object, CfIntrinsicFunctions.Fn_FindInMap);

        const findInMapArray = (object as FnFindInMap)[CfIntrinsicFunctions.Fn_FindInMap];
        log.debug('[FnFindInMapIntrinsic.resolveValue] Extracted array from Fn::FindInMap:', findInMapArray);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!Array.isArray(findInMapArray) || findInMapArray.length !== 3) {
            log.warn('[FnFindInMapIntrinsic.resolveValue] Incorrect format, expected 3 items', findInMapArray);
            const error = new Error('Expected 3 items in Fn::FindInMap array');
            log.error('[FnFindInMapIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        const [mapNameValue, level1KeyValue, level2KeyValue] = findInMapArray;
        log.debug('[FnFindInMapIntrinsic.resolveValue] Map Name Value:', mapNameValue);
        log.debug('[FnFindInMapIntrinsic.resolveValue] Level 1 Key Value:', level1KeyValue);
        log.debug('[FnFindInMapIntrinsic.resolveValue] Level 2 Key Value:', level2KeyValue);

        if (!ctx.originalTemplate.Mappings) {
            log.warn('[FnFindInMapIntrinsic.resolveValue] Template Mappings are missing');
            const error = new Error('Template Mappings are missing. Fn::FindInMap cannot search for a value');
            log.error('[FnFindInMapIntrinsic.resolveValue] Error:', error);
            throw error;
        }

        const mapName = this.resolveAndValidateString(mapNameValue, ctx, resolveValue, 'MapName');
        log.debug('[FnFindInMapIntrinsic.resolveValue] Resolved Map Name:', mapName);
        const level1Key = this.resolveAndValidateString(level1KeyValue, ctx, resolveValue, 'Top-level key');
        log.debug('[FnFindInMapIntrinsic.resolveValue] Resolved Top-level Key:', level1Key);
        const level2Key = this.resolveAndValidateString(level2KeyValue, ctx, resolveValue, 'Second-level key');
        log.debug('[FnFindInMapIntrinsic.resolveValue] Resolved Second-level Key:', level2Key);

        const mapping = ctx.originalTemplate.Mappings;
        const map = mapping[mapName];

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!map) {
            log.warn(`[FnFindInMapIntrinsic.resolveValue] Mapping "${mapName}" not found in template Mappings`);
            const error = new Error(`Mapping with name "${mapName}" not found`);
            log.error('[FnFindInMapIntrinsic.resolveValue] Error:', error);
            throw error;
        }
        log.debug('[FnFindInMapIntrinsic.resolveValue] Found Mapping:', map);

        const level1Map = map[level1Key];

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!level1Map) {
            log.warn(`[FnFindInMapIntrinsic.resolveValue] Mapping for key "${level1Key}" not found in mapping "${mapName}"`);
            const error = new Error(`Mapping for key "${level1Key}" not found in mapping "${mapName}"`);
            log.error('[FnFindInMapIntrinsic.resolveValue] Error:', error);
            throw error;
        }
        log.debug('[FnFindInMapIntrinsic.resolveValue] Found Level 1 Map:', level1Map);

        const mapValue = level1Map[level2Key];

        if (mapValue === undefined || mapValue === null) {
            log.warn(
                `[FnFindInMapIntrinsic.resolveValue] Value for key "${level2Key}" not found in mapping "${mapName}" at top-level key "${level1Key}"`,
            );
            const error = new Error(`Value for key "${level2Key}" not found in mapping "${mapName}" at top-level key "${level1Key}"`);
            log.error('[FnFindInMapIntrinsic.resolveValue] Error:', error);
            throw error;
        }
        log.debug('[FnFindInMapIntrinsic.resolveValue] Found Map Value:', mapValue);

        log.trace(`[FnFindInMapIntrinsic.resolveValue] Found value for map "${mapName}", level1 "${level1Key}", level2 "${level2Key}"`);
        log.trace('[FnFindInMapIntrinsic.resolveValue] Exiting, returning:', mapValue);
        return mapValue;
    }

    private resolveAndValidateString(value: unknown, ctx: ResolvingContext, resolveValue: ValueResolverFunc, paramName: string): string {
        log.trace('[FnFindInMapIntrinsic.resolveAndValidateString] Entering with arguments:', { value, ctx, paramName });
        log.trace('[FnFindInMapIntrinsic.resolveAndValidateString] Resolving value for:', paramName);
        const resolvedValue = resolveValue(value, ctx);
        log.trace('[FnFindInMapIntrinsic.resolveAndValidateString] Resolved value for:', paramName, ':', resolvedValue);
        if (typeof resolvedValue !== 'string') {
            log.warn(`[FnFindInMapIntrinsic.resolveAndValidateString] ${paramName} is not a string`, resolvedValue);
            const error = new Error(`Expected ${paramName.toLowerCase()} to be a string`);
            log.error('[FnFindInMapIntrinsic.resolveAndValidateString] Error:', error);
            throw error;
        }
        log.trace('[FnFindInMapIntrinsic.resolveAndValidateString] Exiting, returning:', resolvedValue);
        return resolvedValue;
    }
}
