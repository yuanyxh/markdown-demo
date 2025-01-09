import type { MarkdownNode } from 'commonmark-java-js';
import type { Editor } from './main';

import {
  Code,
  FencedCodeBlock,
  HtmlBlock,
  IndentedCodeBlock,
  SoftLineBreak
} from 'commonmark-java-js';

import { findHtmlSelectionPoint, getContentIndex, getSourcePosition } from './utils/source';

const locateHtmlBlock: LocateHandler = function locateHtmlBlock(node, offset) {
  let curr: Node | null = node;

  while (curr) {
    if (!curr.$virtNode) {
      curr = curr.parentNode;

      continue;
    }

    if (!(curr instanceof HTMLElement && curr.$virtNode instanceof HtmlBlock)) {
      return -1;
    }

    if (curr === node) {
      return offset === 0
        ? getSourcePosition(curr.$virtNode).inputIndex
        : getSourcePosition(curr.$virtNode).inputEndIndex;
    }

    return findHtmlSelectionPoint(node, curr, offset);
  }

  return -1;
};

const locateHr: LocateHandler = function locateHr(node, offset) {
  if (!(node instanceof HTMLElement)) {
    return -1;
  }

  let el: Node | null = node.childNodes[offset - 1];

  if (el instanceof Text && el.nodeValue === '\n') {
    el = el.nextSibling;
  }

  if (!(el instanceof HTMLHRElement)) {
    return -1;
  }

  const hrNode = el.$virtNode;

  if (!hrNode) {
    return -1;
  }

  return getSourcePosition(hrNode).inputIndex;
};

const locateCode: LocateHandler = function locateCode(node, offset) {
  if (
    !(
      node instanceof Text &&
      node.parentElement &&
      node.parentElement.tagName.toLocaleLowerCase() === 'code'
    )
  ) {
    return -1;
  }

  const mNode = node.parentElement.$virtNode;

  if (
    !(
      mNode &&
      (mNode instanceof FencedCodeBlock ||
        mNode instanceof IndentedCodeBlock ||
        mNode instanceof Code)
    )
  ) {
    return -1;
  }

  let literal = mNode.getLiteral();

  let { inputIndex, inputEndIndex } = getSourcePosition(mNode);

  if (literal === void 0) {
    return inputEndIndex;
  }

  if (literal.charCodeAt(literal.length - 1) === 10) {
    literal = literal.slice(0, literal.length - 1);
  }

  if (mNode instanceof FencedCodeBlock) {
    inputIndex += (mNode.getOpeningFenceLength() || 0) + (mNode.getFenceIndent() || 0);
  }

  const textStart = this.document.slice(inputIndex, inputEndIndex).indexOf(literal);

  if (textStart === -1) {
    return -1;
  }

  return inputIndex + textStart + offset;
};

const fallbackLocate: LocateHandler = function fallbackLocate(node, offset) {
  if (node instanceof Text && node.parentElement) {
    const el = node.parentElement;

    const textNode = el.$virtNode;

    if (!textNode) {
      return -1;
    }

    const { inputIndex } = getSourcePosition(textNode);

    return inputIndex + offset;
  }

  const element = node as HTMLElement;

  const block = element.$virtNode;

  if (offset === 0) {
    return getContentIndex(block);
  }

  let isSoftLineBreak = false;
  let childMarkdownNode: MarkdownNode | null = block.getChildren()[offset - 1];

  if (childMarkdownNode instanceof SoftLineBreak) {
    childMarkdownNode = childMarkdownNode.getPrevious();

    isSoftLineBreak = true;
  }

  if (!childMarkdownNode) {
    return -1;
  }

  if (isSoftLineBreak) {
    const softLineBreakPos = getSourcePosition(childMarkdownNode).inputEndIndex;

    const continuousLine = childMarkdownNode.getNext()!.getNext();

    if (!continuousLine) {
      return softLineBreakPos + 1;
    }

    return getSourcePosition(continuousLine).inputIndex;
  }

  const { inputEndIndex } = getSourcePosition(childMarkdownNode);

  return inputEndIndex;
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
