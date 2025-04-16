import type { BlockParserFactory, InlineContentParserFactory, Node } from 'commonmark-java-js';
import type { EditorEventHandler } from './EditorEvent';
import type ContentView from './views/abstracts/contentview';

import EditorContext from './EditorContext';
import EditorEvent from './EditorEvent';
import DocView from './views/docview';

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
  eventHandler?: EditorEventHandler;
}

class Editor {
  private parent: HTMLElement;
  private _context: EditorContext;
  private editorEvent: EditorEvent;

  constructor(options: EditorOptions) {
    this.parent = options.parent;

    this._context = new EditorContext(options);

    this.editorEvent = new EditorEvent(this.context)
      .setEventHandler(options.eventHandler ?? {})
      .listen();
  }

  get context(): EditorContext {
    return this._context;
  }

  destroy(): void {
    this.editorEvent.unListen();
    this.context.docView.destroy();
  }
}

export default Editor;
