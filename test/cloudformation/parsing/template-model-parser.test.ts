import { parseJsonTemplateToModel } from '../../../src/cloudformation';

import { TypeGuardError } from 'typia';
import { InvalidTemplateInputError } from '../../../src/errors/cloudformation-errors';
import * as dynamodb_lambda from '../../testdata/dynamodb-lambda.json';
import * as ecs_service from '../../testdata/ecs-service.json';
import * as gateway_lambda_eventbus_rules_sns from '../../testdata/gateway-lambda-eventbus-rules-sns.json';
import * as kinesis_pipe_event_bus from '../../testdata/kinesis-pipe-event-bus.json';
import * as rule_lambda_dlq from '../../testdata/rule-lambda-dlq.json';
import * as two_dynamo_db from '../../testdata/two-dynamo-db.json';

describe('template-model-parser', () => {
    const testCases = [
        { obj: ecs_service, fileName: 'ecs-service.json' },
        { obj: gateway_lambda_eventbus_rules_sns, fileName: 'gateway-lambda-eventbus-rules-sns.json' },
        { obj: kinesis_pipe_event_bus, fileName: 'kinesis-pipe-event-bus.json' },
        { obj: dynamodb_lambda, fileName: 'dynamodb-lambda.json' },
        { obj: two_dynamo_db, fileName: 'two-dynamo-db.json' },
        { obj: rule_lambda_dlq, fileName: 'rule-lambda-dlq.json' },
    ];

    describe('parseJsonTemplateToModel', () => {
        it.each(testCases)('should successfully parse the JSON template from $fileName', ({ obj }) => {
            const jsonString = JSON.stringify(obj);
            const parsedModel = parseJsonTemplateToModel(jsonString);

            // Assert that the parsing did not throw an error and returned a value
            expect(parsedModel).toBeDefined();

            // Assert that the returned model has a Resources property
            expect(parsedModel).toHaveProperty('Resources');
            expect(parsedModel.Resources).toBeDefined();

            // Assert that there is at least one resource in the template
            expect(Object.keys(parsedModel.Resources).length).toBeGreaterThanOrEqual(1);
        });

        it('should throw an error for non CloudFormationTemplate JSON input', () => {
            const jsonString = '{}';
            expect(() => parseJsonTemplateToModel(jsonString)).toThrow(TypeGuardError);
        });

        it('should throw an error for invalid JSON input', () => {
            const invalidJsonString = 'invalid json';
            expect(() => parseJsonTemplateToModel(invalidJsonString)).toThrow(SyntaxError);
        });

        it(`should throw an error on the null input`, () => {
            expect(() => parseJsonTemplateToModel(null)).toThrow(InvalidTemplateInputError);
        });

        it(`should throw an error on the undefined input`, () => {
            expect(() => parseJsonTemplateToModel(undefined)).toThrow(InvalidTemplateInputError);
        });

        it(`should throw an error on the empty string input`, () => {
            expect(() => parseJsonTemplateToModel('')).toThrow(InvalidTemplateInputError);
        });

        it(`should throw an error on the blank string input`, () => {
            expect(() => parseJsonTemplateToModel('   \n')).toThrow(InvalidTemplateInputError);
        });

        it(`should throw an error on the non Json string input`, () => {
            expect(() => parseJsonTemplateToModel('HelloWorld')).toThrow(Error);
        });

        it(`should throw an error on the non CloudFormation Json string input`, () => {
            expect(() => parseJsonTemplateToModel('{ "hello": 10 }')).toThrow(TypeGuardError);
        });
    });
});
