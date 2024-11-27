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
