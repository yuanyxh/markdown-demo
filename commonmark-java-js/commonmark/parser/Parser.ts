import type { Block, MarkdownNode } from "@/node";
import type { Extension } from "@/Extension";

import type { InlineContentParserFactory } from "./interfaces/InlineContentParserFactory";
import type { LinkProcessor } from "./interfaces/LinkProcessor";
import type { BlockParserFactory } from "./interfaces/BlockParserFactory";
import type { DelimiterProcessor } from "./interfaces/DelimiterProcessor";
import type { InlineParserFactory } from "./interfaces/InlineParserFactory";
import type { PostProcessor } from "./interfaces/PostProcessor";

import {
  Definitions,
  DocumentParser,
  InlineParserContextImpl,
  InlineParserImpl,
} from "@/internal";

import IncludeSourceSpans from "./enums/IncludeSourceSpans";

/**
 * Extension for {@link Parser}.
 */
class ParserExtension implements Extension {
  extend(parserBuilder: ParserBuilder) {}
}

class ParserBuilder {
  public readonly blockParserFactories: BlockParserFactory[] = [];
  public readonly inlineContentParserFactories: InlineContentParserFactory[] =
    [];
  public readonly delimiterProcessors: DelimiterProcessor[] = [];
  public readonly linkProcessors: LinkProcessor[] = [];
  public readonly postProcessors: PostProcessor[] = [];
  public readonly linkMarkers: Set<string> = new Set();
  public enabledBlockTypes: Set<typeof Block> =
    DocumentParser.getDefaultBlockParserTypes();
  private inlineParserFactory: InlineParserFactory | null = null;
  public includeSourceSpans = IncludeSourceSpans.NONE;

  /**
   * @return the configured {@link Parser}
   */
  public build(): Parser {
    return new Parser(this);
  }

  /**
   * @param extensions extensions to use on this parser
   * @return {@code this}
   */
  public extensions(extensions: Extension[]): ParserBuilder {
    for (const extension of extensions) {
      if (extension instanceof ParserExtension) {
        extension.extend(this);
      }
    }
    return this;
  }

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
  public setEnabledBlockTypes(
    enabledBlockTypes: Set<typeof Block>
  ): ParserBuilder {
    DocumentParser.checkEnabledBlockTypes(enabledBlockTypes);

    this.enabledBlockTypes = enabledBlockTypes;
    return this;
  }

  /**
   * Whether to calculate source positions for parsed {@link MarkdownNode Nodes}, see {@link MarkdownNode#getSourceSpans()}.
   * <p>
   * By default, source spans are disabled.
   *
   * @param includeSourceSpans which kind of source spans should be included
   * @return {@code this}
   * @since 0.16.0
   */
  public setIncludeSourceSpans(
    includeSourceSpans: IncludeSourceSpans
  ): ParserBuilder {
    this.includeSourceSpans = includeSourceSpans;
    return this;
  }

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
  public customBlockParserFactory(
    blockParserFactory: BlockParserFactory
  ): ParserBuilder {
    this.blockParserFactories.push(blockParserFactory);
    return this;
  }

  /**
   * Add a factory for a custom inline content parser, for extending inline parsing or overriding built-in parsing.
   * <p>
   * Note that parsers are triggered based on a special character as specified by
   * {@link InlineContentParserFactory#getTriggerCharacters()}. It is possible to register multiple parsers for the same
   * character, or even for some built-in special character such as {@code `}. The custom parsers are tried first
   * in order in which they are registered, and then the built-in ones.
   */
  public customInlineContentParserFactory(
    inlineContentParserFactory: InlineContentParserFactory
  ): ParserBuilder {
    this.inlineContentParserFactories.push(inlineContentParserFactory);
    return this;
  }

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
  public customDelimiterProcessor(
    delimiterProcessor: DelimiterProcessor
  ): ParserBuilder {
    this.delimiterProcessors.push(delimiterProcessor);
    return this;
  }

