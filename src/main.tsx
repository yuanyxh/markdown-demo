import 'normalize.css';
import './styles/global.less';

import './styles/editor-init.less';

import { createEditorElement } from './utils';

import { Parser, IncludeSourceSpans } from 'commonmark-java-js';

import source from './example.md?raw';

import { runOffset } from './offset';
import { sync } from './sync';
import AttributesProvider from './attributes';
import HtmlRenderer from './renderer/HtmlRenderer';
import { getPlainData } from './data';

const attributesProvider = new AttributesProvider();

const editor = createEditorElement();
window.document.getElementById('root')!.appendChild(editor);

const markdownParser = Parser.builder()
  .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
  .build();

const htmlRenderer = HtmlRenderer.builder().attributeProviderFactory(attributesProvider).build();

function render(source: string) {
  const root = markdownParser.parse(source);
  const html = htmlRenderer.render(root);
  editor.innerHTML = html;
  sync(editor, root);
}

render(source);

// window.document.addEventListener('selectionchange', () => {
//   const selection = window.document.getSelection();

//   if (!selection) {
//     return false;
//   }

//   const range = selection.getRangeAt(0);

//   console.log(range);

//   const changeRange = runOffset.call({ source }, range);

//   console.log(changeRange);
//   console.log(source.charAt(changeRange.start));
//   console.log(source.charAt(changeRange.end));
// });

editor.addEventListener('beforeinput', (e) => {
  e.preventDefault();

  const data = getPlainData(e);

  const selection = window.document.getSelection();

  if (!selection) {
    return false;
  }

  const range = selection.getRangeAt(0);

  const changeRange = runOffset.call({ source }, range);

  render(source.slice(0, changeRange.start) + data + source.slice(changeRange.end));
});
