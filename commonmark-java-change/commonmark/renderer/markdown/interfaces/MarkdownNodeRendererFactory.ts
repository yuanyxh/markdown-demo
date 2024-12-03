import type { NodeRenderer } from "../../interfaces/NodeRenderer";
import type { MarkdownNodeRendererContext } from "./MarkdownNodeRendererContext";

/**
 * Factory for instantiating new node renderers for rendering custom nodes.
 *
 * 用于实例化新 NodeRenderer 以渲染自定义节点的工厂
 */
export interface MarkdownNodeRendererFactory {
  /**
   * Create a new node renderer for the specified rendering context.
   *
   * 为指定的渲染上下文创建一个新的节点渲染器
   *
   * @param context the context for rendering (normally passed on to the node renderer)
   * @return a node renderer
   */
  create(context: MarkdownNodeRendererContext): NodeRenderer;

  /**
   * 该工厂希望在普通文本中转义的其他特殊字符；现在只允许使用 ASCII 字符
   *
   * @return the additional special characters that this factory would like to have escaped in normal text; currently
   * only ASCII characters are allowed
   */
  getSpecialCharacters(): Set<string>;
}
