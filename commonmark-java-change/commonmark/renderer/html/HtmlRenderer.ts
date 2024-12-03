import type { Extension } from "../../Extension";
import type { HtmlNodeRendererContext } from "./interfaces/HtmlNodeRendererContext";
import type { AttributeProviderFactory } from "./interfaces/AttributeProviderFactory";
import type { Renderer } from "../interfaces/Renderer";
import type { UrlSanitizer } from "./interfaces/UrlSanitizer";
import type { HtmlNodeRendererFactory } from "./interfaces/HtmlNodeRendererFactory";
import type { NodeRenderer } from "../interfaces/NodeRenderer";
import type { MarkdownNode } from "../../node";
import type { AttributeProvider } from "./interfaces/AttributeProvider";
import type { AttributeProviderContext } from "./interfaces/AttributeProviderContext";

import CoreHtmlNodeRenderer from "./CoreHtmlNodeRenderer";
import DefaultUrlSanitizer from "./html_utils/DefaultUrlSanitizer";
import HtmlWriter from "./HtmlWriter";
import { Appendable } from "../../../helpers";
import { NodeRendererMap, Escaping } from "../../internal";

/**
 * Extension for {@link HtmlRenderer}.
 */
class HtmlRendererExtension implements Extension {
  extend(rendererBuilder: HtmlRendererBuilder) {}
}

/**
 * HtmlRenderer 的编译器
 */
class HtmlRendererBuilder {
  public softbreak = "\n";
  public escapeHtml = false;
  public sanitizeUrls = false;
  public urlSanitizer: UrlSanitizer = new DefaultUrlSanitizer();
  public percentEncodeUrls = false;
  public omitSingleParagraphP = false;
  public attributeProviderFactories: AttributeProviderFactory[] = [];
  public nodeRendererFactories: HtmlNodeRendererFactory[] = [];

  /**
   * @return the configured {@link HtmlRenderer}
   */
  public build(): HtmlRenderer {
    return new HtmlRenderer(this);
  }

  /**
   * The HTML to use for rendering a softbreak, defaults to {@code "\n"} (meaning the rendered result doesn't have
   * a line break).
   * <p>
   * Set it to {@code "<br>"} (or {@code "<br />"} to make them hard breaks.
   * <p>
   * Set it to {@code " "} to ignore line wrapping in the source.
   *
   * 用于渲染软中断的 HTML，默认为 {@code "\n"} （意味着渲染的结果没有换行）
   * <p>
   * 将其设置为 {@code "<br>"}（或 {@code "<br />"} 以使它们硬中断
   * <p>
   * 将其设置为 {@code " "} 以忽略源代码中的换行
   *
   * @param softbreak HTML for softbreak
   * @return {@code this}
   */
  public setSoftbreak(softbreak: string): HtmlRendererBuilder {
    this.softbreak = softbreak;
    return this;
  }

  /**
   * Whether {@link HtmlInline} and {@link HtmlBlock} should be escaped, defaults to {@code false}.
   * <p>
   * Note that {@link HtmlInline} is only a tag itself, not the text between an opening tag and a closing tag. So
   * markup in the text will be parsed as normal and is not affected by this option.
   *
   * {@link HtmlInline} 和 {@link HtmlBlock} 是否应该转义，默认为 {@code false}。
   * <p>
   * 请注意，{@link HtmlInline} 只是一个标签本身，而不是开始标签和结束标签之间的文本。所以
   * 文本中的标记将正常解析，不受此选项影响。
   *
   * @param escapeHtml true for escaping, false for preserving raw HTML
   * @return {@code this}
   */
  public setEscapeHtml(escapeHtml: boolean): HtmlRendererBuilder {
    this.escapeHtml = escapeHtml;
    return this;
  }

  /**
   * Whether {@link Image} src and {@link Link} href should be sanitized, defaults to {@code false}.
   *
   * 是否清理 {@link Image} src 和 {@link Link} href，默认为 {@code false}。
   *
   * @param sanitizeUrls true for sanitization, false for preserving raw attribute
   * @return {@code this}
   * @since 0.14.0
   */
  public setSanitizeUrls(sanitizeUrls: boolean): HtmlRendererBuilder {
    this.sanitizeUrls = sanitizeUrls;
    return this;
  }

