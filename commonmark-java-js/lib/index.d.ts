/**
 * Abstract visitor that visits all children by default.
 * <p>
 * Can be used to only process certain nodes. If you override a method and want visiting to descend into children,
 * call {@link #visitChildren}.
 */
export declare abstract class AbstractVisitor implements Visitor {
  visit(node: MarkdownNode): void;
  protected visitChildren(parent: MarkdownNode): void;
}

export declare class Appendable {
  private data;
  constructor(initStr?: string);
  append(str: string, start?: number, end?: number): void;
  length(): number;
  toString(): string;
}

/**
 * Extension point for adding/changing attributes on HTML tags for a node.
 */
export declare interface AttributeProvider {
  /**
   * Set the attributes for a HTML tag of the specified node by modifying the provided map.
   * <p>
   * This allows to change or even remove default attributes. With great power comes great responsibility.
   * <p>
   * The attribute key and values will be escaped (preserving character entities), so don't escape them here,
   * otherwise they will be double-escaped.
   * <p>
   * This method may be called multiple times for the same node, if the node is rendered using multiple nested
   * tags (e.g. code blocks).
   *
   * @param node the node to set attributes for
   * @param tagName the HTML tag name that these attributes are for (e.g. {@code h1}, {@code pre}, {@code code}).
   * @param attributes the attributes, with any default attributes already set in the map
   */
  setAttributes(node: MarkdownNode, tagName: string, attributes: Map<string, string>): void;
}

/**
 * The context for attribute providers.
 * <p>Note: There are currently no methods here, this is for future extensibility.</p>
 * <p><em>This interface is not intended to be implemented by clients.</em></p>
 */
export declare interface AttributeProviderContext {}

/**
 * Factory for instantiating new attribute providers when rendering is done.
 */
export declare interface AttributeProviderFactory {
  /**
   * Create a new attribute provider.
   *
   * @param context for this attribute provider
   * @return an AttributeProvider
   */
  create(context: AttributeProviderContext): AttributeProvider;
}

export declare class BitSet {
  private readonly values;
  constructor(values?: boolean[]);
  set(index: number): void;
  get(index: number): boolean;
  clone(): BitSet;
}

/**
 * Block nodes such as paragraphs, list blocks, code blocks etc.
 */
export declare abstract class Block extends MarkdownNode {
  isBlock(): boolean;
  getParent(): Block | null;
  setParent(parent: MarkdownNode): void;
}

/**
 * Result object for continuing parsing of a block, see static methods for constructors.
 */
declare class BlockContinue {
  static none(): BlockContinue | null;
  static atIndex(newIndex: number): BlockContinue;
  static atColumn(newColumn: number): BlockContinue;
  static finished(): BlockContinue;
}

/**
 * Parser for a specific block node.
 * <p>
 * Implementations should subclass {@link AbstractBlockParser} instead of implementing this directly.
 */
declare interface BlockParser {
  /**
   * Return true if the block that is parsed is a container (contains other blocks), or false if it's a leaf.
   */
  isContainer(): boolean;
  /**
   * Return true if the block can have lazy continuation lines.
   * <p>
   * Lazy continuation lines are lines that were rejected by this {@link #tryContinue(ParserState)} but didn't match
   * any other block parsers either.
   * <p>
   * If true is returned here, those lines will get added via {@link #addLine(SourceLine)}. For false, the block is
   * closed instead.
   */
  canHaveLazyContinuationLines(): boolean;
  canContain(childBlock: Block): boolean;
  getBlock(): Block;
  tryContinue(parserState: ParserState): BlockContinue | null;
  /**
   * Add the part of a line that belongs to this block parser to parse (i.e. without any container block markers).
   * Note that the line will only include a {@link SourceLine#getSourceSpan()} if source spans are enabled for inlines.
   */
  addLine(line: SourceLine): void;
  /**
   * Add a source span of the currently parsed block. The default implementation in {@link AbstractBlockParser} adds
   * it to the block. Unless you have some complicated parsing where you need to check source positions, you don't
   * need to override this.
   *
   * @since 0.16.0
   */
  addSourceSpan(sourceSpan: SourceSpan): void;
  /**
   * Return definitions parsed by this parser. The definitions returned here can later be accessed during inline
   * parsing via {@link InlineParserContext#getDefinition}.
   */
  getDefinitions(): DefinitionMap<any>[];
  closeBlock(): void;
  parseInlines(inlineParser: InlineParser): void;
}

/**
 * Parser factory for a block node for determining when a block starts.
 * <p>
 * Implementations should subclass {@link AbstractBlockParserFactory} instead of implementing this directly.
 */
export declare interface BlockParserFactory {
  tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart | null;
}

export declare class BlockQuote extends Block {
  constructor();
  accept(visitor: Visitor): void;
}

/**
 * Result object for starting parsing of a block, see static methods for constructors.
 */
declare abstract class BlockStart {
  static none(): BlockStart | null;
  static of(...blockParsers: BlockParser[]): BlockStart;
  abstract atIndex(newIndex: number): BlockStart;
  abstract atColumn(newColumn: number): BlockStart;
  abstract setReplaceActiveBlockParser(): BlockStart;
}

export declare class BulletList extends ListBlock {
  private marker;
  constructor();
  accept(visitor: Visitor): void;
  /**
   * @return the bullet list marker that was used, e.g. {@code -}, {@code *} or {@code +}, if available, or null otherwise
   */
  getMarker(): string | undefined;
  /**
   * @param marker
   */
  setMarker(marker: string | undefined): void;
}

export declare class Character {
  private static map;
  static isUnicodeCharOfCategory(type: UnicodeCategoryTypes, char: string): boolean;
  static isISOControl(c: string): boolean;
  static isLetter(char: string): boolean;
  static isHighSurrogate(codePoint: number): boolean;
  static isLowSurrogate(codePoint: number): boolean;
  static toCodePoint(char1: number, char2: number): number;
  static readonly UnicodeCategory: {
    readonly Ll: 'Ll';
    readonly Lu: 'Lu';
    readonly Lt: 'Lt';
    readonly Lm: 'Lm';
    readonly Lo: 'Lo';
    readonly Mn: 'Mn';
    readonly Mc: 'Mc';
    readonly Me: 'Me';
    readonly Nd: 'Nd';
    readonly Nl: 'Nl';
    readonly No: 'No';
    readonly Pd: 'Pd';
    readonly Ps: 'Ps';
    readonly Pe: 'Pe';
    readonly Pi: 'Pi';
    readonly Pf: 'Pf';
    readonly Pc: 'Pc';
    readonly Po: 'Po';
    readonly Sm: 'Sm';
    readonly Sc: 'Sc';
    readonly Sk: 'Sk';
    readonly So: 'So';
    readonly Zs: 'Zs';
    readonly Zl: 'Zl';
    readonly Zp: 'Zp';
    readonly Cc: 'Cc';
    readonly Cf: 'Cf';
    readonly Co: 'Co';
    readonly Cs: 'Cs';
    readonly Cn: 'Cn';
    readonly L: 'L';
    readonly P: 'P';
    readonly S: 'S';
  };
}

/**
 * Matcher interface for {@code char} values.
 * <p>
 * Note that because this matches on {@code char} values only (as opposed to {@code int} code points),
 * this only operates on the level of code units and doesn't support supplementary characters
 * (see {@link Character#isSupplementaryCodePoint(int)}).
 */
declare interface CharMatcher {
  matches(c: string): boolean;
}

export declare class Code extends MarkdownNode {
  private literal;
  constructor(literal?: string);
  accept(visitor: Visitor): void;
  getLiteral(): string;
  setLiteral(literal: string): void;
}

export declare abstract class CustomBlock extends Block {
  accept(visitor: Visitor): void;
}

export declare abstract class CustomNode extends MarkdownNode {
  accept(visitor: Visitor): void;
}

