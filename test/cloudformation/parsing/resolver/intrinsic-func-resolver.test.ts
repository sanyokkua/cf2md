import log from 'loglevel';
import { SupportedIntrinsicFunctions } from '../../../../src/cloudformation/constants';
import {
    fnAnd,
    fnBase64,
    fnContains,
    fnEquals,
    fnFindInMap,
    fnGetAtt,
    fnGetAZs,
    fnIf,
    fnImportValue,
    fnJoin,
    fnNot,
    fnOr,
    fnRef,
    fnSelect,
    fnSplit,
    fnSub,
    fnToJsonString,
    stubIntrinsic,
} from '../../../../src/cloudformation/parsing/resolver/intrinsic';
import { intrinsicResolver } from '../../../../src/cloudformation/parsing/resolver/intrinsic-func-resolver'; // adjust path accordingly
import { IntrinsicFunc } from '../../../../src/cloudformation/parsing/types/types';

describe('intrinsicResolver', () => {
    let traceSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        traceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
        warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should log the entry message when called', () => {
        const key = SupportedIntrinsicFunctions.Ref;
        intrinsicResolver(key);
        expect(traceSpy).toHaveBeenCalledWith(`intrinsicResolver called with intrinsicKey: ${key}`);
    });

    it.each([
        [SupportedIntrinsicFunctions.Ref, fnRef],
        [SupportedIntrinsicFunctions.Fn_Not, fnNot],
        [SupportedIntrinsicFunctions.Fn_And, fnAnd],
        [SupportedIntrinsicFunctions.Fn_Or, fnOr],
        [SupportedIntrinsicFunctions.Fn_Equals, fnEquals],
        [SupportedIntrinsicFunctions.Fn_If, fnIf],
        [SupportedIntrinsicFunctions.Fn_ToJsonString, fnToJsonString],
        [SupportedIntrinsicFunctions.Fn_GetAZs, fnGetAZs],
        [SupportedIntrinsicFunctions.Fn_GetAtt, fnGetAtt],
        [SupportedIntrinsicFunctions.Fn_FindInMap, fnFindInMap],
        [SupportedIntrinsicFunctions.Fn_Sub, fnSub],
        [SupportedIntrinsicFunctions.Fn_ImportValue, fnImportValue],
        [SupportedIntrinsicFunctions.Fn_Split, fnSplit],
        [SupportedIntrinsicFunctions.Fn_Join, fnJoin],
        [SupportedIntrinsicFunctions.Fn_Select, fnSelect],
        [SupportedIntrinsicFunctions.Fn_Base64, fnBase64],
        [SupportedIntrinsicFunctions.Fn_Contains, fnContains],
    ])(
        'should return the expected intrinsic function for key "%s"',
        (intrinsicKey: string, expectedFn: IntrinsicFunc) => {
            const result = intrinsicResolver(intrinsicKey);
            expect(result).toBe(expectedFn);
            expect(traceSpy).toHaveBeenCalledWith(`Found intrinsic function for intrinsicKey: ${intrinsicKey}`);
        },
    );

    it('should return the stubIntrinsic function for an unsupported intrinsic key', () => {
        const unsupportedKey = 'UnsupportedIntrinsic';
        const result = intrinsicResolver(unsupportedKey);
        expect(result).toBe(stubIntrinsic);
        expect(warnSpy).toHaveBeenCalledWith(
            `No intrinsic function implemented for intrinsicKey: ${unsupportedKey}. Returning stub function.`,
        );
    });
});
