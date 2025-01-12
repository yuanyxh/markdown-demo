import type { MarkdownNode, Parser } from 'commonmark-java-js';

import type { HtmlRenderer } from '@/renderer';
import type { NodePoint } from './types';

export type ParserExtension = (typeof Parser)['ParserExtension'];
export type HtmlRendererExtension = (typeof HtmlRenderer)['HtmlRendererExtension'];

export interface Extension {
  getTypes(): (typeof MarkdownNode)[];

  getParserExtension(): ParserExtension | null;

  getHtmlRendererExtension(): HtmlRendererExtension | null;

  locateSrcPos(node: Node, offset: number): number;

  locatePointFromSrcPos(node: MarkdownNode, pos: number): NodePoint | null;

  adjustNode(node: MarkdownNode): void;
}
