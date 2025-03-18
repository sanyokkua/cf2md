import { generateStubOnType } from '../../../../src/cloudformation/preparation/utils/stub-utils';
import { randomArray, randomInteger, randomString } from '../../../../src/utils/random-utils';

// Mock the random utility functions.
jest.mock('../../../../src/utils/random-utils', () => ({
    randomString: jest.fn(),
    randomInteger: jest.fn(),
    randomArray: jest.fn(),
}));

describe('generateStubOnType', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should generate a stub for a 'String' type", () => {
        (randomString as jest.Mock).mockReturnValue('stub-string');
        const result = generateStubOnType('String');
        expect(result).toBe('stub-string');
        expect(randomString).toHaveBeenCalledTimes(1);
        expect(randomInteger).not.toHaveBeenCalled();
        expect(randomArray).not.toHaveBeenCalled();
    });

    it("should generate a stub for a 'Number' type", () => {
        (randomInteger as jest.Mock).mockReturnValue(123);
        const result = generateStubOnType('Number');
        expect(result).toBe(123);
        expect(randomInteger).toHaveBeenCalledTimes(1);
        expect(randomString).not.toHaveBeenCalled();
        expect(randomArray).not.toHaveBeenCalled();
    });

    it("should generate a stub for an 'Integer' type", () => {
        (randomInteger as jest.Mock).mockReturnValue(456);
        const result = generateStubOnType('Integer');
        expect(result).toBe(456);
        expect(randomInteger).toHaveBeenCalledTimes(1);
        expect(randomString).not.toHaveBeenCalled();
        expect(randomArray).not.toHaveBeenCalled();
    });

    it("should generate a stub for a 'List<Number>' type", () => {
        // For this branch the implementation is:
        // return randomArray<number>(() => randomInteger());
        // We mock randomArray so that we can simulate the callback behaviour.
        (randomInteger as jest.Mock).mockReturnValue(10);
        (randomArray as jest.Mock).mockImplementation((gen: () => number) => {
            // Call the provided generator function twice.
            const a = gen();
            const b = gen();
            return [a, b];
        });
        const result = generateStubOnType('List<Number>');
        expect(result).toEqual([10, 10]);
        expect(randomArray).toHaveBeenCalledTimes(1);
        // Also test that the generator provided to randomArray calls randomInteger:
        const generatorFn = (randomArray as jest.Mock).mock.calls[0][0];
        (randomInteger as jest.Mock).mockClear(); // clear call count
        generatorFn();
        expect(randomInteger).toHaveBeenCalledTimes(1);
    });

    it("should generate a stub for a 'CommaDelimitedList' type", () => {
        // In this branch: return randomArray<string>(() => randomString(3, 10)).join(',')
        (randomString as jest.Mock).mockImplementation((_min?: number, _max?: number) => {
            // For our purposes, we return a constant value regardless of min and max.
            return 'stub';
        });
        (randomArray as jest.Mock).mockReturnValue(['a', 'b', 'c']);
        const result = generateStubOnType('CommaDelimitedList');
        expect(result).toBe('a,b,c');
        expect(randomArray).toHaveBeenCalledTimes(1);
    });

    it("should generate a stub for a generic list type with inner type 'String'", () => {
        // When paramType is like "List<String>", it should return randomArray with randomString generator.
        (randomString as jest.Mock).mockReturnValue('gen-string');
        (randomArray as jest.Mock).mockReturnValue(['gen-string', 'gen-string']);
        const result = generateStubOnType('List<String>');
        expect(result).toEqual(['gen-string', 'gen-string']);
        expect(randomArray).toHaveBeenCalledTimes(1);
    });

    it("should generate a stub for a generic list type with inner type 'Number'", () => {
        // When paramType is like "List<String>", it should return randomArray with randomString generator.
        (randomInteger as jest.Mock).mockReturnValue('gen-string');
        (randomArray as jest.Mock).mockReturnValue([1, 2]);
        const result = generateStubOnType('List<Integer>');
        expect(result).toEqual([1, 2]);
        expect(randomArray).toHaveBeenCalledTimes(1);
    });

    it("should generate a stub for a generic list type with non-'Number' inner type (e.g. 'List<Boolean')", () => {
        // Any inner type besides Number defaults to a list of strings.
        (randomString as jest.Mock).mockReturnValue('default-string');
        (randomArray as jest.Mock).mockReturnValue(['default-string']);
        const result = generateStubOnType('List<Boolean>');
        expect(result).toEqual(['default-string']);
        expect(randomArray).toHaveBeenCalledTimes(1);
    });

    it('should generate a stub for an AWS-specific parameter type', () => {
        // For AWS types, the function returns `Stub${randomString(4, 8)}`.
        (randomString as jest.Mock).mockReturnValue('abcd');
        const paramType = 'AWS::EC2::KeyPair::KeyName';
        const result = generateStubOnType(paramType);
        expect(result).toBe('Stubabcd');
        expect(randomString).toHaveBeenCalledWith(4, 8);
    });

    it('should return the fallback stub for an unrecognized parameter type', () => {
        const paramType = 'UnrecognizedType';
        const result = generateStubOnType(paramType);
        expect(result).toBe('StubValue');
        // None of the random functions were called.
        expect(randomString).not.toHaveBeenCalled();
        expect(randomInteger).not.toHaveBeenCalled();
        expect(randomArray).not.toHaveBeenCalled();
    });

    it("should generate a stub for a generic list type with an empty inner type (e.g. 'List<>')", () => {
        (randomString as jest.Mock).mockReturnValue('empty');
        (randomArray as jest.Mock).mockReturnValue(['empty']);
        const result = generateStubOnType('List<>');
        expect(result).toEqual(['empty']);
        expect(randomArray).toHaveBeenCalledTimes(1);
    });
});
