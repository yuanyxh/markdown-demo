import type { Extension } from '@/Extension';

import type { Node } from '@/node';

import type { MarkdownNodeRendererContext } from './interfaces/MarkdownNodeRendererContext';
import type { MarkdownNodeRendererFactory } from './interfaces/MarkdownNodeRendererFactory';
import type { Renderer } from '../interfaces/Renderer';
import type { NodeRenderer } from '../interfaces/NodeRenderer';

import { Appendable } from '@helpers/index';
import { NodeRendererMap } from '@/internal';

import CoreMarkdownNodeRenderer from './CoreMarkdownNodeRenderer';
import MarkdownWriter from './MarkdownWriter';

class MarkdownRendererExtension implements Extension {
  /**
   * Extend Markdown rendering, usually by registering custom node renderers using {@link Builder#nodeRendererFactory}.
   *
   * @param rendererBuilder the renderer builder to extend
   */
  extend(rendererBuilder: MarkdownNodeRendererBuilder) {}
}

class MarkdownNodeRendererBuilder {
  readonly nodeRendererFactories: MarkdownNodeRendererFactory[] = [];

  /**
   * @return the configured {@link MarkdownRenderer}
   */
  build(): MarkdownRenderer {
    return new MarkdownRenderer(this);
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
    nodeRendererFactory: MarkdownNodeRendererFactory
  ): MarkdownNodeRendererBuilder {
    this.nodeRendererFactories.push(nodeRendererFactory);

    return this;
  }

  /**
   * @param extensions extensions to use on this renderer
   * @return {@code this}
   */
  extensions(extensions: Extension[]): MarkdownNodeRendererBuilder {
    for (const extension of extensions) {
      if (extension instanceof MarkdownRendererExtension) {
        extension.extend(this);
      }
    }

    return this;
  }
}

class RendererContext implements MarkdownNodeRendererContext {
  private readonly writer: MarkdownWriter;
  private readonly nodeRendererMap: NodeRendererMap = new NodeRendererMap();
  private readonly additionalTextEscapes: Set<string>;
  private readonly context: MarkdownRenderer;

  constructor(context: MarkdownRenderer, writer: MarkdownWriter) {
    // Set fields that are used by interface
    this.writer = writer;
    this.context = context;

    const escapes = new Set<string>();
    for (const factory of this.context.nodeRendererFactories) {
      for (const value of factory.getSpecialCharacters()) {
        escapes.add(value);
      }
    }

    this.additionalTextEscapes = escapes;

    // The first node renderer for a node type "wins".
    for (let i = this.context.nodeRendererFactories.length - 1; i >= 0; i--) {
      const nodeRendererFactory = this.context.nodeRendererFactories[i];
      // Pass in this as context here, which uses the fields set above
      const nodeRenderer = nodeRendererFactory.create(this);
      this.nodeRendererMap.add(nodeRenderer);
    }
  }

  getWriter(): MarkdownWriter {
    return this.writer;
  }

  render(node: Node) {
    this.nodeRendererMap.render(node);
  }

  getSpecialCharacters(): Set<string> {
    return this.additionalTextEscapes;
  }
}

/**
 * Renders nodes to Markdown (CommonMark syntax); use {@link #builder()} to create a renderer.
 * <p>
 * Note that it doesn't currently preserve the exact syntax of the original input Markdown (if any):
 * <ul>
 *     <li>Headings are output as ATX headings if possible (multi-line headings need Setext headings)</li>
 *     <li>Links are always rendered as inline links (no support for reference links yet)</li>
 *     <li>Escaping might be over-eager, e.g. a plain {@code *} might be escaped
 *     even though it doesn't need to be in that particular context</li>
 *     <li>Leading whitespace in paragraphs is not preserved</li>
 * </ul>
 * However, it should produce Markdown that is semantically equivalent to the input, i.e. if the Markdown was parsed
 * again and compared against the original AST, it should be the same (minus bugs).
 */
export class MarkdownRenderer implements Renderer {
  readonly nodeRendererFactories: MarkdownNodeRendererFactory[];

  constructor(builder: MarkdownNodeRendererBuilder) {
    this.nodeRendererFactories = [];

    this.nodeRendererFactories.push(...builder.nodeRendererFactories);
    // Add as last. This means clients can override the rendering of core nodes if they want.

    this.nodeRendererFactories.push({
      create(context: MarkdownNodeRendererContext): NodeRenderer {
        return new CoreMarkdownNodeRenderer(context);
      },

      getSpecialCharacters() {
        return new Set();
      }
    });
  }

  /**
   * Create a new builder for configuring a {@link MarkdownRenderer}.
   *
   * @return a builder
   */
  static builder(): MarkdownNodeRendererBuilder {
    return new MarkdownNodeRendererBuilder();
  }

  render(node: Node, output?: Appendable) {
    output = output ? output : new Appendable();

    let context = new RendererContext(this, new MarkdownWriter(output));

    context.render(node);

    return output.toString();
  }

  /**
   * Builder for configuring a {@link MarkdownRenderer}. See methods for default configuration.
   */
  static Builder = MarkdownNodeRendererBuilder;

  static MarkdownRendererExtension = MarkdownRendererExtension;
}

export default MarkdownRenderer;
