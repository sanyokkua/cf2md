import { FnStubIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { ResolvingContext, ValueResolverFunc } from '../../../../src/parsing/types/resolving-types';

describe('FnStubIntrinsic', () => {
    let intrinsic: FnStubIntrinsic;
    let mockContext: jest.Mocked<ResolvingContext>;
    let mockResolveValue: jest.Mock<ValueResolverFunc>;

    beforeEach(() => {
        mockContext = {
            hasParameterName: jest.fn(),
            getParameter: jest.fn(),
            addParameter: jest.fn(),
            resolveValue: jest.fn(),
            originalTemplate: {},
        } as unknown as jest.Mocked<ResolvingContext>;

        mockResolveValue = jest.fn();

        intrinsic = new FnStubIntrinsic();

        jest.clearAllMocks();
    });

    it('should return the static string "stubIntrinsic"', () => {
        const inputObject = { Stub: 'someValue' };
        const result = intrinsic.resolveValue(inputObject, mockContext, mockResolveValue);
        expect(result).toBe('stubIntrinsic');
        expect(mockResolveValue).not.toHaveBeenCalled();
    });

    it('should accept any input object and context', () => {
        const inputObject = { SomeKey: 'someValue' };
        const result = intrinsic.resolveValue(inputObject, mockContext, mockResolveValue);
        expect(result).toBe('stubIntrinsic');

        const anotherInputObject = ['arrayValue'];
        const anotherMockContext = { ...mockContext, someNewProp: 'newValue' } as unknown as jest.Mocked<ResolvingContext>;
        const anotherResult = intrinsic.resolveValue(anotherInputObject, anotherMockContext, mockResolveValue);
        expect(anotherResult).toBe('stubIntrinsic');
    });

    it('should not call the resolveValue function passed to it', () => {
        const inputObject = { Stub: 'someValue' };
        intrinsic.resolveValue(inputObject, mockContext, mockResolveValue);
        expect(mockResolveValue).not.toHaveBeenCalled();
    });
});
