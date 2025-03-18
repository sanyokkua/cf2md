import { isBlankString } from 'coreutilsts';
import log from 'loglevel';
import { resolveValue, ResolvingContext } from '../../../../../src/cloudformation/parsing/index';
import {
    fnGetAZs,
    validateThatCorrectIntrinsicCalled,
} from '../../../../../src/cloudformation/parsing/resolver/intrinsic';
import { FnGetAZs } from '../../../../../src/cloudformation/types/cloudformation-model';

// --- Mocks for external dependencies ---
jest.mock('coreutilsts', () => ({
    isBlankString: jest.fn(),
}));
jest.mock('../../../../../src/cloudformation/parsing/resolver/intrinsic/utils/intrinsic-utils', () => ({
    validateThatCorrectIntrinsicCalled: jest.fn(),
}));

jest.mock('../../../../../src/cloudformation/parsing/index', () => ({
    resolveValue: jest.fn(),
}));

// Dummy resolution context implementing the minimal ResolvingContext interface.
const fakeCtx: ResolvingContext = {
    originalTemplate: {} as any,
    lookupMapPreProcessed: {},
    generatedIds: new Set(),
    lookupMapDynamic: {},
    currentPath: [],
    addName: jest.fn(),
    popName: jest.fn(),
    getCurrentPath: jest.fn(() => ''),
    hasParameterName: jest.fn(),
    getParameter: jest.fn(),
    addParameter: jest.fn(),
    addGeneratedId: jest.fn(),
    isIdExists: jest.fn(() => false),
    getRegion: jest.fn(() => 'us-east-1'),
    getPartition: jest.fn(() => 'aws'),
    getAccountId: jest.fn(() => '123456789012'),
    getAZs: jest.fn((region?: string) => {
        if (region) {
            return [`${region}-a`, `${region}-b`];
        }
        return ['us-east-1a', 'us-east-1b'];
    }),
};

describe('fnGetAZs', () => {
    let traceSpy: jest.SpyInstance;

    beforeEach(() => {
        traceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
        // Clear mocks for dependencies
        (validateThatCorrectIntrinsicCalled as jest.Mock).mockClear();
        (resolveValue as jest.Mock).mockClear();
        (isBlankString as jest.Mock).mockClear();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should call intrinsic validation and log the start message', () => {
        // Arrange: Prepare a valid intrinsic node.
        const node = { 'Fn::GetAZs': 'us-west-2' } as FnGetAZs;
        // Stub resolveValue to return the region as string.
        (resolveValue as jest.Mock).mockReturnValue('us-west-2');
        // Stub isBlankString (region is not blank)
        (isBlankString as jest.Mock).mockReturnValue(false);

        // Act
        const result = fnGetAZs(node, fakeCtx);

        // Assert
        expect(validateThatCorrectIntrinsicCalled).toHaveBeenCalledWith(node, 'Fn::GetAZs');
        expect(traceSpy).toHaveBeenCalledWith('fnGetAZs is called');
        expect(traceSpy).toHaveBeenCalledWith('fnGetAZs: Region resolved as "us-west-2", fetching AZs for region');
        // Using the provided region, ctx.getAZs() should be called with region.
        expect(fakeCtx.getAZs).toHaveBeenCalledWith('us-west-2');
        expect(result).toEqual(['us-west-2-a', 'us-west-2-b']);
    });

    it('should return default AZs when resolved region is not a string', () => {
        // Arrange: Create an intrinsic node with a raw value.
        const node = { 'Fn::GetAZs': 123 } as unknown as FnGetAZs;
        (validateThatCorrectIntrinsicCalled as jest.Mock).mockImplementation(() => {});
        // Simulate resolveValue returning a non-string (e.g. a number)
        (resolveValue as jest.Mock).mockReturnValue(123);
        // Stub isBlankString to return false when passed 123 (not applicable, but precaution)
        (isBlankString as jest.Mock).mockReturnValue(false);

        // Act
        const result = fnGetAZs(node, fakeCtx);

        // Assert – since resolved value is not a string, default AZs should be returned.
        expect(traceSpy).toHaveBeenCalledWith('fnGetAZs: Region is blank or not a string, using default AZs');
        // When region is invalid, ctx.getAZs is expected to be called without argument.
        expect(fakeCtx.getAZs).toHaveBeenCalledWith();
        expect(result).toEqual(['us-east-1a', 'us-east-1b']);
    });

    it('should return default AZs when resolved region is a blank string', () => {
        // Arrange
        const node = { 'Fn::GetAZs': '' } as FnGetAZs;
        (validateThatCorrectIntrinsicCalled as jest.Mock).mockImplementation(() => {});
        // Simulate resolveValue returns a blank string.
        (resolveValue as jest.Mock).mockReturnValue('');
        // Simulate isBlankString to return true for blank region.
        (isBlankString as jest.Mock).mockReturnValue(true);

        // Act
        const result = fnGetAZs(node, fakeCtx);

        // Assert – the default AZs should be used.
        expect(traceSpy).toHaveBeenCalledWith('fnGetAZs: Region is blank or not a string, using default AZs');
        expect(fakeCtx.getAZs).toHaveBeenCalledWith(); // Called without region to get default AZs.
        expect(result).toEqual(['us-east-1a', 'us-east-1b']);
    });
});