/**
 * A map that can be used to store and look up reference definitions by a label. The labels are case-insensitive and
 * normalized, the same way as for {@link LinkReferenceDefinition} nodes.
 *
 * @param <D> the type of value
 */
declare class DefinitionMap<D extends abstract new (...args: any) => any> {
  private readonly type;
  private readonly definitions;
  constructor(type: D);
  getType(): D;
  addAll(that: DefinitionMap<InstanceType<D>>): void;
  /**
   * Store a new definition unless one is already in the map. If there is no definition for that label yet, return null.
   * Otherwise, return the existing definition.
   * <p>
   * The label is normalized by the definition map before storing.
   */
  putIfAbsent(label: string, definition: InstanceType<D>): InstanceType<D>;
  /**
   * Look up a definition by label. The label is normalized by the definition map before lookup.
   *
   * @return the value or null
   */
  get(label: string): InstanceType<D> | undefined;
  keySet(): string[];
  values(): InstanceType<D>[];
}

/**
 * A node that uses delimiters in the source form (e.g. <code>*bold*</code>).
 */
export declare interface Delimited {
  /**
   * @return the opening (beginning) delimiter, e.g. <code>*</code>
   */
  getOpeningDelimiter(): string | undefined;
  /**
   * @return the closing (ending) delimiter, e.g. <code>*</code>
   */
  getClosingDelimiter(): string | undefined;
}

/**
 * Custom delimiter processor for additional delimiters besides {@code _} and {@code *}.
 * <p>
 * Note that implementations of this need to be thread-safe, the same instance may be used by multiple parsers.
 *
 * @see parser.beta.InlineContentParserFactory
 */
export declare interface DelimiterProcessor {
  /**
   * @return the character that marks the beginning of a delimited node, must not clash with any built-in special
   * characters
   */
  getOpeningCharacter(): string;
  /**
   * @return the character that marks the the ending of a delimited node, must not clash with any built-in special
   * characters. Note that for a symmetric delimiter such as "*", this is the same as the opening.
   */
  getClosingCharacter(): string;
  /**
   * Minimum number of delimiter characters that are needed to activate this. Must be at least 1.
   */
  getMinLength(): number;
  /**
   * Process the delimiter runs.
   * <p>
   * The processor can examine the runs and the nodes and decide if it wants to process or not. If not, it should not
   * change any nodes and return 0. If yes, it should do the processing (wrapping nodes, etc) and then return how many
   * delimiters were used.
   * <p>
   * Note that removal (unlinking) of the used delimiter {@link Text} nodes is done by the caller.
   *
   * @param openingRun the opening delimiter run
   * @param closingRun the closing delimiter run
   * @return how many delimiters were used; must not be greater than length of either opener or closer
   */
  process(openingRun: DelimiterRun, closingRun: DelimiterRun): number;
}

/**
 * A delimiter run is one or more of the same delimiter character, e.g. {@code ***}.
 */
declare interface DelimiterRun {
  /**
   * @return whether this can open a delimiter
   */
  getCanOpen(): boolean;
  /**
   * @return whether this can close a delimiter
   */
  getCanClose(): boolean;
  /**
   * @return the number of characters in this delimiter run (that are left for processing)
   */
  length(): number;
  /**
   * @return the number of characters originally in this delimiter run; at the start of processing, this is the same
   * as {{@link #length()}}
   */
  getOriginalLength(): number;
  /**
   * @return the innermost opening delimiter, e.g. for {@code ***} this is the last {@code *}
   */
  getOpener(): Text_2;
  /**
   * @return the innermost closing delimiter, e.g. for {@code ***} this is the first {@code *}
   */
  getCloser(): Text_2;
  /**
   * Get the opening delimiter nodes for the specified length of delimiters. Length must be between 1 and
   * {@link #length()}.
   * <p>
   * For example, for a delimiter run {@code ***}, calling this with 1 would return the last {@code *}.
   * Calling it with 2 would return the second last {@code *} and the last {@code *}.
   */
  getOpeners(length: number): Text_2[];
  /**
   * Get the closing delimiter nodes for the specified length of delimiters. Length must be between 1 and
   * {@link #length()}.
   * <p>
   * For example, for a delimiter run {@code ***}, calling this with 1 would return the first {@code *}.
   * Calling it with 2 would return the first {@code *} and the second {@code *}.
   */
  getClosers(length: number): Text_2[];
}

declare class Document_2 extends Block {
  constructor();
  accept(visitor: Visitor): void;
}
export { Document_2 as Document };

export declare class Emphasis extends MarkdownNode implements Delimited {
  private delimiter;
  constructor(delimiter?: string);
  accept(visitor: Visitor): void;
  setDelimiter(delimiter: string): void;
  getOpeningDelimiter(): string | undefined;
  getClosingDelimiter(): string | undefined;
}

export declare class Escaping {
  static readonly ESCAPABLE: string;
  static readonly ENTITY: string;
  private static readonly BACKSLASH_OR_AMP;
  private static readonly ENTITY_OR_ESCAPED_CHAR;
  private static readonly ESCAPE_IN_URI;
  private static readonly HEX_DIGITS;
  private static readonly WHITESPACE;
  private static readonly UNESCAPE_REPLACER;
  private static readonly URI_REPLACER;
  static getBytes(input: string): number[];
  static escapeHtml(input: string): string;
  /**
   * Replace entities and backslash escapes with literal characters.
   */
  static unescapeString(s: string): string;
  static percentEncodeUrl(s: string): string;
  static normalizeLabelContent(input: string): string;
  private static replaceAll;
}

/**
 * Base interface for a parser/renderer extension.
 * <p>
 * Doesn't have any methods itself, but has specific sub interfaces to
 * configure parser/renderer. This base interface is for convenience, so that a list of extensions can be built and then
 * used for configuring both the parser and renderer in the same way.
 */
export declare interface Extension {}

export declare class FencedCodeBlock extends Block {
  private fenceCharacter;
  private openingFenceLength;
  private closingFenceLength;
  private fenceIndent;
  private info;
  private literal;
  constructor();
  accept(visitor: Visitor): void;
  /**
   * @return the fence character that was used, e.g. {@code `} or {@code ~}, if available, or null otherwise
   */
  getFenceCharacter(): string | undefined;
  /**
   * @param fenceCharacter
   */
  setFenceCharacter(fenceCharacter: string): void;
  /**
   * @return the length of the opening fence (how many of {{@link #getFenceCharacter()}} were used to start the code
   * block) if available, or null otherwise
   */
  getOpeningFenceLength(): number | undefined;
  /**
   * @param openingFenceLength
   */
  setOpeningFenceLength(openingFenceLength: number | undefined): void;
  /**
   * @return the length of the closing fence (how many of {@link #getFenceCharacter()} were used to end the code
   * block) if available, or null otherwise
   */
  getClosingFenceLength(): number | undefined;
  setClosingFenceLength(closingFenceLength: number | undefined): void;
  getFenceIndent(): number | undefined;
  setFenceIndent(fenceIndent: number): void;
  /**
   * @see <a href="http://spec.commonmark.org/0.31.2/#info-string">CommonMark spec</a>
   */
  getInfo(): string | undefined;
  setInfo(info: string): void;
  getLiteral(): string | undefined;
  setLiteral(literal: string): void;
  private static checkFenceLengths;
}

export declare function fromCodePoint(...codes: number[]): string;

export declare class HardLineBreak extends MarkdownNode {
  constructor();
  accept(visitor: Visitor): void;
}

export declare class Heading extends Block {
  private level;
  constructor();
  accept(visitor: Visitor): void;
  getLevel(): number;
  setLevel(level: number): void;
}

/**
 * HTML block
 *
 * @see <a href="http://spec.commonmark.org/0.31.2/#html-blocks">CommonMark Spec</a>
 */
export declare class HtmlBlock extends Block {
  private literal;
  constructor();
  accept(visitor: Visitor): void;
  getLiteral(): string;
  setLiteral(literal: string): void;
}