  /**
   * {@link UrlSanitizer} used to filter URL's if {@link #sanitizeUrls} is true.
   *
   * 如果 {@link #sanitizeUrls} 为 true，则 {@link UrlSanitizer} 用于过滤 URL。
   *
   * @param urlSanitizer Filterer used to filter {@link Image} src and {@link Link}.
   * @return {@code this}
   * @since 0.14.0
   */
  public setUrlSanitizer(urlSanitizer: UrlSanitizer): HtmlRendererBuilder {
    this.urlSanitizer = urlSanitizer;
    return this;
  }

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
   * 链接或图像的 URL 是否应进行百分比编码，默认为 {@code false}。
   * <p>
   * 如果启用，将完成以下操作：
   *   - 保留现有的百分比编码部分（例如“%20”保留为“%20”）
   *   - 保留 “/” 等保留字符，“[” 和 “]” 除外（参见 JS 中的 encodeURI）
   *   - 保留非保留字符，例如 “a”
   *   - 其他字符（例如变音符号）采用百分比编码
   *
   * @param percentEncodeUrls true to percent-encode, false for leaving as-is
   * @return {@code this}
   */
  public setPercentEncodeUrls(percentEncodeUrls: boolean): HtmlRendererBuilder {
    this.percentEncodeUrls = percentEncodeUrls;
    return this;
  }

  /**
   * Whether documents that only contain a single paragraph should be rendered without the {@code <p>} tag. Set to
   * {@code true} to render without the tag; the default of {@code false} always renders the tag.
   *
   * 是否应在不使用 {@code <p>} 标记的情况下呈现仅包含单个段落的文档。设置为{@code true} 在没有标签的情况下渲染；
   * 默认值 {@code false} 始终呈现标签
   *
   * @return {@code this}
   */
  public setOmitSingleParagraphP(
    omitSingleParagraphP: boolean
  ): HtmlRendererBuilder {
    this.omitSingleParagraphP = omitSingleParagraphP;
    return this;
  }

  /**
   * Add a factory for an attribute provider for adding/changing HTML attributes to the rendered tags.
   *
   * 为属性提供程序添加一个工厂，用于向呈现的标签添加/更改 HTML 属性。
   *
   * @param attributeProviderFactory the attribute provider factory to add
   * @return {@code this}
   */
  public attributeProviderFactory(
    attributeProviderFactory: AttributeProviderFactory
  ): HtmlRendererBuilder {
    this.attributeProviderFactories.push(attributeProviderFactory);

    return this;
  }

  /**
   * Add a factory for instantiating a node renderer (done when rendering). This allows to override the rendering
   * of node types or define rendering for custom node types.
   * <p>
   * If multiple node renderers for the same node type are created, the one from the factory that was added first
   * "wins". (This is how the rendering for core node types can be overridden; the default rendering comes last.)
   *
   * 添加用于实例化节点渲染器的工厂（渲染时完成）。这允许覆盖渲染
   * 节点类型或定义自定义节点类型的渲染。
   * <p>
   * 如果为同一节点类型创建了多个节点渲染器，则第一个添加的工厂渲染器优先
   *
   * @param nodeRendererFactory the factory for creating a node renderer
   * @return {@code this}
   */
  public nodeRendererFactory(
    nodeRendererFactory: HtmlNodeRendererFactory
  ): HtmlRendererBuilder {
    this.nodeRendererFactories.push(nodeRendererFactory);

    return this;
  }

  /**
   * @param extensions extensions to use on this HTML renderer
   * @return {@code this}
   */
  public extensions(extensions: Extension[]): HtmlRendererBuilder {
    for (const extension of extensions) {
      if (extension instanceof HtmlRendererExtension) {
        extension.extend(this);
      }
    }

    return this;
  }
}

/**
 * Html 渲染上下文
 */
