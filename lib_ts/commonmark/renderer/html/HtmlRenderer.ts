import { Extension } from "./../../Extension";
import { HtmlNodeRendererContext } from "./HtmlNodeRendererContext";
import { AttributeProviderFactory } from "./AttributeProviderFactory";
import { Renderer } from "./../Renderer";
import { UrlSanitizer } from "./UrlSanitizer";
import { HtmlNodeRendererFactory } from "./HtmlNodeRendererFactory";
import { NodeRenderer } from "../NodeRenderer";
import CoreHtmlNodeRenderer from "./CoreHtmlNodeRenderer";
import HtmlWriter from "./HtmlWriter";
import Appendable from "../../../common/Appendable";
import { Node } from "../../node";
import DefaultUrlSanitizer from "./DefaultUrlSanitizer";
import { AttributeProviderContext } from "./AttributeProviderContext";
import { NodeRendererMap, Escaping } from "../../internal";
import { AttributeProvider } from "./AttributeProvider";

/**
 * Extension for {@link HtmlRenderer}.
 */
class HtmlRendererExtension implements Extension {
  extend(rendererBuilder: Builder) {}
}

class Builder {
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
   * @param softbreak HTML for softbreak
   * @return {@code this}
   */
  public setSoftbreak(softbreak: string): Builder {
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
  public setEscapeHtml(escapeHtml: boolean): Builder {
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
  public setSanitizeUrls(sanitizeUrls: boolean): Builder {
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
  public setUrlSanitizer(urlSanitizer: UrlSanitizer): Builder {
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
  public setPercentEncodeUrls(percentEncodeUrls: boolean): Builder {
    this.percentEncodeUrls = percentEncodeUrls;
    return this;
  }

  /**
   * Whether documents that only contain a single paragraph should be rendered without the {@code <p>} tag. Set to
   * {@code true} to render without the tag; the default of {@code false} always renders the tag.
   *
   * @return {@code this}
   */
  public setOmitSingleParagraphP(omitSingleParagraphP: boolean): Builder {
    this.omitSingleParagraphP = omitSingleParagraphP;
    return this;
  }

  /**
   * Add a factory for an attribute provider for adding/changing HTML attributes to the rendered tags.
   *
   * @param attributeProviderFactory the attribute provider factory to add
   * @return {@code this}
   */
  public attributeProviderFactory(
    attributeProviderFactory: AttributeProviderFactory
  ): Builder {
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
  public nodeRendererFactory(
    nodeRendererFactory: HtmlNodeRendererFactory
  ): Builder {
    this.nodeRendererFactories.push(nodeRendererFactory);

    return this;
  }

  /**
   * @param extensions extensions to use on this HTML renderer
   * @return {@code this}
   */
  public extensions(extensions: Extension[]): Builder {
    for (const extension of extensions) {
      if (extension instanceof HtmlRendererExtension) {
        extension.extend(this);
      }
    }

    return this;
  }
}

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

  public shouldEscapeHtml(): boolean {
    return this.context.escapeHtml;
  }

  public shouldOmitSingleParagraphP(): boolean {
    return this.context.omitSingleParagraphP;
  }

  public shouldSanitizeUrls(): boolean {
    return this.context.sanitizeUrls;
  }

  public urlSanitizer(): UrlSanitizer {
    return this.context.urlSanitizer;
  }

  public encodeUrl(url: string): string {
    if (this.context.percentEncodeUrls) {
      return Escaping.percentEncodeUrl(url);
    } else {
      return url;
    }
  }

  public extendAttributes(
    node: Node,
    tagName: string,
    attributes: Map<string, string>
  ): Map<string, string> {
    const attrs = new Map<string, string>(attributes);
    this.setCustomAttributes(node, tagName, attrs);

    return attrs;
  }

  public getWriter(): HtmlWriter {
    return this.htmlWriter;
  }

  public getSoftbreak(): string {
    return this.context.softbreak;
  }

  public render(node: Node | null) {
    this.nodeRendererMap.render(node);
  }

  public beforeRoot(node: Node | null) {
    this.nodeRendererMap.beforeRoot(node);
  }

  public afterRoot(node: Node | null) {
    this.nodeRendererMap.afterRoot(node);
  }

  private setCustomAttributes(
    node: Node,
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

  public constructor(builder: Builder) {
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
  public static builder(): Builder {
    return new Builder();
  }

  public render(node: Node, output: Appendable) {
    const context = new RendererContext(this, new HtmlWriter(output));

    context.beforeRoot(node);
    context.render(node);
    context.afterRoot(node);
  }

  /**
   * Builder for configuring an {@link HtmlRenderer}. See methods for default configuration.
   */
  public static Builder = Builder;
}

export default HtmlRenderer;