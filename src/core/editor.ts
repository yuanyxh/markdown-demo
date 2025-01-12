import type { MarkdownNode } from 'commonmark-java-js';

import type { EditorRange, Extension, Selection } from './interfaces';
import type EnhanceExtension from './abstracts/enhanceextension';

import { Parser, IncludeSourceSpans } from 'commonmark-java-js';

import { HtmlRenderer } from '@/renderer';
import { createEditorElement } from '@/utils';

import EditorInput from './editorInput';
import SyncDoc from './syncdoc';
import DocSelection from './docselection';
import Source from './source';
import Scope from './scope';
import { defaultPlugins } from './plugins';

interface EditorOptions {
  parent: HTMLElement;
  root?: Document;
  doc?: string;
  plugins: (typeof EnhanceExtension)[];
}

interface InputAction {
  type: InputType;
  from: number;
  to?: number;
  text?: string;
}

type Update = Pick<InputAction, 'from' | 'to' | 'text'>;
type InputType = 'insert' | 'delete' | 'replace' | 'selection';

class Editor {
  private editorDOM = createEditorElement();

  private renderer: HtmlRenderer;
  private parser: Parser;
  private docSelection: DocSelection;
  private syncDoc: SyncDoc;
  private editorInput: EditorInput;
  private scope: Scope;

  private innerDoc: MarkdownNode;
  private oldDoc: MarkdownNode;

  private innerRoot: Document;
  private innerSource: Source;

  private innerPlugins: Extension[] = [];

  public constructor(options: EditorOptions) {
    const { doc = '', plugins = [] } = options;

    this.innerPlugins = plugins
      .concat(defaultPlugins)
      .map((Plugin) => new Plugin({ context: this }));

    {
      this.parser = Parser.builder()
        .extensions(this.getParserExtensions(this.innerPlugins))
        .setIncludeSourceSpans(IncludeSourceSpans.BLOCKS_AND_INLINES)
        .build();

      this.renderer = HtmlRenderer.builder()
        .extensions(this.getHtmlRendererExtensions(this.innerPlugins))
        .build();
    }

    {
      options.parent.appendChild(this.editorDOM);
      this.innerRoot = options.root ?? this.editorDOM.ownerDocument;
    }

    {
      this.editorInput = new EditorInput({ context: this });
      this.editorInput.on(this.editorDOM);

      this.syncDoc = new SyncDoc({ context: this });
      this.docSelection = new DocSelection({ context: this });
      this.scope = new Scope({ context: this });
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

    let result = false;

    switch (action.type) {
      case 'insert':
        result = this.update(action);

        break;

      case 'delete':
        break;

      case 'replace':
        break;

      case 'selection':
        result = this.docSelection.updateSelection(action);

        break;

      default:
        break;
    }

    return result;
  }

  public locateSrcPos(range: EditorRange): Required<Selection> {
    const from = this.locateFormPoint(range.startContainer, range.startOffset);

    if (this.isCollapseRange(range) || from === -1) {
      return { from, to: from };
    }

    const to = this.locateFormPoint(range.endContainer, range.endOffset);

    return { from, to };
  }

  public getRange(): StaticRange | null {
    if (!this.hasFocus()) {
      return null;
    }

    const selection = this.root.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    return selection.getRangeAt(0);
  }

  public checkSelection() {
    const range = this.getRange();

    if (range) {
      return this.scope.updateScopes(range);
    }

    return false;
  }

  public render(node: MarkdownNode) {
    return this.renderer.render(node);
  }

  public destroy() {
    this.editorDOM.blur();
    this.editorInput.off(this.editorDOM);
    this.editorDOM.remove();
  }

  public hasFocus() {
    return this.innerRoot.activeElement === this.editorDOM;
  }

  public getPlugins(type: typeof MarkdownNode) {
    return this.innerPlugins.filter((plugin) => plugin.getTypes().includes(type));
  }

  private getParserExtensions(pluginInstances: Extension[]) {
    return pluginInstances
      .map((plugin) => plugin.getParserExtension())
      .filter((plugin) => plugin !== null);
  }

  private getHtmlRendererExtensions(pluginInstances: Extension[]) {
    return pluginInstances
      .map((plugin) => plugin.getHtmlRendererExtension())
      .filter((plugin) => plugin !== null);
  }

  private isCollapseRange(range: EditorRange) {
    return range.startContainer === range.endContainer && range.startOffset === range.endOffset;
  }

  private locateFormPoint(node: Node, offset: number) {
    let result = -1;

    this.innerPlugins.some((plugin) => {
      result = plugin.locateSrcPos(node, offset);

      return result !== -1;
    });

    return result;
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

  private attachNode() {
    this.syncDoc.attach(this.innerDoc, this.editorDOM);
  }

  public static create(options: EditorOptions) {
    return new Editor(options);
  }
}

export default Editor;
