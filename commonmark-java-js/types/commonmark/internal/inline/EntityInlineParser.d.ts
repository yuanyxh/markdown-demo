import type { InlineContentParser, InlineContentParserFactory, InlineParserState } from '@/parser';
import { ParsedInline } from '@/parser';
declare class Factory implements InlineContentParserFactory {
    getTriggerCharacters(): Set<string>;
    create(): InlineContentParser;
}
/**
 * Attempts to parse an HTML entity or numeric character reference.
 */
declare class EntityInlineParser implements InlineContentParser {
    private static readonly hex;
    private static readonly dec;
    private static readonly entityStart;
    private static readonly entityContinue;
    tryParse(inlineParserState: InlineParserState): ParsedInline | null;
    private entity;
    static Factory: typeof Factory;
}
export default EntityInlineParser;
