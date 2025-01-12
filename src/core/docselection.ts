import type { MarkdownNode } from 'commonmark-java-js';

import type Editor from './editor';
import type { EditorContextConfig, EditorRange, NodePoint, RangeBounds } from '@/interfaces';

import { ElementTools, NodeTools } from '@/utils';

class DocSelection {
  private context: Editor;

  public constructor(config: EditorContextConfig) {
    this.context = config.context;
  }

  public updateSelection(rangeBounds?: RangeBounds): boolean {
    if (!rangeBounds || (rangeBounds.from === 0 && rangeBounds.to === this.context.length)) {
      return this.setRange({
        startContainer: ElementTools.getDomFromNode(this.context.doc),
        startOffset: 0,
        endContainer: ElementTools.getDomFromNode(this.context.doc),
        endOffset: this.context.doc.children.length
      });
    }

    rangeBounds.to ??= this.context.length;

    if (rangeBounds.from > rangeBounds.to) {
      [rangeBounds.from, rangeBounds.to] = [rangeBounds.to, rangeBounds.from];
    }

    const selectionRange = this.locateRange(rangeBounds.from, rangeBounds.to);

    if (selectionRange) {
      return this.setRange(selectionRange);
    }

    return false;
  }

  public locateRange(from: number, to: number): EditorRange | null {
    let start: NodePoint | null;
    let end: NodePoint | null;

    if (from === 0) {
      start = { node: ElementTools.getDomFromNode(this.context.doc), offset: 0 };
    } else {
      start = this.findNodePoint(this.context.doc, from);
    }

    if (to === from) {
      end = start;
    } else if (to === this.context.length) {
      end = {
        node: ElementTools.getDomFromNode(this.context.doc),
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

  private findNodePoint(node: MarkdownNode, position: number): NodePoint | null {
    const children = node.children;

    let curr: MarkdownNode;
    let next: MarkdownNode;
    let nodePoint: NodePoint | null = null;

    for (let i = 0; i < children.length; i++) {
      curr = children[i];
      next = children[i + 1];

      if (next && position > curr.inputEndIndex && position < next.inputIndex) {
        return { node: ElementTools.getDomFromNode(node), offset: i + 1 };
      }

      if (position >= curr.inputIndex && position <= curr.inputEndIndex) {
        nodePoint = this.findNodePoint(curr, position);

        if (nodePoint) {
          return nodePoint;
        }

        this.context
          .getPlugins(NodeTools.getConstructor(curr))
          .find((plugin) => (nodePoint = plugin.locatePointFromSrcPos(curr, position)));

        if (!nodePoint) {
          if (position === curr.inputIndex) {
            nodePoint = { node: ElementTools.getDomFromNode(node), offset: i };
          } else if (position === curr.inputEndIndex) {
            nodePoint = { node: ElementTools.getDomFromNode(node), offset: i + 1 };
          } else {
            nodePoint = { node: ElementTools.getDomFromNode(node), offset: i === 0 ? 0 : i + 1 };
          }
        }

        return nodePoint;
      }
    }

    return nodePoint;
  }

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
