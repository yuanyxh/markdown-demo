import type { Block, Node } from '@/node';
import type { Extension } from '@/Extension';
import type { InlineContentParserFactory } from './interfaces/InlineContentParserFactory';
import type { LinkProcessor } from './interfaces/LinkProcessor';
import type { BlockParserFactory } from './interfaces/BlockParserFactory';
import type { DelimiterProcessor } from './interfaces/DelimiterProcessor';
import type { InlineParserFactory } from './interfaces/InlineParserFactory';
import type { PostProcessor } from './interfaces/PostProcessor';
import IncludeSourceSpans from './enums/IncludeSourceSpans';
/**
 * Extension for {@link Parser}.
 */
declare class ParserExtension implements Extension {
    extend(parserBuilder: ParserBuilder): void;
}
declare class ParserBuilder {
    readonly blockParserFactories: BlockParserFactory[];
    readonly inlineContentParserFactories: InlineContentParserFactory[];
    readonly delimiterProcessors: DelimiterProcessor[];
    readonly linkProcessors: LinkProcessor[];
    readonly postProcessors: PostProcessor[];
    readonly linkMarkers: Set<string>;
    enabledBlockTypes: Set<typeof Block>;
    private inlineParserFactory;
    includeSourceSpans: IncludeSourceSpans;
    /**
     * @return the configured {@link Parser}
     */
    build(): Parser;
    /**
     * @param extensions extensions to use on this parser
     * @return {@code this}
     */
    extensions(extensions: Extension[]): ParserBuilder;
    /**
     * Describe the list of markdown features the parser will recognize and parse.
     * <p>
     * By default, CommonMark will recognize and parse the following set of "block" elements:
     * <ul>
     * <li>{@link Heading} ({@code #})
     * <li>{@link HtmlBlock} ({@code <html></html>})
     * <li>{@link ThematicBreak} (Horizontal Rule) ({@code ---})
     * <li>{@link FencedCodeBlock} ({@code ```})
     * <li>{@link IndentedCodeBlock}
     * <li>{@link BlockQuote} ({@code >})
     * <li>{@link ListBlock} (Ordered / Unordered List) ({@code 1. / *})
     * </ul>
     * <p>
     * To parse only a subset of the features listed above, pass a list of each feature's associated {@link Block} class.
     * <p>
     * E.g., to only parse headings and lists:
     * <pre>
     *     {@code
     *     Parser.builder().enabledBlockTypes(Set.of(Heading.class, ListBlock.class));
     *     }
     * </pre>
     *
     * @param enabledBlockTypes A list of block nodes the parser will parse.
     *                          If this list is empty, the parser will not recognize any CommonMark core features.
     * @return {@code this}
     */
    setEnabledBlockTypes(enabledBlockTypes: Set<typeof Block>): ParserBuilder;
    /**
     * Whether to calculate source positions for parsed {@link Node Nodes}, see {@link Node#getSourceSpans()}.
     * <p>
     * By default, source spans are disabled.
     *
     * @param includeSourceSpans which kind of source spans should be included
     * @return {@code this}
     * @since 0.16.0
     */
    setIncludeSourceSpans(includeSourceSpans: IncludeSourceSpans): ParserBuilder;
    /**
     * Add a custom block parser factory.
     * <p>
     * Note that custom factories are applied <em>before</em> the built-in factories. This is so that
     * extensions can change how some syntax is parsed that would otherwise be handled by built-in factories.
     * "With great power comes great responsibility."
     *
     * @param blockParserFactory a block parser factory implementation
     * @return {@code this}
     */
    customBlockParserFactory(blockParserFactory: BlockParserFactory): ParserBuilder;
    /**
     * Add a factory for a custom inline content parser, for extending inline parsing or overriding built-in parsing.
     * <p>
     * Note that parsers are triggered based on a special character as specified by
     * {@link InlineContentParserFactory#getTriggerCharacters()}. It is possible to register multiple parsers for the same
     * character, or even for some built-in special character such as {@code `}. The custom parsers are tried first
     * in order in which they are registered, and then the built-in ones.
     */
    customInlineContentParserFactory(inlineContentParserFactory: InlineContentParserFactory): ParserBuilder;
    /**
     * Add a custom delimiter processor for inline parsing.
     * <p>
     * Note that multiple delimiter processors with the same characters can be added, as long as they have a
     * different minimum length. In that case, the processor with the shortest matching length is used. Adding more
     * than one delimiter processor with the same character and minimum length is invalid.
     * <p>
     * If you want more control over how parsing is done, you might want to use
     * {@link #customInlineContentParserFactory} instead.
     *
     * @param delimiterProcessor a delimiter processor implementation
     * @return {@code this}
     */
    customDelimiterProcessor(delimiterProcessor: DelimiterProcessor): ParserBuilder;
    /**
     * Add a custom link/image processor for inline parsing.
     * <p>
     * Multiple link processors can be added, and will be tried in order in which they were added. If no link
     * processor applies, the normal behavior applies. That means these can override built-in link parsing.
     *
     * @param linkProcessor a link processor implementation
     * @return {@code this}
     */
    linkProcessor(linkProcessor: LinkProcessor): ParserBuilder;
    /**
     * Add a custom link marker for link processing. A link marker is a character like {@code !} which, if it
     * appears before the {@code [} of a link, changes the meaning of the link.
     * <p>
     * If a link marker followed by a valid link is parsed, the {@link LinkInfo}
     * that is passed to {@link LinkProcessor} will have its {@link LinkInfo#marker()} set. A link processor should
     * check the {@link Text#getLiteral()} and then do any processing, and will probably want to use {@link LinkResult#includeMarker()}.
     *
     * @param linkMarker a link marker character
     * @return {@code this}
     */
    linkMarker(linkMarker: string): ParserBuilder;
    postProcessor(postProcessor: PostProcessor): ParserBuilder;
    /**
     * Overrides the parser used for inline markdown processing.
     * <p>
     * Provide an implementation of InlineParserFactory which provides a custom inline parser
     * to modify how the following are parsed:
     * bold (**)
     * italic (*)
     * strikethrough (~~)
     * backtick quote (`)
     * link ([title](http://))
     * image (![alt](http://))
     * <p>
     * Note that if this method is not called or the inline parser factory is set to null, then the default
     * implementation will be used.
     *
     * @param inlineParserFactory an inline parser factory implementation
     * @return {@code this}
     */
    setInlineParserFactory(inlineParserFactory: InlineParserFactory | null): ParserBuilder;
    getInlineParserFactory(): InlineParserFactory;
}
/**
 * Parses input text to a tree of nodes.
 * <p>
 * Start with the {@link #builder} method, configure the parser and build it. Example:
 * <pre><code>
 * Parser parser = Parser.builder().build();
 * Node document = parser.parse("input text");
 * </code></pre>
 */
