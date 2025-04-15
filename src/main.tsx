import 'normalize.css';
import './styles/global.less';
import './styles/editor-init.less';

import source from './examples/example.md?raw';
import Editor from './Editor';

const editor = new Editor({
  parent: window.document.getElementById('root')!!,
  doc: source
});
