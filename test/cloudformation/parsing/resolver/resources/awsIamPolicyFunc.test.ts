import log from 'loglevel';
import { awsIamPolicyFunc } from '../../../../../src/cloudformation/parsing/resolver/resources/awsIamPolicyFunc';
import { ResolvingContext } from '../../../../../src/cloudformation/parsing/types/types';
import { resolveString } from '../../../../../src/cloudformation/parsing/utils/helper-utils';
import { CloudFormationResource } from '../../../../../src/cloudformation/types/cloudformation-model';

// Mock helper functions
jest.mock('../../../../../src/cloudformation/parsing/utils/helper-utils', () => ({
    resolveString: jest.fn((_value: unknown, _propertyName: string, _ctx: ResolvingContext) => 'resolvedPolicyName'),
}));

// Mock context creation helper
function createMockContext(): ResolvingContext {
    return {
        originalTemplate: {},
        lookupMapPreProcessed: {},
        generatedIds: new Set(),
        lookupMapDynamic: {},
        currentPath: [],
        addName: jest.fn(),
        popName: jest.fn(() => ''),
        getCurrentPath: jest.fn(() => ''),
        hasParameterName: jest.fn(() => false),
        getParameter: jest.fn(),
        addParameter: jest.fn(),
        addGeneratedId: jest.fn(),
        isIdExists: jest.fn(() => false),
        getRegion: jest.fn(() => 'us-east-1'),
        getPartition: jest.fn(() => 'aws'),
        getAccountId: jest.fn(() => '123456789012'),
        getAZs: jest.fn(() => ['us-east-1a', 'us-east-1b']),
    } as unknown as ResolvingContext;
}

describe('awsIamPolicyFunc', () => {
    let mockCtx: ResolvingContext;
    let resource: CloudFormationResource;

    beforeEach(() => {
        mockCtx = createMockContext();
        resource = {
            Properties: {
                PolicyName: 'MyPolicy',
            },
        } as CloudFormationResource;

        delete resource._id;
        delete resource._arn;
        (resolveString as jest.Mock).mockClear();
    });

    describe('idGenFunc', () => {
        it('should set _id to logicalId when not present', () => {
            const id = awsIamPolicyFunc.idGenFunc('AWS::IAM::Policy', 'TestPolicy', resource, mockCtx);

            expect(id).toBe('TestPolicy');
            expect(resource._id).toBe('TestPolicy');
        });

        it('should return existing _id when present', () => {
            resource._id = 'existing-id';
            const id = awsIamPolicyFunc.idGenFunc('AWS::IAM::Policy', 'TestPolicy', resource, mockCtx);

            expect(id).toBe('existing-id');
        });
    });

    describe('refFunc', () => {
        it('should resolve PolicyName using resolveString', () => {
            const ref = awsIamPolicyFunc.refFunc('AWS::IAM::Policy', 'TestPolicy', resource, mockCtx);

            expect(ref).toBe('resolvedPolicyName');
            expect(resolveString).toHaveBeenCalledWith('MyPolicy', 'AWS::IAM::Policy.Properties.PolicyName', mockCtx);
        });

        it('should handle missing PolicyName property', () => {
            delete resource.Properties?.PolicyName;
            const ref = awsIamPolicyFunc.refFunc('AWS::IAM::Policy', 'TestPolicy', resource, mockCtx);

            expect(ref).toBe('resolvedPolicyName');
            expect(resolveString).toHaveBeenCalledWith(undefined, 'AWS::IAM::Policy.Properties.PolicyName', mockCtx);
        });
    });

    describe('getAttFunc', () => {
        it('should return ID when key is "Id"', () => {
            const result = awsIamPolicyFunc.getAttFunc('AWS::IAM::Policy', 'Id', 'TestPolicy', resource, mockCtx);

            expect(result).toBe('TestPolicy');
        });

        it('should warn and return ID for unsupported attributes', () => {
            const warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
            const result = awsIamPolicyFunc.getAttFunc(
                'AWS::IAM::Policy',
                'InvalidKey',
                'TestPolicy',
                resource,
                mockCtx,
            );

            expect(warnSpy).toHaveBeenCalledWith(
                'Passed key InvalidKey for AWS::IAM::Policy, with logicalId=TestPolicy is not supported, id will be returned',
                resource,
                mockCtx,
            );
            expect(result).toBe('TestPolicy');
            warnSpy.mockRestore();
        });
    });

    describe('arnGenFunc', () => {
        it('should generate correct ARN format with context values', () => {
            const arn = awsIamPolicyFunc.arnGenFunc('AWS::IAM::Policy', 'TestPolicy', resource, mockCtx);

            expect(arn).toBe('arn:aws:iam::123456789012:policy/resolvedPolicyName');
            expect(resource._arn).toBe(arn);
        });

        it('should use existing ARN when present', () => {
            resource._arn = 'existing-arn';
            const arn = awsIamPolicyFunc.arnGenFunc('AWS::IAM::Policy', 'TestPolicy', resource, mockCtx);

            expect(arn).toBe('existing-arn');
        });

        it('should construct ARN with resolved policy name', () => {
            awsIamPolicyFunc.arnGenFunc('AWS::IAM::Policy', 'TestPolicy', resource, mockCtx);

            expect(resolveString).toHaveBeenCalledWith('MyPolicy', 'AWS::IAM::Policy.Properties.PolicyName', mockCtx);
            expect(mockCtx.getPartition).toHaveBeenCalled();
            expect(mockCtx.getAccountId).toHaveBeenCalled();
        });
    });
});
