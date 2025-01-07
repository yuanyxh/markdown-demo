import type { MarkdownNode } from 'commonmark-java-js';

import {
  Code,
  FencedCodeBlock,
  HtmlBlock,
  HtmlInline,
  IndentedCodeBlock,
  SoftLineBreak
} from 'commonmark-java-js';

import { getContentIndex, getSourcePosition } from './utils/source';

type TGetOffset = (this: INodeRange, node: Node, offset: number) => number;

const getHtmlOffset: TGetOffset = function getHtmlOffset(node, offset) {
  let curr: Node | null = node;

  while (curr) {
    if (curr.$virtNode) {
      if (!(curr.$virtNode instanceof HtmlBlock || curr.$virtNode instanceof HtmlInline)) {
        return -1;
      }
    } else {
      curr = node.parentNode;
    }
  }

  return -1;
};

const getHrOffset: TGetOffset = function getHrOffset(node, offset) {
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

const getCodeOffset: TGetOffset = function getCodeOffset(node, offset) {
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

  const textStart = this.source.slice(inputIndex, inputEndIndex).indexOf(literal);

  if (textStart === -1) {
    return -1;
  }

  return inputIndex + textStart + offset;
};

const fallbackGetOffset: TGetOffset = function fallbackGetOffset(node, offset) {
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

  const children = block.getChildren();
  let childMarkdownNode: MarkdownNode | null = children[offset - 1];
  let isSoftLineBreak = false;

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

const offsetHandlers: TGetOffset[] = [getHtmlOffset, getHrOffset, getCodeOffset, fallbackGetOffset];

export function getOffset(this: INodeRange, offset: number, get: TGetOffset) {
  if (offset === -1) {
    return get.call(this, this.node, this.offset);
  }

  return offset;
}

export function runOffset(this: Pick<INodeRange, 'source'>, range: StaticRange) {
  const start = offsetHandlers.reduce(
    getOffset.bind({
      node: range.startContainer,
      offset: range.startOffset,
      ...this
    }),
    -1
  );

  const end = offsetHandlers.reduce(
    getOffset.bind({
      node: range.endContainer,
      offset: range.endOffset,
      ...this
    }),
    -1
  );

  return { start: start, end: end };
}
