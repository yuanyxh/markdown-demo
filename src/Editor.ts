import type { BlockParserFactory, InlineContentParserFactory, Node } from 'commonmark-java-js';
import type ContentView from './views/abstracts/contentview';
import EditorContext from './EditorContext';

export interface NodeDefinition {
  nodeType: typeof Node;
  nodeView: typeof ContentView;
  blockParserFactory?: BlockParserFactory;
  inlineContentParserFactory?: InlineContentParserFactory;
}

export interface NodeConfig {
  includes?: NodeDefinition[];
  excludes?: Array<typeof Node>;
}

export interface EditorOptions {
  parent: HTMLElement;
  doc?: string;
  nodeConfig?: NodeConfig;
}

class Editor {
  private parent: HTMLElement;
  private _context: EditorContext;

  constructor(options: EditorOptions) {
    this.parent = options.parent;

    this._context = new EditorContext(options);

    this.context.docView.attachTo(this.parent);
  }

  get context(): EditorContext {
    return this._context;
  }

  destroy(): void {
    this.context.docView.destroy();
  }
}

export default Editor;
