import log from 'loglevel';
import { awsIamRoleFunc } from '../../../../../src/cloudformation/parsing/resolver/resources/awsIamRoleFunc';
import { ResolvingContext } from '../../../../../src/cloudformation/parsing/types/types';
import {
    generateAlphaNumeric,
    resolveStringWithDefault,
} from '../../../../../src/cloudformation/parsing/utils/helper-utils';
import { CloudFormationResource } from '../../../../../src/cloudformation/types/cloudformation-model';

// Mock helper functions
jest.mock('../../../../../src/cloudformation/parsing/utils/helper-utils', () => ({
    generateAlphaNumeric: jest.fn(() => 'MOCKEDID'),
    resolveStringWithDefault: jest.fn(
        (_prop: unknown, _default: string, _propName: string, _ctx: ResolvingContext) => 'resolvedRoleName',
    ),
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
        getRegion: jest.fn(() => 'us-west-2'),
        getPartition: jest.fn(() => 'aws'),
        getAccountId: jest.fn(() => '123456789012'),
        getAZs: jest.fn(() => ['us-west-2a', 'us-west-2b']),
    } as unknown as ResolvingContext;
}

describe('awsIamRoleFunc', () => {
    let mockCtx: ResolvingContext;
    let resource: CloudFormationResource;

    beforeEach(() => {
        mockCtx = createMockContext();
        resource = {
            Properties: {
                RoleName: 'MyRole',
            },
        } as CloudFormationResource;

        delete resource._id;
        delete resource._arn;
        (generateAlphaNumeric as jest.Mock).mockClear();
        (resolveStringWithDefault as jest.Mock).mockClear();
    });

    describe('idGenFunc', () => {
        it('should generate ARN as ID when not present', () => {
            const id = awsIamRoleFunc.idGenFunc('AWS::IAM::Role', 'TestRole', resource, mockCtx);

            expect(id).toMatch(/arn:aws:iam::123456789012:role\/resolvedRoleName/);
            expect(resource._id).toBe(id);
        });

        it('should return existing ID when present', () => {
            resource._id = 'existing-id';
            const id = awsIamRoleFunc.idGenFunc('AWS::IAM::Role', 'TestRole', resource, mockCtx);

            expect(id).toBe('existing-id');
        });
    });

    describe('refFunc', () => {
        it('should return the generated ID from idGenFunc', () => {
            const ref = awsIamRoleFunc.refFunc('AWS::IAM::Role', 'TestRole', resource, mockCtx);

            expect(ref).toMatch(/arn:aws:iam::123456789012:role\/resolvedRoleName/);
        });
    });

    describe('getAttFunc', () => {
        it('should return ARN when key is "Arn"', () => {
            const result = awsIamRoleFunc.getAttFunc('AWS::IAM::Role', 'Arn', 'TestRole', resource, mockCtx);

            expect(result).toMatch(/arn:aws:iam::123456789012:role\/resolvedRoleName/);
        });

        it('should return ID when key is "RoleId"', () => {
            const result = awsIamRoleFunc.getAttFunc('AWS::IAM::Role', 'RoleId', 'TestRole', resource, mockCtx);

            expect(result).toMatch(/arn:aws:iam::123456789012:role\/resolvedRoleName/);
        });

        it('should warn and return ID for unsupported attributes', () => {
            const warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
            const result = awsIamRoleFunc.getAttFunc('AWS::IAM::Role', 'InvalidKey', 'TestRole', resource, mockCtx);

            expect(warnSpy).toHaveBeenCalledWith(
                'Passed key InvalidKey for AWS::IAM::Role, with logicalId=TestRole is not supported, id will be returned',
                resource,
                mockCtx,
            );
            expect(result).toMatch(/arn:aws:iam::123456789012:role\/resolvedRoleName/);
            warnSpy.mockRestore();
        });
    });

    describe('arnGenFunc', () => {
        it('should generate correct ARN format with context values', () => {
            const arn = awsIamRoleFunc.arnGenFunc('AWS::IAM::Role', 'TestRole', resource, mockCtx);

            expect(arn).toBe('arn:aws:iam::123456789012:role/resolvedRoleName');
            expect(resource._arn).toBe(arn);
        });

        it('should use existing ARN when present', () => {
            resource._arn = 'existing-arn';
            const arn = awsIamRoleFunc.arnGenFunc('AWS::IAM::Role', 'TestRole', resource, mockCtx);

            expect(arn).toBe('existing-arn');
        });

        it('should resolve RoleName with default generation', () => {
            delete resource.Properties?.RoleName;
            awsIamRoleFunc.arnGenFunc('AWS::IAM::Role', 'TestRole', resource, mockCtx);

            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                undefined,
                'role-MOCKEDID',
                'AWS::IAM::Role.Properties.RoleName',
                mockCtx,
            );
            expect(generateAlphaNumeric).toHaveBeenCalledWith(6, mockCtx);
        });

        it('should use provided RoleName property', () => {
            awsIamRoleFunc.arnGenFunc('AWS::IAM::Role', 'TestRole', resource, mockCtx);

            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                'MyRole',
                'role-MOCKEDID',
                'AWS::IAM::Role.Properties.RoleName',
                mockCtx,
            );
        });
    });
});
