import type { MarkdownNode } from 'commonmark-java-js';

import type Editor from '@/editor';
import type { HtmlNodeRendererContext } from '@/renderer';
import type {
  Extension,
  HtmlRendererExtension,
  ParserExtension,
  NodePoint,
  EnhanceextensionConfig
} from '@/interfaces';

class EnhanceExtension implements Extension {
  protected context: Editor;

  public constructor(config: EnhanceextensionConfig) {
    this.context = config.context;
  }

  public getTypes(): (typeof MarkdownNode)[] {
    return [];
  }

  public locateSrcPos(node: Node, offset: number): number {
    return -1;
  }

  public locatePointFromSrcPos(node: MarkdownNode, pos: number): NodePoint | null {
    return null;
  }

  public render(rendererContext: HtmlNodeRendererContext, node: MarkdownNode): void | null {
    return null;
  }

  public getParserExtension(): ParserExtension | null {
    return null;
  }

  public getHtmlRendererExtension(): HtmlRendererExtension | null {
    return null;
  }
}

export default EnhanceExtension;