  /**
   * Add a custom link/image processor for inline parsing.
   * <p>
   * Multiple link processors can be added, and will be tried in order in which they were added. If no link
   * processor applies, the normal behavior applies. That means these can override built-in link parsing.
   *
   * @param linkProcessor a link processor implementation
   * @return {@code this}
   */
  public linkProcessor(linkProcessor: LinkProcessor): ParserBuilder {
    this.linkProcessors.push(linkProcessor);
    return this;
  }

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
  public linkMarker(linkMarker: string): ParserBuilder {
    this.linkMarkers.add(linkMarker);
    return this;
  }

  public postProcessor(postProcessor: PostProcessor): ParserBuilder {
    this.postProcessors.push(postProcessor);
    return this;
  }

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
  public setInlineParserFactory(
    inlineParserFactory: InlineParserFactory | null
  ): ParserBuilder {
    this.inlineParserFactory = inlineParserFactory;
    return this;
  }

  public getInlineParserFactory(): InlineParserFactory {
    if (this.inlineParserFactory) {
      return this.inlineParserFactory;
    }

    return {
      create(inlineParserContext): InlineParserImpl {
        return new InlineParserImpl(inlineParserContext);
      },
    };
  }
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
export class Parser {
  private readonly blockParserFactories: BlockParserFactory[];
  private readonly inlineContentParserFactories: InlineContentParserFactory[];
  private readonly delimiterProcessors: DelimiterProcessor[];
  private readonly linkProcessors: LinkProcessor[];
  private readonly linkMarkers: Set<string>;
  private readonly postProcessors: PostProcessor[];
  private readonly inlineParserFactory: InlineParserFactory;
  private readonly includeSourceSpans: IncludeSourceSpans;

  public constructor(builder: ParserBuilder) {
    this.blockParserFactories = DocumentParser.calculateBlockParserFactories(
      builder.blockParserFactories,
      builder.enabledBlockTypes
    );

    const createFactory = builder.getInlineParserFactory();

    this.postProcessors = builder.postProcessors;
    this.inlineContentParserFactories = builder.inlineContentParserFactories;
    this.delimiterProcessors = builder.delimiterProcessors;
    this.linkProcessors = builder.linkProcessors;
    this.linkMarkers = builder.linkMarkers;
    this.includeSourceSpans = builder.includeSourceSpans;

    // Try to construct an inline parser. Invalid configuration might result in an exception, which we want to detect as soon as possible.
    const context = new InlineParserContextImpl(
      this.inlineContentParserFactories,
      this.delimiterProcessors,
      this.linkProcessors,
      this.linkMarkers,
      new Definitions()
    );

    this.inlineParserFactory = createFactory.create(context);
  }

  /**
   * Create a new builder for configuring a {@link Parser}.
   *
   * @return a builder
   */
  public static builder(): ParserBuilder {
    return new ParserBuilder();
  }

  /**
   * Parse the specified input text into a tree of nodes.
   * <p>
   * This method is thread-safe (a new parser state is used for each invocation).
   *
   * @param input the text to parse - must not be null
   * @return the root node
   */
  public parse(input: string): MarkdownNode {
    const documentParser = this.createDocumentParser();
    const document = documentParser.parse(input);

    return this.postProcess(document);
  }

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
  public async parseReader(input: File): Promise<MarkdownNode> {
    return new Promise<MarkdownNode>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const documentParser = this.createDocumentParser();
        const document = documentParser.parse(reader.result as string);

        resolve(this.postProcess(document));
      };

      reader.onerror = reject;

      reader.readAsText(input);
    });
  }

  private createDocumentParser(): DocumentParser {
    return new DocumentParser(
      this.blockParserFactories,
      this.inlineParserFactory,
      this.inlineContentParserFactories,
      this.delimiterProcessors,
      this.linkProcessors,
      this.linkMarkers,
      this.includeSourceSpans
    );
  }

  private postProcess(document: MarkdownNode): MarkdownNode {
    for (const postProcessor of this.postProcessors) {
      document = postProcessor.process(document);
    }

    return document;
  }

  /**
   * Builder for configuring a {@link Parser}.
   */
  public static Builder = ParserBuilder;

  public static ParserExtension = ParserExtension;
}

export default Parser;
