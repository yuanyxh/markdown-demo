import type { MarkdownNode } from 'commonmark-java-js';

import type {
  EditorRange,
  ExtendsMarkdownNode,
  Extension,
  HtmlRendererExtension,
  ParserExtension,
  RangeBounds
} from './types';
import type EnhanceExtension from './abstracts/enhanceextension';

import { Parser, IncludeSourceSpans } from 'commonmark-java-js';

import { HtmlRenderer } from '@/renderer';
import { ElementTools, TypeTools } from '@/utils';

import EditorInput from './editorInput';
import SyncDoc from './syncdoc';
import DocSelection from './docselection';
import Source from './source';
import { defaultPlugins } from './plugins';

/** Editor configuration. */
export interface EditorConfig {
  /** Mounting point for editor elements. By default, editor elements are appended using the appendChild method. */
  parent: HTMLElement;
  /** Any document instance that implements the Document interface. By default, it is {@link window.document}. */
  root?: Document;
  /** Initial document, provided in string form. */
  doc?: string;
  /**
   * Any extension class that inherits the {@link EnhanceExtension} class.
   *
   * It is used to help the editor locate and can also enhance the built-in parser and renderer.
   */
  plugins: (typeof EnhanceExtension)[];
}

/** Input action. */
export interface InputAction {
  /**
   * {@link InputType | Input type.}
   */
  type: InputType;
  /** Starting point. */
  from: number;
  /** Ending point. */
  to?: number;
  /** Text data attached to this action. */
  text?: string;
  /** Enforce action even if the document is not changed. */
  force?: boolean;
}

export type InputType = 'insert' | 'delete' | 'replace' | 'selection';

/**
 * A WYSIWYG editor that focuses on source code and provides the ability of instant rendering.
 *
 * @example Editor.create({ parent: window.document });
 */
class Editor {
  private editorDOM = ElementTools.createEditorElement();

  private renderer: HtmlRenderer;
  private parser: Parser;
  private docSelection: DocSelection;
  private syncDoc: SyncDoc;
  private editorInput: EditorInput;

  private innerDoc: ExtendsMarkdownNode;
  private oldDoc: ExtendsMarkdownNode;

  private innerRoot: Document;
  private innerSource: Source;

  private innerIsInputing = false;

  private innerPlugins: Extension[] = [];

  public constructor(options: EditorConfig) {
    const { doc = '', plugins = [] } = options;

    {
      this.innerPlugins = plugins
        .concat(defaultPlugins)
        .map((Plugin) => new Plugin({ context: this }));
    }

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
      this.innerDoc = this.oldDoc = this.parser.parse(this.innerSource) as ExtendsMarkdownNode;
      this.attachNode();
    }

