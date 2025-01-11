import type {
  Block,
  FencedCodeBlock,
  MarkdownNode,
  HtmlBlock,
  ThematicBreak,
  SoftLineBreak,
  Image,
  Text as MarkdownText,
  Code
} from 'commonmark-java-js';

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

  public static isMarkdownText(data: MarkdownNode): data is MarkdownText {
    return data.type === 'text';
  }

  public static isSoftLineBreak(data: MarkdownNode): data is SoftLineBreak {
    return data.type === 'softline-break';
  }

  public static isImageFile(file: File): file is File {
    return file.type.startsWith('image/');
  }
}

export default TypeTools;
