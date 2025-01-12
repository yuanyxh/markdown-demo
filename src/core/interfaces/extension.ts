import type { MarkdownNode, Parser } from 'commonmark-java-js';

import type Editor from '@/editor';
import type { HtmlRenderer, HtmlNodeRendererContext } from '@/renderer';
import type { NodePoint } from './types';

export type ParserExtension = (typeof Parser)['ParserExtension'];
export type HtmlRendererExtension = (typeof HtmlRenderer)['HtmlRendererExtension'];

export interface EnhanceextensionConfig {
  context: Editor;
}

export interface Extension {
  getTypes(): (typeof MarkdownNode)[];

  locateSrcPos(node: Node, offset: number): number;

  locatePointFromSrcPos(node: MarkdownNode, pos: number): NodePoint | null;

  render(rendererContext: HtmlNodeRendererContext, node: MarkdownNode): void | null;

  getParserExtension(): ParserExtension | null;

  getHtmlRendererExtension(): HtmlRendererExtension | null;
}
