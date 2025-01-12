import type { MarkdownNode, Parser } from 'commonmark-java-js';

import type { HtmlRenderer } from '@/renderer';
import type { NodePoint } from './types';

/** Built-in parser extension. Passed to the built-in parser to enhance its functionality. */
export type ParserExtension = (typeof Parser)['ParserExtension'];

/** HTML renderer’s internal extension which permits customized rendering. */
export type HtmlRendererExtension = (typeof HtmlRenderer)['HtmlRendererExtension'];

/**
 * Editor extension for adding auxiliary positioning and source code mapping programs.
 *
 * It can also add parser or renderer extensions. These extensions are passed to the built-in parser and renderer.
 */
export interface Extension {
  /**
   * Return the constructor class corresponding to the nodes that are allowed to be processed by this extension.
   * <p>
   * This will only affect the behavior of the editor. It will not affect the built-in parser and renderer.
   *
   * @returns {(typeof MarkdownNode)[]} constructor class corresponding to the nodes - default at empty arrays
   */
  getTypes(): (typeof MarkdownNode)[];

  /**
   * Return the built-in parser extension. It is processed by the built-in parser.
   *
   * @returns {ParserExtension | null} parser extension - default at null
   */
  getParserExtension(): ParserExtension | null;

  /**
   * Return the built-in renderer extension. It is processed by the built-in renderer.
   *
   * @returns {HtmlRendererExtension | null} renderer extension - default at null
   */
  getHtmlRendererExtension(): HtmlRendererExtension | null;

  /**
   * Program for source code positioning.
   *
   * This program is not influenced by the {@link getTypes()} method. It always runs. When there is no match, it returns -1.
   *
   * @param node DOM Node, typically either anchorNode or focusNode.
   * @param offset node offset
   * @returns {number} The source code position located. - default at -1
   */
  locateSrcPos(node: Node, offset: number): number;

  /**
   * Locate the anchor or focus from the source code position.
   *
   * @param node The Markdown node corresponding to the DOM node.
   * @param pos Position in source code
   * @returns {NodePoint | null} anchor or focus. - default at null
   */
  locatePointFromSrcPos(node: MarkdownNode, pos: number): NodePoint | null;

  /**
   * When the cursor enters a node, adjust the node at the cursor position.
   *
   * This is usually used to display the source code of inline nodes and HTML nodes.
   *
   * @param node The Markdown node corresponding to the DOM node.
   * @returns {void}
   */
  adjustNode(node: MarkdownNode): void;
}