/**
 * Inline HTML element.
 *
 * @see <a href="http://spec.commonmark.org/0.31.2/#raw-html">CommonMark Spec</a>
 */
export declare class HtmlInline extends MarkdownNode {
  private literal;
  constructor();
  accept(visitor: Visitor): void;
  getLiteral(): string;
  setLiteral(literal: string): void;
}

declare interface HtmlNodeRendererContext {
  /**
   * @param url to be encoded
   * @return an encoded URL (depending on the configuration)
   */
  encodeUrl(url: string): string;
  /**
   * Let extensions modify the HTML tag attributes.
   *
   * @param node       the node for which the attributes are applied
   * @param tagName    the HTML tag name that these attributes are for (e.g. {@code h1}, {@code pre}, {@code code}).
   * @param attributes the attributes that were calculated by the renderer
   * @return the extended attributes with added/updated/removed entries
   */
  extendAttributes(
    node: MarkdownNode,
    tagName: string,
    attributes: Map<string, string>
  ): Map<string, string>;
  /**
   * @return the HTML writer to use
   */
  getWriter(): HtmlWriter;
  /**
   * @return HTML that should be rendered for a soft line break
   */
  getSoftbreak(): string;
  /**
   * Render the specified node and its children using the configured renderers. This should be used to render child
   * nodes; be careful not to pass the node that is being rendered, that would result in an endless loop.
   *
   * @param node the node to render
   */
  render(node: MarkdownNode): void;
  /**
   * @return whether HTML blocks and tags should be escaped or not
   */
  shouldEscapeHtml(): boolean;
  /**
   * @return whether documents that only contain a single paragraph should be rendered without the {@code <p>} tag
   */
  shouldOmitSingleParagraphP(): boolean;
  /**
   * @return true if the {@link UrlSanitizer} should be used.
   * @since 0.14.0
   */
  shouldSanitizeUrls(): boolean;
  /**
   * @return Sanitizer to use for securing {@link Link} href and {@link Image} src if {@link #shouldSanitizeUrls()} is true.
   * @since 0.14.0
   */
  urlSanitizer(): UrlSanitizer;
}

/**
 * Factory for instantiating new node renderers when rendering is done.
 */
export declare interface HtmlNodeRendererFactory {
  /**
   * Create a new node renderer for the specified rendering context.
   *
   * @param context the context for rendering (normally passed on to the node renderer)
   * @return a node renderer
   */
  create(context: HtmlNodeRendererContext): NodeRenderer;
}

/**
 * Renders a tree of nodes to HTML.
 * <p>
 * Start with the {@link #builder} method to configure the renderer. Example:
 * <pre><code>
 * HtmlRenderer renderer = HtmlRenderer.builder().escapeHtml(true).build();
 * renderer.render(node);
 * </code></pre>
 */
export declare class HtmlRenderer implements Renderer {
  readonly softbreak: string;
  readonly escapeHtml: boolean;
  readonly percentEncodeUrls: boolean;
  readonly omitSingleParagraphP: boolean;
  readonly sanitizeUrls: boolean;
  readonly urlSanitizer: UrlSanitizer;
  readonly attributeProviderFactories: AttributeProviderFactory[];
  readonly nodeRendererFactories: HtmlNodeRendererFactory[];
  constructor(builder: HtmlRendererBuilder);
  /**
   * Create a new builder for configuring an {@link HtmlRenderer}.
   *
   * @return a builder
   */
  static builder(): HtmlRendererBuilder;
  render(node: MarkdownNode, output?: Appendable): string;
  /**
   * Builder for configuring an {@link HtmlRenderer}. See methods for default configuration.
   */
  static Builder: typeof HtmlRendererBuilder;
  static HtmlRendererExtension: typeof HtmlRendererExtension;
}

declare class HtmlRendererBuilder {
  softbreak: string;
  escapeHtml: boolean;
  sanitizeUrls: boolean;
  urlSanitizer: UrlSanitizer;
  percentEncodeUrls: boolean;
  omitSingleParagraphP: boolean;
  attributeProviderFactories: AttributeProviderFactory[];
  nodeRendererFactories: HtmlNodeRendererFactory[];
  /**
   * @return the configured {@link HtmlRenderer}
   */
  build(): HtmlRenderer;
  /**
   * The HTML to use for rendering a softbreak, defaults to {@code "\n"} (meaning the rendered result doesn't have
   * a line break).
   * <p>
   * Set it to {@code "<br>"} (or {@code "<br />"} to make them hard breaks.
   * <p>
   * Set it to {@code " "} to ignore line wrapping in the source.
   *
   * @param softbreak HTML for softbreak
   * @return {@code this}
   */
  setSoftbreak(softbreak: string): HtmlRendererBuilder;
  /**
   * Whether {@link HtmlInline} and {@link HtmlBlock} should be escaped, defaults to {@code false}.
   * <p>
   * Note that {@link HtmlInline} is only a tag itself, not the text between an opening tag and a closing tag. So
   * markup in the text will be parsed as normal and is not affected by this option.
   *
   * @param escapeHtml true for escaping, false for preserving raw HTML
   * @return {@code this}
   */
  setEscapeHtml(escapeHtml: boolean): HtmlRendererBuilder;
  /**
   * Whether {@link Image} src and {@link Link} href should be sanitized, defaults to {@code false}.
   *
   * @param sanitizeUrls true for sanitization, false for preserving raw attribute
   * @return {@code this}
   * @since 0.14.0
   */
  setSanitizeUrls(sanitizeUrls: boolean): HtmlRendererBuilder;
  /**
   * {@link UrlSanitizer} used to filter URL's if {@link #sanitizeUrls} is true.
   *
   * @param urlSanitizer Filterer used to filter {@link Image} src and {@link Link}.
   * @return {@code this}
   * @since 0.14.0
   */
  setUrlSanitizer(urlSanitizer: UrlSanitizer): HtmlRendererBuilder;
  /**
   * Whether URLs of link or images should be percent-encoded, defaults to {@code false}.
   * <p>
   * If enabled, the following is done:
   * <ul>
   * <li>Existing percent-encoded parts are preserved (e.g. "%20" is kept as "%20")</li>
   * <li>Reserved characters such as "/" are preserved, except for "[" and "]" (see encodeURI in JS)</li>
   * <li>Unreserved characters such as "a" are preserved</li>
   * <li>Other characters such umlauts are percent-encoded</li>
   * </ul>
   *
   * @param percentEncodeUrls true to percent-encode, false for leaving as-is
   * @return {@code this}
   */
  setPercentEncodeUrls(percentEncodeUrls: boolean): HtmlRendererBuilder;
  /**
   * Whether documents that only contain a single paragraph should be rendered without the {@code <p>} tag. Set to
   * {@code true} to render without the tag; the default of {@code false} always renders the tag.
   *
   * @return {@code this}
   */
  setOmitSingleParagraphP(omitSingleParagraphP: boolean): HtmlRendererBuilder;
  /**
   * Add a factory for an attribute provider for adding/changing HTML attributes to the rendered tags.
   *
   * @param attributeProviderFactory the attribute provider factory to add
   * @return {@code this}
   */
  attributeProviderFactory(attributeProviderFactory: AttributeProviderFactory): HtmlRendererBuilder;
  /**
   * Add a factory for instantiating a node renderer (done when rendering). This allows to override the rendering
   * of node types or define rendering for custom node types.
   * <p>
   * If multiple node renderers for the same node type are created, the one from the factory that was added first
   * "wins". (This is how the rendering for core node types can be overridden; the default rendering comes last.)
   *
   * @param nodeRendererFactory the factory for creating a node renderer
   * @return {@code this}
   */
  nodeRendererFactory(nodeRendererFactory: HtmlNodeRendererFactory): HtmlRendererBuilder;
  /**
   * @param extensions extensions to use on this HTML renderer
   * @return {@code this}
   */
  extensions(extensions: Extension[]): HtmlRendererBuilder;
}

