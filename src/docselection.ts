import type { MarkdownNode } from 'commonmark-java-js';

import type Editor from './editor';
import TypeTools from './utils/typetools';
import NodeTools from './utils/nodetools';
import { getDom, getDomOfType } from './utils/element';

interface DocSelectionConfig {
  context: Editor;
}

interface NodePoint {
  node: Node;
  offset: number;
}

interface SelectionRange {
  startNode: Node;
  startOffset: number;
  endNode: Node;
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
        startNode: getDom(this.context.doc),
        startOffset: 0,
        endNode: getDom(this.context.doc),
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

  public locateRange(from: number, to: number): SelectionRange | false {
    let start: NodePoint | false;
    let end: NodePoint | false;

    if (from === 0) {
      start = { node: getDom(this.context.doc), offset: 0 };
    } else {
      start = this.findNodePoint(this.context.doc, from);
    }

    if (to === from) {
      end = start;
    } else if (to === this.context.length) {
      end = { node: getDom(this.context.doc), offset: this.context.doc.children.length };
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
    const children = node.children;

    let curr: MarkdownNode;
    let next: MarkdownNode;
    let nodePoint: NodePoint | false = false;

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

        if (TypeTools.isMarkdownText(curr)) {
          return { node: getDomOfType(curr), offset: position - curr.inputIndex };
        }

        if (TypeTools.isCode(curr)) {
          const textRange = NodeTools.codePoint(this.context.source, curr);

          if (textRange !== false) {
            let inputIndex = curr.inputIndex;

            if (TypeTools.isFencedCodeBlock(curr)) {
              inputIndex += (curr.getOpeningFenceLength() || 0) + (curr.getFenceIndent() || 0);
            }

            if (
              position >= inputIndex + textRange.textStart &&
              position <= inputIndex + textRange.textStart + textRange.textEnd
            ) {
              return {
                node: getDomOfType(curr),
                offset: position - inputIndex - textRange.textStart
              };
            }
          }
        }

        if (position === curr.inputIndex) {
          nodePoint = { node: getDomOfType(node), offset: i };
        } else if (position === curr.inputEndIndex) {
          nodePoint = { node: getDomOfType(node), offset: i + 1 };
        } else {
          nodePoint = { node: getDomOfType(node), offset: i === 0 ? 0 : i + 1 };
        }

        break;
      }
    }

    return nodePoint;
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

    try {
      range.setStart(startNode, startOffset);

      if (startNode !== endNode || startOffset !== endOffset) {
        range.setEnd(endNode, endOffset);
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
