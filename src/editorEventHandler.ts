import type EditorContext from './EditorContext';
import type { EditorEventHandler } from './EditorEvent';

function insertText(e: InputEvent, context: EditorContext) {
  const text = context.getTextData(e);
  context.updateSourceCode(text);
  context.cursor.rightShift(text.length);
}

export const defaultEditorEvnetHandler: EditorEventHandler = {
  insertText: insertText
};
