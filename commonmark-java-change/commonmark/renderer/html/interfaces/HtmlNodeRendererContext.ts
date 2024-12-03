import type HtmlWriter from "../HtmlWriter";
import type { MarkdownNode } from "../../../node";
import type { UrlSanitizer } from "./UrlSanitizer";

export interface HtmlNodeRendererContext {
  /**
   * @param url to be encoded
   * @return an encoded URL (depending on the configuration)
   */
  encodeUrl(url: string): string;

  /**
   * Let extensions modify the HTML tag attributes.
   *
   * 让 extensions (此处的扩展表示自定义节点渲染器) 修改 HTML 标签属性
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
   * 获取写入器
   *
   * @return the HTML writer to use
   */
  getWriter(): HtmlWriter;

  /**
   * 获取换行符标记
   *
   * @return HTML that should be rendered for a soft line break
   */
  getSoftbreak(): string;

  /**
   * Render the specified node and its children using the configured renderers. This should be used to render child
   * nodes; be careful not to pass the node that is being rendered, that would result in an endless loop.
   *
   * 使用配置的渲染器渲染指定的节点及其子节点。这应该用于渲染子项节点
   * 注意不要传递正在渲染的节点，否则会导致无限循环
   *
   * @param node the node to render
   */
  render(node: MarkdownNode): void;

  /**
   * 是否应该编码 html 特殊标记
   *
   * @return whether HTML blocks and tags should be escaped or not
   */
  shouldEscapeHtml(): boolean;

  /**
   * 是否在文档只包含单个段落时，使用纯文本而不添加 p 标记
   *
   * @return whether documents that only contain a single paragraph should be rendered without the {@code <p>} tag
   */
  shouldOmitSingleParagraphP(): boolean;

  /**
   * 是否应该处理图像或链接的 url
   *
   * @return true if the {@link UrlSanitizer} should be used.
   * @since 0.14.0
   */
  shouldSanitizeUrls(): boolean;

  /**
   * 返回处理图像或链接的处理对象
   *
   * @return Sanitizer to use for securing {@link Link} href and {@link Image} src if {@link #shouldSanitizeUrls()} is true.
   * @since 0.14.0
   */
  urlSanitizer(): UrlSanitizer;
}
