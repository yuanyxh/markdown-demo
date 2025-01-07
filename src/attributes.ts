import type { MarkdownNode } from 'commonmark-java-js';

import {
  AttributeProvider,
  AttributeProviderContext,
  AttributeProviderFactory
} from 'commonmark-java-js';

class NodeAttributeProvider implements AttributeProvider {
  setAttributes(node: MarkdownNode, tagName: string, attributes: Map<string, string>) {
    attributes.set('data-type', node.type);
  }
}

class AttributesProvider implements AttributeProviderFactory {
  create(context: AttributeProviderContext): AttributeProvider {
    return new NodeAttributeProvider();
  }
}

export default AttributesProvider;
