import type { MarkdownNode, Block } from 'commonmark-java-js';

export function getSourcePosition(node: MarkdownNode) {
  const spans = node.getSourceSpans();

  if (!spans.length) {
    return { inputIndex: 0, inputLength: 0, inputEndIndex: 0 };
  }

  const inputIndex = spans[0].getInputIndex();

  const lastSpan = spans[spans.length - 1];
  const inputEndLength = lastSpan.getInputIndex() + lastSpan.getLength();
  const inputLength = inputEndLength - inputIndex;

  return { inputIndex, inputLength, inputEndIndex: inputEndLength };
}

export function getContentIndex(block: Block) {
  const child = block.getFirstChild();

  if (child === null) {
    const sources = block.getSourceSpans();
    const source = sources[0];

    if (source) {
      return source.getInputIndex() + source.getLength();
    }

    return -1;
  }

  const childSources = child.getSourceSpans();
  const source = childSources[0];

  if (source) {
    return source.getInputIndex();
  }

  return -1;
}

export function findHtmlSelectionPoint(node: Node, parent: HTMLElement, offset: number) {
  let element: HTMLElement | null = null;
  let position = 0;

  if (node instanceof HTMLElement) {
    element = node;
  } else {
    element = node.parentElement;
  }

  while (element && element !== parent) {
    const elementParent = element.parentElement;

    if (!elementParent || elementParent === parent) {
      break;
    }

    position += elementParent.outerHTML.indexOf(element.outerHTML);

    element = elementParent;
  }

  if (node instanceof HTMLElement && offset !== 0) {
    position += node.outerHTML.length;
  } else if (node instanceof Text) {
    if (node.parentElement && node.nodeValue) {
      position += node.parentElement.outerHTML.indexOf(node.nodeValue);
    }

    position += offset;
  }

  return getSourcePosition(parent.$virtNode).inputIndex + position;
}
