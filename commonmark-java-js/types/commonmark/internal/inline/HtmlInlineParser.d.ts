import type { InlineContentParserFactory, InlineParserState, InlineContentParser } from '@/parser';
import { ParsedInline } from '@/parser';
declare class Factory implements InlineContentParserFactory {
    getTriggerCharacters(): Set<string>;
    create(): InlineContentParser;
}
/**
 * Attempt to parse inline HTML.
 */
declare class HtmlInlineParser implements InlineContentParser {
    private static readonly asciiLetter;
    private static readonly tagNameStart;
    private static readonly tagNameContinue;
    private static readonly attributeStart;
    private static readonly attributeContinue;
    private static readonly attributeValueEnd;
    tryParse(inlineParserState: InlineParserState): ParsedInline | null;
    private static htmlInline;
    private static tryOpenTag;
    private static tryClosingTag;
    private static tryProcessingInstruction;
    private static tryComment;
    private static tryCdata;
    private static tryDeclaration;
    static Factory: typeof Factory;
}
export default HtmlInlineParser;
