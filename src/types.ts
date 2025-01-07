import type { Block, MarkdownNode } from 'commonmark-java-js';

declare global {
  interface IEditorOptions {
    root: HTMLElement;
  }

  /** 变更范围 */
  interface IChangeRange {
    start: number;
    end: number;
  }

  /** 公共祖先 */
  interface ICommonAncestor {
    element: HTMLElement;
    blockAncestor: Block;
  }

  /** 新块的信息 */
  interface INewBlockInfo {
    /** 缩进 */
    indent: number;
    /** 是否是列表 */
    isList: boolean;
    /** 是否紧凑 */
    isTight?: boolean;
    /** 列表标记 */
    marker?: string;
    /** 有序列表的序号 */
    startNumber?: number;
  }

  interface INodeHolder {
    type: 'insertFirstChild' | 'insertAfter' | 'remove' | 'replace';
    target: HTMLElement | null;
    node: MarkdownNode | null;
  }

  interface IScope {
    start: MarkdownNode;
    end: MarkdownNode;
  }

  interface INodeRange {
    node: Node;
    offset: number;
    source: string;
  }

  interface Node {
    $virtNode: MarkdownNode;
  }

  type TCursorDir = 'forward' | 'backword';
}
