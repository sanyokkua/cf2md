import log from 'loglevel';
import { ResolvingContext } from '../../../../../src/cloudformation/parsing/types/types';
import {
    generateAlphaNumeric,
    resolveStringWithDefault,
} from '../../../../../src/cloudformation/parsing/utils/helper-utils';
import { CloudFormationResource } from '../../../../../src/cloudformation/types/cloudformation-model';

import { awsEventsArchiveFunc } from '../../../../../src/cloudformation/parsing/resolver/resources/awsEventsArchiveFunc';

jest.mock('../../../../../src/cloudformation/parsing/utils/helper-utils', () => ({
    generateAlphaNumeric: jest.fn((_length: number, _ctx: ResolvingContext) => 'MOCKED_ID'),
    resolveStringWithDefault: jest.fn(
        (_prop: unknown, _defaultVal: string, _propName: string, _ctx: ResolvingContext) => 'resolved-tg-name',
    ),
}));

// Mock external dependency
jest.mock('coreutilsts', () => ({
    removePrefixIfPresent: jest.fn((arn: string, prefix: string) => arn.replace(prefix, '')),
}));

// In many tests across modules you might define a helper function such as:
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

describe('awsEventsArchiveFunc', () => {
    let mockCtx: ResolvingContext;
    let resource: CloudFormationResource;

    beforeEach(() => {
        // Create fresh mock context & resource for every test.
        mockCtx = createMockContext();

        // A basic resource mock. Depending on the test you can extend this object.
        resource = {
            Properties: {
                ArchiveName: 'testArchive',
            },
        } as CloudFormationResource;

        // Ensure _id and _arn are not preset.
        delete resource._id;
        delete resource._arn;

        // Clear any previous calls on helper mocks.
        (generateAlphaNumeric as jest.Mock).mockClear();
        (resolveStringWithDefault as jest.Mock).mockClear();
    });

    describe('idGenFunc', () => {
        it('should generate a new ID if not already set, using ArchiveName if provided', () => {
            (resolveStringWithDefault as jest.Mock).mockReturnValueOnce('testArchive');

            const id = awsEventsArchiveFunc.idGenFunc('AWS::Events::Archive', 'TestLogicalId', resource, mockCtx);

            expect(id).toBe('testArchive');
            expect(resource._id).toBe('testArchive');
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                'testArchive',
                'archive-MOCKED_ID',
                'AWS::Events::Archive.Properties.ArchiveName',
                mockCtx,
            );
            expect(generateAlphaNumeric).toHaveBeenCalled(); // Should not be called as ArchiveName exists
        });

        it('should generate a new ID using generateAlphaNumeric if ArchiveName is not provided', () => {
            delete resource.Properties.ArchiveName;
            (resolveStringWithDefault as jest.Mock).mockImplementation(
                (_property: unknown, defaultValue: string) => defaultValue,
            );

            const id = awsEventsArchiveFunc.idGenFunc('AWS::Events::Archive', 'TestLogicalId', resource, mockCtx);

            expect(id).toBe('archive-MOCKED_ID');
            expect(resource._id).toBe('archive-MOCKED_ID');
            expect(resolveStringWithDefault).toHaveBeenCalledWith(
                undefined,
                'archive-MOCKED_ID',
                'AWS::Events::Archive.Properties.ArchiveName',
                mockCtx,
            );
            expect(generateAlphaNumeric).toHaveBeenCalledWith(6, mockCtx);
        });

        it('should return the existing ID if already set', () => {
            resource._id = 'existingArchiveId';
            const id = awsEventsArchiveFunc.idGenFunc('AWS::Events::Archive', 'TestLogicalId', resource, mockCtx);

            expect(id).toBe('existingArchiveId');
            expect(generateAlphaNumeric).not.toHaveBeenCalled();
            expect(resolveStringWithDefault).not.toHaveBeenCalled();
        });
    });

    describe('refFunc', () => {
        it('should return an empty string', () => {
            const ref = awsEventsArchiveFunc.refFunc('AWS::Events::Archive', 'TestLogicalId', resource, mockCtx);
            expect(ref).toBe('');
        });
    });

    describe('getAttFunc', () => {
        it('should return the ARN when key is "Arn"', () => {
            const arn = awsEventsArchiveFunc.getAttFunc(
                'AWS::Events::Archive',
                'Arn',
                'TestLogicalId',
                resource,
                mockCtx,
            );
            expect(arn).toBe('arn:aws:events:us-east-1:123456789012:archive/archive-MOCKED_ID');
        });

        it('should warn and return the ID for an unsupported key', () => {
            const warnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});

            const id = awsEventsArchiveFunc.getAttFunc(
                'AWS::Events::Archive',
                'UnsupportedKey',
                'TestLogicalId',
                resource,
                mockCtx,
            );

            expect(id).toBe('archive-MOCKED_ID');
            expect(warnSpy).toHaveBeenCalledWith(
                `Passed key UnsupportedKey for AWS::Events::Archive, with logicalId=TestLogicalId is not supported, id will be returned`,
                resource,
                mockCtx,
            );

            warnSpy.mockRestore();
        });
    });

    describe('arnGenFunc', () => {
        it('should generate and assign a new ARN if none exists', () => {
            (resolveStringWithDefault as jest.Mock).mockReturnValueOnce('testArchive');

            const arn = awsEventsArchiveFunc.arnGenFunc('AWS::Events::Archive', 'TestLogicalId', resource, mockCtx);

            expect(arn).toBe('arn:aws:events:us-east-1:123456789012:archive/testArchive');
            expect(resource._arn).toBe(arn);
        });

        it('should generate ARN with default ID if ArchiveName is not provided', () => {
            delete resource.Properties.ArchiveName;
            (resolveStringWithDefault as jest.Mock).mockImplementation(
                (_property: unknown, defaultValue: string) => defaultValue,
            );
            const arn = awsEventsArchiveFunc.arnGenFunc('AWS::Events::Archive', 'TestLogicalId', resource, mockCtx);

            expect(arn).toBe('arn:aws:events:us-east-1:123456789012:archive/archive-MOCKED_ID');
            expect(resource._arn).toBe(arn);
        });

        it('should return the existing ARN if it is already set', () => {
            resource._arn = 'existingArchiveArn';
            const arn = awsEventsArchiveFunc.arnGenFunc('AWS::Events::Archive', 'TestLogicalId', resource, mockCtx);

            expect(arn).toBe('existingArchiveArn');
        });

        it('should correctly construct the ARN with mocked context values', () => {
            const customMockCtx = {
                ...createMockContext(),
                getRegion: jest.fn(() => 'eu-west-1'),
                getPartition: jest.fn(() => 'aws-cn'),
                getAccountId: jest.fn(() => '987654321098'),
            } as unknown as ResolvingContext;

            const arn = awsEventsArchiveFunc.arnGenFunc(
                'AWS::Events::Archive',
                'TestLogicalId',
                resource,
                customMockCtx,
            );

            expect(arn).toBe('arn:aws-cn:events:eu-west-1:987654321098:archive/archive-MOCKED_ID');
        });
    });
});
