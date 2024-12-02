import type { MarkdownNode } from "../../node";
import type { NodeRenderer } from "./../../renderer";

/**
 * 节点渲染器的映射类
 *
 * 通过节点的类型获取对应节点类型中优先级最高的 Renderer 实例
 */
class NodeRendererMap {
  private readonly nodeRenderers: NodeRenderer[] = [];
  private readonly renderers = new Map<typeof MarkdownNode, NodeRenderer>();

  /**
   * 添加一个节点渲染器
   *
   * @param nodeRenderer
   */
  public add(nodeRenderer: NodeRenderer) {
    this.nodeRenderers.push(nodeRenderer);

    for (const nodeType of nodeRenderer.getNodeTypes()) {
      // The first node renderer for a node type "wins".
      if (!this.renderers.has(nodeType)) {
        this.renderers.set(nodeType, nodeRenderer);
      }
    }
  }

  /**
   * 渲染节点
   *
   * @param node
   */
  public render(node: MarkdownNode) {
    const nodeRenderer = this.renderers.get(
      node.constructor as unknown as typeof MarkdownNode
    );

    if (nodeRenderer) {
      nodeRenderer.render(node);
    }
  }

  public beforeRoot(node: MarkdownNode) {
    this.nodeRenderers.forEach((r) => r.beforeRoot(node));
  }

  public afterRoot(node: MarkdownNode) {
    this.nodeRenderers.forEach((r) => r.afterRoot(node));
  }
}

export default NodeRendererMap;
