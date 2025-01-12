import type { MarkdownNode } from 'commonmark-java-js';

import type HtmlWriter from '../HtmlWriter';

export interface HtmlNodeRendererContext {
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
}
