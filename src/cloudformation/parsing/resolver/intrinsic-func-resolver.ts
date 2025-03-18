import log from 'loglevel';
import { SupportedIntrinsicFunctions } from '../../constants';
import { IntrinsicFunc, IntrinsicResolver } from '../types/types';
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
} from './intrinsic';

/**
 * Resolves and returns the intrinsic function corresponding to the provided intrinsic key.
 *
 * This resolver maps an intrinsic key (as defined in CloudFormation templates) to its
 * corresponding implementation function. It supports common intrinsic functions such as "Ref",
 * "Fn::GetAtt", and others. If the intrinsic key is not recognized, a stub function is returned.
 *
 * @param intrinsicKey - The key representing the intrinsic function.
 * @returns The intrinsic function if found; otherwise, returns the stub function.
 */
export const intrinsicResolver: IntrinsicResolver = (intrinsicKey: string): IntrinsicFunc => {
    log.trace(`intrinsicResolver called with intrinsicKey: ${intrinsicKey}`);

    // Define the mapping between intrinsic keys and their corresponding function implementations.
    const intrinsicFunctionMap: Record<string, IntrinsicFunc> = {
        [SupportedIntrinsicFunctions.Ref]: fnRef,
        [SupportedIntrinsicFunctions.Fn_Not]: fnNot,
        [SupportedIntrinsicFunctions.Fn_And]: fnAnd,
        [SupportedIntrinsicFunctions.Fn_Or]: fnOr,
        [SupportedIntrinsicFunctions.Fn_Equals]: fnEquals,
        [SupportedIntrinsicFunctions.Fn_If]: fnIf,
        [SupportedIntrinsicFunctions.Fn_ToJsonString]: fnToJsonString,
        [SupportedIntrinsicFunctions.Fn_GetAZs]: fnGetAZs,
        [SupportedIntrinsicFunctions.Fn_GetAtt]: fnGetAtt,
        [SupportedIntrinsicFunctions.Fn_FindInMap]: fnFindInMap,
        [SupportedIntrinsicFunctions.Fn_Sub]: fnSub,
        [SupportedIntrinsicFunctions.Fn_ImportValue]: fnImportValue,
        [SupportedIntrinsicFunctions.Fn_Split]: fnSplit,
        [SupportedIntrinsicFunctions.Fn_Join]: fnJoin,
        [SupportedIntrinsicFunctions.Fn_Select]: fnSelect,
        [SupportedIntrinsicFunctions.Fn_Base64]: fnBase64,
        [SupportedIntrinsicFunctions.Fn_Contains]: fnContains,
    };

    // Check if the intrinsic key exists in the mapping.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (intrinsicFunctionMap[intrinsicKey]) {
        log.trace(`Found intrinsic function for intrinsicKey: ${intrinsicKey}`);
        return intrinsicFunctionMap[intrinsicKey];
    }

    // If the key is not supported, log a warning and return the stub intrinsic function.
    log.warn(`No intrinsic function implemented for intrinsicKey: ${intrinsicKey}. Returning stub function.`);
    return stubIntrinsic;
};
