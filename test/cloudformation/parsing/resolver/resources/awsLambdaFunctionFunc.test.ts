import log from 'loglevel';
import { awsLambdaFunctionFunc } from '../../../../../src/cloudformation/parsing/resolver/resources/awsLambdaFunctionFunc';
import { ResolvingContext } from '../../../../../src/cloudformation/parsing/types/types';
import {
    generateAlphaNumeric,
    resolveStringWithDefault,
} from '../../../../../src/cloudformation/parsing/utils/helper-utils';
import { LambdaFunctionResource } from '../../../../../src/cloudformation/types/cloudformation-model';

// Mock helper functions so that we can control their outputs and verify their usage.
jest.mock('../../../../../src/cloudformation/parsing/utils/helper-utils', () => ({
    generateAlphaNumeric: jest.fn(() => 'MOCKED_ID'),
    resolveStringWithDefault: jest.fn(
        (_value: unknown, _defaultValue: string, _propertyName: string, _ctx: ResolvingContext) =>
            'resolvedFunctionName',
    ),
}));

/**
 * Helper function to create a fresh mock ResolvingContext.
 * @returns A mock ResolvingContext object.
 */
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

describe('awsLambdaFunctionFunc', () => {
    let mockCtx: ResolvingContext;
    let resource: LambdaFunctionResource;

    beforeEach(() => {
        // Create a fresh context and resource for each test.
        mockCtx = createMockContext();

        // Set up a basic resource mock with Lambda function properties.
        resource = {
            Properties: {
                FunctionName: 'dummyFunctionName',
                SnapStart: {
                    ApplyOn: 'Initial',
                },
            },
        } as LambdaFunctionResource;

        // Ensure that _id and _arn are not preset.
        delete resource._id;
        delete resource._arn;

        // Reset calls for mocked helper functions.
        (generateAlphaNumeric as jest.Mock).mockClear();
        (resolveStringWithDefault as jest.Mock).mockClear();
    });

    describe('idGenFunc', () => {
        it('should generate a new ID if not already set', () => {
            const id = awsLambdaFunctionFunc.idGenFunc('AWS::Lambda::Function', 'TestLogicalId', resource, mockCtx);

            // The idGenFunc delegates to arnGenFunc which constructs the ARN.
            // Expected ARN format: arn:{partition}:lambda:{region}:{accountId}:function:{resolvedFunctionName}
            const expectedArn = 'arn:aws:lambda:us-east-1:123456789012:function:resolvedFunctionName';
            expect(id).toBe(expectedArn);
            expect(resource._id).toBe(expectedArn);
            expect(generateAlphaNumeric).toHaveBeenCalledWith(6, mockCtx);
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                'dummyFunctionName',
                `lambda-MOCKED_ID`,
                'AWS::Lambda::Function.Properties.FunctionName',
                mockCtx,
            );
        });

        it('should return the existing ID if already set', () => {
            resource._id = 'existingId';
            const id = awsLambdaFunctionFunc.idGenFunc('AWS::Lambda::Function', 'TestLogicalId', resource, mockCtx);
            expect(id).toBe('existingId');
            expect(generateAlphaNumeric).not.toHaveBeenCalled();
            expect(resolveStringWithDefault).not.toHaveBeenCalled();
        });
    });

    describe('refFunc', () => {
        it('should return the Lambda function name by stripping the ARN prefix', () => {
            // Generate the ARN first.
            const arn = awsLambdaFunctionFunc.arnGenFunc('AWS::Lambda::Function', 'TestLogicalId', resource, mockCtx);
            // refFunc should remove the prefix.
            const ref = awsLambdaFunctionFunc.refFunc('AWS::Lambda::Function', 'TestLogicalId', resource, mockCtx);
            // Expected prefix: arn:aws:lambda:us-east-1:123456789012:function:
            const expectedPrefix = 'arn:aws:lambda:us-east-1:123456789012:function:';
            expect(arn.startsWith(expectedPrefix)).toBe(true);
            expect(ref).toBe('resolvedFunctionName');
        });
    });

    describe('getAttFunc', () => {
        it('should return the ARN when key is "Arn"', () => {
            const att = awsLambdaFunctionFunc.getAttFunc(
                'AWS::Lambda::Function',
                'Arn',
                'TestLogicalId',
                resource,
                mockCtx,
            );
            // getAttFunc should call arnGenFunc to ensure _arn is set.
            const expectedArn = resource._arn || 'arn:aws:lambda:us-east-1:123456789012:function:resolvedFunctionName';
            expect(att).toBe(expectedArn);
        });

        it('should return resolved SnapStart.ApplyOn when key is "SnapStartResponse.ApplyOn"', () => {
            const att = awsLambdaFunctionFunc.getAttFunc(
                'AWS::Lambda::Function',
                'SnapStartResponse.ApplyOn',
                'TestLogicalId',
                resource,
                mockCtx,
            );
            expect(att).toBe('resolvedFunctionName');
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                resource.Properties.SnapStart?.ApplyOn,
                'SnapStartResponse.ApplyOn',
                'AWS::Lambda::Function.Properties?.SnapStart?.ApplyOn',
                mockCtx,
            );
        });

        it('should return static optimization status for key "SnapStartResponse.OptimizationStatus"', () => {
            const att = awsLambdaFunctionFunc.getAttFunc(
                'AWS::Lambda::Function',
                'SnapStartResponse.OptimizationStatus',
                'TestLogicalId',
                resource,
                mockCtx,
            );
            expect(att).toBe('RUNTIME_SnapStartResponse.OptimizationStatus');
        });

        it('should warn and return ID when an unsupported key is passed', () => {
            const warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});
            const att = awsLambdaFunctionFunc.getAttFunc(
                'AWS::Lambda::Function',
                'UnsupportedKey',
                'TestLogicalId',
                resource,
                mockCtx,
            );
            // For unsupported keys, idGenFunc is called and its value is returned.
            const expectedValue = resource._id || 'arn:aws:lambda:us-east-1:123456789012:function:resolvedFunctionName';
            expect(att).toBe(expectedValue);
            expect(warnSpy).toHaveBeenCalledWith(
                'Passed key UnsupportedKey for AWS::Lambda::Function, with logicalId=TestLogicalId is not supported, id will be returned',
                resource,
                mockCtx,
            );
            warnSpy.mockRestore();
        });
    });

    describe('arnGenFunc', () => {
        it('should generate and assign a new ARN if none exists', () => {
            const arn = awsLambdaFunctionFunc.arnGenFunc('AWS::Lambda::Function', 'TestLogicalId', resource, mockCtx);
            expect(generateAlphaNumeric).toHaveBeenCalledWith(6, mockCtx);
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                resource.Properties.FunctionName,
                'lambda-MOCKED_ID',
                'AWS::Lambda::Function.Properties.FunctionName',
                mockCtx,
            );
            const expectedArn = 'arn:aws:lambda:us-east-1:123456789012:function:resolvedFunctionName';
            expect(arn).toBe(expectedArn);
            expect(resource._arn).toBe(expectedArn);
        });

        it('should return the existing ARN if already set', () => {
            resource._arn = 'existingArn';
            const arn = awsLambdaFunctionFunc.arnGenFunc('AWS::Lambda::Function', 'TestLogicalId', resource, mockCtx);
            expect(arn).toBe('existingArn');
        });
    });
});
