import type { Block, MarkdownNode } from "../node";
import type { Extension } from "../Extension";
import type { InlineContentParserFactory } from "./interfaces/InlineContentParserFactory";
import type { LinkProcessor } from "./interfaces/LinkProcessor";
import type { BlockParserFactory } from "./interfaces/BlockParserFactory";
import type { DelimiterProcessor } from "./interfaces/DelimiterProcessor";
import type { InlineParserFactory } from "./interfaces/InlineParserFactory";
import type { PostProcessor } from "./interfaces/PostProcessor";

import IncludeSourceSpans from "./enums/IncludeSourceSpans";
import {
  Definitions,
  DocumentParser,
  InlineParserContextImpl,
  InlineParserImpl,
} from "../internal";

/**
 * Extension for {@link Parser}.
 */
class ParserExtension implements Extension {
  extend(parserBuilder: ParserBuilder) {}
}

/**
 * Parser 的编译器
 */
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
   * 设置需要解析的 markdown 块节点, 默认解析:
   *   - Heading
   *   - HtmlBlock
   *   - ThematicBreak
   *   - FencedCodeBlock
   *   - IndentedCodeBlock
   *   - BlockQuote
   *   - ListBlock
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
   * 是否计算已解析的 {@link MarkdownNode Nodes} 的源码位置, 请参阅 {@link MarkdownNode#getSourceSpans()}
   * 默认情况下处于禁用状态
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
   * 添加自定义块解析器工厂类
   * <p>
   * 请注意，自定义解析工厂在内置解析工厂之前应用,
   * 扩展可以改变某些语法的解析方式, 否则这些语法将由内置解析工厂处理
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
   *
   * 为自定义内联内容解析器添加工厂, 用于扩展内联解析或覆盖内置解析
   * <p>
   * 请注意，解析器是根据指定的特殊字符触发的
   * {@link InlineContentParserFactory#getTriggerCharacters()}
   * 可以为同一个解析器注册多个解析器字符, 甚至某些内置特殊字符, 例如 {@code `}
   * 首先按照注册的顺序应用自定义内联内容解析器, 然后应用内置的内联内容解析器
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
   * 添加自定义分隔符处理器以进行内联解析
   * <p>
   * 注意, 可以添加多个具有相同字符的分隔符处理器, 只要它们有一个不同的最小长度
   * 在这种情况下, 将使用具有最短匹配长度的处理器
   * 添加更多超过一个具有相同字符和最小长度的定界符处理器无效
   * <p>
   * 如果想更多地控制解析的完成方式, 可能需要使用 {@link #customInlineContentParserFactory}
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
   * 添加自定义链接/图像处理器以进行内联解析
   * <p>
   * 可以添加多个链接处理器, 并且将按照添加的顺序进行尝试
   * 如果没有链接处理器适用, 内置处理器会进行处理适用
   * 这意味着它们可以覆盖内置链接解析
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
   * If a link marker followed by a valid link is parsed, the {@link org.commonmark.parser.beta.LinkInfo}
   * that is passed to {@link LinkProcessor} will have its {@link LinkInfo#marker()} set. A link processor should
   * check the {@link Text#getLiteral()} and then do any processing, and will probably want to use {@link LinkResult#includeMarker()}.
   *
   * 添加自定义链接标记以进行链接处理
   * 链接标记是一个类似于 {@code !} 的字符,
   * 如果它出现在链接的{@code [}之前, 改变链接的含义
   * <p>
   * 如果解析了后面跟有有效链接的链接标记, 则 {@link org.commonmark.parser.beta.LinkInfo}
   * 传递给 {@link LinkProcessor} 的内容将设置其 {@link LinkInfo#marker()}
   * 链接处理器应该检查 {@link Text#getLiteral()}, 然后进行任何处理, 并且可能需要使用 {@link LinkResult#includeMarker()}
   *
   * @param linkMarker a link marker character
   * @return {@code this}
   */
  public linkMarker(linkMarker: string): ParserBuilder {
    this.linkMarkers.add(linkMarker);
    return this;
  }

  /**
   * 添加后置处理器
   *
   * @param postProcessor
   * @returns
   */
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
   * 覆盖用于内联解析处理的解析器
   * <p>
   * 提供 InlineParserFactory 的实现, 它提供自定义内联解析器
   * 修改以下内容的解析方式：
   *   粗体 （**）
   *   斜体 (*)
   *   删除线 (~~)
   *   反引号 (`)
   *   链接（[标题](http://)）
   *   图片 (![alt](http://))
   * <p>
   * 注意, 如果没有调用该方法或者内联解析器工厂设置为 null, 则将使用默认实现
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

  /**
   * 获取内联内容解析器工厂
   *
   * @returns
   */
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
 *
 * 将输入文本解析为节点树
 * <p>
 * 从 {@link #builder} 方法开始, 配置解析器并构建它
 */
export class Parser {
  private readonly blockParserFactories: BlockParserFactory[];
  private readonly inlineContentParserFactories: InlineContentParserFactory[];
  private readonly delimiterProcessors: DelimiterProcessor[];
  private readonly linkProcessors: LinkProcessor[];
  private readonly linkMarkers: Set<string>;
  private readonly inlineParserFactory: InlineParserFactory;
  private readonly postProcessors: PostProcessor[];
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
    // 尝试构建一个内联解析器, 无效的配置可能会导致异常, 我们希望尽快检测到
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
   * 将指定的输入文本解析为节点树
   * <p>
   * 每次调用都会使用新的解析器状态
   *
   * @param input the text to parse - must not be null
   * @return the root node
   */
  public parse(input: string): MarkdownNode {
    let documentParser = this.createDocumentParser();
    let document = documentParser.parse(input);
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
   * 将指定的 Markdown 文件解析为节点树
   * <p>
   * 每次调用都会使用新的解析器状态
   *
   * @param input the reader to parse - must not be null
   * @return the root node
   * @throws IOException when reading throws an exception
   */
  public async parseReader(input: File): Promise<MarkdownNode> {
    return new Promise<MarkdownNode>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        let documentParser = this.createDocumentParser();
        let document = documentParser.parse(reader.result as string);
        resolve(this.postProcess(document));
      };

      reader.onerror = reject;

      reader.readAsText(input);
    });
  }

  /**
   * 创建文档解析器
   *
   * @returns
   */
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

  /**
   * 后置处理
   *
   * @param document
   * @returns
   */
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
