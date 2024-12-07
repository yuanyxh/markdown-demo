import type { Extension } from "../../Extension";
import type { TextContentNodeRendererFactory } from "./interfaces/TextContentNodeRendererFactory";
import type { MarkdownNode } from "../../node";
import type { TextContentNodeRendererContext } from "./interfaces/TextContentNodeRendererContext";
import type { Renderer } from "../interfaces/Renderer";
import type { Appendable } from "../../../helpers";

import LineBreakRendering from "./enums/LineBreakRendering";
import CoreTextContentNodeRenderer from "./CoreTextContentNodeRenderer";
import TextContentWriter from "./TextContentWriter";
import { NodeRendererMap } from "../../internal";

/**
 * Extension for {@link TextContentRenderer}.
 */
class TextContentRendererExtension implements Extension {
  extend(rendererBuilder: TextContentRendererBuilder) {}
}

/**
 * TextContentRenderer 的编译器
 */
class TextContentRendererBuilder {
  public nodeRendererFactories: TextContentNodeRendererFactory[] = [];
  public lineBreakRendering = LineBreakRendering.COMPACT;

  /**
   * 编译一个 TextContentRenderer 实例
   *
   * @return the configured {@link TextContentRenderer}
   */
  public build(): TextContentRenderer {
    return new TextContentRenderer(this);
  }

  /**
   * Configure how line breaks (newlines) are rendered, see {@link LineBreakRendering}.
   * The default is {@link LineBreakRendering#COMPACT}.
   *
   * 配置换行符的呈现方式
   *
   * @param lineBreakRendering the mode to use
   * @return {@code this}
   */
  public setLineBreakRendering(
    lineBreakRendering: LineBreakRendering
  ): TextContentRendererBuilder {
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
   * 添加用于实例化 NodeRenderer 的工厂（渲染时完成）
   * 允许覆盖默认的节点渲染和自定义节点渲染
   * <p>
   * 如果为同一节点类型创建了多个节点渲染器，则第一个添加的工厂渲染器生效
   * 默认渲染器排在最后，优先级最低
   *
   * @param nodeRendererFactory the factory for creating a node renderer
   * @return {@code this}
   */
  public nodeRendererFactory(
    nodeRendererFactory: TextContentNodeRendererFactory
  ): TextContentRendererBuilder {
    this.nodeRendererFactories.push(nodeRendererFactory);
    return this;
  }

  /**
   * @param extensions extensions to use on this text content renderer
   * @return {@code this}
   */
  public extensions(extensions: Extension[]): TextContentRendererBuilder {
    for (const extension of extensions) {
      if (extension instanceof TextContentRendererExtension) {
        extension.extend(this);
      }
    }

    return this;
  }
}

/**
 * 渲染上下文
 */
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

  /**
   * 返回换行的呈现方式
   *
   * @returns
   */
  public lineBreakRendering(): LineBreakRendering {
    return this.context.lineBreakRendering;
  }

  /**
   * 返回新行的呈现方式
   *
   * @returns
   */
  public stripNewlines(): boolean {
    return this.context.lineBreakRendering == LineBreakRendering.STRIP;
  }

  /**
   * 返回 TextContentWriter 实例
   *
   * @returns
   */
  public getWriter(): TextContentWriter {
    return this.textContentWriter;
  }

  /**
   * 渲染指定节点
   *
   * @param node
   */
  public render(node: MarkdownNode) {
    this.nodeRendererMap.render(node);
  }
}

/**
 * Renders nodes to plain text content with minimal markup-like additions.
 *
 * 将节点渲染为纯文本内容，并添加最少的类似标记的内容
 */
class TextContentRenderer implements Renderer {
  public readonly lineBreakRendering: LineBreakRendering;

  public readonly nodeRendererFactories: TextContentNodeRendererFactory[];

  public constructor(builder: TextContentRendererBuilder) {
    this.lineBreakRendering = builder.lineBreakRendering;

    this.nodeRendererFactories = [];
    this.nodeRendererFactories.push(...builder.nodeRendererFactories);
    // Add as last. This means clients can override the rendering of core nodes if they want.
    // 添加为最后。这意味着客户端可以根据需要覆盖核心节点的渲染
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
  public static builder(): TextContentRendererBuilder {
    return new TextContentRendererBuilder();
  }

  public render(node: MarkdownNode, output: Appendable) {
    const context = new RendererContext(
      this,
      new TextContentWriter(output, this.lineBreakRendering)
    );

    context.render(node);
  }

  /**
   * Builder for configuring a {@link TextContentRenderer}. See methods for default configuration.
   */
  public static Builder = TextContentRendererBuilder;

  public static TextContentRendererExtension = TextContentRendererExtension;
}

export default TextContentRenderer;