/**
 * Extension for {@link HtmlRenderer}.
 */
declare class HtmlRendererExtension implements Extension {
  extend(rendererBuilder: HtmlRendererBuilder): void;
}

declare class HtmlWriter {
  private static readonly NO_ATTRIBUTES;
  private readonly buffer;
  private lastChar;
  constructor(out: Appendable);
  raw(s: string): void;
  text(text: string): void;
  tag(name: string, attrs?: Map<string, string>, voidElement?: boolean): void;
  line(): void;
  protected append(s: string): void;
}

declare class Image_2 extends MarkdownNode {
  private destination;
  private title;
  constructor(destination: string | undefined, title: string | undefined);
  accept(visitor: Visitor): void;
  getDestination(): string;
  setDestination(destination: string): void;
  getTitle(): string | undefined;
  setTitle(title: string): void;
  protected toStringAttributes(): string;
}
export { Image_2 as Image };

export declare enum IncludeSourceSpans {
  /**
   * Do not include source spans.
   */
  NONE = 'NONE',
  /**
   * Include source spans on {@link Block} nodes.
   */
  BLOCKS = 'BLOCKS',
  /**
   * Include source spans on block nodes and inline nodes.
   */
  BLOCKS_AND_INLINES = 'BLOCKS_AND_INLINES'
}

export declare class IndentedCodeBlock extends Block {
  private literal;
  constructor();
  accept(visitor: Visitor): void;
  getLiteral(): string;
  setLiteral(literal: string): void;
}

/**
 * Parser for a type of inline content. Registered via a {@link InlineContentParserFactory} and created by its
 * {@link InlineContentParserFactory#create() create} method. The lifetime of this is tied to each inline content
 * snippet that is parsed, as a new instance is created for each.
 */
declare interface InlineContentParser {
  /**
   * Try to parse inline content starting from the current position. Note that the character at the current position
   * is one of {@link InlineContentParserFactory#getTriggerCharacters()} of the factory that created this parser.
   * <p>
   * For a given inline content snippet that is being parsed, this method can be called multiple times: each time a
   * trigger character is encountered.
   *
   * @param inlineParserState the current state of the inline parser
   * @return the result of parsing; can indicate that this parser is not interested, or that parsing was successful
   */
  tryParse(inlineParserState: InlineParserState): ParsedInline | null;
}

/**
 * A factory for extending inline content parsing.
 * <p>
 * See {@link parser.Parser.Builder#customInlineContentParserFactory} for how to register it.
 */
export declare interface InlineContentParserFactory {
  /**
   * An inline content parser needs to have a special "trigger" character which activates it. When this character is
   * encountered during inline parsing, {@link InlineContentParser#tryParse} is called with the current parser state.
   * It can also register for more than one trigger character.
   */
  getTriggerCharacters(): Set<string>;
  /**
   * Create an {@link InlineContentParser} that will do the parsing. Create is called once per text snippet of inline
   * content inside block structures, and then called each time a trigger character is encountered.
   */
  create(): InlineContentParser;
}

/**
 * Parser for inline content (text, links, emphasized text, etc).
 */
declare interface InlineParser extends InlineParserFactory {
  /**
   * @param lines the source content to parse as inline
   * @param node the node to append resulting nodes to (as children)
   */
  parse(lines: SourceLines, node: MarkdownNode): void;
}

/**
 * Context for inline parsing.
 */
export declare interface InlineParserContext {
  /**
   * @return custom inline content parsers that have been configured with
   * {@link Parser.Builder#customInlineContentParserFactory(InlineContentParserFactory)}
   */
  getCustomInlineContentParserFactories(): InlineContentParserFactory[];
  /**
   * @return custom delimiter processors that have been configured with
   * {@link Parser.Builder#customDelimiterProcessor(DelimiterProcessor)}
   */
  getCustomDelimiterProcessors(): DelimiterProcessor[];
  /**
   * @return custom link processors that have been configured with {@link Parser.Builder#linkProcessor}.
   */
  getCustomLinkProcessors(): LinkProcessor[];
  /**
   * @return custom link markers that have been configured with {@link Parser.Builder#linkMarker}.
   */
  getCustomLinkMarkers(): Set<string>;
  /**
   * Look up a {@link LinkReferenceDefinition} for a given label.
   * <p>
   * Note that the passed in label does not need to be normalized; implementations are responsible for doing the
   * normalization before lookup.
   *
   * @param label the link label to look up
   * @return the definition if one exists, {@code null} otherwise
   * @deprecated use {@link #getDefinition} with {@link LinkReferenceDefinition} instead
   */
  getLinkReferenceDefinition(label: string): LinkReferenceDefinition | null;
  /**
   * Look up a definition of a type for a given label.
   * <p>
   * Note that the passed in label does not need to be normalized; implementations are responsible for doing the normalization before lookup.
   *
   * @return the definition if one exists, null otherwise
   */
  getDefinition<D extends abstract new (...args: any) => any>(
    type: D,
    label: string
  ): InstanceType<D> | null;
}

/**
 * Factory for custom inline parser.
 */
declare interface InlineParserFactory {
  /**
   * Create an {@link InlineParser} to use for parsing inlines. This is called once per parsed document.
   */
  create(inlineParserContext: InlineParserContext): InlineParser;
}

declare interface InlineParserState {
  /**
   * Return a scanner for the input for the current position (on the trigger character that the inline parser was added for).
   * <p>
   * Note that this always returns the same instance, if you want to backtrack you need to use
   * {@link Scanner#position()} and {@link Scanner#setPosition(Position)}.
   */
  getScanner(): Scanner;
}

export declare function isNotUnDef<T>(data: T | undefined): data is T;

export declare function isUnDef(data: any): data is undefined;

declare enum LineBreakRendering {
  /**
   * Strip all line breaks within blocks and between blocks, resulting in all the text in a single line.
   */
  STRIP = 'STRIP',
  /**
   * Use single line breaks between blocks, not a blank line (also render all lists as tight).
   */
  COMPACT = 'COMPACT',
  /**
   * Separate blocks by a blank line (and respect tight vs loose lists).
   */
  SEPARATE_BLOCKS = 'SEPARATE_BLOCKS'
}

/**
 * A link with a destination and an optional title; the link text is in child nodes.
 * <p>
 * Example for an inline link in a CommonMark document:
 * <pre><code>
 * [link](/uri "title")
 * </code></pre>
 * <p>
 * The corresponding Link node would look like this:
 * <ul>
 * <li>{@link #getDestination()} returns {@code "/uri"}
 * <li>{@link #getTitle()} returns {@code "title"}
 * <li>A {@link Text} child node with {@link Text#getLiteral() getLiteral} that returns {@code "link"}</li>
 * </ul>
 * <p>
 * Note that the text in the link can contain inline formatting, so it could also contain an {@link Image} or
 * {@link Emphasis}, etc.
 *
 * @see <a href="http://spec.commonmark.org/0.31.2/#links">CommonMark Spec for links</a>
 */
export declare class Link extends MarkdownNode {
  private destination;
  private title;
  constructor(destination?: string, title?: string);
  accept(visitor: Visitor): void;
  getDestination(): string;
  setDestination(destination: string): void;
  getTitle(): string | undefined;
  setTitle(title: string | undefined): void;
  protected toStringAttributes(): string;
}

/**
 * A parsed link/image. There are different types of links.
 * <p>
 * Inline links:
 * <pre>
 * [text](destination)
 * [text](destination "title")
 * </pre>
 * <p>
 * Reference links, which have different subtypes. Full::
 * <pre>
 * [text][label]
 * </pre>
 * Collapsed (label is ""):
 * <pre>
 * [text][]
 * </pre>
 * Shortcut (label is null):
 * <pre>
 * [text]
 * </pre>
 * Images use the same syntax as links but with a {@code !} {@link #marker()} front, e.g. {@code ![text](destination)}.
 */
