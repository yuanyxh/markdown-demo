import type { MarkdownNode } from "commonmark-java-js";

import {
  AttributeProvider,
  AttributeProviderContext,
  AttributeProviderFactory,
} from "commonmark-java-js";

let nodeId = 1;

class NodeAttributeProvider implements AttributeProvider {
  private mapNode = new Map<string, MarkdownNode>();
  private mapNodeId = new Map<MarkdownNode, string>();

  setAttributes(
    node: MarkdownNode,
    tagName: string,
    attributes: Map<string, string>
  ) {
    attributes.set("data-type", node.type);

    const curId = nodeId.toString();

    this.mapNode.set(curId, node);
    this.mapNodeId.set(node, curId);

    attributes.set("data-cid", curId);

    nodeId++;
  }

  getNodeById(nodeId: string) {
    return this.mapNode.get(nodeId);
  }

  getNodeIdByMap(node: MarkdownNode) {
    return this.mapNodeId.get(node) || null;
  }
}

class NodeMap implements AttributeProviderFactory {
  private nodeAttributeProvider = new NodeAttributeProvider();

  create(context: AttributeProviderContext): AttributeProvider {
    return this.nodeAttributeProvider;
  }

  getNodeById(nodeId: string) {
    return this.nodeAttributeProvider.getNodeById(nodeId);
  }

  getNodeByElement(element: HTMLElement) {
    const nodeId = element.dataset.cid;

    if (nodeId) {
      return this.getNodeById(nodeId);
    }

    return void 0;
  }

  getNodeIdByMap(node: MarkdownNode) {
    return this.nodeAttributeProvider.getNodeIdByMap(node);
  }
}

export default NodeMap;
