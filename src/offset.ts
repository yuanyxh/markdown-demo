import type { Block } from "../commonmark-java-change/commonmark";
import type NodeMap from "./nodemap";
import {
  FencedCodeBlock,
  IndentedCodeBlock,
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

  const { inputIndex, inputEndIndex } = getSourcePosition(codeBolckNode);

  if (literal === void 0) {
    return inputEndIndex;
  }

  if (literal.charCodeAt(literal.length - 1) === 10) {
    literal = literal.slice(0, literal.length - 1);
  }

  const codeBlockSource = this.source.slice(inputIndex, inputEndIndex);

  const textStart = codeBlockSource.indexOf(literal);

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
  let childMarkdownNode = children[offset - 1];

  if (!childMarkdownNode) {
    return -1;
  }

  const { inputEndIndex } = getSourcePosition(childMarkdownNode);

  return inputEndIndex;
}

export default [getHrOffset, getCodeBlockOffset, getDefaultOffset];
