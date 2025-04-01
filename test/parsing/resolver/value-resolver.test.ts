// Create a dummy context implementing ResolvingContext for testing purposes.
import { ValueResolverImpl } from '../../../src/parsing/resolver/value-resolver';
import { CloudFormationTemplate } from '../../../src/parsing/types/cloudformation-model';
import { Intrinsic, IntrinsicResolver } from '../../../src/parsing/types/intrinsic-types';
import { ResolvingContext, ValueResolver } from '../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../src/parsing/types/util-service-types';

const createDummyContext = (): ResolvingContext => {
    return {
        originalTemplate: {} as CloudFormationTemplate,
        lookupMapPreProcessed: {},
        generatedIds: new Set<string>(),
        lookupMapDynamic: {},
        currentPath: [],
        addName: jest.fn(),
        popName: jest.fn(() => 'dummy'),
        getCurrentPath: jest.fn(() => 'dummyPath'),
        hasParameterName: jest.fn(),
        getParameter: jest.fn(),
        addParameter: jest.fn(),
        addGeneratedId: jest.fn(),
        isIdExists: jest.fn(),
        getRegion: jest.fn(() => 'us-east-1'),
        getPartition: jest.fn(() => 'aws'),
        getAccountId: jest.fn(() => '123456789012'),
        getAZs: jest.fn(() => ['us-east-1a']),
        getStackName: jest.fn(() => 'test-stack'),
    };
};

describe('ValueResolver', () => {
    let valueResolver: ValueResolver;
    let mockIntrinsicUtils: jest.Mocked<IntrinsicUtils>;
    let mockIntrinsicResolver: jest.Mocked<IntrinsicResolver>;
    let dummyCtx: ResolvingContext;

    beforeEach(() => {
        mockIntrinsicUtils = {
            isIntrinsic: jest.fn(),
            getIntrinsicKey: jest.fn(),
            validateIntrinsic: jest.fn(),
            deepEqual: jest.fn(),
        };

        mockIntrinsicResolver = {
            getIntrinsic: jest.fn(),
        };

        dummyCtx = createDummyContext();

        valueResolver = new ValueResolverImpl(mockIntrinsicUtils, mockIntrinsicResolver);
        jest.clearAllMocks();
    });

    describe('resolveValue', () => {
        test('returns a primitive string value unchanged', () => {
            // Arrange
            const primitive = 'simple string';

            // Act
            const result = valueResolver.resolveValue(primitive, dummyCtx);

            // Assert
            expect(result).toBe(primitive);
        });

        test('returns a primitive number value unchanged', () => {
            // Arrange
            const primitive = 5;

            // Act
            const result = valueResolver.resolveValue(primitive, dummyCtx);

            // Assert
            expect(result).toBe(primitive);
        });

        test('returns a primitive boolean value unchanged', () => {
            // Arrange
            const primitive = false;

            // Act
            const result = valueResolver.resolveValue(primitive, dummyCtx);

            // Assert
            expect(result).toBe(primitive);
        });

        test('recursively resolves an array', () => {
            // Arrange
            const arrayInput = [1, 'two', { key: 'value' }];
            // For non-intrinsic object resolution, mark object as not intrinsic.
            mockIntrinsicUtils.isIntrinsic.mockReturnValue(false);
            // Act
            const result = valueResolver.resolveValue(arrayInput, dummyCtx);

            // Assert
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual(expect.arrayContaining([1, 'two', { key: 'value' }]));
            // Ensure resolveValue was called recursively.
            expect((result as []).length).toBe(arrayInput.length);
        });

        test('recursively resolves a non-intrinsic object', () => {
            // Arrange
            const objectInput = { a: 1, b: 'text' };
            mockIntrinsicUtils.isIntrinsic.mockReturnValue(false);
            // Act
            const result = valueResolver.resolveValue(objectInput, dummyCtx);

            // Assert
            expect(result).toEqual(objectInput);
        });

        describe('when the object is intrinsic', () => {
            let mockIntrinsic: jest.Mocked<Intrinsic>;
            const intrinsicKey = 'Fn::Join';

            beforeEach(() => {
                // Arrange intrinsic-related mocks.
                mockIntrinsicUtils.isIntrinsic.mockReturnValue(true);
                mockIntrinsicUtils.getIntrinsicKey.mockReturnValue(intrinsicKey);

                mockIntrinsic = {
                    resolveValue: jest.fn().mockReturnValue('resolved-intrinsic'),
                } as unknown as jest.Mocked<Intrinsic>;

                mockIntrinsicResolver.getIntrinsic.mockReturnValue(mockIntrinsic);
            });

            test('resolves intrinsic object correctly', () => {
                // Arrange
                const intrinsicObject = { 'Fn::Join': [',', ['a', 'b', 'c']] };

                // Act
                const result = valueResolver.resolveValue(intrinsicObject, dummyCtx);

                // Assert
                expect(mockIntrinsicUtils.getIntrinsicKey).toHaveBeenCalledWith(intrinsicObject);
                expect(mockIntrinsicResolver.getIntrinsic).toHaveBeenCalledWith(intrinsicKey);
                expect(mockIntrinsic.resolveValue).toHaveBeenCalledWith(intrinsicObject, dummyCtx, expect.any(Function));
                expect(result).toBe('resolved-intrinsic');
            });

            test('throws an error when intrinsic key is missing', () => {
                // Arrange
                const intrinsicObject = { someKey: 'value' };
                mockIntrinsicUtils.getIntrinsicKey.mockReturnValue('');

                // Act & Assert
                expect(() => valueResolver.resolveValue(intrinsicObject, dummyCtx)).toThrow('Intrinsic key missing');
            });

            test('propagates error thrown by intrinsic resolution', () => {
                // Arrange
                const intrinsicObject = { 'Fn::Join': [',', ['a', 'b', 'c']] };
                const intrinsicError = new Error('Intrinsic failure');
                mockIntrinsicUtils.getIntrinsicKey.mockReturnValue(intrinsicKey);
                mockIntrinsicResolver.getIntrinsic.mockReturnValue(mockIntrinsic);
                mockIntrinsic.resolveValue.mockImplementation(() => {
                    throw intrinsicError;
                });

                // Act & Assert
                expect(() => valueResolver.resolveValue(intrinsicObject, dummyCtx)).toThrow(intrinsicError);
            });
        });
    });
});
