import 'normalize.css';
import './styles/global.less';

import './styles/editor-init.less';

import { createEditorElement } from './utils';

import { Parser, IncludeSourceSpans, MarkdownNode } from 'commonmark-java-js';

import source from './example.md?raw';

import { runOffset } from './offset';
import { sync } from './sync';
import AttributesProvider from './attributes';
import HtmlRenderer from './renderer/HtmlRenderer';
import inputHandlers from './input';

const attributesProvider = new AttributesProvider();

const markdownParser = Parser.builder()
  .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
  .build();
const htmlRenderer = HtmlRenderer.builder().attributeProviderFactory(attributesProvider).build();

function init() {
  const editor = createEditorElement();
  window.document.getElementById('root')!.appendChild(editor);

  let doc = '';
  let initial = false;

  function render(newSource: string) {
    const newRoot = markdownParser.parse(newSource);

    if (!initial) {
      const html = htmlRenderer.render(newRoot);
      editor.innerHTML = html;

      initial = true;
    } else {
    }

    sync(newRoot, editor);
  }

  function updateDoc(update: TUpdateFn | string) {
    const newDoc = typeof update === 'function' ? update(doc) : update;

    if (newDoc !== doc) {
      doc = newDoc;

      render(newDoc);

      return true;
    }

    return false;
  }

  const onBeforeInput = (e: InputEvent) => {
    const changed = runOffset.call({ source }, e.getTargetRanges()[0]);

    if (inputHandlers[e.inputType]) {
      inputHandlers[e.inputType](e, changed, updateDoc);
    }
  };

  editor.addEventListener('beforeinput', onBeforeInput);

  updateDoc(source);
}

init();
