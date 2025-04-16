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

  private docView: DocView;

  constructor(options: EditorOptions) {
    this.parent = options.parent;

    this._context = new EditorContext(options);

    this.docView = new DocView(this.context.parseMarkdown(options.doc ?? ''), this.context);
    this.docView.attachTo(this.parent);

    this.editorEvent = new EditorEvent(this.context)
      .setEventHandler(options.eventHandler ?? {})
      .listenForView(this.docView);
  }

  get context(): EditorContext {
    return this._context;
  }

  destroy(): void {
    this.editorEvent.unListenForView(this.docView);
    this.docView.destroy();
  }
}

export default Editor;
