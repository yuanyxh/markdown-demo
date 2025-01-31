import type {
  Block,
  FencedCodeBlock,
  HtmlBlock,
  ThematicBreak,
  SoftLineBreak,
  Image,
  Code,
  MarkdownNode
} from 'commonmark-java-js';

import type { CodeBlock, LiteralNode, MarkdownCode, SourceNode } from '@/types';

/** Auxiliary tool class for validating types. */
class TypeTools {
  public static isElement(data: Node): data is HTMLElement {
    return data instanceof HTMLElement;
  }

  public static isText(data: Node): data is Text {
    return data instanceof Text;
  }

  public static isHtmlBlock(data: MarkdownNode): data is HtmlBlock {
    return data.type === 'html-block';
  }

  public static isBlockNode(data: MarkdownNode): data is Block {
    return data.isBlock();
  }

  public static isThematicBreak(data: MarkdownNode): data is ThematicBreak {
    return data.type === 'thematic-break';
  }

  public static isInlineCode(data: MarkdownNode): data is Code {
    return data.type === 'code';
  }

  public static isCode(data: MarkdownNode): data is MarkdownCode {
    return ['code', 'fenced-code-block', 'indented-code-block'].includes(data.type);
  }

  public static isFencedCodeBlock(data: MarkdownNode): data is FencedCodeBlock {
    return data.type === 'fenced-code-block';
  }

  public static isCodeBlock(data: MarkdownNode): data is CodeBlock {
    return ['fenced-code-block', 'indented-code-block'].includes(data.type);
  }

  public static isImage(data: MarkdownNode): data is Image {
    return data.type === 'image';
  }

  public static isLiteralNode(data: any): data is LiteralNode {
    return data && typeof data.getLiteral === 'function' && typeof data.setLiteral === 'function';
  }

  public static isSoftLineBreak(data: MarkdownNode): data is SoftLineBreak {
    return data.type === 'softline-break';
  }

  public static isSourceNode(data: MarkdownNode): data is SourceNode {
    return ['source-text', 'source-block'].includes(data.type);
  }

  public static isImageFile(file: File): file is File {
    return file.type.startsWith('image/');
  }
}

export default TypeTools;
