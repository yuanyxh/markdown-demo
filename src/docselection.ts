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

    this.setRange(this.locateRange(updateSelection.from, updateSelection.to));
  }

  public locateRange(from: number, to: number): SelectionRange {
    let start: NodePoint;
    let end: NodePoint;

    if (from === 0) {
      start = { node: this.context.doc, offset: 0 };
    } else {
      start = this.findPoint(this.context.doc, from);
    }

    if (to === from) {
      end = start;
    } else if (to === this.context.length) {
      end = { node: this.context.doc, offset: this.context.doc.children.length };
    } else {
      end = this.findPoint(this.context.doc, to);
    }

    return {
      startNode: start.node,
      startOffset: start.offset,
      endNode: end.node,
      endOffset: end.offset
    };
  }

  private findPoint(node: MarkdownNode, position: number): NodePoint {
    // image | code | html | gap
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
