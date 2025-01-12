import type { MarkdownNode, Parser } from 'commonmark-java-js';

import type { HtmlRenderer, HtmlNodeRendererContext } from '@/renderer';
import type { NodePoint } from './types';

export type ParserExtension = (typeof Parser)['ParserExtension'];
export type HtmlRendererExtension = (typeof HtmlRenderer)['HtmlRendererExtension'];

export interface Extension {
  locateSrcPos(node: Node, offset: number): number;

  locatePointFromSrcPos(pos: number): NodePoint | null;

  render(context: HtmlNodeRendererContext, node: MarkdownNode): void | null;

  getParserExtension(): ParserExtension | null;

  getHtmlRendererExtension(): HtmlRendererExtension | null;
}
