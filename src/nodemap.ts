import {
  AttributeProvider,
  AttributeProviderContext,
  AttributeProviderFactory,
} from "../commonmark-java-change/commonmark";

import type { MarkdownNode } from "../commonmark-java-change/commonmark";

let nodeId = 1;

class NodeAttributeProvider implements AttributeProvider {
  private map = new Map<string, MarkdownNode>();

  setAttributes(
    node: MarkdownNode,
    tagName: string,
    attributes: Map<string, string>
  ) {
    const curId = nodeId.toString();

    attributes.set("data-cid", curId);
    attributes.set("data-type", node.type);

    this.map.set(curId, node);

    nodeId++;
  }

  getNodeById(nodeId: string) {
    return this.map.get(nodeId);
  }

  getNodeIdByMap(node: MarkdownNode) {
    for (const [nodeId, mapNode] of this.map) {
      if (node === mapNode) {
        return nodeId;
      }
    }

    return null;
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
