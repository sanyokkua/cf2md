import { StringUtils } from '../../../src/common';
import { CfIntrinsicFunctions } from '../../../src/parsing';
import { IntrinsicResolverImpl } from '../../../src/parsing/resolver/intrinsic-resolver';
import { IntrinsicResolver, ResourceIntrinsicResolver } from '../../../src/parsing/types/intrinsic-types';
import { IntrinsicUtils } from '../../../src/parsing/types/util-service-types';

describe('IntrinsicResolverImpl', () => {
    let resolver: IntrinsicResolver;
    let mockIntrinsicUtils: jest.Mocked<IntrinsicUtils>;
    let mockResourceIntrinsicResolver: jest.Mocked<ResourceIntrinsicResolver>;
    let mockStringUtils: jest.Mocked<StringUtils>;

    beforeEach(() => {
        // Minimal mocks for IntrinsicUtils
        mockIntrinsicUtils = {
            isIntrinsic: jest.fn(),
            getIntrinsicKey: jest.fn(),
            validateIntrinsic: jest.fn(),
        };

        // Minimal mock for ResourceIntrinsicResolver
        mockResourceIntrinsicResolver = {
            getResourceIntrinsic: jest.fn(),
        } as jest.Mocked<ResourceIntrinsicResolver>;

        mockStringUtils = {
            isBlankString: jest.fn(),
            // @ts-ignore
            isValidNotBlankString: jest.fn(),
            parseTemplateString: jest.fn(),
            replaceTemplateVariables: jest.fn(),
            joinStrings: jest.fn(),
            splitString: jest.fn(),
        };

        resolver = new IntrinsicResolverImpl(mockIntrinsicUtils, mockResourceIntrinsicResolver, mockStringUtils);
        jest.clearAllMocks();
    });

    describe('getIntrinsic', () => {
        test('returns a cached intrinsic if the key has been requested before', () => {
            // Arrange
            const key = CfIntrinsicFunctions.Ref;

            // Act
            const firstCall = resolver.getIntrinsic(key);
            const secondCall = resolver.getIntrinsic(key);

            // Assert: Both calls should return the same instance (cached)
            expect(firstCall).toBe(secondCall);
        });

        test('creates and caches a new intrinsic when the key exists in factories', () => {
            // Arrange
            const key = CfIntrinsicFunctions.Fn_Not;

            // Act
            const intrinsicInstance = resolver.getIntrinsic(key);
            const cachedInstance = resolver.getIntrinsic(key);

            // Assert: The intrinsic instance should be created and cached
            expect(intrinsicInstance).toBeDefined();
            expect(cachedInstance).toBe(intrinsicInstance);
            // Additionally, for a valid intrinsic key, the instance should not be the stub.
            const unknownIntrinsic = resolver.getIntrinsic('NonExistentKey');
            expect(intrinsicInstance).not.toBe(unknownIntrinsic);
        });

        test('returns the stub intrinsic for unknown keys', () => {
            // Arrange
            const unknownKey = 'NonExistentKey';

            // Act
            const stubInstanceFirst = resolver.getIntrinsic(unknownKey);
            const stubInstanceSecond = resolver.getIntrinsic(unknownKey);

            // Assert: For an unknown key, the stub should always be returned and cached
            expect(stubInstanceFirst).toBeDefined();
            expect(stubInstanceFirst).toBe(stubInstanceSecond);
        });

        describe.each([
            CfIntrinsicFunctions.Ref,
            CfIntrinsicFunctions.Fn_Not,
            CfIntrinsicFunctions.Fn_And,
            CfIntrinsicFunctions.Fn_Contains,
            CfIntrinsicFunctions.Fn_Or,
            CfIntrinsicFunctions.Fn_Equals,
            CfIntrinsicFunctions.Fn_If,
            CfIntrinsicFunctions.Fn_ToJsonString,
            CfIntrinsicFunctions.Fn_GetAZs,
            CfIntrinsicFunctions.Fn_GetAtt,
            CfIntrinsicFunctions.Fn_FindInMap,
            CfIntrinsicFunctions.Fn_Sub,
            CfIntrinsicFunctions.Fn_ImportValue,
            CfIntrinsicFunctions.Fn_Split,
            CfIntrinsicFunctions.Fn_Join,
            CfIntrinsicFunctions.Fn_Select,
            CfIntrinsicFunctions.Fn_Base64,
        ])('Resolver Test', (intrinsicName) => {
            it(`${intrinsicName} should be defined`, () => {
                expect(resolver.getIntrinsic(intrinsicName)).toBeDefined();
            });
        });
    });
});