export declare interface LinkInfo {
  /**
   * The marker if present, or null. A marker is e.g. {@code !} for an image, or a custom marker as specified in
   * {@link Parser.Builder#linkMarker}.
   */
  getMarker(): Text_2 | null;
  /**
   * The text node of the opening bracket {@code [}.
   */
  getOpeningBracket(): Text_2 | null;
  /**
   * The text between the first brackets, e.g. `foo` in `[foo][bar]`.
   */
  getText(): string | null;
  /**
   * The label, or null for inline links or for shortcut links (in which case {@link #text()} should be used as the label).
   */
  getLabel(): string | null;
  /**
   * The destination if available, e.g. in `[foo](destination)`, or null
   */
  getDestination(): string | null;
  /**
   * The title if available, e.g. in `[foo](destination "title")`, or null
   */
  getTitle(): string | null;
  /**
   * The position after the closing text bracket, e.g.:
   * <pre>
   * [foo][bar]
   *      ^
   * </pre>
   */
  getAfterTextBracket(): Position;
}

/**
 * An interface to decide how links/images are handled.
 * <p>
 * Implementations need to be registered with a parser via {@link Parser.Builder#linkProcessor}.
 * Then, when inline parsing is run, each parsed link/image is passed to the processor. This includes links like these:
 * <p>
 * <pre><code>
 * [text](destination)
 * [text]
 * [text][]
 * [text][label]
 * </code></pre>
 * And images:
 * <pre><code>
 * ![text](destination)
 * ![text]
 * ![text][]
 * ![text][label]
 * </code></pre>
 * See {@link LinkInfo} for accessing various parts of the parsed link/image.
 * <p>
 * The processor can then inspect the link/image and decide what to do with it by returning the appropriate
 * {@link LinkResult}. If it returns {@link LinkResult#none()}, the next registered processor is tried. If none of them
 * apply, the link is handled as it normally would.
 */
export declare interface LinkProcessor {
  /**
   * @param linkInfo information about the parsed link/image
   * @param scanner  the scanner at the current position after the parsed link/image
   * @param context  context for inline parsing
   * @return what to do with the link/image, e.g. do nothing (try the next processor), wrap the text in a node, or
   * replace the link/image with a node
   */
  process(linkInfo: LinkInfo, scanner: Scanner, context: InlineParserContext): LinkResult | null;
}

/**
 * A link reference definition, e.g.:
 * <pre><code>
 * [foo]: /url "title"
 * </code></pre>
 * <p>
 * They can be referenced anywhere else in the document to produce a link using <code>[foo]</code>. The definitions
 * themselves are usually not rendered in the final output.
 *
 * @see <a href="https://spec.commonmark.org/0.31.2/#link-reference-definition">Link reference definitions</a>
 */
export declare class LinkReferenceDefinition extends Block {
  private label;
  private destination;
  private title;
  constructor(label?: string, destination?: string, title?: string);
  accept(visitor: Visitor): void;
  getLabel(): string | null;
  setLabel(label: string): void;
  getDestination(): string;
  setDestination(destination: string): void;
  getTitle(): string;
  setTitle(title: string): void;
}

/**
 * What to do with a link/image processed by {@link LinkProcessor}.
 */
export declare abstract class LinkResult {
  /**
   * Link not handled by processor.
   */
  static none(): LinkResult | null;
  /**
   * Wrap the link text in a node. This is the normal behavior for links, e.g. for this:
   * <pre><code>
   * [my *text*](destination)
   * </code></pre>
   * The text is {@code my *text*}, a text node and emphasis. The text is wrapped in a
   * {@link Link} node, which means the text is added as child nodes to it.
   *
   * @param node     the node to which the link text nodes will be added as child nodes
   * @param position the position to continue parsing from
   */
  static wrapTextIn(node: MarkdownNode, position: Position): LinkResult;
  /**
   * Replace the link with a node. E.g. for this:
   * <pre><code>
   * [^foo]
   * </code></pre>
   * The processor could decide to create a {@code FootnoteReference} node instead which replaces the link.
   *
   * @param node     the node to replace the link with
   * @param position the position to continue parsing from
   */
  static replaceWith(node: MarkdownNode, position: Position): LinkResult;
  /**
   * If a {@link LinkInfo#marker()} is present, include it in processing (i.e. treat it the same way as the brackets).
   */
  abstract setIncludeMarker(): LinkResult;
}

export declare abstract class ListBlock extends Block {
  private tight;
  /**
   * @return whether this list is tight or loose
   * @see <a href="https://spec.commonmark.org/0.31.2/#tight">CommonMark Spec for tight lists</a>
   */
  isTight(): boolean;
  setTight(tight: boolean): void;
}

export declare class ListItem extends Block {
  private markerIndent;
  private contentIndent;
  constructor();
  accept(visitor: Visitor): void;
  /**
   * Returns the indent of the marker such as "-" or "1." in columns (spaces or tab stop of 4) if available, or null
   * otherwise.
   * <p>
   * Some examples and their marker indent:
   * <pre>- Foo</pre>
   * Marker indent: 0
   * <pre> - Foo</pre>
   * Marker indent: 1
   * <pre>  1. Foo</pre>
   * Marker indent: 2
   */
  getMarkerIndent(): number | undefined;
  setMarkerIndent(markerIndent: number): void;
  /**
   * Returns the indent of the content in columns (spaces or tab stop of 4) if available, or null otherwise.
   * The content indent is counted from the beginning of the line and includes the marker on the first line.
   * <p>
   * Some examples and their content indent:
   * <pre>- Foo</pre>
   * Content indent: 2
   * <pre> - Foo</pre>
   * Content indent: 3
   * <pre>  1. Foo</pre>
   * Content indent: 5
   * <p>
   * Note that subsequent lines in the same list item need to be indented by at least the content indent to be counted
   * as part of the list item.
   */
  getContentIndent(): number | undefined;
  setContentIndent(contentIndent: number): void;
}

/**
 * The base class of all CommonMark AST nodes ({@link Block} and inlines).
 * <p>
 * A node can have multiple children, and a parent (except for the root node).
 */
export declare abstract class MarkdownNode {
  private innerType;
  private innerMeta;
  private innerChildren;
  private innerInputIndex;
  private innerInputEndInput;
  private parent;
  private firstChild;
  private lastChild;
  private prev;
  private next;
  private sourceSpans;
  constructor(type: string);
  get meta(): Record<string, any>;
  set meta(meta: Record<string, any>);
  get type(): string;
  get inputIndex(): number;
  get inputEndIndex(): number;
  get children(): MarkdownNode[];
  abstract accept(visitor: Visitor): void;
  isBlock(): boolean;
  getNext(): MarkdownNode | null;
  getPrevious(): MarkdownNode | null;
  getFirstChild(): MarkdownNode | null;
  getLastChild(): MarkdownNode | null;
  getParent(): MarkdownNode | null;
  setParent(parent: MarkdownNode): void;
  appendChild(child: MarkdownNode): void;
  prependChild(child: MarkdownNode): void;
  unlink(): void;
  /**
   * Inserts the {@code sibling} node after {@code this} node.
   */
  insertAfter(sibling: MarkdownNode): void;
  /**
   * Inserts the {@code sibling} node before {@code this} node.
   */
  insertBefore(sibling: MarkdownNode): void;
  /**
   * @return the source spans of this node if included by the parser, an empty list otherwise
   * @since 0.16.0
   */
  getSourceSpans(): SourceSpan[];
  /**
   * Replace the current source spans with the provided list.
   *
   * @param sourceSpans the new source spans to set
   * @since 0.16.0
   */
  setSourceSpans(sourceSpans: SourceSpan[]): void;
  /**
   * Add a source span to the end of the list.
   *
   * @param sourceSpan the source span to add
   * @since 0.16.0
   */
  addSourceSpan(sourceSpan: SourceSpan): void;
}

