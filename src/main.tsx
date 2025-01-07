import 'normalize.css';
import './styles/global.less';

import './styles/editor-init.less';

import { createEditorElement } from './utils';

import { Parser, IncludeSourceSpans } from 'commonmark-java-js';

import source from './example.md?raw';

import AttributesProvider from './attributes';
import HtmlRenderer from './renderer/HtmlRenderer';
import { runOffset } from './offset';
import { sync } from './sync';

const attributesProvider = new AttributesProvider();

const editor = createEditorElement();
window.document.getElementById('root')!.appendChild(editor);

const markdownParser = Parser.builder()
  .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
  .build();

const htmlRenderer = HtmlRenderer.builder().attributeProviderFactory(attributesProvider).build();

const root = markdownParser.parse(source);
editor.innerHTML = htmlRenderer.render(root);
sync(editor, root);

window.document.addEventListener('selectionchange', () => {
  const selection = window.document.getSelection();

  if (!selection) {
    return false;
  }

  const range = selection.getRangeAt(0);

  console.log(range);

  const changeRange = runOffset.call({ source }, range);

  console.log(changeRange);
  console.log(source.charAt(changeRange.start));
  console.log(source.charAt(changeRange.end));
});
