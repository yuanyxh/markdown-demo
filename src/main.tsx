import 'normalize.css';
import './styles/global.less';
import './styles/editor-init.less';

import source from './examples/example.md?raw';

import Editor from './core/editor';

Editor.create({
  parent: window.document.getElementById('root')!,
  doc: source
});
