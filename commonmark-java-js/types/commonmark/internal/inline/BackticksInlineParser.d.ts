import type { InlineContentParser, InlineContentParserFactory, InlineParserState } from '@/parser';
import { ParsedInline } from '@/parser';
declare class Factory implements InlineContentParserFactory {
    getTriggerCharacters(): Set<string>;
    create(): InlineContentParser;
}
/**
 * Attempt to parse backticks, returning either a backtick code span or a literal sequence of backticks.
 */
declare class BackticksInlineParser implements InlineContentParser {
    tryParse(inlineParserState: InlineParserState): ParsedInline;
    static Factory: typeof Factory;
}
export default BackticksInlineParser;
