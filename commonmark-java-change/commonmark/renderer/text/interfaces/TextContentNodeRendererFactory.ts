import type { NodeRenderer } from "../../interfaces/NodeRenderer";
import type { TextContentNodeRendererContext } from "./TextContentNodeRendererContext";

/**
 * Factory for instantiating new node renderers when rendering is done.
 *
 * 用于在渲染完成时实例化新节点渲染器的工厂
 */
export interface TextContentNodeRendererFactory {
  /**
   * Create a new node renderer for the specified rendering context.
   *
   * 为指定的渲染上下文创建一个新的节点渲染器
   *
   * @param context the context for rendering (normally passed on to the node renderer)
   * @return a node renderer
   */
  create(context: TextContentNodeRendererContext): NodeRenderer;
}
