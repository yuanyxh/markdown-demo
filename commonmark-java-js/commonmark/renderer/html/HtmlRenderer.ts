import type { Extension } from '@/Extension';
import type { Node } from '@/node';

import type { HtmlNodeRendererContext } from './interfaces/HtmlNodeRendererContext';
import type { AttributeProviderFactory } from './interfaces/AttributeProviderFactory';
import type { AttributeProvider } from './interfaces/AttributeProvider';
import type { AttributeProviderContext } from './interfaces/AttributeProviderContext';
import type { UrlSanitizer } from './interfaces/UrlSanitizer';
import type { HtmlNodeRendererFactory } from './interfaces/HtmlNodeRendererFactory';
import type { NodeRenderer } from '../interfaces/NodeRenderer';
import type { Renderer } from '../interfaces/Renderer';

import { Appendable } from '@helpers/index';
import { NodeRendererMap, Escaping } from '@/internal';

import CoreHtmlNodeRenderer from './CoreHtmlNodeRenderer';
import DefaultUrlSanitizer from './html_utils/DefaultUrlSanitizer';
import HtmlWriter from './HtmlWriter';

/**
 * Extension for {@link HtmlRenderer}.
 */
class HtmlRendererExtension implements Extension {
  extend(rendererBuilder: HtmlRendererBuilder) {}
}

class HtmlRendererBuilder {
  softbreak = '\n';
  escapeHtml = false;
  sanitizeUrls = false;
  urlSanitizer: UrlSanitizer = new DefaultUrlSanitizer();
  percentEncodeUrls = false;
  omitSingleParagraphP = false;
  attributeProviderFactories: AttributeProviderFactory[] = [];
  nodeRendererFactories: HtmlNodeRendererFactory[] = [];

