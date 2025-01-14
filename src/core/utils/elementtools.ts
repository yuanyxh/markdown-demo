import type { ExtendsMarkdownNode } from '@/types';

import TypeTools from './typetools';

/** Auxiliary tool class for elements. */
class ElementTools {
  /**
   * Create elements for the editor.
   *
   * @returns {HTMLElement} the editor element
   */
  public static createEditorElement(): HTMLElement {
    const editorElement = window.document.createElement('div');

    editorElement.classList.add('editor');
    editorElement.spellcheck = false;
    editorElement.contentEditable = 'true';
    editorElement.ariaAutoComplete = 'off';
    editorElement.autocapitalize = 'off';
    editorElement.translate = false;
    editorElement.role = 'textbox';
    editorElement.ariaMultiLine = 'true';

    return editorElement;
  }

  /**
   * Obtain the corresponding DOM node of a specific type from the Markdown node.
   *
   * @param node
   * @returns {Node} DOM Node
   */
  public static getDomByNodeType(node: ExtendsMarkdownNode): Node {
    if (TypeTools.isCodeBlock(node)) {
      return node.meta.$dom.childNodes[0].childNodes[0];
    } else if (TypeTools.isLiteralNode(node)) {
      return node.meta.$dom.childNodes[0];
    } else {
      return this.getDom(node);
    }
  }

  /**
   * Obtain the corresponding DOM node from the Markdown node.
   *
   * @param node
   * @returns {Node} DOM Node
   */
  public static getDom(node: ExtendsMarkdownNode): Node {
    return node.meta.$dom;
  }
}

export default ElementTools;