declare class MarkdownNodeIterable implements Iterable<MarkdownNode> {
  private readonly first;
  private readonly end;
  constructor(first: MarkdownNode, end: MarkdownNode);
  [Symbol.iterator](): Iterator<MarkdownNode, any, any>;
  iterator(): Iterator<MarkdownNode>;
}

declare class MarkdownNodeIterator implements Iterator<MarkdownNode> {
  private node;
  private readonly end;
  constructor(first: MarkdownNode, end: MarkdownNode);
  next(): IteratorResult<MarkdownNode>;
}

declare class MarkdownNodeRendererBuilder {
  readonly nodeRendererFactories: MarkdownNodeRendererFactory[];
  /**
   * @return the configured {@link MarkdownRenderer}
   */
  build(): MarkdownRenderer;
  /**
   * Add a factory for instantiating a node renderer (done when rendering). This allows to override the rendering
   * of node types or define rendering for custom node types.
   * <p>
   * If multiple node renderers for the same node type are created, the one from the factory that was added first
   * "wins". (This is how the rendering for core node types can be overridden; the default rendering comes last.)
   *
   * @param nodeRendererFactory the factory for creating a node renderer
   * @return {@code this}
   */
  nodeRendererFactory(
    nodeRendererFactory: MarkdownNodeRendererFactory
  ): MarkdownNodeRendererBuilder;
  /**
   * @param extensions extensions to use on this renderer
   * @return {@code this}
   */
  extensions(extensions: Extension[]): MarkdownNodeRendererBuilder;
}

/**
 * Context that is passed to custom node renderers, see {@link MarkdownNodeRendererFactory#create}.
 */
declare interface MarkdownNodeRendererContext {
  /**
   * @return the writer to use
   */
  getWriter(): MarkdownWriter;
  /**
   * Render the specified node and its children using the configured renderers. This should be used to render child
   * nodes; be careful not to pass the node that is being rendered, that would result in an endless loop.
   *
   * @param node the node to render
   */
  render(node: MarkdownNode): void;
  /**
   * @return additional special characters that need to be escaped if they occur in normal text; currently only ASCII
   * characters are allowed
   */
  getSpecialCharacters(): Set<string>;
}

/**
 * Factory for instantiating new node renderers for rendering custom nodes.
 */
export declare interface MarkdownNodeRendererFactory {
  /**
   * Create a new node renderer for the specified rendering context.
   *
   * @param context the context for rendering (normally passed on to the node renderer)
   * @return a node renderer
   */
  create(context: MarkdownNodeRendererContext): NodeRenderer;
  /**
   * @return the additional special characters that this factory would like to have escaped in normal text; currently
   * only ASCII characters are allowed
   */
  getSpecialCharacters(): Set<string>;
}

/**
 * Renders nodes to Markdown (CommonMark syntax); use {@link #builder()} to create a renderer.
 * <p>
 * Note that it doesn't currently preserve the exact syntax of the original input Markdown (if any):
 * <ul>
 *     <li>Headings are output as ATX headings if possible (multi-line headings need Setext headings)</li>
 *     <li>Links are always rendered as inline links (no support for reference links yet)</li>
 *     <li>Escaping might be over-eager, e.g. a plain {@code *} might be escaped
 *     even though it doesn't need to be in that particular context</li>
 *     <li>Leading whitespace in paragraphs is not preserved</li>
 * </ul>
 * However, it should produce Markdown that is semantically equivalent to the input, i.e. if the Markdown was parsed
 * again and compared against the original AST, it should be the same (minus bugs).
 */
export declare class MarkdownRenderer implements Renderer {
  readonly nodeRendererFactories: MarkdownNodeRendererFactory[];
  constructor(builder: MarkdownNodeRendererBuilder);
  /**
   * Create a new builder for configuring a {@link MarkdownRenderer}.
   *
   * @return a builder
   */
  static builder(): MarkdownNodeRendererBuilder;
  render(node: MarkdownNode, output?: Appendable): string;
  /**
   * Builder for configuring a {@link MarkdownRenderer}. See methods for default configuration.
   */
  static Builder: typeof MarkdownNodeRendererBuilder;
  static MarkdownRendererExtension: typeof MarkdownRendererExtension;
}

declare class MarkdownRendererExtension implements Extension {
  /**
   * Extend Markdown rendering, usually by registering custom node renderers using {@link Builder#nodeRendererFactory}.
   *
   * @param rendererBuilder the renderer builder to extend
   */
  extend(rendererBuilder: MarkdownNodeRendererBuilder): void;
}

/**
 * Writer for Markdown (CommonMark) text.
 */
declare class MarkdownWriter {
  private readonly buffer;
  private blockSeparator;
  private lastChar;
  private atLineStart;
  private readonly prefixes;
  private readonly tight;
  private readonly rawEscapes;
  constructor(out: Appendable);
  /**
   * Write the supplied string (raw/unescaped except if {@link #pushRawEscape} was used).
   */
  raw(s: string): void;
  /**
   * Write the supplied string with escaping.
   *
   * @param s      the string to write
   * @param escape which characters to escape
   */
  text(s: string, escape: CharMatcher): void;
  /**
   * Write a newline (line terminator).
   */
  line(): void;
  /**
   * Enqueue a block separator to be written before the next text is written. Block separators are not written
   * straight away because if there are no more blocks to write we don't want a separator (at the end of the document).
   */
  block(): void;
  /**
   * Push a prefix onto the top of the stack. All prefixes are written at the beginning of each line, until the
   * prefix is popped again.
   *
   * @param prefix the raw prefix string
   */
  pushPrefix(prefix: string): void;
  /**
   * Write a prefix.
   *
   * @param prefix the raw prefix string to write
   */
  writePrefix(prefix: string): void;
  /**
   * Remove the last prefix from the top of the stack.
   */
  popPrefix(): void;
  /**
   * Change whether blocks are tight or loose. Loose is the default where blocks are separated by a blank line. Tight
   * is where blocks are not separated by a blank line. Tight blocks are used in lists, if there are no blank lines
   * within the list.
   * <p>
   * Note that changing this does not affect block separators that have already been enqueued with {@link #block()},
   * only future ones.
   */
  pushTight(tight: boolean): void;
  /**
   * Remove the last "tight" setting from the top of the stack.
   */
  popTight(): void;
  /**
   * Escape the characters matching the supplied matcher, in all text (text and raw). This might be useful to
   * extensions that add another layer of syntax, e.g. the tables extension that uses `|` to separate cells and needs
   * all `|` characters to be escaped (even in code spans).
   *
   * @param rawEscape the characters to escape in raw text
   */
  pushRawEscape(rawEscape: CharMatcher): void;
  /**
   * Remove the last raw escape from the top of the stack.
   */
  popRawEscape(): void;
  /**
   * @return the last character that was written
   */
  getLastChar(): string;
  /**
   * @return whether we're at the line start (not counting any prefixes), i.e. after a {@link #line} or {@link #block}.
   */
  isAtLineStart(): boolean;
  private write;
  private writePrefixes;
  /**
   * If a block separator has been enqueued with {@link #block()} but not yet written, write it now.
   */
  private flushBlockSeparator;
  private append;
  private isTight;
  private needsEscaping;
  private rawNeedsEscaping;
}

/**
 * Open block parser that was last matched during the continue phase. This is different from the currently active
 * block parser, as an unmatched block is only closed when a new block is started.
 * <p><em>This interface is not intended to be implemented by clients.</em></p>
 */
declare interface MatchedBlockParser {
  getMatchedBlockParser(): BlockParser;
  /**
   * Returns the current paragraph lines if the matched block is a paragraph.
   *
   * @return paragraph content or an empty list
   */
  getParagraphLines(): SourceLines;
}

/**
 * A renderer for a set of node types.
 */
