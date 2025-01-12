import type { MarkdownNode } from 'commonmark-java-js';

import type { HtmlNodeRendererContext } from '@/renderer';
import type { Extension, HtmlRendererExtension, ParserExtension, NodePoint } from '@/interfaces';

abstract class EnhanceExtension implements Extension {
  public locateSrcPos(node: Node, offset: number): number {
    return -1;
  }

  public locatePointFromSrcPos(pos: number): NodePoint | null {
    return null;
  }

  public render(context: HtmlNodeRendererContext, node: MarkdownNode): void | null {
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
