type TInputHandlerFn = (e: InputEvent) => boolean;

interface IInputHandler {
  [key: string]: TInputHandlerFn;
}

const insertPlainText: TInputHandlerFn = function insertPlainText() {
  return false;
};

const inputHandlers: IInputHandler = {};

[
  'insertText',
  'insertReplacementText',
  'insertFromYank',
  'insertFromDrop',
  'insertFromPaste',
  'insertLink',
  'insertFromPasteAsQuotation'
].forEach((eventName) => {
  inputHandlers[eventName] = insertPlainText;
});

export default inputHandlers;
