import type { InlineParser, InlineParserContext, InlineParserFactory, InlineParserState, LinkInfo, Position, SourceLines } from '@/parser';
import { Scanner } from '@/parser';
import { Node, Text } from '@/node';
declare class DelimiterData {
    readonly characters: Text[];
    readonly canClose: boolean;
    readonly canOpen: boolean;
    constructor(characters: Text[], canOpen: boolean, canClose: boolean);
}
declare class DestinationTitle {
    readonly destination: string;
    readonly title: string;
    constructor(destination: string, title: string);
}
declare class LinkInfoImpl implements LinkInfo {
    private readonly marker;
    private readonly openingBracket;
    private readonly text;
    private readonly label;
    private readonly destination;
    private readonly title;
    private readonly afterTextBracket;
    constructor(marker: Text | null, openingBracket: Text | null, text: string | null, label: string | null, destination: string | null, title: string | null, afterTextBracket: Position);
    getMarker(): Text | null;
    getOpeningBracket(): Text | null;
    getText(): string | null;
    getLabel(): string | null;
    getDestination(): string | null;
    getTitle(): string | null;
    getAfterTextBracket(): Position;
}
declare class InlineParserImpl implements InlineParser, InlineParserState, InlineParserFactory {
    private readonly context;
    private readonly inlineContentParserFactories;
    private readonly delimiterProcessors;
    private readonly linkProcessors;
    private readonly specialCharacters;
    private readonly linkMarkers;
    private inlineParsers;
    private scanner;
    private includeSourceSpans;
    private trailingSpaces;
    /**
     * Top delimiter (emphasis, strong emphasis or custom emphasis). (Brackets are on a separate stack, different
     * from the algorithm described in the spec.)
     */
    private lastDelimiter;
    /**
     * Top opening bracket (<code>[</code> or <code>![)</code>).
     */
    private lastBracket;
    constructor(context: InlineParserContext);
    private calculateInlineContentParserFactories;
    private calculateLinkProcessors;
    private static calculateDelimiterProcessors;
    private static addDelimiterProcessors;
    private static addDelimiterProcessorForChar;
    private static calculateLinkMarkers;
    private static calculateSpecialCharacters;
    private createInlineContentParsers;
    getScanner(): Scanner;
    /**
     * Parse content in block into inline children, appending them to the block node.
     */
    parse(lines: SourceLines, block: Node): void;
    protected reset(lines: SourceLines): void;
    private text;
    /**
     * Parse the next inline element in subject, advancing our position.
     * On success, return the new inline node.
     * On failure, return null.
     */
    private parseInline;
    /**
     * Attempt to parse delimiters like emphasis, strong emphasis or custom delimiters.
     */
    private parseDelimiters;
    /**
     * Add open bracket to delimiter stack and add a text node to block's children.
     */
    private parseOpenBracket;
    /**
     * If next character is {@code [}, add a bracket to the stack.
     * Otherwise, return null.
     */
    private parseLinkMarker;
    /**
     * Try to match close bracket against an opening in the delimiter stack. Return either a link or image, or a
     * plain [ character. If there is a matching delimiter, remove it from the delimiter stack.
     */
    private parseCloseBracket;
    private parseLinkOrImage;
    private parseLinkInfo;
    private wrapBracket;
    private replaceBracket;
    private addBracket;
    private removeLastBracket;
    /**
     * Try to parse the destination and an optional title for an inline link/image.
     */
    private static parseInlineDestinationTitle;
    /**
     * Attempt to parse link destination, returning the string or null if no match.
     */
    private static parseLinkDestination;
    /**
     * Attempt to parse link title (sans quotes), returning the string or null if no match.
     */
    private static parseLinkTitle;
    /**
     * Attempt to parse a link label, returning the label between the brackets or null.
     */
    protected static parseLinkLabel(scanner: Scanner): string | null;
    private parseLineBreak;
    /**
     * Parse the next character as plain text, and possibly more if the following characters are non-special.
     */
    private parseText;
    /**
     * Scan a sequence of characters with code delimiterChar, and return information about the number of delimiters
     * and whether they are positioned such that they can open and/or close emphasis or strong emphasis.
     *
     * @return information about delimiter run, or {@code null}
     */
    private scanDelimiters;
    private processDelimiters;
    private removeDelimitersBetween;
    /**
     * Remove the delimiter and the corresponding text node. For used delimiters, e.g. `*` in `*foo*`.
     */
    private removeDelimiterAndNodes;
    /**
     * Remove the delimiter but keep the corresponding node as text. For unused delimiters such as `_` in `foo_bar`.
     */
    private removeDelimiterKeepNode;
    private removeDelimiter;
    private mergeChildTextNodes;
    private mergeTextNodesInclusive;
    private mergeIfNeeded;
    create(inlineParserContext: InlineParserContext): InlineParserImpl;
    static DelimiterData: typeof DelimiterData;
    /**
     * A destination and optional title for a link or image.
     */
    static DestinationTitle: typeof DestinationTitle;
    static LinkInfoImpl: typeof LinkInfoImpl;
}
export default InlineParserImpl;
