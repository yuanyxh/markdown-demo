import type { Extension } from 'commonmark-java-js';
import type { MarkdownNode } from 'commonmark-java-js';
import type { Renderer } from 'commonmark-java-js';
import type { NodeRenderer } from 'commonmark-java-js';

import type { HtmlNodeRendererContext } from './interfaces/HtmlNodeRendererContext';
import type { AttributeProviderFactory } from './interfaces/AttributeProviderFactory';
import type { AttributeProvider } from './interfaces/AttributeProvider';
import type { AttributeProviderContext } from './interfaces/AttributeProviderContext';
import type { HtmlNodeRendererFactory } from './interfaces/HtmlNodeRendererFactory';

import { Appendable } from 'commonmark-java-js';
import { NodeRendererMap } from 'commonmark-java-js';

import CoreHtmlNodeRenderer from './CoreHtmlNodeRenderer';
import HtmlWriter from './HtmlWriter';

/**
 * Extension for {@link HtmlRenderer}.
 */
class HtmlRendererExtension implements Extension {
  extend(rendererBuilder: HtmlRendererBuilder) {}
}

class HtmlRendererBuilder {
  public softbreak = '<br />';
  public attributeProviderFactories: AttributeProviderFactory[] = [];
  public nodeRendererFactories: HtmlNodeRendererFactory[] = [];

  /**
   * @return the configured {@link HtmlRenderer}
   */
  public build(): HtmlRenderer {
    return new HtmlRenderer(this);
  }

  /**
   * Add a factory for an attribute provider for adding/changing HTML attributes to the rendered tags.
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
   * @param nodeRendererFactory the factory for creating a node renderer
   * @return {@code this}
   */
  public nodeRendererFactory(nodeRendererFactory: HtmlNodeRendererFactory): HtmlRendererBuilder {
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

class RendererContext implements HtmlNodeRendererContext, AttributeProviderContext {
  private readonly htmlWriter: HtmlWriter;
  private readonly attributeProviders: AttributeProvider[];
  private readonly nodeRendererMap = new NodeRendererMap();
  private readonly context: HtmlRenderer;

  public constructor(context: HtmlRenderer, htmlWriter: HtmlWriter) {
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

  public extendAttributes(
    node: MarkdownNode,
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

  public render(node: MarkdownNode) {
    this.nodeRendererMap.render(node);
  }

  public beforeRoot(node: MarkdownNode) {
    this.nodeRendererMap.beforeRoot(node);
  }

  public afterRoot(node: MarkdownNode) {
    this.nodeRendererMap.afterRoot(node);
  }

  private setCustomAttributes(node: MarkdownNode, tagName: string, attrs: Map<string, string>) {
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
  public readonly attributeProviderFactories: AttributeProviderFactory[];
  public readonly nodeRendererFactories: HtmlNodeRendererFactory[];

  public constructor(builder: HtmlRendererBuilder) {
    this.softbreak = builder.softbreak;
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
  public static builder(): HtmlRendererBuilder {
    return new HtmlRendererBuilder();
  }

  public render(node: MarkdownNode) {
    const output = new Appendable();

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
