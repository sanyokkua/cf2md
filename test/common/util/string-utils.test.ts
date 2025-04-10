import log from 'loglevel';
import { StringUtils, StringUtilsImpl } from '../../../src/common';

type TestCase = {
    input: string;
    output: string;
    variables?: Record<string, string>;
};

describe('string-utils', () => {
    let stringUtils: StringUtils;
    let traceSpy: jest.SpyInstance;
    let debugSpy: jest.SpyInstance;

    describe('isBlankString', () => {
        beforeEach(() => {
            // Spy on logging methods.
            stringUtils = new StringUtilsImpl();
            traceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
            debugSpy = jest.spyOn(log, 'debug').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it(`should return false for null`, () => {
            expect(stringUtils.isBlankString(null)).toBeTruthy();
        });

        it(`should return false for undefined`, () => {
            expect(stringUtils.isBlankString(null)).toBeTruthy();
        });

        it(`should return false for ""`, () => {
            expect(stringUtils.isBlankString('')).toBeTruthy();
        });

        it(`should return false for "  "`, () => {
            expect(stringUtils.isBlankString('  ')).toBeTruthy();
        });

        it(`should return true for " This Is A String "`, () => {
            expect(stringUtils.isBlankString(' This Is A String ')).toBeFalsy();
        });
    });

    describe('isValidNotBlankString', () => {
        beforeEach(() => {
            // Spy on logging methods.
            stringUtils = new StringUtilsImpl();
            traceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
            debugSpy = jest.spyOn(log, 'debug').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it(`should return false for null`, () => {
            expect(stringUtils.isValidNotBlankString(null)).toBeFalsy();
        });

        it(`should return false for undefined`, () => {
            expect(stringUtils.isValidNotBlankString(null)).toBeFalsy();
        });

        it(`should return false for ""`, () => {
            expect(stringUtils.isValidNotBlankString('')).toBeFalsy();
        });

        it(`should return false for "  "`, () => {
            expect(stringUtils.isValidNotBlankString('  ')).toBeFalsy();
        });

        it(`should return true for " This Is A String "`, () => {
            expect(stringUtils.isValidNotBlankString(' This Is A String ')).toBeTruthy();
        });
    });

    describe('parseTemplateString', () => {
        beforeEach(() => {
            // Spy on logging methods.
            stringUtils = new StringUtilsImpl();
            traceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
            debugSpy = jest.spyOn(log, 'debug').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should return an empty array if there are no placeholders', () => {
            const template = 'Hello World!';
            const result = stringUtils.parseTemplateString(template);
            expect(result).toEqual([]);
            expect(debugSpy).not.toHaveBeenCalled();
            // Two trace calls: at start and at end.
            expect(traceSpy).toHaveBeenCalledTimes(2);
        });

        it('should extract a single placeholder', () => {
            const template = 'Hello ${name}';
            const result = stringUtils.parseTemplateString(template);
            expect(result).toEqual(['name']);
            expect(debugSpy).toHaveBeenCalledTimes(1);
            expect(debugSpy).toHaveBeenCalledWith('[StringUtilsImpl.parseTemplateString] Found variable:', 'name');
        });

        it('should extract multiple distinct placeholders', () => {
            const template = 'Hello ${first}, meet ${second}';
            const result = stringUtils.parseTemplateString(template);
            expect(result).toEqual(['first', 'second']);
            expect(debugSpy).toHaveBeenCalledTimes(2);
            expect(debugSpy).toHaveBeenCalledWith('[StringUtilsImpl.parseTemplateString] Found variable:', 'first');
            expect(debugSpy).toHaveBeenCalledWith('[StringUtilsImpl.parseTemplateString] Found variable:', 'second');
        });

        it('should extract repeated placeholders', () => {
            const template = 'Repeat ${dup}, then ${dup}';
            const result = stringUtils.parseTemplateString(template);
            expect(result).toEqual(['dup', 'dup']);
            expect(debugSpy).toHaveBeenCalledTimes(2);
        });

        it('should extract adjacent placeholders', () => {
            const template = 'Values: ${a}${b}';
            const result = stringUtils.parseTemplateString(template);
            expect(result).toEqual(['a', 'b']);
            expect(debugSpy).toHaveBeenCalledTimes(2);
        });

        it('should return an empty array for a malformed placeholder (missing closing brace)', () => {
            const template = 'This is a ${test';
            const result = stringUtils.parseTemplateString(template);
            expect(result).toEqual([]);
        });

        it('should extract placeholders that include spaces', () => {
            const template = 'Hello ${first name}';
            const result = stringUtils.parseTemplateString(template);
            expect(result).toEqual(['first name']);
        });

        it('should return an empty array when the template is an empty string', () => {
            const template = '';
            const result = stringUtils.parseTemplateString(template);
            expect(result).toEqual([]);
        });
    });

    describe('replaceTemplateVariables', () => {
        beforeEach(() => {
            stringUtils = new StringUtilsImpl();
            traceSpy = jest.spyOn(log, 'trace').mockImplementation(() => {});
            debugSpy = jest.spyOn(log, 'debug').mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should replace a single placeholder with the provided value', () => {
            const template = 'Hello ${name}';
            const values = { name: 'World' };
            const result = stringUtils.replaceTemplateVariables(template, values);
            expect(result).toBe('Hello World');
            expect(debugSpy).toHaveBeenCalledWith(
                '[StringUtilsImpl.replaceTemplateVariables] Replacing placeholder:',
                '${name}',
                'with value:',
                'World',
            );
            expect(traceSpy).toHaveBeenCalledTimes(2);
        });

        it('should replace multiple occurrences of the same placeholder', () => {
            const template = 'Hello ${name}, ${name}!';
            const values = { name: 'John' };
            const result = stringUtils.replaceTemplateVariables(template, values);
            expect(result).toBe('Hello John, John!');
            // Only one replacement loop since there's one key.
            expect(debugSpy).toHaveBeenCalledTimes(1);
            expect(debugSpy).toHaveBeenCalledWith(
                '[StringUtilsImpl.replaceTemplateVariables] Replacing placeholder:',
                '${name}',
                'with value:',
                'John',
            );
        });

        it('should replace multiple different placeholders', () => {
            const template = 'The ${animal} jumped over the ${object}';
            const values = { animal: 'cow', object: 'moon' };
            const result = stringUtils.replaceTemplateVariables(template, values);
            expect(result).toBe('The cow jumped over the moon');
            expect(debugSpy).toHaveBeenCalledTimes(2);
        });

        it('should leave placeholders intact if no corresponding value is provided', () => {
            const template = 'Hello ${name} and ${city}';
            const values = { name: 'Alice' };
            const result = stringUtils.replaceTemplateVariables(template, values);
            expect(result).toBe('Hello Alice and ${city}');
            // Only ${name} replacement occurs.
            expect(debugSpy).toHaveBeenCalledTimes(1);
        });

        it('should convert non-string values to their string representation', () => {
            const template = 'Number: ${num}, Boolean: ${isActive}';
            const values = { num: 123, isActive: false };
            const result = stringUtils.replaceTemplateVariables(template, values);
            expect(result).toBe('Number: 123, Boolean: false');
            expect(debugSpy).toHaveBeenCalledTimes(2);
        });

        it('should properly replace keys containing special regex characters', () => {
            const template = 'Sum: ${a+b}';
            const values = { 'a+b': 5 };
            const result = stringUtils.replaceTemplateVariables(template, values);
            expect(result).toBe('Sum: 5');
            expect(debugSpy).toHaveBeenCalledWith('[StringUtilsImpl.replaceTemplateVariables] Replacing placeholder:', '${a+b}', 'with value:', 5);
        });

        it('should leave the template unchanged if there are no placeholders', () => {
            const template = 'Static text';
            const values = { any: 'value' };
            const result = stringUtils.replaceTemplateVariables(template, values);
            expect(result).toBe('Static text');
        });

        it('should not replace partial or malformed placeholders', () => {
            const template = 'This is not a placeholder: $name or ${name';
            const values = { name: 'Test' };
            const result = stringUtils.replaceTemplateVariables(template, values);
            expect(result).toBe('This is not a placeholder: $name or ${name');
        });
    });

    describe('joinStrings', () => {
        beforeEach(() => {
            stringUtils = new StringUtilsImpl();
        });

        it('should join strings', () => {
            const result = stringUtils.joinStrings(['a', 'b', 'c'], ',');
            expect(result).toBe('a,b,c');
        });
    });

    describe('splitString', () => {
        beforeEach(() => {
            stringUtils = new StringUtilsImpl();
        });

        it('should split string', () => {
            const result = stringUtils.splitString('a,b,c,d', ',');
            expect(result).toStrictEqual(['a', 'b', 'c', 'd']);
        });
    });

    describe('renderVelocityJsonString', () => {
        const templateEventBus1 = `
#*
  This is a velocity comment.
*#
#set($requestSource = $input.json('$.topic'))
{
    "Entries": [
        {
            "DetailType": $input.json('$.topic'),
            "Source": "$requestSource",
            "EventBusName": "test-perf-event-bus-env",
            "Detail": "$util.escapeJavaScript($input.json('$.payload')).replaceAll("\\'","'")"
        }
    ]
}
`;
        const templateDynamo = `
{
    "TableName": "Users",
    "Item": {
        "UserId": {
            "S": "$input.path('$.userId')"
        },
        "Name": {
            "S": "$input.path('$.name')"
        },
        "Age": {
            "N": "$input.path('$.age')"
        },
        "CreatedAt": {
            "S": "$context.requestTimeEpoch"
        }
    },
    #if($input.path('$.email'))
    "ConditionExpression": "attribute_not_exists(Email)",
    "ExpressionAttributeNames": {"#E": "Email"},
    "ExpressionAttributeValues": {":e": {"S": "$input.path('$.email')"}},
    "UpdateExpression": "SET #E = :e"
    #end
}
        `;
        const template3Sqs = `
{
    "QueueUrl": "\${stageVariables.queueUrl}",
    "MessageBody": "$util.escapeJavaScript($input.json('$'))",
    #set($attributes = {})
    #foreach($key in $input.params().header.keySet())
        #set($value = $input.params().header.get($key))
        $util.qr($attributes.put("$key", {"DataType": "String", "StringValue": "$value"}))
    #end
    #if(!$attributes.isEmpty())
    "MessageAttributes": $util.toJson($attributes)
    #end
}
`;
        const template4Sns = `
{
    "TopicArn": "arn:aws:sns:\${stageVariables.region}:\${stageVariables.accountId}:\${stageVariables.topicName}",
    "Message": "$util.escapeJavaScript($input.json('$.message'))",
    #if($input.path('$.subject'))
    "Subject": "$input.path('$.subject')",
    #end
    "MessageAttributes": {
        "RequestId": {
            "DataType": "String",
            "StringValue": "$context.requestId"
        },
        "HttpMethod": {
            "DataType": "String",
            "StringValue": "$context.httpMethod"
        }
    }
}
`;
        const template5EventBridge = `
{
    "Entries": [
        {
            "Source": "$input.path('$.source')",
            "DetailType": "$input.path('$.detailType')",
            "Detail": "$util.escapeJavaScript($input.json('$.detail'))",
            "EventBusName": "\${stageVariables.eventBusName}",
            #if($input.path('$.time'))
            "Time": "$input.path('$.time')"
            #else
            "Time": "$context.requestTimeEpoch"
            #end
        }
    ]
}
`;
        const template7StepFunction = `
{
    "stateMachineArn": "arn:aws:states:\${stageVariables.region}:\${stageVariables.accountId}:stateMachine:\${stageVariables.stateMachineName}",
    "name": "$util.randomUUID()",
    #set($input = $input.json('$'))
    #set($input.requestId = $context.requestId)
    #set($input.apiId = $context.apiId)
    "input": "$util.escapeJavaScript($util.toJson($input))"
}
`;
        const template8S3 = `
{
    "Bucket": "\${stageVariables.bucketName}",
    "Key": "$input.path('$.fileName')",
    "ContentType": "$input.params().header.get('Content-Type')",
    "Body": "$util.base64Decode($input.path('$.content'))",
    #set($metadata = {})
    #foreach($key in $input.path('$.metadata').keySet())
        $util.qr($metadata.put($key, $input.path("$.metadata.$key")))
    #end
    #if(!$metadata.isEmpty())
    "Metadata": $util.toJson($metadata)
    #end
}
`;
        const testCases: TestCase[] = [
            {
                input: templateEventBus1,
                output: `{"Entries":[{"DetailType":"$.topic","Source":"$.topic","EventBusName":"test-perf-event-bus-env","Detail":"$.payload"}]}`,
            },
            {
                input: templateDynamo,
                output: `{"TableName":"Users","Item":{"UserId":{"S":"{}"},"Name":{"S":"{}"},"Age":{"N":"{}"},"CreatedAt":{"S":"$context.requestTimeEpoch"}},"ConditionExpression":"attribute_not_exists(Email)","ExpressionAttributeNames":{"#E":"Email"},"ExpressionAttributeValues":{":e":{"S":"{}"}},"UpdateExpression":"SET #E = :e"}`,
            },
            {
                input: template3Sqs,
                output: `{"QueueUrl":"https://sqs.com","MessageBody":"$","MessageAttributes":{}}`,
                variables: { queueUrl: 'https://sqs.com' },
            },
            {
                input: template4Sns,
                output: `{"TopicArn":"arn:aws:sns:us-west-1:1234567890123:my-topic","Message":"$.message","Subject":"{}","MessageAttributes":{"RequestId":{"DataType":"String","StringValue":"$context.requestId"},"HttpMethod":{"DataType":"String","StringValue":"$context.httpMethod"}}}`,
                variables: {
                    region: 'us-west-1',
                    accountId: '1234567890123',
                    topicName: 'my-topic',
                },
            },
            {
                input: template5EventBridge,
                output: `{"Entries":[{"Source":"{}","DetailType":"{}","Detail":"$.detail","EventBusName":"test-event-bus-env","Time":"{}"}]}`,
                variables: { eventBusName: 'test-event-bus-env' },
            },
            {
                input: template7StepFunction,
                output: `{"stateMachineArn":"arn:aws:states:us-west-1:1234567890123:stateMachine:test-sf","name":"$util.randomUUID()","input":"{}"}`,
                variables: {
                    region: 'us-west-1',
                    accountId: '1234567890123',
                    stateMachineName: 'test-sf',
                },
            },
            {
                input: template8S3,
                output: `{"Bucket":"my-s3-bucket","Key":"{}","ContentType":"$input.params().header.get('Content-Type')","Body":"{}","Metadata":{}}`,
                variables: {
                    bucketName: 'my-s3-bucket',
                },
            },
        ];

        describe.each(testCases)('renderVelocityJsonString', (testCase) => {
            const { input, output, variables } = testCase;

            beforeEach(() => {
                stringUtils = new StringUtilsImpl();
            });

            it(`should parse template into ${output}`, () => {
                const result = stringUtils.renderVelocityJsonString(input, variables);
                expect(result).toStrictEqual(output);
            });
        });
    });
});