export declare interface NodeRenderer {
  /**
   * @return the types of nodes that this renderer handles
   */
  getNodeTypes(): Set<typeof MarkdownNode>;
  /**
   * Render the specified node.
   *
   * @param node the node to render, will be an instance of one of {@link #getNodeTypes()}
   */
  render(node: MarkdownNode): void;
  /**
   * Called before the root node is rendered, to do any initial processing at the start.
   *
   * @param rootNode the root (top-level) node
   */
  beforeRoot(rootNode: MarkdownNode): void;
  /**
   * Called after the root node is rendered, to do any final processing at the end.
   *
   * @param rootNode the root (top-level) node
   */
  afterRoot(rootNode: MarkdownNode): void;
}

export declare class NodeRendererMap {
  private readonly nodeRenderers;
  private readonly renderers;
  add(nodeRenderer: NodeRenderer): void;
  render(node: MarkdownNode): void;
  beforeRoot(node: MarkdownNode): void;
  afterRoot(node: MarkdownNode): void;
}

/**
 * Utility class for working with multiple {@link MarkdownNode}s.
 *
 * @since 0.16.0
 */
export declare class Nodes {
  /**
   * The nodes between (not including) start and end.
   */
  static between(start: MarkdownNode, end: MarkdownNode): MarkdownNodeIterable;
  static MarkdownNodeIterable: typeof MarkdownNodeIterable;
  static MarkdownNodeIterator: typeof MarkdownNodeIterator;
}

export declare class OrderedList extends ListBlock {
  private markerDelimiter;
  private markerStartNumber;
  constructor();
  accept(visitor: Visitor): void;
  /**
   * @return the start number used in the marker, e.g. {@code 1}, if available, or null otherwise
   */
  getMarkerStartNumber(): number | undefined;
  setMarkerStartNumber(markerStartNumber: number): void;
  /**
   * @return the delimiter used in the marker, e.g. {@code .} or {@code )}, if available, or null otherwise
   */
  getMarkerDelimiter(): string | undefined;
  setMarkerDelimiter(markerDelimiter: string): void;
}

/**
 * A paragraph block, contains inline nodes such as {@link Text}
 */
export declare class Paragraph extends Block {
  constructor();
  accept(visitor: Visitor): void;
}

/**
 * The result of a single inline parser. Use the static methods to create instances.
 * <p>
 * <em>This interface is not intended to be implemented by clients.</em>
 */
declare abstract class ParsedInline {
  static none(): ParsedInline | null;
  static of(node: MarkdownNode, position: Position): ParsedInline;
}

