import type { Code, FencedCodeBlock, IndentedCodeBlock } from 'commonmark-java-js';

import type Editor from '@/editor';

export type InputHandlerFn = (this: Editor, e: InputEvent) => boolean;

export type CodeBlock = FencedCodeBlock | IndentedCodeBlock;

export type MarkdownCode = CodeBlock | Code;

export type EditorRange = Omit<StaticRange, 'collapsed'>;

export interface Selection {
  from: number;
  to?: number;
}

export interface NodePoint {
  node: Node;
  offset: number;
}
