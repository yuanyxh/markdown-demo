import type { MarkdownNode } from 'commonmark-java-js';

import type {
  EditorRange,
  Extension,
  HtmlRendererExtension,
  ParserExtension,
  RangeBounds
} from './interfaces';
import type EnhanceExtension from './abstracts/enhanceextension';

import { Parser, IncludeSourceSpans } from 'commonmark-java-js';

import { HtmlRenderer } from '@/renderer';
import { ElementTools } from '@/utils';

import EditorInput from './editorInput';
import SyncDoc from './syncdoc';
import DocSelection from './docselection';
import Source from './source';
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
  force?: boolean;
}

type InputType = 'insert' | 'delete' | 'replace' | 'selection';

class Editor {
  private editorDOM = ElementTools.createEditorElement();

  private renderer: HtmlRenderer;
  private parser: Parser;
  private docSelection: DocSelection;
  private syncDoc: SyncDoc;
  private editorInput: EditorInput;

  private innerDoc: MarkdownNode;
  private oldDoc: MarkdownNode;
  private innerRangeBounds: Required<RangeBounds> | null = null;

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
    }

    {
      this.innerSource = new Source();
      this.innerDoc = this.oldDoc = this.parser.parse(this.innerSource);
      this.attachNode();
    }

    this.update({ type: 'insert', from: 0, text: doc });
  }

  public get root(): Document {
    return this.innerRoot;
  }

  public get source(): string {
    return this.innerSource.toString();
  }

  public get rangeBounds(): Required<RangeBounds> | null {
    if (this.innerRangeBounds) {
      return { ...this.innerRangeBounds };
    }

    return null;
  }

  public get length(): number {
    return this.innerSource.length;
  }

  public get doc(): MarkdownNode {
    return this.innerDoc;
  }

  public get isFocus(): boolean {
    return this.innerRoot.activeElement === this.editorDOM;
  }

  public dispatch(action: InputAction): boolean {
    action.to ??= this.innerSource.length;
    action.force ??= false;

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
        if (
          !action.force &&
          (this.rangeBounds?.from !== action.from || this.rangeBounds?.to !== action.to)
        ) {
          result = this.docSelection.updateSelection(action);
        }

        break;

      default:
        break;
    }

    return result;
  }

  public locateSrcPos(range: EditorRange): Required<RangeBounds> {
    const from = this.locateFormPoint(range.startContainer, range.startOffset);

    if (this.isCollapseRange(range) || from === -1) {
      return { from, to: from };
    }

    const to = this.locateFormPoint(range.endContainer, range.endOffset);

    return { from, to };
  }

  public locateRangeFromSrcPos(selection: RangeBounds): EditorRange | null {
    selection.to ??= this.length;

    return this.docSelection.locateRange(selection.from, selection.to);
  }

  public getRange(): EditorRange | null {
    const originSelection = this.root.getSelection();

    if (!(this.isFocus && originSelection && originSelection.rangeCount !== 0)) {
      return (this.innerRangeBounds = null);
    }

    return originSelection.getRangeAt(0);
  }

  public updateRangeBounds(): boolean {
    const range = this.getRange();

    let rangeBounds: Required<RangeBounds>;

    if (
      range &&
      (rangeBounds = this.locateSrcPos(range)) &&
      rangeBounds.from !== -1 &&
      rangeBounds.to !== -1
    ) {
      if (
        this.innerRangeBounds &&
        rangeBounds.from === this.innerRangeBounds.from &&
        rangeBounds.to === this.innerRangeBounds.to
      ) {
        return false;
      }

      this.innerRangeBounds = rangeBounds;

      return true;
    }

    this.innerRangeBounds = null;

    return false;
  }

  public render(node: MarkdownNode): string {
    return this.renderer.render(node);
  }

  public getPlugins(type: typeof MarkdownNode): Extension[] {
    return this.innerPlugins.filter((plugin) => plugin.getTypes().includes(type));
  }

  public destroy(): void {
    this.editorDOM.blur();
    this.editorInput.off(this.editorDOM);
    this.editorDOM.remove();
  }

  private getParserExtensions(pluginInstances: Extension[]): ParserExtension[] {
    return pluginInstances
      .map((plugin) => plugin.getParserExtension())
      .filter((plugin) => plugin !== null);
  }

  private getHtmlRendererExtensions(pluginInstances: Extension[]): HtmlRendererExtension[] {
    return pluginInstances
      .map((plugin) => plugin.getHtmlRendererExtension())
      .filter((plugin) => plugin !== null);
  }

  private isCollapseRange(range: EditorRange): boolean {
    return range.startContainer === range.endContainer && range.startOffset === range.endOffset;
  }

  private locateFormPoint(node: Node, offset: number): number {
    let result = -1;

    this.innerPlugins.some((plugin) => {
      result = plugin.locateSrcPos(node, offset);

      return result !== -1;
    });

    return result;
  }

  private update(action: InputAction): boolean {
    action.text ??= '';

    const oldSource = this.innerSource.toString();
    this.innerSource.update(action.from, action.to, action.text);

    if (!action.force && this.innerSource.compare(oldSource)) {
      return false;
    }

    this.oldDoc = this.innerDoc;
    this.innerDoc = this.parser.parse(this.innerSource);

    const result = this.syncDoc.sync(this.innerDoc, this.oldDoc);

    this.attachNode();

    return result;
  }

  private attachNode(): void {
    this.syncDoc.attach(this.innerDoc, this.editorDOM);
  }

  public static create(options: EditorOptions): Editor {
    return new Editor(options);
  }
}

export default Editor;
