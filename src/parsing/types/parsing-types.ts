import { CloudFormationTemplate } from './cloudformation-model';

export type TemplateParam = {
    paramKey: string;
    paramType: string;
    paramValue: unknown;
    isRequired: boolean;
    generatedStub: unknown;
};

export type ParsingResult = {
    hasErrors: boolean;
    errorMsg?: string;
    parsedTemplate?: CloudFormationTemplate;
    paramsToReview?: TemplateParam[];
};

export type UserProvidedParam = {
    paramKey: string;
    paramValue: unknown;
};

export interface ParserService {
    parseTemplateJsonString(template?: string | null): ParsingResult;

    resolveValuesInTemplate(parseResult: ParsingResult, userParameters: UserProvidedParam[]): CloudFormationTemplate;
}
