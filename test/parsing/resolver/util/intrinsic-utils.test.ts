import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { IntrinsicUtilsImpl } from '../../../../src/parsing/resolver/util/intrinsic-utils';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('IntrinsicUtilsImpl', () => {
    let intrinsicUtils: IntrinsicUtils;

    beforeEach(() => {
        intrinsicUtils = new IntrinsicUtilsImpl();
    });

    describe('isIntrinsic', () => {
        test('returns false when passed a non-object (null)', () => {
            const result = intrinsicUtils.isIntrinsic(null);
            expect(result).toBe(false);
        });

        test('returns false when passed a non-object (string)', () => {
            const result = intrinsicUtils.isIntrinsic('NotAnObject');
            expect(result).toBe(false);
        });

        test('returns false when object has more than one key', () => {
            const obj = { 'Ref': 'value', 'Fn::Join': 'another' };
            const result = intrinsicUtils.isIntrinsic(obj);
            expect(result).toBe(false);
        });

        test('returns true for a valid intrinsic object with supported key', () => {
            const obj = { [CfIntrinsicFunctions.Ref]: 'someValue' };
            const result = intrinsicUtils.isIntrinsic(obj);
            expect(result).toBe(true);
        });

        test('returns false for an object with single key that is not a supported intrinsic', () => {
            const obj = { 'Fn::Unsupported': 'value' };
            const result = intrinsicUtils.isIntrinsic(obj);
            expect(result).toBe(false);
        });
    });

    describe('getIntrinsicKey', () => {
        test('returns the intrinsic key for a valid intrinsic object', () => {
            const obj = { [CfIntrinsicFunctions.Fn_Sub]: 'value' };
            const key = intrinsicUtils.getIntrinsicKey(obj);
            expect(key).toBe(CfIntrinsicFunctions.Fn_Sub);
        });

        test('returns an empty string for a non-intrinsic object', () => {
            const obj = { notIntrinsic: 'value' };
            const key = intrinsicUtils.getIntrinsicKey(obj);
            expect(key).toBe('');
        });
    });

    describe('validateIntrinsic', () => {
        test('throws error if passed object is not intrinsic', () => {
            const obj = { invalidKey: 'value' };
            expect(() => intrinsicUtils.validateIntrinsic(obj, CfIntrinsicFunctions.Ref)).toThrow('Passed objectNode is not an intrinsic object');
        });

        test('throws error if the expected intrinsic key is not present', () => {
            // Create a valid intrinsic with a supported key.
            const obj = { [CfIntrinsicFunctions.Fn_Not]: 'value' };
            // Validate against a different intrinsic key.
            expect(() => intrinsicUtils.validateIntrinsic(obj, CfIntrinsicFunctions.Ref)).toThrow(
                `Intrinsic key "${CfIntrinsicFunctions.Ref}" is not found in the object`,
            );
        });

        test('does not throw error when object is a valid intrinsic and expected key is present', () => {
            const obj = { [CfIntrinsicFunctions.Fn_ToJsonString]: 'value' };
            expect(() => intrinsicUtils.validateIntrinsic(obj, CfIntrinsicFunctions.Fn_ToJsonString)).not.toThrow();
        });
    });
});
