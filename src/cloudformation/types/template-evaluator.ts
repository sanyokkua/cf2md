import { TemplateParam } from '../preparation';
import { CloudFormationTemplate } from './cloudformation-model';

/**
 * The result of parsing the CloudFormation template.
 */
export type ParsingResult = {
    hasErrors: boolean;
    errorMsg?: string;
    parsedTemplate?: CloudFormationTemplate;
    paramsToReview?: TemplateParam[];
};
