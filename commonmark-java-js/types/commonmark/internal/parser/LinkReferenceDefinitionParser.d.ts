import type { SourceSpan } from '@/node';
import type { SourceLine } from '@/parser';
import { LinkReferenceDefinition } from '@/node';
import { SourceLines } from '@/parser';
declare enum State {
    START_DEFINITION = "START_DEFINITION",
    LABEL = "LABEL",
    DESTINATION = "DESTINATION",
    START_TITLE = "START_TITLE",
    TITLE = "TITLE",
    PARAGRAPH = "PARAGRAPH"
}
/**
 * Parser for link reference definitions at the beginning of a paragraph.
 *
 * @see <a href="https://spec.commonmark.org/0.31.2/#link-reference-definitions">Link reference definitions</a>
 */
declare class LinkReferenceDefinitionParser {
    private state;
    private readonly paragraphLines;
    private readonly definitions;
    private readonly sourceSpans;
    private label;
    private destination;
    private titleDelimiter;
    private title;
    private referenceValid;
    parse(line: SourceLine): void;
    addSourceSpan(sourceSpan: SourceSpan): void;
    /**
     * @return the lines that are normal paragraph content, without newlines
     */
    getParagraphLines(): SourceLines;
    getParagraphSourceSpans(): SourceSpan[];
    getDefinitions(): LinkReferenceDefinition[];
    protected getState(): State;
    private startDefinition;
    private setLabel;
    private setDestination;
    private startTitle;
    private setTitle;
    private finishReference;
    protected static State: typeof State;
}
export default LinkReferenceDefinitionParser;
