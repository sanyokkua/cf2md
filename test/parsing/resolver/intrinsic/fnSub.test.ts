import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnSubIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnSubIntrinsic', () => {
    let intrinsic: FnSubIntrinsic;
    let mockIntrinsicUtils: jest.Mocked<IntrinsicUtils>;
    let mockContext: jest.Mocked<ResolvingContext>;
    let mockResolveValue: jest.Mock<any, any>;

    beforeEach(() => {
        mockIntrinsicUtils = {
            validateIntrinsic: jest.fn(),
            isIntrinsic: jest.fn(),
            getIntrinsicKey: jest.fn(),
            deepEqual: jest.fn(),
        } as jest.Mocked<IntrinsicUtils>;

        mockContext = {
            hasParameterName: jest.fn(),
            getParameter: jest.fn(),
            addParameter: jest.fn(),
            resolveValue: jest.fn(),
            originalTemplate: {},
        } as unknown as jest.Mocked<ResolvingContext>;

        mockResolveValue = jest.fn();

        intrinsic = new FnSubIntrinsic(mockIntrinsicUtils);

        jest.clearAllMocks();
    });

    it('should validate the intrinsic object', () => {
        const subObject = { 'Fn::Sub': 'Hello ${World}' };
        mockContext.hasParameterName.mockReturnValueOnce(true);
        mockContext.getParameter.mockReturnValueOnce('World');
        intrinsic.resolveValue(subObject, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(subObject, CfIntrinsicFunctions.Fn_Sub);
    });

    describe('when the input is a string', () => {
        it('should replace variables found in the context cache', () => {
            const subObject = { 'Fn::Sub': 'Hello ${World}' };
            mockContext.hasParameterName.mockReturnValue(true);
            mockContext.getParameter.mockReturnValue('Earth');

            const result = intrinsic.resolveValue(subObject, mockContext, mockResolveValue);
            expect(result).toBe('Hello Earth');
            expect(mockContext.hasParameterName).toHaveBeenCalledWith('World');
            expect(mockContext.getParameter).toHaveBeenCalledWith('World');
        });

        it('should throw an error if a variable is not found in the context cache', () => {
            const subObject = { 'Fn::Sub': 'Hello ${World}' };
            mockContext.hasParameterName.mockReturnValue(false);

            expect(() => intrinsic.resolveValue(subObject, mockContext, mockResolveValue)).toThrow('Expected variable "World" is not found in cache');
            expect(mockContext.hasParameterName).toHaveBeenCalledWith('World');
            expect(mockContext.getParameter).not.toHaveBeenCalled();
        });

        it('should handle a string with no variables', () => {
            const subObject = { 'Fn::Sub': 'Hello World' };
            const result = intrinsic.resolveValue(subObject, mockContext, mockResolveValue);
            expect(result).toBe('Hello World');
            expect(mockContext.hasParameterName).not.toHaveBeenCalled();
            expect(mockContext.getParameter).not.toHaveBeenCalled();
        });

        it('should handle escaped dollar signs', () => {
            const subObject = { 'Fn::Sub': 'Hello $${World}' };
            mockContext.hasParameterName.mockReturnValueOnce(true);
            mockContext.getParameter.mockReturnValueOnce('World');

            const result = intrinsic.resolveValue(subObject, mockContext, mockResolveValue);
            expect(result).toBe('Hello $World');
            expect(mockContext.hasParameterName).toHaveBeenCalled();
            expect(mockContext.getParameter).toHaveBeenCalled();
        });

        it('should handle multiple variables', () => {
            const subObject = { 'Fn::Sub': 'Hello ${FirstName} ${LastName}' };
            mockContext.hasParameterName.mockImplementation((key) => key === 'FirstName' || key === 'LastName');
            mockContext.getParameter.mockImplementation((key) => (key === 'FirstName' ? 'John' : 'Doe'));

            const result = intrinsic.resolveValue(subObject, mockContext, mockResolveValue);
            expect(result).toBe('Hello John Doe');
            expect(mockContext.hasParameterName).toHaveBeenCalledWith('FirstName');
            expect(mockContext.hasParameterName).toHaveBeenCalledWith('LastName');
            expect(mockContext.getParameter).toHaveBeenCalledWith('FirstName');
            expect(mockContext.getParameter).toHaveBeenCalledWith('LastName');
        });
    });

    describe('when the input is an array', () => {
        it('should throw an error if the array does not have exactly 2 elements', () => {
            const subObjectShort = { 'Fn::Sub': ['template'] };
            expect(() => intrinsic.resolveValue(subObjectShort, mockContext, mockResolveValue)).toThrow('Expected array of size 2 for Fn::Sub');

            const subObjectLong = { 'Fn::Sub': ['template', {}, 'extra'] };
            expect(() => intrinsic.resolveValue(subObjectLong, mockContext, mockResolveValue)).toThrow('Expected array of size 2 for Fn::Sub');
        });

        it('should throw an error if the second element is not an object', () => {
            const subObject = { 'Fn::Sub': ['template', 'not-an-object'] };
            expect(() => intrinsic.resolveValue(subObject, mockContext, mockResolveValue)).toThrow(
                'Expected the second element of Fn::Sub array to be an object',
            );
        });

        it('should replace variables using the provided map with resolved values', () => {
            const subObject = { 'Fn::Sub': ['Hello ${World}', { World: { Ref: 'SomeResource' } }] };
            mockResolveValue.mockReturnValue('Earth');

            const result = intrinsic.resolveValue(subObject, mockContext, mockResolveValue);
            expect(result).toBe('Hello Earth');
            expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'SomeResource' }, mockContext);
        });

        it('should throw an error if a variable value cannot be resolved', () => {
            const subObject = { 'Fn::Sub': ['Hello ${World}', { World: { Ref: 'SomeResource' } }] };
            mockResolveValue.mockReturnValue(undefined);

            expect(() => intrinsic.resolveValue(subObject, mockContext, mockResolveValue)).toThrow(
                'Value for variable "World" could not be resolved',
            );
            expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'SomeResource' }, mockContext);
        });

        it('should handle multiple variables in the map', () => {
            const subObject = {
                'Fn::Sub': ['Hello ${FirstName} ${LastName}', { FirstName: 'John', LastName: { Ref: 'LastNameResource' } }],
            };
            mockResolveValue.mockReturnValueOnce('John');
            mockResolveValue.mockReturnValueOnce('Doe');

            const result = intrinsic.resolveValue(subObject, mockContext, mockResolveValue);
            expect(result).toBe('Hello John Doe');
            expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'LastNameResource' }, mockContext);
        });

        it('should handle variables in the template string that are not in the map', () => {
            const subObject = { 'Fn::Sub': 'Hello ${World}' };
            expect(() => intrinsic.resolveValue(subObject, mockContext, mockResolveValue)).toThrow('Expected variable "World" is not found in cache');
        });

        it('should handle a template string with no variables and an empty map', () => {
            const subObject = { 'Fn::Sub': ['Hello World', {}] };
            const result = intrinsic.resolveValue(subObject, mockContext, mockResolveValue);
            expect(result).toBe('Hello World');
            expect(mockResolveValue).not.toHaveBeenCalled();
        });

        it('should handle escaped dollar signs in the template string within an array', () => {
            const subObject = { 'Fn::Sub': ['Hello $${World}', { World: 'World' }] };
            mockResolveValue.mockReturnValueOnce('World');
            const result = intrinsic.resolveValue(subObject, mockContext, mockResolveValue);
            expect(result).toBe('Hello $World');
            expect(mockResolveValue).toHaveBeenCalled();
        });
    });

    describe('when the input is of an invalid type', () => {
        it('should throw an error if the input is a number', () => {
            const subObject = { 'Fn::Sub': 123 };
            expect(() => intrinsic.resolveValue(subObject, mockContext, mockResolveValue)).toThrow(
                'Fn::Sub must be either a string or an array of two elements',
            );
        });

        it('should throw an error if the input is null', () => {
            const subObject = { 'Fn::Sub': null };
            expect(() => intrinsic.resolveValue(subObject, mockContext, mockResolveValue)).toThrow(
                'Fn::Sub must be either a string or an array of two elements',
            );
        });
    });
});
