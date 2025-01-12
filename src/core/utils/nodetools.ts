import type { Block, MarkdownNode } from 'commonmark-java-js';

import type { MarkdownCode } from '@/interfaces';

import { isUnDef } from 'commonmark-java-js';
import TypeTools from './typetools';
import HtmlTools from './htmltools';

interface TextRange {
  textStart: number;
  textEnd: number;
}

/** Auxiliary tool class for Markdown node. */
class NodeTools {
  /**
   * Obtain the correct source code position of the Markdown block node.
   *
   * @param block Markdown block nodes
   * @returns {number} Position at the source code
   */
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

  /**
   * Obtain the correct source code position of Markdown code nodes or code block nodes.
   *
   * @param source The source code of the current editor’s document.
   * @param node Markdown node
   * @param offset Code offset
   * @returns {number} Position at the source code
   */
  public static codeIndexOf(source: string, node: MarkdownCode, offset: number): number {
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

  /**
   * Obtain the position of the code content in a code node or code block node.
   *
   * @param source The source code of the current editor’s document.
   * @param node Code or CodeBlock
   * @returns {TextRange | false} code content index in the {@link MarkdownCode}
   */
  public static codePoint(source: string, node: MarkdownCode): TextRange | false {
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

  /**
   * Find the code position of an HTML block node.
   *
   * @param node DOM Node
   * @param parent Parent element of the node
   * @param offset Node offset
   * @returns {number} Position in the source code.
   */
  public static findHtmlBlockSrcPos(node: Node, parent: HTMLElement, offset: number): number {
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

  /**
   * Obtain the constructor class of a node instance.
   *
   * @param node Markdown node
   * @returns {typeof MarkdownNode} constructor class of a node instance
   */
  public static getConstructor(node: MarkdownNode): typeof MarkdownNode {
    return Object.getPrototypeOf(node).constructor;
  }
}

export default NodeTools;
