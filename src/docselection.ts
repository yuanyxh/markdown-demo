import type { MarkdownNode } from 'commonmark-java-js';

import type Editor from './editor';

interface DocSelectionConfig {
  context: Editor;
}

interface UpdateSelection {
  from: number;
  to?: number;
}

interface NodePoint {
  node: MarkdownNode;
  offset: number;
}

interface SelectionRange {
  startNode: MarkdownNode;
  startOffset: number;
  endNode: MarkdownNode;
  endOffset: number;
}

function findNodePoint(node: MarkdownNode, position: number): NodePoint | false {
  // image | code | html | gap
  const children = node.children;

  let curr: MarkdownNode;
  let nodePoint: NodePoint | false = false;

  for (let i = 0; i < children.length; i++) {
    curr = children[i];
  }

  return nodePoint;
}

class DocSelection {
  private context: Editor;

  public constructor(config: DocSelectionConfig) {
    this.context = config.context;
  }

  public updateSelection(updateSelection?: UpdateSelection) {
    if (
      !updateSelection ||
      (updateSelection.from === 0 && updateSelection.to === this.context.length)
    ) {
      return this.setRange({
        startNode: this.context.doc,
        startOffset: 0,
        endNode: this.context.doc,
        endOffset: this.context.doc.children.length
      });
    }

    updateSelection.to ??= this.context.length;

    if (updateSelection.from > updateSelection.to) {
      [updateSelection.from, updateSelection.to] = [updateSelection.to, updateSelection.from];
    }

    const selectionRange = this.locateRange(updateSelection.from, updateSelection.to);

    if (selectionRange) {
      this.setRange(selectionRange);
    }
  }

  public locateRange(from: number, to: number): SelectionRange | false {
    let start: NodePoint | false;
    let end: NodePoint | false;

    if (from === 0) {
      start = { node: this.context.doc, offset: 0 };
    } else {
      start = this.findNodePoint(this.context.doc, from);
    }

    if (to === from) {
      end = start;
    } else if (to === this.context.length) {
      end = { node: this.context.doc, offset: this.context.doc.children.length };
    } else {
      end = this.findNodePoint(this.context.doc, to);
    }

    if (!(start && end)) {
      return false;
    }

    return {
      startNode: start.node,
      startOffset: start.offset,
      endNode: end.node,
      endOffset: end.offset
    };
  }

  private findNodePoint(node: MarkdownNode, position: number): NodePoint | false {
    return findNodePoint(node, position);
  }

  private setRange({ startNode, startOffset, endNode, endOffset }: SelectionRange) {
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

    range.setStart(startNode.meta.$dom, startOffset);

    if (startNode !== endNode || startOffset !== endOffset) {
      range.setEnd(endNode.meta.$dom, endOffset);

      return true;
    } else {
      range.collapse(true);
    }

    selection.removeAllRanges();
    selection.addRange(range);

    return true;
  }
}

export default DocSelection;
