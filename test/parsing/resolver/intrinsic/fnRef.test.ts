import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnRefIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { ResourceIntrinsic, ResourceIntrinsicResolver } from '../../../../src/parsing/types/intrinsic-types';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnRefIntrinsic', () => {
    let intrinsic: FnRefIntrinsic;
    let mockIntrinsicUtils: jest.Mocked<IntrinsicUtils>;
    let mockResolver: jest.Mocked<ResourceIntrinsicResolver>;
    let mockContext: jest.Mocked<ResolvingContext>;
    let mockResolveValue: jest.Mock<any, any>;

    beforeEach(() => {
        mockIntrinsicUtils = {
            validateIntrinsic: jest.fn(),
            isIntrinsic: jest.fn(),
            getIntrinsicKey: jest.fn(),
        } as jest.Mocked<IntrinsicUtils>;

        mockResolver = {
            getResourceIntrinsic: jest.fn().mockReturnValue({
                refFunc: jest.fn().mockReturnValue('resolved-resource-id'),
            }),
        } as jest.Mocked<ResourceIntrinsicResolver>;

        mockContext = {
            hasParameterName: jest.fn(),
            getParameter: jest.fn(),
            addParameter: jest.fn(),
            resolveValue: jest.fn(),
            originalTemplate: {
                Resources: {
                    ExistingResource: { Type: 'AWS::S3::Bucket', Properties: {} },
                },
            },
        } as unknown as jest.Mocked<ResolvingContext>;

        mockResolveValue = jest.fn();

        intrinsic = new FnRefIntrinsic(mockIntrinsicUtils, mockResolver);

        jest.clearAllMocks();
        mockContext.originalTemplate.Resources = { ExistingResource: { Type: 'AWS::S3::Bucket', Properties: {} } };
    });

    it('should validate the intrinsic object', () => {
        const refObject = { Ref: 'SomeResource' };
        mockContext.hasParameterName.mockReturnValueOnce(true);
        mockContext.getParameter.mockReturnValueOnce('refObject');

        intrinsic.resolveValue(refObject, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(refObject, CfIntrinsicFunctions.Ref);
    });

    it('resolves Ref to a cached parameter', () => {
        const refObject = { Ref: 'CachedParam' };
        mockContext.hasParameterName.mockReturnValue(true);
        mockContext.getParameter.mockReturnValue('cached-value');

        const result = intrinsic.resolveValue(refObject, mockContext, mockResolveValue);
        expect(result).toBe('cached-value');
        expect(mockContext.getParameter).toHaveBeenCalledWith('CachedParam');
        expect(mockContext.hasParameterName).toHaveBeenCalledWith('CachedParam');
        expect(mockResolver.getResourceIntrinsic).not.toHaveBeenCalled();
        expect(mockContext.addParameter).not.toHaveBeenCalled();
    });

    it('resolves Ref to a resource and caches the result', () => {
        const refObject = { Ref: 'ExistingResource' };
        mockContext.hasParameterName.mockReturnValue(false);

        const result = intrinsic.resolveValue(refObject, mockContext, mockResolveValue);
        expect(result).toBe('resolved-resource-id');
        expect(mockContext.hasParameterName).toHaveBeenCalledWith('ExistingResource');
        expect(mockResolver.getResourceIntrinsic).toHaveBeenCalledWith('AWS::S3::Bucket');
        expect(mockResolver.getResourceIntrinsic('AWS::S3::Bucket').refFunc).toHaveBeenCalledWith(
            expect.objectContaining({
                resource: { Type: 'AWS::S3::Bucket', Properties: {} },
                logicalId: 'ExistingResource',
                ctx: mockContext,
                valueResolver: mockResolveValue,
            }),
        );
        expect(mockContext.addParameter).toHaveBeenCalledWith('ExistingResource', 'resolved-resource-id');
    });

    it('throws error when Ref key is missing in context and resources', () => {
        const refObject = { Ref: 'InvalidKey' };
        mockContext.hasParameterName.mockReturnValue(false);

        expect(() => intrinsic.resolveValue(refObject, mockContext, mockResolveValue)).toThrow(
            'InvalidKey is not found in context and among Resources logicalIds',
        );
        expect(mockContext.hasParameterName).toHaveBeenCalledWith('InvalidKey');
        expect(mockResolver.getResourceIntrinsic).not.toHaveBeenCalled();
        expect(mockContext.addParameter).not.toHaveBeenCalled();
    });

    it('resolves Ref when the value is not initially a string but resolves to a string', () => {
        const refObject = { Ref: { 'Fn::GetAtt': ['SomeResource', 'Id'] } };
        mockResolveValue.mockReturnValue('ResolvedResourceId');
        mockContext.hasParameterName.mockReturnValue(false);
        mockContext.originalTemplate.Resources = { ResolvedResourceId: { Type: 'AWS::EC2::Instance', Properties: {} } };
        mockResolver.getResourceIntrinsic.mockReturnValue({
            refFunc: jest.fn().mockReturnValue('resolved-instance-id'),
        } as unknown as ResourceIntrinsic);

        const result = intrinsic.resolveValue(refObject, mockContext, mockResolveValue);

        expect(mockResolveValue).toHaveBeenCalledWith({ 'Fn::GetAtt': ['SomeResource', 'Id'] }, mockContext);
        expect(result).toBe('resolved-instance-id');
        expect(mockContext.hasParameterName).toHaveBeenCalledWith('ResolvedResourceId');
        expect(mockResolver.getResourceIntrinsic).toHaveBeenCalledWith('AWS::EC2::Instance');
        expect(mockContext.addParameter).toHaveBeenCalledWith('ResolvedResourceId', 'resolved-instance-id');
    });

    it('throws error when Ref value is not initially a string and does not resolve to a string', () => {
        const refObject = { Ref: { 'Fn::GetAtt': ['SomeResource', 'Id'] } };
        mockResolveValue.mockReturnValue(123);

        expect(() => intrinsic.resolveValue(refObject, mockContext, mockResolveValue)).toThrow('Key was not resolved as a string');
        expect(mockResolveValue).toHaveBeenCalledWith({ 'Fn::GetAtt': ['SomeResource', 'Id'] }, mockContext);
        expect(mockContext.hasParameterName).not.toHaveBeenCalled();
        expect(mockResolver.getResourceIntrinsic).not.toHaveBeenCalled();
        expect(mockContext.addParameter).not.toHaveBeenCalled();
    });

    it('handles resource not found by the resolver', () => {
        const refObject = { Ref: 'NonExistingResource' };
        mockContext.hasParameterName.mockReturnValue(false);

        expect(() => intrinsic.resolveValue(refObject, mockContext, mockResolveValue)).toThrow(
            'NonExistingResource is not found in context and among Resources logicalIds',
        );
        expect(mockContext.hasParameterName).toHaveBeenCalledWith('NonExistingResource');
        expect(mockResolver.getResourceIntrinsic).not.toHaveBeenCalled();
        expect(mockContext.addParameter).not.toHaveBeenCalled();
    });
});
