import type EditorContext from './EditorContext';
import type { EditorEventHandler } from './EditorEvent';

function insertText(e: InputEvent, context: EditorContext) {}

const defaultEditorEvnetHandler: EditorEventHandler = {
  insertText: insertText
};
