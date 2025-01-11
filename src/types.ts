import type Editor from './editor';
import type { Code, FencedCodeBlock, IndentedCodeBlock, MarkdownNode } from 'commonmark-java-js';

declare global {
  interface Node {
    $virtNode: MarkdownNode;
  }

  interface UpdateSelection {
    from: number;
    to?: number;
  }

  type TInputHandlerFn = (this: Editor, e: InputEvent) => boolean;

  type CodeBlock = FencedCodeBlock | IndentedCodeBlock;

  type MarkdownCode = CodeBlock | Code;
}
