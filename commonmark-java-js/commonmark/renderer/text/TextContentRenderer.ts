import type { Extension } from '@/Extension';
import type { Node } from '@/node';
import type { Appendable } from '@helpers/index';

import type { TextContentNodeRendererFactory } from './interfaces/TextContentNodeRendererFactory';
import type { TextContentNodeRendererContext } from './interfaces/TextContentNodeRendererContext';
import type { Renderer } from '../interfaces/Renderer';

import { NodeRendererMap } from '@/internal';

import LineBreakRendering from './enums/LineBreakRendering';
import CoreTextContentNodeRenderer from './CoreTextContentNodeRenderer';
import TextContentWriter from './TextContentWriter';

/**
 * Extension for {@link TextContentRenderer}.
 */
class TextContentRendererExtension implements Extension {
  extend(rendererBuilder: TextContentRendererBuilder) {}
}

class TextContentRendererBuilder {
  nodeRendererFactories: TextContentNodeRendererFactory[] = [];
  lineBreakRendering = LineBreakRendering.COMPACT;

  /**
   * @return the configured {@link TextContentRenderer}
   */
  build(): TextContentRenderer {
    return new TextContentRenderer(this);
  }

  /**
   * Configure how line breaks (newlines) are rendered, see {@link LineBreakRendering}.
   * The default is {@link LineBreakRendering#COMPACT}.
   *
   * @param lineBreakRendering the mode to use
   * @return {@code this}
   */
  setLineBreakRendering(lineBreakRendering: LineBreakRendering): TextContentRendererBuilder {
    this.lineBreakRendering = lineBreakRendering;

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
  nodeRendererFactory(
    nodeRendererFactory: TextContentNodeRendererFactory
  ): TextContentRendererBuilder {
    this.nodeRendererFactories.push(nodeRendererFactory);
    return this;
  }

  /**
   * @param extensions extensions to use on this text content renderer
   * @return {@code this}
   */
  extensions(extensions: Extension[]): TextContentRendererBuilder {
    for (const extension of extensions) {
      if (extension instanceof TextContentRendererExtension) {
        extension.extend(this);
      }
    }

    return this;
  }
}

class RendererContext implements TextContentNodeRendererContext {
  private readonly textContentWriter: TextContentWriter;
  private readonly nodeRendererMap = new NodeRendererMap();
  private readonly context: TextContentRenderer;

  constructor(context: TextContentRenderer, textContentWriter: TextContentWriter) {
    this.textContentWriter = textContentWriter;
    this.context = context;

    for (const factory of this.context.nodeRendererFactories) {
      const renderer = factory.create(this);
      this.nodeRendererMap.add(renderer);
    }
  }

  lineBreakRendering(): LineBreakRendering {
    return this.context.lineBreakRendering;
  }

  stripNewlines(): boolean {
    return this.context.lineBreakRendering == LineBreakRendering.STRIP;
  }

  getWriter(): TextContentWriter {
    return this.textContentWriter;
  }

  render(node: Node) {
    this.nodeRendererMap.render(node);
  }
}

/**
 * Renders nodes to plain text content with minimal markup-like additions.
 */
class TextContentRenderer implements Renderer {
  readonly lineBreakRendering: LineBreakRendering;

  readonly nodeRendererFactories: TextContentNodeRendererFactory[];

  constructor(builder: TextContentRendererBuilder) {
    this.lineBreakRendering = builder.lineBreakRendering;

    this.nodeRendererFactories = [];
    this.nodeRendererFactories.push(...builder.nodeRendererFactories);
    // Add as last. This means clients can override the rendering of core nodes if they want.
    this.nodeRendererFactories.push({
      create(context) {
        return new CoreTextContentNodeRenderer(context);
      }
    });
  }

  /**
   * Create a new builder for configuring a {@link TextContentRenderer}.
   *
   * @return a builder
   */
  static builder(): TextContentRendererBuilder {
    return new TextContentRendererBuilder();
  }

  render(node: Node, output: Appendable) {
    const context = new RendererContext(
      this,
      new TextContentWriter(output, this.lineBreakRendering)
    );

    context.render(node);
  }

  /**
   * Builder for configuring a {@link TextContentRenderer}. See methods for default configuration.
   */
  static Builder = TextContentRendererBuilder;

  static TextContentRendererExtension = TextContentRendererExtension;
}

export default TextContentRenderer;
