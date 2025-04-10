import { extractErrorDetails } from 'coreutilsts';
import log from 'loglevel';
import typia from 'typia';
import { StringUtils } from '../../common';
import { ParsingValidationError } from '../error/parsing-errors';
import { ResolvingContextImpl } from '../resolver/resolving-context';
import { CloudFormationResource, CloudFormationTemplate } from '../types/cloudformation-model';
import { ResourceIntrinsicResolver } from '../types/intrinsic-types';
import { ParserService, ParsingResult, TemplateParam, UserProvidedParam } from '../types/parsing-types';
import { ResolvingContext, ValueResolver } from '../types/resolving-types';
import { ParserUtils, ResourceUtils } from '../types/util-service-types';

export class CfModelParserImpl implements ParserService {
    constructor(
        private readonly stringUtils: StringUtils,
        private readonly parserUtils: ParserUtils,
        private readonly resolverUtils: ValueResolver,
        private readonly resourceUtils: ResourceUtils,
        private readonly cfResourceResolver: ResourceIntrinsicResolver,
    ) {
        log.trace('[CfModelParserImpl.constructor] Entering with arguments:', {
            stringUtils,
            parserUtils,
            resolverUtils,
            resourceUtils,
            cfResourceResolver,
        });
        log.trace('[CfModelParserImpl.constructor] Exiting');
    }

    parseTemplateJsonString(template?: string | null): ParsingResult {
        log.trace('[CfModelParserImpl.parseTemplateJsonString] Entering with arguments:', { template });

        if (!this.stringUtils.isValidNotBlankString(template)) {
            log.warn('[CfModelParserImpl.parseTemplateJsonString] Template validation failed: Invalid template string provided');
            const result: ParsingResult = {
                hasErrors: true,
                errorMsg: 'Invalid template string',
            };
            log.trace('[CfModelParserImpl.parseTemplateJsonString] Exiting with result:', result);
            return result;
        }

        try {
            const parsedTemplate = typia.json.assertParse<CloudFormationTemplate>(template);
            log.trace('[CfModelParserImpl.parseTemplateJsonString] Successfully parsed CloudFormation template');

            const missingParams: TemplateParam[] = this.parserUtils.analyzeParams(parsedTemplate);
            log.trace(`[CfModelParserImpl.parseTemplateJsonString] Template analyzed. Number of missing parameters: ${String(missingParams.length)}`);

            const result: ParsingResult = {
                hasErrors: false,
                parsedTemplate,
                paramsToReview: missingParams,
            };
            log.trace('[CfModelParserImpl.parseTemplateJsonString] Exiting with result:', result);
            return result;
        } catch (error: unknown) {
            const errorMsg = extractErrorDetails(error);
            log.warn('[CfModelParserImpl.parseTemplateJsonString] Error while parsing template:', error);
            const result: ParsingResult = {
                hasErrors: true,
                errorMsg,
            };
            log.trace('[CfModelParserImpl.parseTemplateJsonString] Exiting with result:', result);
            return result;
        }
    }

    resolveValuesInTemplate(parseResult: ParsingResult, userParameters: UserProvidedParam[]): CloudFormationTemplate {
        log.trace('[CfModelParserImpl.resolveValuesInTemplate] Entering with arguments:', { parseResult, userParameters });
        try {
            const [parsedTemplate, paramsToReview] = this.validateAndGetParsingResult(parseResult);
            log.debug('[CfModelParserImpl.resolveValuesInTemplate] Validated parsing result:', { parsedTemplate, paramsToReview });

            const resolvedMapping = this.applyUserParameters(paramsToReview, userParameters);
            log.debug('[CfModelParserImpl.resolveValuesInTemplate] Applied user parameters. Resolved mapping:', resolvedMapping);

            const context = this.createResolvingContext(parsedTemplate, resolvedMapping);
            log.debug('[CfModelParserImpl.resolveValuesInTemplate] Created resolving context:', context);

            const resolvedTemplate = this.resolverUtils.resolveValue(parsedTemplate, context);
            log.debug('[CfModelParserImpl.resolveValuesInTemplate] Initial template resolution complete.');
            const finalTemplate = typia.assert<CloudFormationTemplate>(resolvedTemplate);
            log.trace('[CfModelParserImpl.resolveValuesInTemplate] Template resolved and type-asserted successfully.');

            this.assignIdentifiersToResources(finalTemplate, context);
            log.debug('[CfModelParserImpl.resolveValuesInTemplate] Assigned identifiers to resources.');

            log.trace('[CfModelParserImpl.resolveValuesInTemplate] Exiting with result:', finalTemplate);
            return typia.assert<CloudFormationTemplate>(finalTemplate);
        } catch (error: unknown) {
            const errorMsg = extractErrorDetails(error);
            log.error(`[CfModelParserImpl.resolveValuesInTemplate] Error during template resolution: ${errorMsg}`);
            throw error; // Re-throw the error to maintain existing behavior
        }
    }

