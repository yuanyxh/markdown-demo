import {
  AttributeProvider,
  AttributeProviderContext,
  AttributeProviderFactory,
} from "../commonmark-java-change/commonmark";

import type { MarkdownNode } from "../commonmark-java-change/commonmark";

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

    let existNodeId = this.mapNodeId.get(node);
    if (existNodeId) {
      attributes.set("data-cid", existNodeId);

      this.mapNode.set(existNodeId, node);
      this.mapNodeId.set(node, existNodeId);
    } else {
      const curId = nodeId.toString();

      this.mapNode.set(curId, node);
      this.mapNodeId.set(node, curId);

      attributes.set("data-cid", curId);

      nodeId++;
    }
  }

  getNodeById(nodeId: string) {
    return this.mapNode.get(nodeId);
  }

  getNodeIdByMap(node: MarkdownNode) {
    return this.mapNodeId.get(node) || null;
  }

  replaceNode(n: MarkdownNode, o: MarkdownNode) {
    const nodeId = this.mapNodeId.get(o);

    if (nodeId) {
      this.mapNodeId.set(n, nodeId);
      this.mapNode.set(nodeId, n);
    }

    this.mapNodeId.delete(o);
  }

  deleteNode(node: MarkdownNode) {
    const nodeId = this.mapNodeId.get(node);

    if (nodeId) {
      this.mapNode.delete("nodeId");
    }

    this.mapNodeId.delete(node);
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

  replaceNode(n: MarkdownNode, o: MarkdownNode) {
    return this.nodeAttributeProvider.replaceNode(n, o);
  }

  deleteNode(node: MarkdownNode) {
    return this.nodeAttributeProvider.deleteNode(node);
  }
}

export default NodeMap;
