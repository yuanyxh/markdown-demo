import type {
  Block,
  FencedCodeBlock,
  HtmlBlock,
  ThematicBreak,
  SoftLineBreak,
  Image,
  Code,
  Node as MarkdownNode
} from 'commonmark-java-js';

/** Auxiliary tool class for validating types. */
class TypeUtils {
  static isElement(data: Node): data is HTMLElement {
    return data instanceof HTMLElement;
  }

  static isText(data: Node): data is Text {
    return data instanceof Text;
  }

  static isHtmlBlock(data: MarkdownNode): data is HtmlBlock {
    return data.type === 'html-block';
  }

  static isBlockNode(data: MarkdownNode): data is Block {
    return data.isBlock();
  }

  static isThematicBreak(data: MarkdownNode): data is ThematicBreak {
    return data.type === 'thematic-break';
  }

  static isInlineCode(data: MarkdownNode): data is Code {
    return data.type === 'code';
  }

  static isFencedCodeBlock(data: MarkdownNode): data is FencedCodeBlock {
    return data.type === 'fenced-code-block';
  }

  static isImage(data: MarkdownNode): data is Image {
    return data.type === 'image';
  }

  static isSoftLineBreak(data: MarkdownNode): data is SoftLineBreak {
    return data.type === 'softline-break';
  }

  public static isImageFile(file: File): file is File {
    return file.type.startsWith('image/');
  }
}

export default TypeUtils;
