import type Editor from './editor';
import type { Code, FencedCodeBlock, IndentedCodeBlock, MarkdownNode } from 'commonmark-java-js';
import type HtmlRenderer from './renderer/HtmlRenderer';

declare global {
  interface Node {
    $virtNode: MarkdownNode;
  }

  type TInputHandlerFn = (this: Editor, e: InputEvent) => boolean;

  type CodeBlock = FencedCodeBlock | IndentedCodeBlock;

  type MarkdownCode = CodeBlock | Code;
}
