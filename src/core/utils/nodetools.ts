import type { Block, MarkdownNode } from 'commonmark-java-js';

import type { MarkdownCode } from '@/interfaces';

import { isUnDef } from 'commonmark-java-js';
import TypeTools from './typetools';
import HtmlTools from './htmltools';

interface TextRange {
  textStart: number;
  textEnd: number;
}

class NodeTools {
  public static getContentIndex(block: Block): number {
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

  public static codeIndexOf(source: string | String, node: MarkdownCode, offset: number): number {
    let literal = node.getLiteral();

    let { inputIndex, inputEndIndex } = node;

    if (isUnDef(literal)) {
      return inputEndIndex;
    }

    if (literal.charCodeAt(literal.length - 1) === 10) {
      literal = literal.slice(0, literal.length - 1);
    }

    if (TypeTools.isFencedCodeBlock(node)) {
      inputIndex += (node.getOpeningFenceLength() || 0) + (node.getFenceIndent() || 0);
    }

    const textRange = this.codePoint(source, node);

    if (typeof textRange === 'boolean') {
      return -1;
    }

    return inputIndex + textRange.textStart + offset;
  }

  public static codePoint(source: string | String, node: MarkdownCode): TextRange | false {
    let literal = node.getLiteral();

    if (isUnDef(literal)) {
      return false;
    }

    let { inputIndex, inputEndIndex } = node;

    if (literal.charCodeAt(literal.length - 1) === 10) {
      literal = literal.slice(0, literal.length - 1);
    }

    if (TypeTools.isFencedCodeBlock(node)) {
      inputIndex += (node.getOpeningFenceLength() || 0) + (node.getFenceIndent() || 0);
    }

    const textStart = source.slice(inputIndex, inputEndIndex).indexOf(literal);
    const textEnd = literal.length;

    if (textStart === -1) {
      return false;
    }

    return { textStart, textEnd };
  }

  public static findHtmlSelectionPoint(node: Node, parent: HTMLElement, offset: number): number {
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

      position += HtmlTools.indexOf(elementParent.outerHTML, element.outerHTML);

      element = elementParent;
    }

    if (TypeTools.isElement(node) && offset !== 0) {
      position += HtmlTools.unescape(node.outerHTML).length;
    } else if (TypeTools.isText(node)) {
      if (node.parentElement && node.nodeValue) {
        if (node.parentElement === parent) {
          position += HtmlTools.indexOf(node.parentElement.innerHTML, node.nodeValue);
        } else {
          position += HtmlTools.indexOf(node.parentElement.outerHTML, node.nodeValue);
        }
      }

      position += offset;
    }

    return parent.$virtNode.inputIndex + position;
  }

  public static getConstructor(node: MarkdownNode): typeof MarkdownNode {
    return Object.getPrototypeOf(node).constructor;
  }
}

export default NodeTools;
