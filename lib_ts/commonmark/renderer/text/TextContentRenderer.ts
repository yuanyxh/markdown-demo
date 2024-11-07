import { Extension } from "../../Extension";
import { TextContentNodeRendererFactory } from "./TextContentNodeRendererFactory";
import { Renderer } from "../Renderer";
import LineBreakRendering from "./LineBreakRendering";
import CoreTextContentNodeRenderer from "./CoreTextContentNodeRenderer";
import { Node } from "../../node";
import { Appendable } from "../../../common";
import { TextContentNodeRendererContext } from "./TextContentNodeRendererContext";
import TextContentWriter from "./TextContentWriter";
import { NodeRendererMap } from "../../internal";

/**
 * Extension for {@link TextContentRenderer}.
 */
class TextContentRendererExtension implements Extension {
  extend(rendererBuilder: Builder) {}
}

class Builder {
  public nodeRendererFactories: TextContentNodeRendererFactory[] = [];
  public lineBreakRendering = LineBreakRendering.COMPACT;

  /**
   * @return the configured {@link TextContentRenderer}
   */
  public build(): TextContentRenderer {
    return new TextContentRenderer(this);
  }

  /**
   * Configure how line breaks (newlines) are rendered, see {@link LineBreakRendering}.
   * The default is {@link LineBreakRendering#COMPACT}.
   *
   * @param lineBreakRendering the mode to use
   * @return {@code this}
   */
  public setLineBreakRendering(
    lineBreakRendering: LineBreakRendering
  ): Builder {
    this.lineBreakRendering = lineBreakRendering;

    return this;
  }

  /**
   * Set the value of flag for stripping new lines.
   *
   * @param stripNewlines true for stripping new lines and render text as "single line",
   *                      false for keeping all line breaks
   * @return {@code this}
   * @deprecated Use {@link #lineBreakRendering(LineBreakRendering)} with {@link LineBreakRendering#STRIP} instead
   */
  public stripNewlines(stripNewlines: boolean): Builder {
    this.lineBreakRendering = stripNewlines
      ? LineBreakRendering.STRIP
      : LineBreakRendering.COMPACT;

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
    nodeRendererFactory: TextContentNodeRendererFactory
  ): Builder {
    this.nodeRendererFactories.push(nodeRendererFactory);
    return this;
  }

  /**
   * @param extensions extensions to use on this text content renderer
   * @return {@code this}
   */
  public extensions(extensions: Extension[]): Builder {
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

  public constructor(
    context: TextContentRenderer,
    textContentWriter: TextContentWriter
  ) {
    this.textContentWriter = textContentWriter;
    this.context = context;

    for (const factory of this.context.nodeRendererFactories) {
      const renderer = factory.create(this);
      this.nodeRendererMap.add(renderer);
    }
  }

  public lineBreakRendering(): LineBreakRendering {
    return this.context.lineBreakRendering;
  }

  public stripNewlines(): boolean {
    return this.context.lineBreakRendering == LineBreakRendering.STRIP;
  }

  public getWriter(): TextContentWriter {
    return this.textContentWriter;
  }

  public render(node: Node) {
    this.nodeRendererMap.render(node);
  }
}

/**
 * Renders nodes to plain text content with minimal markup-like additions.
 */
class TextContentRenderer implements Renderer {
  public readonly lineBreakRendering: LineBreakRendering;

  public readonly nodeRendererFactories: TextContentNodeRendererFactory[];

  public constructor(builder: Builder) {
    this.lineBreakRendering = builder.lineBreakRendering;

    this.nodeRendererFactories = [];
    this.nodeRendererFactories.push(...builder.nodeRendererFactories);
    // Add as last. This means clients can override the rendering of core nodes if they want.
    this.nodeRendererFactories.push({
      create(context) {
        return new CoreTextContentNodeRenderer(context);
      },
    });
  }

  /**
   * Create a new builder for configuring a {@link TextContentRenderer}.
   *
   * @return a builder
   */
  public static builder(): Builder {
    return new Builder();
  }

  public render(node: Node, output: Appendable) {
    const context = new RendererContext(
      this,
      new TextContentWriter(output, this.lineBreakRendering)
    );

    context.render(node);
  }

  /**
   * Builder for configuring a {@link TextContentRenderer}. See methods for default configuration.
   */
  public static Builder = Builder;
}

export default TextContentRenderer;
