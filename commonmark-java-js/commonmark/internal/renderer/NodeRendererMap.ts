import type { MarkdownNode } from "@/node";
import type { NodeRenderer } from "@/renderer";

class NodeRendererMap {
  private readonly nodeRenderers: NodeRenderer[] = [];
  private readonly renderers = new Map<typeof MarkdownNode, NodeRenderer>();

  public add(nodeRenderer: NodeRenderer) {
    this.nodeRenderers.push(nodeRenderer);

    for (const nodeType of nodeRenderer.getNodeTypes()) {
      // The first node renderer for a node type "wins".
      if (!this.renderers.has(nodeType)) {
        this.renderers.set(nodeType, nodeRenderer);
      }
    }
  }

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
