import { extractErrorDetails } from 'coreutilsts';
import log from 'loglevel';
import typia from 'typia';
import { InvalidTemplateInputError } from '../../errors/cloudformation-errors';
import { isValidString } from '../../utils/validation-utils';
import { CloudFormationTemplate } from '../types/cloudformation-model';

/**
 * Parses a JSON CloudFormation template string into a CloudFormationTemplate model.
 *
 * This function first validates that the input is a non-empty string. If the validation fails,
 * it throws an InvalidTemplateInputError. It then uses typia to parse and assert that the JSON
 * conforms to the CloudFormationTemplate type.
 *
 * @param template - The JSON string representing the CloudFormation template. It can be undefined or null.
 * @returns The parsed CloudFormationTemplate model.
 * @throws InvalidTemplateInputError If the provided template is not a valid non-empty string.
 */
export function parseJsonTemplateToModel(template: string | undefined | null): CloudFormationTemplate {
    log.trace('Starting parseJsonTemplateToModel');

    if (!isValidString(template)) {
        log.error('Template validation failed: Invalid template string provided');
        throw new InvalidTemplateInputError('Invalid template string');
    }

    try {
        const parsedTemplate = typia.json.assertParse<CloudFormationTemplate>(template);
        log.trace('Successfully parsed CloudFormation template');
        return parsedTemplate;
    } catch (error) {
        const errMsg = extractErrorDetails(error);
        log.error(`Error occurred while parsing CloudFormation template. ${errMsg}`, error);
        throw error;
    }
}
