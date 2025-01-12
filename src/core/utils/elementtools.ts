import type { MarkdownNode } from 'commonmark-java-js';

import TypeTools from './typetools';

class ElementTools {
  public static createEditorElement() {
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

  public static getDomFromNode(node: MarkdownNode) {
    if (TypeTools.isMarkdownText(node) || TypeTools.isInlineCode(node)) {
      return node.meta.$dom.childNodes[0];
    } else if (TypeTools.isCodeBlock(node)) {
      return node.meta.$dom.childNodes[0].childNodes[0];
    } else {
      return this.getDom(node);
    }
  }

  public static getDom(node: MarkdownNode): Node {
    return node.meta.$dom;
  }
}

export default ElementTools;
