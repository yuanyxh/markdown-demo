import type { MarkdownNode } from 'commonmark-java-js';

import type Editor from '@/editor';
import type {
  Extension,
  HtmlRendererExtension,
  ParserExtension,
  NodePoint,
  EditorContextConfig
} from '@/interfaces';

class EnhanceExtension implements Extension {
  /** Editor context. Through it, one can access the data of the editor */
  protected context: Editor;

  public constructor(config: EditorContextConfig) {
    this.context = config.context;
  }

  public getTypes(): (typeof MarkdownNode)[] {
    return [];
  }

  public getParserExtension(): ParserExtension | null {
    return null;
  }

  public getHtmlRendererExtension(): HtmlRendererExtension | null {
    return null;
  }

  public locateSrcPos(node: Node, offset: number): number {
    return -1;
  }

  public locatePointFromSrcPos(node: MarkdownNode, pos: number): NodePoint | null {
    return null;
  }

  public adjustNode(node: MarkdownNode): MarkdownNode {
    return node;
  }
}

export default EnhanceExtension;
