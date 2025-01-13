import type { Code, FencedCodeBlock, IndentedCodeBlock } from 'commonmark-java-js';

import type Editor from '@/editor';
import type { SourceBlock, SourceText } from '@/node';

/** Default editor context configuration. */
export interface EditorContextConfig {
  /** Editor context. Through it, one can access the data of the editor. */
  context: Editor;
}

/** Range, delineated from [from value] to [to value]. */
export interface RangeBounds {
  from: number;
  to?: number;
}

/** NodePoint. Marks a certain point in a DOM node. */
export interface NodePoint {
  node: Node;
  offset: number;
}

export type SourceNode = SourceText | SourceBlock;

/** program for input processing */
export type InputHandlerFn = (this: Editor, e: InputEvent) => boolean;

/** node for code block */
export type CodeBlock = FencedCodeBlock | IndentedCodeBlock;

/** node for code */
export type MarkdownCode = CodeBlock | Code;

/** The selection in the editor. Marks either the anchor or the focus. */
export type EditorRange = Omit<StaticRange, 'collapsed'>;
