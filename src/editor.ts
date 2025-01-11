import type { MarkdownNode, AttributeProviderFactory } from 'commonmark-java-js';

import { Parser, IncludeSourceSpans } from 'commonmark-java-js';

import { createEditorElement } from './utils/element';
import EditorInput from './editorInput';
import SourceMap from './sourcemap';
import SyncDoc from './syncdoc';
import DocSelection from './docselection';
import Source from './source';
import HtmlRenderer from './renderer/HtmlRenderer';

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

class Editor {
  private editorDOM = createEditorElement();

  private renderer: HtmlRenderer;
  private parser: Parser;
  private souremap: SourceMap;
  private docSelection: DocSelection;
  private syncDoc: SyncDoc;
  private editorInput: EditorInput;

  private innerDoc: MarkdownNode;
  private oldDoc: MarkdownNode;

  private innerRoot: Document;
  private innerSource: Source;

  public constructor(options: EditorOptions) {
    const { renderer, doc = '' } = options;

    {
      this.parser = Parser.builder()
        .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
        .build();

      const rendererBuilder = HtmlRenderer.builder();
      if (renderer?.attributeProvider) {
        rendererBuilder.attributeProviderFactory(renderer.attributeProvider);
      }
      this.renderer = rendererBuilder.build();
    }

    {
      options.parent.appendChild(this.editorDOM);
      this.innerRoot = options.root ?? this.editorDOM.ownerDocument;
    }

    {
      this.editorInput = EditorInput.create({ context: this });
      this.editorInput.on(this.editorDOM);

      this.souremap = new SourceMap({ context: this });
      this.syncDoc = new SyncDoc({ context: this });
      this.docSelection = new DocSelection({ context: this });
    }

    {
      this.innerSource = new Source();
      this.innerDoc = this.oldDoc = this.parser.parse(this.innerSource);
      this.attachNode();
    }

    this.update({ from: 0, text: doc });
  }

  public get root() {
    return this.innerRoot;
  }

  public get source() {
    return this.innerSource;
  }

  public get length() {
    return this.innerSource.length;
  }

  public get doc() {
    return this.innerDoc;
  }

  public dispatch(action: InputAction) {
    if (typeof action.to === 'undefined') {
      action.to = this.innerSource.length;
    }

    if (!this.update(action)) {
      return false;
    }

    return true;
  }

  public locate(range: StaticRange) {
    return this.souremap.locate(range);
  }

  public updateSelection(selection: UpdateSelection) {
    return this.docSelection.updateSelection(selection);
  }

  public render(node: MarkdownNode) {
    return this.renderer.render(node);
  }

  private update(update: Update): boolean {
    update.text ??= '';

    const oldSource = this.innerSource.toString();
    this.innerSource.update(update.from, update.to, update.text);

    if (this.innerSource.compare(oldSource)) {
      return false;
    }

    this.oldDoc = this.innerDoc;
    this.innerDoc = this.parser.parse(this.innerSource);

    const result = this.syncDoc.sync(this.innerDoc, this.oldDoc);

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
    this.syncDoc.attach(this.innerDoc, this.editorDOM);
  }

  public static create(options: EditorOptions) {
    return new Editor(options);
  }
}

export default Editor;
