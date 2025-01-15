import 'normalize.css';
import './styles/global.less';
import './styles/editor-init.less';

import source from './examples/example.md?raw';

import { IncludeSourceSpans, Parser } from 'commonmark-java-js';
import DocView from '@/views/docview';

const parser = Parser.builder()
  .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
  .build();
const node = parser.parse(source);

const docView = new DocView();
const docDOM = docView.toDOMRepr();
docView.sync(node);

window.document.getElementById('root')?.appendChild(docDOM);
