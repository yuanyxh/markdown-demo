import type { Block, MarkdownNode } from 'commonmark-java-js';
import type HtmlRenderer from './renderer/HtmlRenderer';

declare global {
  interface IEditorOptions {
    root: HTMLElement;
  }

  /** 变更范围 */
  interface IChanged {
    from: number;
    to: number;
  }

  /** 公共祖先 */
  interface ICommonAncestor {
    element: HTMLElement;
    blockAncestor: Block;
  }

  interface INodeHolder {
    type: 'insertFirstChild' | 'insertAfter' | 'remove' | 'replace';
    target: HTMLElement | null;
    node: MarkdownNode | null;
  }

  interface IEditorContext {
    node: Node;
    offset: number;
    source: string;
    renderer: HtmlRenderer;
  }

  interface Node {
    $virtNode: MarkdownNode;
  }

  type TCursorDir = 'forward' | 'backword';

  type TUpdateFn = (doc: string) => string;

  type TUpdateDoc = (update: TUpdateFn | string) => boolean;

  type TInputHandlerFn = (e: InputEvent, changed: IChanged, updateDoc: TUpdateDoc) => boolean;
}