export declare class Parser {
    private readonly blockParserFactories;
    private readonly inlineContentParserFactories;
    private readonly delimiterProcessors;
    private readonly linkProcessors;
    private readonly linkMarkers;
    private readonly postProcessors;
    private readonly inlineParserFactory;
    private readonly includeSourceSpans;
    constructor(builder: ParserBuilder);
    /**
     * Create a new builder for configuring a {@link Parser}.
     *
     * @return a builder
     */
    static builder(): ParserBuilder;
    /**
     * Parse the specified input text into a tree of nodes.
     * <p>
     * This method is thread-safe (a new parser state is used for each invocation).
     *
     * @param input the text to parse - must not be null
     * @return the root node
     */
    parse(input: string | String): Node;
    /**
     * Parse the specified reader into a tree of nodes. The caller is responsible for closing the reader.
     * <pre><code>
     * Parser parser = Parser.builder().build();
     * try (InputStreamReader reader = new InputStreamReader(new FileInputStream("file.md"), StandardCharsets.UTF_8)) {
     *     Node document = parser.parseReader(reader);
     *     // ...
     * }
     * </code></pre>
     * Note that if you have a file with a byte order mark (BOM), you need to skip it before handing the reader to this
     * library. There's existing classes that do that, e.g. see {@code BOMInputStream} in Commons IO.
     * <p>
     * This method is thread-safe (a new parser state is used for each invocation).
     *
     * @param input the reader to parse - must not be null
     * @return the root node
     * @throws IOException when reading throws an exception
     */
    parseReader(input: File): Promise<Node>;
    private createDocumentParser;
    private postProcess;
    /**
     * Builder for configuring a {@link Parser}.
     */
    static Builder: typeof ParserBuilder;
    static ParserExtension: typeof ParserExtension;
}
export default Parser;
