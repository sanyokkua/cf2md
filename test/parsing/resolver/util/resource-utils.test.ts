import { StringUtils } from '../../../../src/common';
import { ResourceUtilsImpl } from '../../../../src/parsing/resolver/util/resource-utils';
import { ResolvingContext, ValueResolverFunc } from '../../../../src/parsing/types/resolving-types';
import { RandomUtils, ResourceUtils } from '../../../../src/parsing/types/util-service-types';

describe('ResourceUtilsImpl', () => {
    let resourceUtils: ResourceUtils;
    let mockStringUtils: jest.Mocked<StringUtils>;
    let mockRandomUtils: jest.Mocked<RandomUtils>;
    let dummyCtx: jest.Mocked<ResolvingContext>;
    let dummyResolveValue: jest.MockedFunction<ValueResolverFunc>;

    beforeEach(() => {
        // Create mocks for the dependencies.
        mockStringUtils = {
            isBlankString: jest.fn(),
            // @ts-ignore
            isValidNotBlankString: jest.fn(),
            parseTemplateString: jest.fn(),
            replaceTemplateVariables: jest.fn(),
        };

        mockRandomUtils = {
            randomString: jest.fn(),
            randomInteger: jest.fn(),
            randomArray: jest.fn(),
            shortUuid: jest.fn(),
            fullUuid: jest.fn(),
        };

        // Create a dummy ResolvingContext with only necessary functions.
        dummyCtx = {
            originalTemplate: { Resources: {} },
            lookupMapPreProcessed: {},
            generatedIds: new Set<string>(),
            lookupMapDynamic: {},
            currentPath: [],
            addName: jest.fn(),
            popName: jest.fn(),
            getCurrentPath: jest.fn().mockReturnValue('dummy.path'),
            hasParameterName: jest.fn(),
            getParameter: jest.fn(),
            addParameter: jest.fn(),
            addGeneratedId: jest.fn(),
            isIdExists: jest.fn(),
            getRegion: jest.fn().mockReturnValue('us-east-1'),
            getPartition: jest.fn().mockReturnValue('aws'),
            getAccountId: jest.fn().mockReturnValue('123456789012'),
            getAZs: jest.fn(),
            getStackName: jest.fn().mockReturnValue('test-stack'),
        };

        // Dummy resolveValue function.
        dummyResolveValue = jest.fn();

        resourceUtils = new ResourceUtilsImpl(mockStringUtils, mockRandomUtils);
        jest.clearAllMocks();
    });

    describe('generateAZs', () => {
        test('returns AZs when a non-blank region is provided', () => {
            const region = 'us-east-1';
            mockStringUtils.isBlankString.mockReturnValue(false);

            const result = resourceUtils.generateAZs(region);

            expect(result).toEqual([`${region}-1a`, `${region}-1b`]);
            expect(mockStringUtils.isBlankString).toHaveBeenCalledWith(region);
        });

        test('returns empty array when a blank region is provided', () => {
            mockStringUtils.isBlankString.mockReturnValue(true);

            const result = resourceUtils.generateAZs('');
            expect(result).toEqual([]);
        });
    });

    describe('generateAlphaNumeric', () => {
        test('returns a unique alphanumeric string on first attempt', () => {
            const expected = 'ABC123';
            mockRandomUtils.randomString.mockReturnValue(expected);
            dummyCtx.isIdExists.mockReturnValue(false);

            const result = resourceUtils.generateAlphaNumeric(6, dummyCtx);
            expect(result).toBe(expected);
            expect(mockRandomUtils.randomString).toHaveBeenCalledWith(6, 6);
        });

        test('retries until a unique string is generated', () => {
            // Simulate first two attempts produce duplicate values, third is unique.
            mockRandomUtils.randomString.mockReturnValueOnce('DUPLICATE').mockReturnValueOnce('DUPLICATE').mockReturnValueOnce('UNIQUE');
            dummyCtx.isIdExists.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(false);

            const result = resourceUtils.generateAlphaNumeric(6, dummyCtx);
            expect(result).toBe('UNIQUE');
            expect(mockRandomUtils.randomString).toHaveBeenCalledTimes(3);
        });

        test('retries until max attempts exceeded', () => {
            // Simulate first two attempts produce duplicate values, third is unique.
            mockRandomUtils.randomString
                .mockReturnValueOnce('DUPLICATE1')
                .mockReturnValueOnce('DUPLICATE2')
                .mockReturnValueOnce('DUPLICATE3')
                .mockReturnValueOnce('DUPLICATE4')
                .mockReturnValueOnce('DUPLICATE5')
                .mockReturnValueOnce('DUPLICATE6')
                .mockReturnValueOnce('DUPLICATE7')
                .mockReturnValueOnce('DUPLICATE8')
                .mockReturnValueOnce('DUPLICATE9')
                .mockReturnValueOnce('DUPLICATE10');
            dummyCtx.isIdExists.mockReturnValue(true);

            const result = resourceUtils.generateAlphaNumeric(6, dummyCtx);
            expect(result).toBe('DUPLICATE10');
            expect(mockRandomUtils.randomString).toHaveBeenCalledTimes(10);
        });
    });

    describe('shortUuid', () => {
        test('returns a unique short UUID when not already existing', () => {
            const expected = 'short-uuid';
            mockRandomUtils.shortUuid.mockReturnValue(expected);
            dummyCtx.isIdExists.mockReturnValue(false);

            const result = resourceUtils.shortUuid(dummyCtx);
            expect(result).toBe(expected);
            expect(mockRandomUtils.shortUuid).toHaveBeenCalled();
        });

        test('retries until a unique short UUID is generated', () => {
            mockRandomUtils.shortUuid.mockReturnValueOnce('dup').mockReturnValueOnce('dup').mockReturnValueOnce('unique-short');
            dummyCtx.isIdExists.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(false);

            const result = resourceUtils.shortUuid(dummyCtx);
            expect(result).toBe('unique-short');
            expect(mockRandomUtils.shortUuid).toHaveBeenCalledTimes(3);
        });
        test('retries until max attempts exceeded', () => {
            mockRandomUtils.shortUuid
                .mockReturnValueOnce('dup1')
                .mockReturnValueOnce('dup2')
                .mockReturnValueOnce('dup3')
                .mockReturnValueOnce('dup4')
                .mockReturnValueOnce('dup5')
                .mockReturnValueOnce('dup6')
                .mockReturnValueOnce('dup7')
                .mockReturnValueOnce('dup8')
                .mockReturnValueOnce('dup9')
                .mockReturnValueOnce('dup10');
            dummyCtx.isIdExists.mockReturnValue(true);

            const result = resourceUtils.shortUuid(dummyCtx);
            expect(result).toBe('dup10');
            expect(mockRandomUtils.shortUuid).toHaveBeenCalledTimes(10);
        });
    });

    describe('fullUuid', () => {
        test('returns a unique full UUID when not already existing', () => {
            const expected = 'full-uuid';
            mockRandomUtils.fullUuid.mockReturnValue(expected);
            dummyCtx.isIdExists.mockReturnValue(false);

            const result = resourceUtils.fullUuid(dummyCtx);
            expect(result).toBe(expected);
            expect(mockRandomUtils.fullUuid).toHaveBeenCalled();
        });

        test('retries until a unique full UUID is generated', () => {
            mockRandomUtils.fullUuid.mockReturnValueOnce('dup-full').mockReturnValueOnce('unique-full');
            dummyCtx.isIdExists.mockReturnValueOnce(true).mockReturnValueOnce(false);

            const result = resourceUtils.fullUuid(dummyCtx);
            expect(result).toBe('unique-full');
            expect(mockRandomUtils.fullUuid).toHaveBeenCalledTimes(2);
        });

        test('retries until max attempts exceeded', () => {
            mockRandomUtils.fullUuid
                .mockReturnValueOnce('dup-full1')
                .mockReturnValueOnce('dup-full2')
                .mockReturnValueOnce('dup-full3')
                .mockReturnValueOnce('dup-full4')
                .mockReturnValueOnce('dup-full5')
                .mockReturnValueOnce('dup-full6')
                .mockReturnValueOnce('dup-full7')
                .mockReturnValueOnce('dup-full8')
                .mockReturnValueOnce('dup-full9')
                .mockReturnValueOnce('dup-full10');
            dummyCtx.isIdExists.mockReturnValue(true);

            const result = resourceUtils.fullUuid(dummyCtx);
            expect(result).toBe('dup-full10');
            expect(mockRandomUtils.fullUuid).toHaveBeenCalledTimes(10);
        });
    });

    describe('generateGenericId', () => {
        test('generates an ID using stack name, logical ID, and unique alphanumeric string', () => {
            const uniquePart = 'XYZ789';
            jest.spyOn(resourceUtils, 'generateAlphaNumeric').mockReturnValue(uniquePart);
            dummyCtx.getStackName.mockReturnValue('test-stack');

            const result = resourceUtils.generateGenericId('MyResource', 6, dummyCtx);
            expect(result).toBe('test-stack-MyResource-XYZ789');
            expect(resourceUtils.generateAlphaNumeric).toHaveBeenCalledWith(6, dummyCtx);
        });
    });

    describe('generatePrefixedId', () => {
        test('generates a prefixed ID using the provided prefix and unique alphanumeric string', () => {
            const uniquePart = 'ABC999';
            jest.spyOn(resourceUtils, 'generateAlphaNumeric').mockReturnValue(uniquePart);

            const result = resourceUtils.generatePrefixedId('prefix', 6, dummyCtx);
            expect(result).toBe('prefix-ABC999');
            expect(resourceUtils.generateAlphaNumeric).toHaveBeenCalledWith(6, dummyCtx);
        });
    });

    describe('generateNameId', () => {
        test('returns resolved name when resolveStringWithDefault returns a string', () => {
            const defaultName = 'default-123456';
            // Stub generatePrefixedId to return a default name.
            jest.spyOn(resourceUtils, 'generatePrefixedId').mockReturnValue(defaultName);
            // Stub resolveStringWithDefault to simulate a successful resolution.
            jest.spyOn(resourceUtils, 'resolveStringWithDefault').mockReturnValue('ResolvedName');

            const result = resourceUtils.generateNameId('inputName', 'name.path', 'defaultPrefix', dummyCtx, dummyResolveValue, 6);
            expect(result).toBe('ResolvedName');
            expect(resourceUtils.resolveStringWithDefault).toHaveBeenCalledWith('inputName', defaultName, 'name.path', dummyCtx, dummyResolveValue);
        });
    });

    describe('resolveString', () => {
        test('throws an error when property is null or undefined', () => {
            expect(() => resourceUtils.resolveString(null, 'Prop', dummyCtx, dummyResolveValue)).toThrow('Prop must not be null or undefined.');
        });

        test('throws an error when resolved value is not a string', () => {
            dummyResolveValue.mockReturnValue(123);
            expect(() => resourceUtils.resolveString('input', 'Prop', dummyCtx, dummyResolveValue)).toThrow(
                'Prop was resolved to a non-string type.',
            );
        });

        test('returns the resolved string when resolution is successful', () => {
            dummyResolveValue.mockReturnValue('resolved string');
            const result = resourceUtils.resolveString('input', 'Prop', dummyCtx, dummyResolveValue);
            expect(result).toBe('resolved string');
            expect(dummyResolveValue).toHaveBeenCalledWith('input', dummyCtx);
        });
    });

    describe('resolveStringWithDefault', () => {
        test('returns the default value when property is falsy', () => {
            const result = resourceUtils.resolveStringWithDefault(null, 'defaultVal', 'Prop', dummyCtx, dummyResolveValue);
            expect(result).toBe('defaultVal');
        });

        test('returns the resolved string when property resolves to a string', () => {
            dummyResolveValue.mockReturnValue('actualValue');
            const result = resourceUtils.resolveStringWithDefault('input', 'defaultVal', 'Prop', dummyCtx, dummyResolveValue);
            expect(result).toBe('actualValue');
        });

        test('returns the default value when the resolved property is not a string', () => {
            dummyResolveValue.mockReturnValue(456);
            const result = resourceUtils.resolveStringWithDefault('input', 'defaultVal', 'Prop', dummyCtx, dummyResolveValue);
            expect(result).toBe('defaultVal');
        });
    });
});
