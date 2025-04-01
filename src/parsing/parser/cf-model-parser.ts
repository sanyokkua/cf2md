import { extractErrorDetails } from 'coreutilsts';
import log from 'loglevel';
import typia from 'typia';
import { StringUtils } from '../../common';
import { ResolvingContextImpl } from '../resolver/resolving-context';
import { CloudFormationResource, CloudFormationTemplate } from '../types/cloudformation-model';
import { ResourceIntrinsicResolver } from '../types/intrinsic-types';
import { ParserService, ParsingResult, TemplateParam, UserProvidedParam } from '../types/parsing-types';
import { ResolvingContext, ValueResolver } from '../types/resolving-types';
import { ParserUtils, ResourceUtils } from '../types/util-service-types';

export class CfModelParserImpl implements ParserService {
    constructor(
        private readonly stringUtils: StringUtils,
        private readonly cfModelParserUtils: ParserUtils,
        private readonly resolverUtils: ValueResolver,
        private readonly resourceUtils: ResourceUtils,
        private readonly cfResourceResolver: ResourceIntrinsicResolver,
    ) {}

    parseTemplateJsonString(template?: string | null): ParsingResult {
        log.trace('Starting CloudFormation template parsing.', template);

        try {
            if (!this.stringUtils.isValidNotBlankString(template)) {
                log.warn('Template validation failed: Invalid template string provided');
                // noinspection ExceptionCaughtLocallyJS
                throw new Error('Invalid template string');
            }

            const parsedTemplate = typia.json.assertParse<CloudFormationTemplate>(template);
            log.trace('Successfully parsed CloudFormation template');

            const missingParams: TemplateParam[] = this.cfModelParserUtils.analyzeParams(parsedTemplate);
            log.trace(`Template analyzed. Number of missing parameters: ${String(missingParams.length)}`);

            return {
                hasErrors: false,
                parsedTemplate,
                paramsToReview: missingParams,
            };
        } catch (error: unknown) {
            const errorMsg = extractErrorDetails(error);
            log.warn('Error while parsing template:', error);
            return {
                hasErrors: true,
                errorMsg,
            };
        }
    }

    resolveValuesInTemplate(parseResult: ParsingResult, userParameters: UserProvidedParam[]): CloudFormationTemplate {
        const { hasErrors, parsedTemplate, paramsToReview } = parseResult;

        if (hasErrors || !parsedTemplate || !paramsToReview) {
            throw new Error('Parsing result is invalid: the template contains errors or is missing required data.');
        }

        const [resolvedMapping, stats] = this.cfModelParserUtils.replaceParamsWithUserDefined(paramsToReview, userParameters);
        log.trace('User parameters applied. Replacement stats:', stats);

        const context = new ResolvingContextImpl(this.cfModelParserUtils, this.resourceUtils, parsedTemplate, resolvedMapping);
        const resolvedTemplate = this.resolverUtils.resolveValue(parsedTemplate, context);
        const finalTemplate = typia.assert<CloudFormationTemplate>(resolvedTemplate);
        log.trace('Template resolved and type-asserted successfully.');

        for (const resourcesKey of Object.keys(finalTemplate.Resources)) {
            const resource = finalTemplate.Resources[resourcesKey];
            this.assignIdentifiers(resource, resourcesKey, context);
        }

        // Final type assertion to ensure modifications did not break the object structure.
        return typia.assert<CloudFormationTemplate>(finalTemplate);
    }

    private assignIdentifiers(resource: CloudFormationResource, logicalId: string, context: ResolvingContext): void {
        const resolverFunction = (value: unknown, ctx: ResolvingContext) => this.resolverUtils.resolveValue(value, ctx);
        const resolver = this.cfResourceResolver.getResourceIntrinsic(resource.Type);
        const funContext = { resource, logicalId, ctx: context, valueResolver: resolverFunction };

        if (!resource._id) {
            resource._id = resolver.idGenFunc(funContext);
        }
        if (!resource._arn) {
            resource._arn = resolver.arnGenFunc(funContext);
        }
    }
}
