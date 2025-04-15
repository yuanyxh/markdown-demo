import type { InlineContentParserFactory, InlineParserState, InlineContentParser } from '@/parser';
import { ParsedInline } from '@/parser';
declare class Factory implements InlineContentParserFactory {
    getTriggerCharacters(): Set<string>;
    create(): InlineContentParser;
}
/**
 * Attempt to parse an autolink (URL or email in pointy brackets).
 */
declare class AutolinkInlineParser implements InlineContentParser {
    private static readonly URI;
    private static readonly EMAIL;
    tryParse(inlineParserState: InlineParserState): ParsedInline | null;
    static Factory: typeof Factory;
}
export default AutolinkInlineParser;
