export function createEditorElement() {
  const editorElement = window.document.createElement('div');

  editorElement.classList.add('editor');
  editorElement.spellcheck = false;
  editorElement.contentEditable = 'true';
  editorElement.autocapitalize = 'off';
  editorElement.translate = false;
  editorElement.role = 'textbox';
  editorElement.ariaMultiLine = 'true';
  editorElement.classList.add('editor');

  return editorElement;
}
