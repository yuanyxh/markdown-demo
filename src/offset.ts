import type { Block, MarkdownNode } from "../commonmark-java-change/commonmark";
import type NodeMap from "./nodemap";
import {
  FencedCodeBlock,
  IndentedCodeBlock,
  SoftLineBreak,
} from "../commonmark-java-change/commonmark";
import { getContentIndex, getSourcePosition } from "./utils/source";

function getHrOffset(
  this: INodeRange,
  node: Node,
  offset: number,
  nodeMap: NodeMap
) {
  if (!(node instanceof HTMLElement)) {
    return -1;
  }

  let el: Node | null = node.childNodes[offset - 1];

  if (el instanceof Text && el.nodeValue === "\n") {
    el = el.nextSibling;
  }

  if (!(el instanceof HTMLHRElement)) {
    return -1;
  }

  const hrNode = nodeMap.getNodeByElement(el);

  if (!hrNode) {
    return -1;
  }

  return getSourcePosition(hrNode).inputIndex;
}

function getCodeBlockOffset(
  this: INodeRange,
  node: Node,
  offset: number,
  nodeMap: NodeMap
) {
  if (
    !(
      node instanceof Text &&
      node.parentElement &&
      node.parentElement.tagName.toLocaleLowerCase() === "code"
    )
  ) {
    return -1;
  }

  const codeBolckNode = nodeMap.getNodeByElement(node.parentElement);

  if (
    !(
      codeBolckNode &&
      (codeBolckNode instanceof FencedCodeBlock ||
        codeBolckNode instanceof IndentedCodeBlock)
    )
  ) {
    return -1;
  }

  let literal = codeBolckNode.getLiteral();

  let { inputIndex, inputEndIndex } = getSourcePosition(codeBolckNode);

  if (literal === void 0) {
    return inputEndIndex;
  }

  if (literal.charCodeAt(literal.length - 1) === 10) {
    literal = literal.slice(0, literal.length - 1);
  }

  if (codeBolckNode instanceof FencedCodeBlock) {
    inputIndex +=
      (codeBolckNode.getOpeningFenceLength() || 0) +
      (codeBolckNode.getFenceIndent() || 0);
  }

  const textStart = this.source
    .slice(inputIndex, inputEndIndex)
    .indexOf(literal);

  if (textStart === -1) {
    return -1;
  }

  return inputIndex + textStart + offset;
}

function getDefaultOffset(
  this: INodeRange,
  node: Node,
  offset: number,
  nodeMap: NodeMap
) {
  if (node instanceof Text && node.parentElement) {
    const el = node.parentElement;

    const textNode = nodeMap.getNodeByElement(el);

    if (!textNode) {
      return -1;
    }

    const { inputIndex } = getSourcePosition(textNode);

    return inputIndex + offset;
  }

  const element = node as HTMLElement;

  const block = nodeMap.getNodeByElement(element) as Block;

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
}

export default [getHrOffset, getCodeBlockOffset, getDefaultOffset];
