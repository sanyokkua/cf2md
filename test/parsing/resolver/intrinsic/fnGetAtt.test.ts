import { CfIntrinsicFunctions } from '../../../../src/parsing';
import { FnGetAttIntrinsic } from '../../../../src/parsing/resolver/intrinsic';
import { CloudFormationTemplate } from '../../../../src/parsing/types/cloudformation-model';
import { ResourceIntrinsicResolver } from '../../../../src/parsing/types/intrinsic-types';
import { ResolvingContext } from '../../../../src/parsing/types/resolving-types';
import { IntrinsicUtils } from '../../../../src/parsing/types/util-service-types';

describe('FnGetAttIntrinsic', () => {
    let intrinsic: FnGetAttIntrinsic;
    let mockIntrinsicUtils: jest.Mocked<IntrinsicUtils>;
    let mockResolver: jest.Mocked<ResourceIntrinsicResolver>;
    let mockContext: jest.Mocked<ResolvingContext>;
    let mockResolveValue: jest.Mock<any, any>;
    let originalTemplate: CloudFormationTemplate;

    beforeEach(() => {
        mockIntrinsicUtils = {
            validateIntrinsic: jest.fn(),
            isIntrinsic: jest.fn(),
            deepEqual: jest.fn(),
        } as unknown as jest.Mocked<IntrinsicUtils>;

        mockResolver = {
            getResourceIntrinsic: jest.fn().mockReturnValue({
                getAttFunc: jest.fn().mockReturnValue('resolved-attribute-value'),
            }),
        } as unknown as jest.Mocked<ResourceIntrinsicResolver>;

        originalTemplate = {
            Resources: {
                ExistingResource: { Type: 'AWS::S3::Bucket', Properties: {} },
                AnotherResource: { Type: 'Custom::Resource', Properties: {} },
            },
        };

        mockContext = {
            originalTemplate: originalTemplate,
            hasParameterName: jest.fn(),
            getParameter: jest.fn(),
            addParameter: jest.fn(),
        } as unknown as jest.Mocked<ResolvingContext>;

        mockResolveValue = jest.fn();
        mockIntrinsicUtils.validateIntrinsic.mockImplementation(() => true);
        mockResolveValue.mockImplementation((val) => val);
        intrinsic = new FnGetAttIntrinsic(mockIntrinsicUtils, mockResolver);
    });

    it('should call validateIntrinsic with correct parameters', () => {
        const getAttObject = { 'Fn::GetAtt': ['ExistingResource', 'Arn'] };
        intrinsic.resolveValue(getAttObject, mockContext, mockResolveValue);
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(getAttObject, CfIntrinsicFunctions.Fn_GetAtt);
    });

    it('should resolve attribute value for an existing resource', () => {
        const getAttObject = { 'Fn::GetAtt': ['ExistingResource', 'Arn'] };
        const result = intrinsic.resolveValue(getAttObject, mockContext, mockResolveValue);
        expect(result).toBe('resolved-attribute-value');
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolver.getResourceIntrinsic).toHaveBeenCalledWith('AWS::S3::Bucket');
        expect(mockResolver.getResourceIntrinsic('AWS::S3::Bucket')?.getAttFunc).toHaveBeenCalledWith(
            {
                resource: originalTemplate.Resources['ExistingResource'],
                logicalId: 'ExistingResource',
                ctx: mockContext,
                valueResolver: mockResolveValue,
            },
            'Arn',
        );
        expect(mockContext.addParameter).toHaveBeenCalledWith('ExistingResource:Arn', 'resolved-attribute-value');
    });

    it('should resolve attribute value for another existing resource type', () => {
        const getAttObject = { 'Fn::GetAtt': ['AnotherResource', 'Id'] };
        intrinsic.resolveValue(getAttObject, mockContext, mockResolveValue);
        expect(mockResolver.getResourceIntrinsic).toHaveBeenCalledWith('Custom::Resource');
        expect(mockResolver.getResourceIntrinsic('Custom::Resource')?.getAttFunc).toHaveBeenCalledWith(
            {
                resource: originalTemplate.Resources['AnotherResource'],
                logicalId: 'AnotherResource',
                ctx: mockContext,
                valueResolver: mockResolveValue,
            },
            'Id',
        );
    });

    it('should resolve attribute value from cache if it exists', () => {
        const getAttObject = { 'Fn::GetAtt': ['ExistingResource', 'Arn'] };
        mockContext.hasParameterName.mockReturnValue(true);
        mockContext.getParameter.mockReturnValue('cached-arn-value');

        const result = intrinsic.resolveValue(getAttObject, mockContext, mockResolveValue);
        expect(result).toBe('cached-arn-value');
        expect(mockContext.hasParameterName).toHaveBeenCalledWith('ExistingResource:Arn');
        expect(mockContext.getParameter).toHaveBeenCalledWith('ExistingResource:Arn');
        expect(mockResolver.getResourceIntrinsic).not.toHaveBeenCalled();
    });

    it('should resolve logical resource name and attribute name if they are not strings', () => {
        const getAttObject = { 'Fn::GetAtt': [{ Ref: 'ResourceId' }, { Ref: 'AttributeName' }] };
        mockResolveValue.mockReturnValueOnce('ExistingResource').mockReturnValueOnce('Arn');

        intrinsic.resolveValue(getAttObject, mockContext, mockResolveValue);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
        expect(mockResolveValue).toHaveBeenNthCalledWith(1, { Ref: 'ResourceId' }, mockContext);
        expect(mockResolveValue).toHaveBeenNthCalledWith(2, { Ref: 'AttributeName' }, mockContext);
        expect(mockResolver.getResourceIntrinsic).toHaveBeenCalledWith('AWS::S3::Bucket');
        expect(mockResolver.getResourceIntrinsic('AWS::S3::Bucket')?.getAttFunc).toHaveBeenCalledWith(
            expect.objectContaining({ logicalId: 'ExistingResource' }),
            'Arn',
        );
    });

    it('should throw an error if the input object is not a valid intrinsic', () => {
        const invalidObject = { NotFnGetAtt: ['Resource', 'Attr'] };
        mockIntrinsicUtils.validateIntrinsic.mockImplementation(() => {
            throw new Error('Error');
        });
        expect(() => intrinsic.resolveValue(invalidObject, mockContext, mockResolveValue)).toThrow('Error');
        expect(mockIntrinsicUtils.validateIntrinsic).toHaveBeenCalledWith(invalidObject, CfIntrinsicFunctions.Fn_GetAtt);
    });

    it('should throw an error if the value of Fn::GetAtt is not an array', () => {
        const invalidObject = { 'Fn::GetAtt': 'not an array' };
        expect(() => intrinsic.resolveValue(invalidObject, mockContext, mockResolveValue)).toThrow('Expected 2 items in Fn::GetAtt array');
    });

    it('should throw an error if the array within Fn::GetAtt does not have exactly 2 elements', () => {
        const invalidObject1 = { 'Fn::GetAtt': ['Resource'] };
        expect(() => intrinsic.resolveValue(invalidObject1, mockContext, mockResolveValue)).toThrow('Expected 2 items in Fn::GetAtt array');
        const invalidObject2 = { 'Fn::GetAtt': ['Resource', 'Attr', 'Extra'] };
        expect(() => intrinsic.resolveValue(invalidObject2, mockContext, mockResolveValue)).toThrow('Expected 2 items in Fn::GetAtt array');
    });

    it('should throw an error if the resolved logical resource name is not a string', () => {
        const getAttObject = { 'Fn::GetAtt': [{ Ref: 'ResourceId' }, 'Arn'] };
        mockResolveValue.mockReturnValueOnce(123);
        expect(() => intrinsic.resolveValue(getAttObject, mockContext, mockResolveValue)).toThrow(
            'Expected first parameter of fn::getatt (logical resource name) to be a string',
        );
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'ResourceId' }, mockContext);
    });

    it('should throw an error if the resolved attribute name is not a string', () => {
        const getAttObject = { 'Fn::GetAtt': ['ExistingResource', { Ref: 'AttributeName' }] };
        mockResolveValue.mockReturnValueOnce('ExistingResource').mockReturnValueOnce(456);
        expect(() => intrinsic.resolveValue(getAttObject, mockContext, mockResolveValue)).toThrow(
            'Expected second parameter of fn::getatt (attribute name) to be a string',
        );
        expect(mockResolveValue).toHaveBeenCalledWith({ Ref: 'AttributeName' }, mockContext);
    });

    it('should throw an error if the resource with the logical ID is not found', () => {
        const getAttObject = { 'Fn::GetAtt': ['NonExistingResource', 'Arn'] };
        expect(() => intrinsic.resolveValue(getAttObject, mockContext, mockResolveValue)).toThrow(
            'NonExistingResource:Arn is not found in context and NonExistingResource is not found in Resources',
        );
        expect(mockResolver.getResourceIntrinsic).not.toHaveBeenCalled();
    });

    it('should not call resource resolver if the attribute is found in cache', () => {
        const getAttObject = { 'Fn::GetAtt': ['ExistingResource', 'Arn'] };
        mockContext.hasParameterName.mockReturnValue(true);
        mockContext.getParameter.mockReturnValue('cached-value');
        intrinsic.resolveValue(getAttObject, mockContext, mockResolveValue);
        expect(mockResolver.getResourceIntrinsic).not.toHaveBeenCalled();
    });
});