    private validateAndGetParsingResult(parseResult: ParsingResult): [CloudFormationTemplate, TemplateParam[]] {
        log.trace('[CfModelParserImpl.validateAndGetParsingResult] Entering with arguments:', { parseResult });
        if (parseResult.hasErrors || !parseResult.parsedTemplate || !parseResult.paramsToReview) {
            const errorMsg = 'Parsing result is invalid: the template contains errors or is missing required data.';
            log.error('[CfModelParserImpl.validateAndGetParsingResult] Error:', errorMsg);
            throw new ParsingValidationError(errorMsg);
        }
        const result: [CloudFormationTemplate, TemplateParam[]] = [parseResult.parsedTemplate, parseResult.paramsToReview];
        log.trace('[CfModelParserImpl.validateAndGetParsingResult] Exiting with result:', result);
        return result;
    }

    private applyUserParameters(paramsToReview: TemplateParam[], userParameters: UserProvidedParam[]): Record<string, unknown> {
        log.trace('[CfModelParserImpl.applyUserParameters] Entering with arguments:', { paramsToReview, userParameters });
        const [resolvedMapping, stats] = this.parserUtils.replaceParamsWithUserDefined(paramsToReview, userParameters);
        log.trace('[CfModelParserImpl.applyUserParameters] User parameters applied. Replacement stats:', stats, 'Resolved mapping:', resolvedMapping);
        log.trace('[CfModelParserImpl.applyUserParameters] Exiting with result:', resolvedMapping);
        return resolvedMapping;
    }

    private createResolvingContext(parsedTemplate: CloudFormationTemplate, resolvedMapping: Record<string, unknown>): ResolvingContext {
        log.trace('[CfModelParserImpl.createResolvingContext] Entering with arguments:', { parsedTemplate, resolvedMapping });
        const context = new ResolvingContextImpl(this.parserUtils, this.resourceUtils, parsedTemplate, resolvedMapping);
        log.trace('[CfModelParserImpl.createResolvingContext] Exiting with result:', context);
        return context;
    }

    private assignIdentifiersToResources(finalTemplate: CloudFormationTemplate, context: ResolvingContext): void {
        log.trace('[CfModelParserImpl.assignIdentifiersToResources] Entering with arguments:', { finalTemplate, context });
        log.debug('[CfModelParserImpl.assignIdentifiersToResources] Starting assignment of identifiers to resources.');
        for (const [logicalId, resource] of Object.entries(finalTemplate.Resources)) {
            log.debug(`[CfModelParserImpl.assignIdentifiersToResources] Processing resource with logical ID: ${logicalId}`);
            this.assignResourceIdentifiers(resource, logicalId, context);
        }
        log.trace('[CfModelParserImpl.assignIdentifiersToResources] Exiting');
    }

    private assignResourceIdentifiers(resource: CloudFormationResource, logicalId: string, context: ResolvingContext): void {
        log.trace('[CfModelParserImpl.assignResourceIdentifiers] Entering with arguments:', { resource, logicalId, context });
        const resolverFunction = (value: unknown, ctx: ResolvingContext) => this.resolverUtils.resolveValue(value, ctx);
        log.debug('[CfModelParserImpl.assignResourceIdentifiers] Retrieved resolver function:', resolverFunction);
        const resolver = this.cfResourceResolver.getResourceIntrinsic(resource.Type);
        log.debug('[CfModelParserImpl.assignResourceIdentifiers] Retrieved resource intrinsic resolver:', resolver);
        const identifierContext = { resource, logicalId, ctx: context, valueResolver: resolverFunction };
        log.debug('[CfModelParserImpl.assignResourceIdentifiers] Created identifier context:', identifierContext);

        if (resource._id === undefined) {
            resource._id = resolver.idGenFunc(identifierContext);
            log.debug(`[CfModelParserImpl.assignResourceIdentifiers] Assigned _id: ${resource._id} to resource: ${logicalId}`);
        }
        if (resource._arn === undefined) {
            resource._arn = resolver.arnGenFunc(identifierContext);
            log.debug(`[CfModelParserImpl.assignResourceIdentifiers] Assigned _arn: ${resource._arn} to resource: ${logicalId}`);
        }
        log.trace('[CfModelParserImpl.assignResourceIdentifiers] Exiting');
    }
}