    // Initialization of document.
    this.update({ from: 0, text: doc });
  }

  /**
   * @returns {Document} The document where the editor elements are located. - default at {@link window.document}
   */
  public get root(): Document {
    return this.innerRoot;
  }

  /**
   * @returns {string} The source code corresponding to the editor’s document.
   */
  public get source(): string {
    return this.innerSource.toString();
  }

  /**
   * @returns {Required<RangeBounds> | null} The delineated range within the editor. When the focus is not within the editor, it is null.
   */
  public get rangeBounds(): Required<RangeBounds> | null {
    return this.docSelection.rangeBounds;
  }

  /**
   * @returns {number} The length of the editor’s document is always the length of the source code.
   */
  public get length(): number {
    return this.innerSource.toString().length;
  }

  /**
   * @returns {ExtendsMarkdownNode} The Markdown document corresponding to the editor’s document.
   */
  public get doc(): ExtendsMarkdownNode {
    return this.innerDoc;
  }

  /**
   * @returns {HTMLElement} The editor's dom.
   */
  public get dom(): HTMLElement {
    return this.editorDOM;
  }

  /**
   * @returns {boolean} Indicate whether input is in progress, including any behavior that changes the state of the editor.
   */
  public get isInputing(): boolean {
    return this.innerIsInputing;
  }

  /**
   * @returns {boolean} When the focus is in the editor, return true.
   */
  public get isFocus(): boolean {
    return this.innerRoot.activeElement === this.editorDOM;
  }

  /**
   * Dispatch an action. This method is usually used to change the document.
   *
   * @param action
   * @returns {boolean} When the document is successfully changed, return true.
   * @example
   * const editor = Editor.create({ parent: window.parent });
   * editor.dispatch({ type: 'insert', from: 0, to: 0, text: 'inserted' });
   */
  public dispatch(action: InputAction): boolean {
    if (this.innerIsInputing || !this.checkDispatchAction(action)) {
      return false;
    }

    this.innerIsInputing = true;

    let result = false;

    switch (action.type) {
      case 'insert':
      case 'delete':
      case 'replace':
        result = this.update(action);

        break;

      case 'selection':
        result = this.docSelection.updateSelection(action as Required<RangeBounds>);

        break;

      default:
        break;
    }

    this.innerIsInputing = false;

    return result;
  }

  /**
   * Locate the source code position through DOM range.
   *
   * @param range DOM range.
   * @returns {Required<RangeBounds>} The range bounds in the source code.
   * @example
   * editor.locateSrcPos(editor.getRange());
   */
  public locateSrcPos(range: EditorRange): Required<RangeBounds> {
    const from = this.locateFormDOMPoint(range.startContainer, range.startOffset);

    if (this.isCollapseRange(range) || from === -1) {
      return { from, to: from };
    }

    const to = this.locateFormDOMPoint(range.endContainer, range.endOffset);

    return { from, to };
  }

  /**
   * Locate the DOM range through the source code position.
   *
   * @param rangeBounds The range bounds in the source code.
   * @returns {EditorRange | null} DOM range.
   * @example
   * editor.locateRangeFromSrcPos({ from: 42, to: 80 });
   */
  public locateRangeFromSrcPos(rangeBounds: RangeBounds): EditorRange | null {
    if (this.checkRangeBounds(rangeBounds)) {
      return this.docSelection.locateRange(rangeBounds.from, rangeBounds.to);
    }

    return null;
  }

  /**
   * Update the delineated range of the source code in the editor.
   *
   * @returns {boolean} When the update is successful, return true.
   */
  public updateRangeBounds(): boolean {
    return this.docSelection.updateRangeBounds();
  }

  /**
   * Check if the range boundary is valid.
   *
   * @param rangeBounds range boundary
   * @returns {boolean} If the range boundary is valid, return true.
   */
  public checkRangeBounds(rangeBounds: RangeBounds): rangeBounds is Required<RangeBounds> {
    rangeBounds.to ??= this.length;

    const result =
      rangeBounds.from >= 0 &&
      rangeBounds.from <= this.length &&
      rangeBounds.to >= 0 &&
      rangeBounds.to <= this.length;

    if (result && rangeBounds.from > rangeBounds.to) {
      [rangeBounds.from, rangeBounds.to] = [rangeBounds.to, rangeBounds.from];
    }

    return result;
  }

  /**
   * Check whether the dispatched action can be executed.
   *
   * @param action
   * @returns {boolean} If can be executed, return true.
   */
  public checkDispatchAction(action: InputAction): boolean {
    if (!this.checkRangeBounds(action)) {
      return false;
    }

    action.force ??= false;

    return (
      action.force ||
      (action.type === 'selection' &&
        (this.rangeBounds?.from !== action.from || this.rangeBounds?.to !== action.to))
    );
  }

  /**
   * Render the Markdown node using the built-in renderer.
   *
   * @param node
   * @returns {string}
   */
  public render(node: MarkdownNode): string {
    return this.renderer.render(node);
  }

  /**
   * Obtain the instance of the plugin.
   *
   * @param type Any constructor class that inherits from MarkdownNode.
   * @returns {Extension[]} Extension instance
   */
  public getPlugins(type?: typeof MarkdownNode): Extension[] {
    return type === void 0
      ? this.innerPlugins.slice(0)
      : this.innerPlugins.filter((plugin) => plugin.getTypes().includes(type));
  }

  /**
   * checking the node is within the delineated boundary.
   *
   * @param node
   * @returns {boolean} If the node is within the delineated boundary, return true.
   */
  public isInRangeScope(node: MarkdownNode): boolean {
    if (!this.rangeBounds) {
      return false;
    }

    if (TypeTools.isSourceNode(node)) {
      node = node.getCompanionNode();
    }

    return (
      (this.rangeBounds.from >= node.inputIndex && this.rangeBounds.from <= node.inputEndIndex) ||
      (this.rangeBounds.to >= node.inputIndex && this.rangeBounds.to <= node.inputEndIndex)
    );
  }

  /**
   * Destroy the editor and remove all event listeners.
   */
  public destroy(): void {
    this.editorDOM.blur();
    this.editorDOM.remove();

    this.editorInput.off(this.editorDOM);
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

  private locateFormDOMPoint(node: Node, offset: number): number {
    let result = -1;

    /** Apply plugins and execute the locateSrcPos program to locate the source code position. */
    this.innerPlugins.some((plugin) => {
      result = plugin.locateSrcPos(node, offset);

      return result !== -1;
    });

    return result;
  }

  /**
   * Update the source code and synchronize it to the DOM.
   *
   * @param payload payload of the this update
   * @returns {boolean} Return true if updated.
   */
  private update(payload: Omit<InputAction, 'type'>): boolean {
    payload.text ??= '';

    const oldSource = this.innerSource.toString();
    this.innerSource.update(payload.from, payload.to, payload.text);

    if (!payload.force && this.innerSource.compare(oldSource)) {
      return false;
    }

    this.oldDoc = this.innerDoc;
    this.innerDoc = this.parser.parse(this.innerSource) as ExtendsMarkdownNode;

    const result = this.syncDoc.sync(this.innerDoc, this.oldDoc, payload.force);

    this.attachNode();

    return result;
  }

  /**
   * Append the Markdown node to the DOM tree.
   */
  private attachNode(): void {
    this.syncDoc.attach(this.innerDoc, this.editorDOM);
  }

  /**
   * Create an instance of the editor.
   *
   * @param options Editor configuration.
   * @returns {Editor}
   */
  public static create(options: EditorConfig): Editor {
    return new Editor(options);
  }
}

export default Editor;