class RendererContext
  implements HtmlNodeRendererContext, AttributeProviderContext
{
  private readonly htmlWriter: HtmlWriter;
  private readonly attributeProviders: AttributeProvider[];
  private readonly nodeRendererMap = new NodeRendererMap();
  private readonly context: HtmlRenderer;

  public constructor(context: HtmlRenderer, htmlWriter: HtmlWriter) {
    this.context = context;
    this.htmlWriter = htmlWriter;

    this.attributeProviders = [];
    for (const attributeProviderFactory of this.context
      .attributeProviderFactories) {
      this.attributeProviders.push(attributeProviderFactory.create(this));
    }

    for (const factory of this.context.nodeRendererFactories) {
      let renderer = factory.create(this);
      this.nodeRendererMap.add(renderer);
    }
  }

  /**
   * 应该编码特殊符号
   *
   * @returns
   */
  public shouldEscapeHtml(): boolean {
    return this.context.escapeHtml;
  }

  /**
   * 文本只包含单行段落时，不以 p 标记包裹行文本
   *
   * @returns
   */
  public shouldOmitSingleParagraphP(): boolean {
    return this.context.omitSingleParagraphP;
  }

  /**
   * 应该对图像或链接的 url 进行清理
   *
   * @returns
   */
  public shouldSanitizeUrls(): boolean {
    return this.context.sanitizeUrls;
  }

  /**
   * 返回对图像或链接的 url 转化的清理对象
   *
   * @returns
   */
  public urlSanitizer(): UrlSanitizer {
    return this.context.urlSanitizer;
  }

  /**
   * 对 url 进行编码 (如果需要)
   *
   * @param url
   * @returns
   */
  public encodeUrl(url: string): string {
    if (this.context.percentEncodeUrls) {
      return Escaping.percentEncodeUrl(url);
    } else {
      return url;
    }
  }

  /**
   * 设置
   *
   * @param node
   * @param tagName
   * @param attributes
   * @returns
   */
  public extendAttributes(
    node: MarkdownNode,
    tagName: string,
    attributes: Map<string, string>
  ): Map<string, string> {
    const attrs = new Map<string, string>(attributes);
    this.setCustomAttributes(node, tagName, attrs);

    return attrs;
  }

  /**
   * 获取写入器
   *
   * @returns
   */
  public getWriter(): HtmlWriter {
    return this.htmlWriter;
  }

  /**
   * 获取设置的换行标记
   *
   * @returns
   */
  public getSoftbreak(): string {
    return this.context.softbreak;
  }

  /**
   * render
   *
   * @param node
   */
  public render(node: MarkdownNode) {
    this.nodeRendererMap.render(node);
  }

  public beforeRoot(node: MarkdownNode) {
    this.nodeRendererMap.beforeRoot(node);
  }

  public afterRoot(node: MarkdownNode) {
    this.nodeRendererMap.afterRoot(node);
  }

  /**
   * 设置自定义属性
   *
   * @param node
   * @param tagName
   * @param attrs
   */
  private setCustomAttributes(
    node: MarkdownNode,
    tagName: string,
    attrs: Map<string, string>
  ) {
    for (const attributeProvider of this.attributeProviders) {
      attributeProvider.setAttributes(node, tagName, attrs);
    }
  }
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
class HtmlRenderer implements Renderer {
  public readonly softbreak: string;
  public readonly escapeHtml: boolean;
  public readonly percentEncodeUrls: boolean;
  public readonly omitSingleParagraphP: boolean;
  public readonly sanitizeUrls: boolean;
  public readonly urlSanitizer: UrlSanitizer;
  public readonly attributeProviderFactories: AttributeProviderFactory[];
  public readonly nodeRendererFactories: HtmlNodeRendererFactory[];

  public constructor(builder: HtmlRendererBuilder) {
    this.softbreak = builder.softbreak;
    this.escapeHtml = builder.escapeHtml;
    this.percentEncodeUrls = builder.percentEncodeUrls;
    this.omitSingleParagraphP = builder.omitSingleParagraphP;
    this.sanitizeUrls = builder.sanitizeUrls;
    this.urlSanitizer = builder.urlSanitizer;
    this.attributeProviderFactories = [...builder.attributeProviderFactories];

    this.nodeRendererFactories = [];
    this.nodeRendererFactories.push(...builder.nodeRendererFactories);

    // Add as last. This means clients can override the rendering of core nodes if they want.
    this.nodeRendererFactories.push({
      create(context: HtmlNodeRendererContext): NodeRenderer {
        return new CoreHtmlNodeRenderer(context);
      },
    });
  }

  /**
   * Create a new builder for configuring an {@link HtmlRenderer}.
   *
   * @return a builder
   */
  public static builder(): HtmlRendererBuilder {
    return new HtmlRendererBuilder();
  }

  public render(node: MarkdownNode, output?: Appendable) {
    if (!output) {
      output = new Appendable();
    }

    const context = new RendererContext(this, new HtmlWriter(output));

    context.beforeRoot(node);
    context.render(node);
    context.afterRoot(node);

    return output.toString();
  }

  /**
   * Builder for configuring an {@link HtmlRenderer}. See methods for default configuration.
   */
  public static Builder = HtmlRendererBuilder;

  public static HtmlRendererExtension = HtmlRendererExtension;
}

export default HtmlRenderer;
