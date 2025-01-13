import type Editor from './editor';
import type {
  EditorContextConfig,
  EditorRange,
  ExtendsMarkdownNode,
  NodePoint,
  RangeBounds
} from '@/types';

import { ElementTools, NodeTools } from '@/utils';

class DocSelection {
  private context: Editor;

  private innerRangeBounds: Required<RangeBounds> | null = null;
  private scopes: Node[] = [];

  public constructor(config: EditorContextConfig) {
    this.context = config.context;
  }

  /**
   * @returns {Required<RangeBounds> | null} The delineated range within the editor. When the focus is not within the editor, it is null.
   */
  public get rangeBounds(): Required<RangeBounds> | null {
    if (this.innerRangeBounds) {
      return { ...this.innerRangeBounds };
    }

    return null;
  }

  /**
   * Update the delineated range of the source code in the editor.
   *
   * @returns {boolean} When the update is successful, return true.
   */
  public updateRangeBounds(): boolean {
    const range = this.getDOMRange();

    let result = false;
    let rangeBounds: Required<RangeBounds>;

    try {
      if (
        range &&
        (rangeBounds = this.context.locateSrcPos(range)) &&
        this.context.checkRangeBounds(rangeBounds)
      ) {
        if (
          this.innerRangeBounds &&
          rangeBounds.from === this.innerRangeBounds.from &&
          rangeBounds.to === this.innerRangeBounds.to
        ) {
          return (result = false);
        }

        this.innerRangeBounds = rangeBounds;

        return (result = true);
      }

      this.innerRangeBounds = null;
    } finally {
      this.updateScopes(range);

      return result;
    }
  }

  /**
   * Update the selection range in the editor.
   *
   * @param rangeBounds Define boundaries in the source code.
   * @returns {boolean} Whether the selection area is changed. true - yes | false - no.
   */
  public updateSelection(rangeBounds?: Required<RangeBounds>): boolean {
    if (!rangeBounds || (rangeBounds.from === 0 && rangeBounds.to === this.context.length)) {
      return this.setRange({
        startContainer: ElementTools.getDomByNodeType(this.context.doc),
        startOffset: 0,
        endContainer: ElementTools.getDomByNodeType(this.context.doc),
        endOffset: this.context.doc.children.length
      });
    }

    const selectionRange = this.locateRange(rangeBounds.from, rangeBounds.to);

    if (selectionRange) {
      return this.setRange(selectionRange);
    }

    return false;
  }

  /**
   * Locate the dom range according to the defined boundaries in the source code.
   *
   * @param from Start offset in the source code.
   * @param to End offset in the source code.
   * @returns {EditorRange | null} Editor range.
   */
  public locateRange(from: number, to: number): EditorRange | null {
    let start: NodePoint | null;
    let end: NodePoint | null;

    if (from === 0) {
      start = { node: ElementTools.getDomByNodeType(this.context.doc), offset: 0 };
    } else {
      start = this.findNodePoint(this.context.doc, from);
    }

    if (to === from) {
      end = start;
    } else if (to === this.context.length) {
      end = {
        node: ElementTools.getDomByNodeType(this.context.doc),
        offset: this.context.doc.children.length
      };
    } else {
      end = this.findNodePoint(this.context.doc, to);
    }

    if (!(start && end)) {
      return null;
    }

    return {
      startContainer: start.node,
      startOffset: start.offset,
      endContainer: end.node,
      endOffset: end.offset
    };
  }

  /**
   * Obtain the DOM range.
   *
   * @returns {EditorRange | null} DOM range.
   */
  public getDOMRange(): EditorRange | null {
    const originSelection = this.context.root.getSelection();

    if (!(this.context.isFocus && originSelection && originSelection.rangeCount !== 0)) {
      return (this.innerRangeBounds = null);
    }

    return originSelection.getRangeAt(0);
  }

