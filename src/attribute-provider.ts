import type {
  MarkdownNode,
  AttributeProvider,
  AttributeProviderFactory,
  AttributeProviderContext,
} from "./packages/commonmark";

class NodeMapAttributeProvider implements AttributeProvider {
  private nextId = 1;
  private markdownNodeMap = new Map<string, MarkdownNode>();

  getNodeForId(id: string) {
    return this.markdownNodeMap.get(id);
  }

  getIdForNode(node: MarkdownNode) {
    for (const [id, recordNode] of this.markdownNodeMap) {
      if (node === recordNode) {
        return id;
      }
    }

    throw new Error("Can not find id by node");
  }

  setAttributes(
    node: MarkdownNode,
    tagName: string,
    attributes: Map<string, string>
  ): void {
    const id = `node-${this.nextId++}`;

    attributes.set("data-id", id);

    this.markdownNodeMap.set(id, node);
  }
}

export class NodeMapAttributeProviderFactory
  implements AttributeProviderFactory
{
  private nodeMapAttributeProviderFactory!: NodeMapAttributeProvider;

  getNode(id: string) {
    return this.nodeMapAttributeProviderFactory.getNodeForId(id);
  }

  getId(node: MarkdownNode) {
    return this.nodeMapAttributeProviderFactory.getIdForNode(node);
  }

  create(context: AttributeProviderContext): AttributeProvider {
    this.nodeMapAttributeProviderFactory = new NodeMapAttributeProvider();

    return this.nodeMapAttributeProviderFactory;
  }
}
