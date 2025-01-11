import type { Block } from 'commonmark-java-js';

import TypeTools from './typetools';

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

  if (TypeTools.isElement(node)) {
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

  if (TypeTools.isElement(node) && offset !== 0) {
    position += node.outerHTML.length;
  } else if (TypeTools.isText(node)) {
    if (node.parentElement && node.nodeValue) {
      position += node.parentElement.outerHTML.indexOf(node.nodeValue);
    }

    position += offset;
  }

  return parent.$virtNode.inputIndex + position;
}