  /**
   * Update the nodes within the scope of the selection.
   *
   * @param range
   * @returns {boolean}
   */
  private updateScopes(range: EditorRange | null): boolean {
    if (!range) {
      if (this.scopes.length) {
        this.scopes.length = 0;

        return this.forceRerender();
      }

      return false;
    }

    const scopes = this.getScopes(range);
    let result = this.scopes.length !== scopes.length;

    for (let i = 0; i < this.scopes.length; i++) {
      if (!scopes.includes(this.scopes[i])) {
        result = true;

        break;
      }
    }

    this.scopes = scopes;

    return result ? this.forceRerender() : false;
  }

  /**
   * Obtain the nodes within the scope of the selection.
   *
   * @param range
   * @returns {Node[]}
   */
  private getScopes(range: EditorRange): Node[] {
    const result: Node[] = [];

    let node: Node | null = range.startContainer;

    while (node && node !== this.context.dom) {
      if (node.$virtNode && this.context.isInRangeScope(node.$virtNode)) {
        result.push(node);
      }

      node = node.parentNode;
    }

    node = range.endContainer;
    if (node !== range.startContainer) {
      while (node && node !== this.context.dom) {
        if (
          node.$virtNode &&
          this.context.isInRangeScope(node.$virtNode) &&
          !result.includes(node)
        ) {
          result.push(node);
        }

        node = node.parentNode;
      }
    }

    return result;
  }

  /**
   * Forcibly re-execute the check for whether rendering is needed.
   *
   * @returns {boolean}
   */
  private forceRerender(): boolean {
    const cacheRangeBounds = this.context.rangeBounds;

    if (!cacheRangeBounds) {
      return false;
    }

    const result = this.context.dispatch({
      type: 'insert',
      force: true,
      from: 0,
      text: this.context.source
    });

    if (result) {
      return this.updateSelection(cacheRangeBounds);
    }

    return false;
  }

  /**
   * Find the DOM node point according to the position in the source code.
   *
   * @param node Markdown node.
   * @param position Position in the source code.
   * @returns
   */
  private findNodePoint(node: ExtendsMarkdownNode, position: number): NodePoint | null {
    const children = node.children;

    let curr: ExtendsMarkdownNode;
    let next: ExtendsMarkdownNode;
    let nodePoint: NodePoint | null = null;

    for (let i = 0; i < children.length; i++) {
      curr = children[i];
      next = children[i + 1];

      if (next && position > curr.inputEndIndex && position < next.inputIndex) {
        return { node: ElementTools.getDomByNodeType(node), offset: i + 1 };
      }

      if (position >= curr.inputIndex && position <= curr.inputEndIndex) {
        nodePoint = this.findNodePoint(curr, position);

        if (nodePoint) {
          return nodePoint;
        }

        // Apply plugins and execute the locatePointFromSrcPos program to help the editor locate.
        this.context
          .getPlugins(NodeTools.getConstructor(curr))
          .find((plugin) => (nodePoint = plugin.locatePointFromSrcPos(curr, position)));

        if (!nodePoint) {
          if (position === curr.inputIndex) {
            nodePoint = { node: ElementTools.getDomByNodeType(node), offset: i };
          } else if (position === curr.inputEndIndex) {
            nodePoint = { node: ElementTools.getDomByNodeType(node), offset: i + 1 };
          } else {
            nodePoint = { node: ElementTools.getDomByNodeType(node), offset: i === 0 ? 0 : i + 1 };
          }
        }

        return nodePoint;
      }
    }

    return nodePoint;
  }

  /**
   * Set dom range on the editor.
   *
   * @param param0
   * @returns {boolean} Selection area setting result. True means yes. False means no.
   */
  private setRange({ startContainer, startOffset, endContainer, endOffset }: EditorRange): boolean {
    const selection = this.context.root.getSelection();

    if (!selection) {
      return false;
    }

    let range: Range;

    if (selection.rangeCount) {
      range = selection.getRangeAt(0);
    } else {
      range = new Range();
    }

    try {
      range.setStart(startContainer, startOffset);

      if (startContainer !== endContainer || startOffset !== endOffset) {
        range.setEnd(endContainer, endOffset);
      } else {
        range.collapse(true);
      }

      selection.removeAllRanges();
      selection.addRange(range);
    } catch (error) {
      console.error(error);

      return false;
    }

    return true;
  }
}

export default DocSelection;
