import type { Editor } from './main';
import type { Block, MarkdownNode } from 'commonmark-java-js';
import type HtmlRenderer from './renderer/HtmlRenderer';

declare global {
  interface IEditorOptions {
    root: HTMLElement;
  }

  interface IChanged {
    from: number;
    to: number;
  }

  interface IPatchNode {
    type: TNodeChangeType;
    update: (cb: (dom: HTMLElement) => void) => void;
    updateNode?: MarkdownNode;
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

  type TNodeChangeType = 'remove' | 'insertAfter' | 'append' | 'replace';

  type TCursorDir = 'forward' | 'backword';

  type TUpdateFn = (doc: string) => string;

  type TUpdateDoc = (update: TUpdateFn | string) => boolean;

  type TInputHandlerFn = (this: Editor, e: InputEvent) => boolean;
}
