import { filterBreakNode } from './filter';

export function createEditorElement() {
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

export function getElChildren(el: Node) {
  return Array.from(el.childNodes).filter(filterBreakNode);
}

export function setHtml(el: HTMLElement, html: string) {
  el.innerHTML = html;
}