  /**
   * @return the configured {@link HtmlRenderer}
   */
  build(): HtmlRenderer {
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
   * @param softbreak HTML for softbreak
   * @return {@code this}
   */
  setSoftbreak(softbreak: string): HtmlRendererBuilder {
    this.softbreak = softbreak;
    return this;
  }

  /**
   * Whether {@link HtmlInline} and {@link HtmlBlock} should be escaped, defaults to {@code false}.
   * <p>
   * Note that {@link HtmlInline} is only a tag itself, not the text between an opening tag and a closing tag. So
   * markup in the text will be parsed as normal and is not affected by this option.
   *
   * @param escapeHtml true for escaping, false for preserving raw HTML
   * @return {@code this}
   */
  setEscapeHtml(escapeHtml: boolean): HtmlRendererBuilder {
    this.escapeHtml = escapeHtml;
    return this;
  }

  /**
   * Whether {@link Image} src and {@link Link} href should be sanitized, defaults to {@code false}.
   *
   * @param sanitizeUrls true for sanitization, false for preserving raw attribute
   * @return {@code this}
   * @since 0.14.0
   */
  setSanitizeUrls(sanitizeUrls: boolean): HtmlRendererBuilder {
    this.sanitizeUrls = sanitizeUrls;
    return this;
  }

  /**
   * {@link UrlSanitizer} used to filter URL's if {@link #sanitizeUrls} is true.
   *
   * @param urlSanitizer Filterer used to filter {@link Image} src and {@link Link}.
   * @return {@code this}
   * @since 0.14.0
   */
  setUrlSanitizer(urlSanitizer: UrlSanitizer): HtmlRendererBuilder {
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
   * @param percentEncodeUrls true to percent-encode, false for leaving as-is
   * @return {@code this}
   */
  setPercentEncodeUrls(percentEncodeUrls: boolean): HtmlRendererBuilder {
    this.percentEncodeUrls = percentEncodeUrls;
    return this;
  }

  /**
   * Whether documents that only contain a single paragraph should be rendered without the {@code <p>} tag. Set to
   * {@code true} to render without the tag; the default of {@code false} always renders the tag.
   *
   * @return {@code this}
   */
  setOmitSingleParagraphP(omitSingleParagraphP: boolean): HtmlRendererBuilder {
    this.omitSingleParagraphP = omitSingleParagraphP;
    return this;
  }

  /**
   * Add a factory for an attribute provider for adding/changing HTML attributes to the rendered tags.
   *
   * @param attributeProviderFactory the attribute provider factory to add
   * @return {@code this}
   */
  attributeProviderFactory(
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
   * @param nodeRendererFactory the factory for creating a node renderer
   * @return {@code this}
   */
  nodeRendererFactory(nodeRendererFactory: HtmlNodeRendererFactory): HtmlRendererBuilder {
    this.nodeRendererFactories.push(nodeRendererFactory);

    return this;
  }

  /**
   * @param extensions extensions to use on this HTML renderer
   * @return {@code this}
   */
  extensions(extensions: Extension[]): HtmlRendererBuilder {
    for (const extension of extensions) {
      if (extension instanceof HtmlRendererExtension) {
        extension.extend(this);
      }
    }

    return this;
  }
}

class RendererContext implements HtmlNodeRendererContext, AttributeProviderContext {
  private readonly htmlWriter: HtmlWriter;
  private readonly attributeProviders: AttributeProvider[];
  private readonly nodeRendererMap = new NodeRendererMap();
  private readonly context: HtmlRenderer;

  constructor(context: HtmlRenderer, htmlWriter: HtmlWriter) {
    this.context = context;
    this.htmlWriter = htmlWriter;

    this.attributeProviders = [];
    for (const attributeProviderFactory of this.context.attributeProviderFactories) {
      this.attributeProviders.push(attributeProviderFactory.create(this));
    }

    for (const factory of this.context.nodeRendererFactories) {
      let renderer = factory.create(this);
      this.nodeRendererMap.add(renderer);
    }
  }

  shouldEscapeHtml(): boolean {
    return this.context.escapeHtml;
  }

  shouldOmitSingleParagraphP(): boolean {
    return this.context.omitSingleParagraphP;
  }

  shouldSanitizeUrls(): boolean {
    return this.context.sanitizeUrls;
  }

  urlSanitizer(): UrlSanitizer {
    return this.context.urlSanitizer;
  }

  encodeUrl(url: string): string {
    if (this.context.percentEncodeUrls) {
      return Escaping.percentEncodeUrl(url);
    } else {
      return url;
    }
  }

  extendAttributes(
    node: Node,
    tagName: string,
    attributes: Map<string, string>
  ): Map<string, string> {
    const attrs = new Map<string, string>(attributes);
    this.setCustomAttributes(node, tagName, attrs);

    return attrs;
  }

  getWriter(): HtmlWriter {
    return this.htmlWriter;
  }

  getSoftbreak(): string {
    return this.context.softbreak;
  }

  render(node: Node) {
    this.nodeRendererMap.render(node);
  }

  beforeRoot(node: Node) {
    this.nodeRendererMap.beforeRoot(node);
  }

  afterRoot(node: Node) {
    this.nodeRendererMap.afterRoot(node);
  }

  private setCustomAttributes(node: Node, tagName: string, attrs: Map<string, string>) {
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
  readonly softbreak: string;
  readonly escapeHtml: boolean;
  readonly percentEncodeUrls: boolean;
  readonly omitSingleParagraphP: boolean;
  readonly sanitizeUrls: boolean;
  readonly urlSanitizer: UrlSanitizer;
  readonly attributeProviderFactories: AttributeProviderFactory[];
  readonly nodeRendererFactories: HtmlNodeRendererFactory[];

  constructor(builder: HtmlRendererBuilder) {
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
      }
    });
  }

  /**
   * Create a new builder for configuring an {@link HtmlRenderer}.
   *
   * @return a builder
   */
  static builder(): HtmlRendererBuilder {
    return new HtmlRendererBuilder();
  }

  render(node: Node, output?: Appendable) {
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
  static Builder = HtmlRendererBuilder;

  static HtmlRendererExtension = HtmlRendererExtension;
}

export default HtmlRenderer;
