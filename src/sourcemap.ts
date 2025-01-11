import type { MarkdownNode } from 'commonmark-java-js';

import type Editor from './editor';

import { isUnDef } from 'commonmark-java-js';

import NodeTools from './utils/nodetools';
import TypeTools from './utils/typetools';

const locateHtmlBlock: LocateHandler = function locateHtmlBlock(node, offset) {
  let curr: Node | null = node;

  while (curr) {
    if (!curr.$virtNode) {
      curr = curr.parentNode;

      continue;
    }

    if (!(TypeTools.isElement(curr) && TypeTools.isHtmlBlock(curr.$virtNode))) {
      return -1;
    }

    if (curr === node) {
      return offset === 0 ? curr.$virtNode.inputIndex : curr.$virtNode.inputEndIndex;
    }

    return NodeTools.findHtmlSelectionPoint(node, curr, offset);
  }

  return -1;
};

const locateHr: LocateHandler = function locateHr(node, offset) {
  if (!TypeTools.isElement(node)) {
    return -1;
  }

  let el: Node | null = node.childNodes[offset - 1];

  if (!el) {
    return -1;
  }

  if (!TypeTools.isThematicBreak(el.$virtNode)) {
    if (
      TypeTools.isBlockNode(el.$virtNode) &&
      el.nextSibling &&
      TypeTools.isThematicBreak(el.nextSibling.$virtNode)
    ) {
      return el.nextSibling.$virtNode.inputIndex;
    }

    return -1;
  }

  return el.$virtNode.inputEndIndex;
};

const locateCode: LocateHandler = function locateCode(node, offset) {
  if (!(TypeTools.isText(node) && node.parentElement)) {
    return -1;
  }

  const mNode = node.parentElement.$virtNode;

  if (!(mNode && TypeTools.isCode(mNode))) {
    return -1;
  }

  return NodeTools.codeIndexOf(this.source, mNode, offset);
};

const fallbackLocate: LocateHandler = function fallbackLocate(node, offset) {
  if (TypeTools.isText(node) && node.parentElement) {
    const el = node.parentElement;

    const textNode = el.$virtNode;

    if (!textNode) {
      return -1;
    }

    return textNode.inputIndex + offset;
  }

  const element = node as HTMLElement;

  const block = element.$virtNode;

  if (offset === 0) {
    return NodeTools.getContentIndex(block);
  }

  let isSoftLineBreak = false;
  let childMarkdownNode: MarkdownNode | null = block.children[offset - 1];

  if (childMarkdownNode.isBlock() && childMarkdownNode.getNext()) {
    childMarkdownNode = childMarkdownNode.getNext();
  }

  if (childMarkdownNode && TypeTools.isSoftLineBreak(childMarkdownNode)) {
    childMarkdownNode = childMarkdownNode.getPrevious();

    isSoftLineBreak = true;
  }

  if (!childMarkdownNode) {
    return -1;
  }

  if (isSoftLineBreak) {
    const continuousLine = childMarkdownNode.getNext()!.getNext();

    if (!continuousLine) {
      return childMarkdownNode.inputEndIndex + 1;
    }

    return continuousLine.inputIndex;
  }

  return childMarkdownNode.inputEndIndex;
};

interface LocateHandler {
  (this: Editor, node: Node, offset: number): number;
}

interface SourceMapConfig {
  context: Editor;
  locateHandlers?: LocateHandler[];
}

class SourceMap {
  private context: Editor;

  private locateHandlers = [locateHtmlBlock, locateHr, locateCode, fallbackLocate];

  public constructor(config: SourceMapConfig) {
    this.context = config.context;

    this.locateHandlers = [...(config.locateHandlers || []), ...this.locateHandlers];
  }

  public locate(range: StaticRange) {
    const from = this.locateHandlers.reduce(
      (prev, locate) =>
        prev === -1 ? locate.call(this.context, range.startContainer, range.startOffset) : prev,
      -1
    );

    const to = this.locateHandlers.reduce(
      (prev, locate) =>
        prev === -1 ? locate.call(this.context, range.endContainer, range.endOffset) : prev,
      -1
    );

    return { from, to };
  }
}

export default SourceMap;
