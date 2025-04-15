import type { InlineContentParserFactory, InlineParserState, InlineContentParser } from '@/parser';
import { ParsedInline } from '@/parser';
declare class Factory implements InlineContentParserFactory {
    getTriggerCharacters(): Set<string>;
    create(): InlineContentParser;
}
/**
 * Parse a backslash-escaped special character, adding either the escaped  character, a hard line break
 * (if the backslash is followed by a newline), or a literal backslash to the block's children.
 */
declare class BackslashInlineParser implements InlineContentParser {
    private static readonly ESCAPABLE;
    tryParse(inlineParserState: InlineParserState): ParsedInline;
    static Factory: typeof Factory;
}
export default BackslashInlineParser;
