import type { MarkdownNode, AttributeProviderFactory } from 'commonmark-java-js';

import { Parser, IncludeSourceSpans } from 'commonmark-java-js';

import 'normalize.css';
import './styles/global.less';
import './styles/editor-init.less';

import { createEditorElement, setHtml } from './utils';
import HtmlRenderer from './renderer/HtmlRenderer';

import source from './example.md?raw';
import EditorInput from './editorInput';
import SourceMap from './sourcemap';
import SyncDoc from './syncDoc';

interface RendererConfig {
  attributeProvider: AttributeProviderFactory;
}

interface EditorOptions {
  parent: HTMLElement;
  root?: Document;
  doc?: string;
  renderer?: RendererConfig;
}

type InputType = 'insert' | 'delete' | 'replace' | 'selection';

interface InputAction {
  type: InputType;
  from: number;
  to?: number;
  text?: string;
  range?: [MarkdownNode, MarkdownNode];
}

type Update = Pick<InputAction, 'from' | 'to' | 'text'>;

export class Editor {
  private editorDOM = createEditorElement();

  public renderer: HtmlRenderer;
  public parser: Parser;
  public souremap: SourceMap;

  private syncDoc: SyncDoc;
  private editorInput: EditorInput;

  private doc: MarkdownNode;
  private oldDoc: MarkdownNode;

  private innerRoot: Document;
  private source = '';

  public constructor(options: EditorOptions) {
    const { renderer, doc = '' } = options;

    this.parser = Parser.builder()
      .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
      .build();

    const rendererBuilder = HtmlRenderer.builder();
    if (renderer?.attributeProvider) {
      this.renderer = rendererBuilder.attributeProviderFactory(renderer.attributeProvider).build();
    } else {
      this.renderer = rendererBuilder.build();
    }

    this.source = doc;
    this.doc = this.oldDoc = this.parser.parse(this.source);

    options.parent.appendChild(this.editorDOM);
    this.innerRoot = options.root ?? this.editorDOM.ownerDocument;

    this.editorInput = EditorInput.create({ context: this });
    this.editorInput.on(this.editorDOM);

    this.souremap = new SourceMap({ context: this });
    this.syncDoc = new SyncDoc({ context: this });

    setHtml(this.editorDOM, this.renderer.render(this.doc));
    this.attachNode();
  }

  public get root() {
    return this.innerRoot;
  }

  public get document() {
    return this.source;
  }

  public dispatch(action: InputAction) {
    if (typeof action.to === 'undefined') {
      action.to = this.source.length;
    }

    if (!this.update(action)) {
      return false;
    }

    return true;
  }

  private update(update: Update): boolean {
    update.text ??= '';

    const oldSource = this.source;

    this.source = this.source.slice(0, update.from) + update.text + this.source.slice(update.to);

    if (this.source === oldSource) {
      return false;
    }

    this.oldDoc = this.doc;
    this.doc = this.parser.parse(this.source);

    const result = this.syncDoc.sync(this.doc, this.oldDoc);
    this.attachNode();

    return result;
  }

  public destroy() {
    this.editorDOM.blur();
    this.editorInput.off(this.editorDOM);
    this.editorDOM.remove();
  }

  public hasFocus() {
    return this.innerRoot.activeElement === this.editorDOM;
  }

  private attachNode() {
    this.syncDoc.attach(this.doc, this.editorDOM);
  }

  public static create(options: EditorOptions) {
    return new Editor(options);
  }
}

Editor.create({
  parent: window.document.getElementById('root')!,
  doc: source
});
