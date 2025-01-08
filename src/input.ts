import { getPlainData } from './data';

interface IInputHandler {
  [key: string]: TInputHandlerFn;
}

const insertPlainText: TInputHandlerFn = function insertPlainText(e, changed, updateDoc) {
  const text = getPlainData(e);

  updateDoc((doc) => doc.slice(0, changed.from) + text + doc.slice(changed.to));

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
