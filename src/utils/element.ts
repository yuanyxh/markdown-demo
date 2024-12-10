export function createEditorElement() {
  const editorElement = window.document.createElement("div");

  editorElement.classList.add("editor");
  editorElement.spellcheck = false;
  editorElement.contentEditable = "true";
  editorElement.autocapitalize = "off";
  editorElement.translate = false;
  editorElement.role = "textbox";
  editorElement.ariaMultiLine = "true";

  return editorElement;
}