/**
 * Parses input text to a tree of nodes.
 * <p>
 * Start with the {@link #builder} method, configure the parser and build it. Example:
 * <pre><code>
 * Parser parser = Parser.builder().build();
 * MarkdownNode document = parser.parse("input text");
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
  parse(input: string | String): MarkdownNode;
  /**
   * Parse the specified reader into a tree of nodes. The caller is responsible for closing the reader.
   * <pre><code>
   * Parser parser = Parser.builder().build();
   * try (InputStreamReader reader = new InputStreamReader(new FileInputStream("file.md"), StandardCharsets.UTF_8)) {
   *     MarkdownNode document = parser.parseReader(reader);
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
  parseReader(input: File): Promise<MarkdownNode>;
  private createDocumentParser;
  private postProcess;
  /**
   * Builder for configuring a {@link Parser}.
   */
  static Builder: typeof ParserBuilder;
  static ParserExtension: typeof ParserExtension;
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
   * Whether to calculate source positions for parsed {@link MarkdownNode Nodes}, see {@link MarkdownNode#getSourceSpans()}.
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
  customInlineContentParserFactory(
    inlineContentParserFactory: InlineContentParserFactory
  ): ParserBuilder;
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
 * Extension for {@link Parser}.
 */
declare class ParserExtension implements Extension {
  extend(parserBuilder: ParserBuilder): void;
}

/**
 * State of the parser that is used in block parsers.
 * <p><em>This interface is not intended to be implemented by clients.</em></p>
 */
declare interface ParserState {
  /**
   * @return the current source line being parsed (full line)
   */
  getLine(): SourceLine;
  /**
   * @return the current index within the line (0-based)
   */
  getIndex(): number;
  /**
   * @return the index of the next non-space character starting from {@link #getIndex()} (may be the same) (0-based)
   */
  getNextNonSpaceIndex(): number;
  /**
   * The column is the position within the line after tab characters have been processed as 4-space tab stops.
   * If the line doesn't contain any tabs, it's the same as the {@link #getIndex()}. If the line starts with a tab,
   * followed by text, then the column for the first character of the text is 4 (the index is 1).
   *
   * @return the current column within the line (0-based)
   */
  getColumn(): number;
  /**
   * @return the indentation in columns (either by spaces or tab stop of 4), starting from {@link #getColumn()}
   */
  getIndent(): number;
  /**
   * @return true if the current line is blank starting from the index
   */
  isBlank(): boolean;
  /**
   * @return the deepest open block parser
   */
  getActiveBlockParser(): BlockParser;
}

/**
 * Position within a {@link Scanner}. This is intentionally kept opaque so as not to expose the internal structure of
 * the Scanner.
 */
declare class Position {
  readonly lineIndex: number;
  readonly index: number;
  constructor(lineIndex: number, index: number);
}

export declare interface PostProcessor {
  /**
   * @param node the node to post-process
   * @return the result of post-processing, may be a modified {@code node} argument
   */
  process(node: MarkdownNode): MarkdownNode;
}

export declare interface Renderer {
  /**
   * Render the tree of nodes to output.
   *
   * @param node the root node
   * @param output output for rendering
   */
  render(node: MarkdownNode, output: Appendable): void;
}

export declare class Scanner {
  /**
   * Character representing the end of input source (or outside of the text in case of the "previous" methods).
   * <p>
   * Note that we can use NULL to represent this because CommonMark does not allow those in the input (we replace them
   * in the beginning of parsing).
   */
  static readonly END: string;
  private readonly lines;
  private lineIndex;
  private index;
  private line;
  private lineLength;
  protected constructor(lines: SourceLine[], lineIndex: number, index: number);
  static of(lines: SourceLines): Scanner;
  peek(): string;
  peekCodePoint(): number;
  peekPreviousCodePoint(): number;
  hasNext(): boolean;
  /**
   * Check if we have the specified content on the line and advanced the position. Note that if you want to match
   * newline characters, use {@link #next(char)}.
   *
   * @param content the text content to match on a single line (excluding newline characters)
   * @return true if matched and position was advanced, false otherwise
   */
  next(content?: string): boolean;
  matchMultiple(c: string): number;
  match(matcher: CharMatcher): number;
  whitespace(): number;
  find(c: string | CharMatcher): number;
  position(): Position;
  setPosition(position: Position): void;
  getSource(begin: Position, end: Position): SourceLines;
  private setLine;
  private checkPosition;
}

export declare class SoftLineBreak extends MarkdownNode {
  constructor();
  accept(visitor: Visitor): void;
}

/**
 * A line or part of a line from the input source.
 *
 * @since 0.16.0
 */
declare class SourceLine {
  private readonly content;
  private readonly sourceSpan;
  static of(content: string, sourceSpan: SourceSpan | null): SourceLine;
  private constructor();
  getContent(): string;
  getSourceSpan(): SourceSpan | null;
  substring(beginIndex: number, endIndex: number): SourceLine;
}

/**
 * A set of lines ({@link SourceLine}) from the input source.
 *
 * @since 0.16.0
 */
declare class SourceLines {
  private readonly lines;
  static empty(): SourceLines;
  static of(sourceLines: SourceLine[]): SourceLines;
  addLine(sourceLine: SourceLine): void;
  getLines(): SourceLine[];
  isEmpty(): boolean;
  getContent(): string;
  getSourceSpans(): SourceSpan[];
}

/**
 * A source span references a snippet of text from the source input.
 * <p>
 * It has a starting position (line and column index) and a length of how many characters it spans.
 * <p>
 * For example, this CommonMark source text:
 * <pre><code>
 * &gt; foo
 * </code></pre>
 * The {@link BlockQuote} node would have this source span: line 0, column 0, length 5.
 * <p>
 * The {@link Paragraph} node inside it would have: line 0, column 2, length 3.
 * <p>
 * If a block has multiple lines, it will have a source span for each line.
 * <p>
 * Note that the column index and length are measured in Java characters (UTF-16 code units). If you're outputting them
 * to be consumed by another programming language, e.g. one that uses UTF-8 strings, you will need to translate them,
 * otherwise characters such as emojis will result in incorrect positions.
 *
 * @since 0.16.0
 */
export declare class SourceSpan {
  private readonly lineIndex;
  private readonly columnIndex;
  private readonly inputIndex;
  private readonly length;
  private constructor();
  /**
   * @return 0-based line index, e.g. 0 for first line, 1 for the second line, etc
   */
  getLineIndex(): number;
  /**
   * @return 0-based index of column (character on line) in source, e.g. 0 for the first character of a line, 1 for
   * the second character, etc
   */
  getColumnIndex(): number;
  /**
   * @return 0-based index in whole input
   * @since 0.24.0
   */
  getInputIndex(): number;
  /**
   * @return length of the span in characters
   */
  getLength(): number;
  subSpan(beginIndex: number, endIndex?: number): SourceSpan;
  equals(o: any): boolean;
  /**
   * Use {{@link #of(int, int, int, int)}} instead to also specify input index. Using the deprecated one
   * will set {@link #inputIndex} to 0.
   */
  static of(line: number, col: number, input: number | undefined, length: number): SourceSpan;
}

export declare class StrongEmphasis extends MarkdownNode implements Delimited {
  private delimiter;
  constructor(delimiter: string);
  accept(visitor: Visitor): void;
  setDelimiter(delimiter: string): void;
  getOpeningDelimiter(): string;
  getClosingDelimiter(): string;
}

declare class Text_2 extends MarkdownNode {
  private literal;
  constructor(literal: string);
  accept(visitor: Visitor): void;
  getLiteral(): string;
  setLiteral(literal: string): void;
  protected toStringAttributes(): string;
}
export { Text_2 as Text };

declare interface TextContentNodeRendererContext {
  /**
   * Controls how line breaks should be rendered, see {@link LineBreakRendering}.
   */
  lineBreakRendering(): LineBreakRendering;
  /**
   * @return true for stripping new lines and render text as "single line",
   * false for keeping all line breaks.
   * @deprecated Use {@link #lineBreakRendering()} instead
   */
  stripNewlines(): boolean;
  /**
   * @return the writer to use
   */
  getWriter(): TextContentWriter;
  /**
   * Render the specified node and its children using the configured renderers. This should be used to render child
   * nodes; be careful not to pass the node that is being rendered, that would result in an endless loop.
   *
   * @param node the node to render
   */
  render(node: MarkdownNode): void;
}

/**
 * Factory for instantiating new node renderers when rendering is done.
 */
export declare interface TextContentNodeRendererFactory {
  /**
   * Create a new node renderer for the specified rendering context.
   *
   * @param context the context for rendering (normally passed on to the node renderer)
   * @return a node renderer
   */
  create(context: TextContentNodeRendererContext): NodeRenderer;
}

/**
 * Renders nodes to plain text content with minimal markup-like additions.
 */
export declare class TextContentRenderer implements Renderer {
  readonly lineBreakRendering: LineBreakRendering;
  readonly nodeRendererFactories: TextContentNodeRendererFactory[];
  constructor(builder: TextContentRendererBuilder);
  /**
   * Create a new builder for configuring a {@link TextContentRenderer}.
   *
   * @return a builder
   */
  static builder(): TextContentRendererBuilder;
  render(node: MarkdownNode, output: Appendable): void;
  /**
   * Builder for configuring a {@link TextContentRenderer}. See methods for default configuration.
   */
  static Builder: typeof TextContentRendererBuilder;
  static TextContentRendererExtension: typeof TextContentRendererExtension;
}

declare class TextContentRendererBuilder {
  nodeRendererFactories: TextContentNodeRendererFactory[];
  lineBreakRendering: LineBreakRendering;
  /**
   * @return the configured {@link TextContentRenderer}
   */
  build(): TextContentRenderer;
  /**
   * Configure how line breaks (newlines) are rendered, see {@link LineBreakRendering}.
   * The default is {@link LineBreakRendering#COMPACT}.
   *
   * @param lineBreakRendering the mode to use
   * @return {@code this}
   */
  setLineBreakRendering(lineBreakRendering: LineBreakRendering): TextContentRendererBuilder;
  /**
   * Add a factory for instantiating a node renderer (done when rendering). This allows to override the rendering
   * of node types or define rendering for custom node types.
   * <p>
   * If multiple node renderers for the same node type are created, the one from the factory that was added first
   * "wins". (This is how the rendering for core node types can be overridden; the default rendering comes last.)
   *
   * @param nodeRendererFactory the factory for creating a node renderer
   * @return {@code this}
   */
  nodeRendererFactory(
    nodeRendererFactory: TextContentNodeRendererFactory
  ): TextContentRendererBuilder;
  /**
   * @param extensions extensions to use on this text content renderer
   * @return {@code this}
   */
  extensions(extensions: Extension[]): TextContentRendererBuilder;
}

/**
 * Extension for {@link TextContentRenderer}.
 */
declare class TextContentRendererExtension implements Extension {
  extend(rendererBuilder: TextContentRendererBuilder): void;
}

declare class TextContentWriter {
  private readonly buffer;
  private readonly lineBreakRendering;
  private readonly tight;
  private blockSeparator;
  private lastChar;
  constructor(out: Appendable, lineBreakRendering?: LineBreakRendering);
  whitespace(): void;
  colon(): void;
  line(): void;
  block(): void;
  resetBlock(): void;
  writeStripped(s: string): void;
  write(s: string): void;
  /**
   * Change whether blocks are tight or loose. Loose is the default where blocks are separated by a blank line. Tight
   * is where blocks are not separated by a blank line. Tight blocks are used in lists, if there are no blank lines
   * within the list.
   * <p>
   * Note that changing this does not affect block separators that have already been enqueued with {@link #block()},
   * only future ones.
   */
  pushTight(tight: boolean): void;
  /**
   * Remove the last "tight" setting from the top of the stack.
   */
  popTight(): void;
  private isTight;
  /**
   * If a block separator has been enqueued with {@link #block()} but not yet written, write it now.
   */
  private flushBlockSeparator;
  private append;
}

export declare class ThematicBreak extends Block {
  private literal;
  constructor();
  accept(visitor: Visitor): void;
  /**
   * @return the source literal that represents this node, if available
   */
  getLiteral(): string | undefined;
  setLiteral(literal: string): void;
}

declare type UnicodeCategoryTypes = keyof typeof Character.UnicodeCategory;

/**
 * Sanitizes urls for img and a elements by whitelisting protocols.
 * This is intended to prevent XSS payloads like [Click this totally safe url](javascript:document.xss=true;)
 * <p>
 * Implementation based on https://github.com/OWASP/java-html-sanitizer/blob/f07e44b034a45d94d6fd010279073c38b6933072/src/main/java/org/owasp/html/FilterUrlByProtocolAttributePolicy.java
 *
 * @since 0.14.0
 */
export declare interface UrlSanitizer {
  /**
   * Sanitize a url for use in the href attribute of a {@link Link}.
   *
   * @param url Link to sanitize
   * @return Sanitized link
   */
  sanitizeLinkUrl(url: string): string;
  /**
   * Sanitize a url for use in the src attribute of a {@link Image}.
   *
   * @param url Link to sanitize
   * @return Sanitized link {@link Image}
   */
  sanitizeImageUrl(url: string): string;
}

/**
 * MarkdownNode visitor.
 * <p>
 * Implementations should subclass {@link AbstractVisitor} instead of implementing this directly.
 */
declare interface Visitor {
  visit(node: MarkdownNode): void;
}

export {};
