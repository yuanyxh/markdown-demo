import type { MarkdownNode } from 'commonmark-java-js';

import type Editor from './editor';
import type { EditorRange, Extension, NodePoint, Selection } from '@/interfaces';

import { getDomOfType } from '@/utils';

interface DocSelectionConfig {
  context: Editor;
}

class DocSelection {
  private context: Editor;

  public constructor(config: DocSelectionConfig) {
    this.context = config.context;
  }

  public updateSelection(updateSelection?: Selection) {
    if (
      !updateSelection ||
      (updateSelection.from === 0 && updateSelection.to === this.context.length)
    ) {
      return this.setRange({
        startContainer: getDomOfType(this.context.doc),
        startOffset: 0,
        endContainer: getDomOfType(this.context.doc),
        endOffset: this.context.doc.children.length
      });
    }

    updateSelection.to ??= this.context.length;

    if (updateSelection.from > updateSelection.to) {
      [updateSelection.from, updateSelection.to] = [updateSelection.to, updateSelection.from];
    }

    const selectionRange = this.locateRange(updateSelection.from, updateSelection.to);

    if (selectionRange) {
      return this.setRange(selectionRange);
    }

    return false;
  }

  public locateRange(from: number, to: number): EditorRange | null {
    let start: NodePoint | null;
    let end: NodePoint | null;

    if (from === 0) {
      start = { node: getDomOfType(this.context.doc), offset: 0 };
    } else {
      start = this.findNodePoint(this.context.doc, from);
    }

    if (to === from) {
      end = start;
    } else if (to === this.context.length) {
      end = { node: getDomOfType(this.context.doc), offset: this.context.doc.children.length };
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
        return { node: getDomOfType(node), offset: i + 1 };
      }

      if (position >= curr.inputIndex && position <= curr.inputEndIndex) {
        nodePoint = this.findNodePoint(curr, position);

        if (nodePoint) {
          return nodePoint;
        }

        this.context
          .getPlugins(Object.getPrototypeOf(curr)?.constructor)
          .find((plugin) => (nodePoint = plugin.locatePointFromSrcPos(curr, position)));

        if (!nodePoint) {
          if (position === curr.inputIndex) {
            nodePoint = { node: getDomOfType(node), offset: i };
          } else if (position === curr.inputEndIndex) {
            nodePoint = { node: getDomOfType(node), offset: i + 1 };
          } else {
            nodePoint = { node: getDomOfType(node), offset: i === 0 ? 0 : i + 1 };
          }
        }

        return nodePoint;
      }
    }

    return nodePoint;
  }

  private setRange({ startContainer, startOffset, endContainer, endOffset }: EditorRange) {
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
