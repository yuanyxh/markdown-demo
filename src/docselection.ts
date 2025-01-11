import type { MarkdownNode } from 'commonmark-java-js';

import type Editor from './editor';
import TypeTools from './utils/typetools';
import NodeTools from './utils/nodetools';

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
    // image | code | html | gap
    const children = node.children;

    let curr: MarkdownNode;
    let next: MarkdownNode;
    let nodePoint: NodePoint | false = false;

    for (let i = 0; i < children.length; i++) {
      curr = children[i];
      next = children[i + 1];

      if (position >= curr.inputIndex && position <= curr.inputEndIndex) {
        if ((nodePoint = this.findNodePoint(curr, position))) {
          return nodePoint;
        } else {
          if (TypeTools.isMarkdownText(curr)) {
            nodePoint = { node: curr, offset: position - curr.inputIndex };

            break;
          }

          if (TypeTools.isCode(curr)) {
            const textStart = NodeTools.codePoint(this.context.source, curr);

            if (typeof textStart === 'number') {
              let inputIndex = curr.inputIndex;

              if (TypeTools.isFencedCodeBlock(curr)) {
                inputIndex += (curr.getOpeningFenceLength() || 0) + (curr.getFenceIndent() || 0);
              }

              if (position >= inputIndex + textStart) {
                nodePoint = { node: curr, offset: position - inputIndex - textStart };

                break;
              }
            }
          }

          if (position === curr.inputIndex) {
            nodePoint = { node: node, offset: i };
          } else if (position === curr.inputEndIndex) {
            nodePoint = { node: node, offset: i + 1 };
          } else {
            nodePoint = { node: node, offset: i === 0 ? 0 : i + 1 };
          }

          break;
        }
      } else if (next && position > curr.inputEndIndex && position < next.inputIndex) {
        nodePoint = { node: node, offset: i + 1 };

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
      if (TypeTools.isMarkdownText(startNode) || TypeTools.isInlineCode(endNode)) {
        range.setStart(startNode.meta.$dom.childNodes[0], startOffset);
      } else if (TypeTools.isCodeBlock(startNode)) {
        range.setStart(startNode.meta.$dom.childNodes[0].childNodes[0], startOffset);
      } else {
        range.setStart(startNode.meta.$dom, startOffset);
      }

      if (startNode !== endNode || startOffset !== endOffset) {
        if (TypeTools.isMarkdownText(endNode) || TypeTools.isInlineCode(endNode)) {
          range.setEnd(endNode.meta.$dom.childNodes[0], endOffset);
        } else if (TypeTools.isCodeBlock(endNode)) {
          range.setEnd(endNode.meta.$dom.childNodes[0].childNodes[0], endOffset);
        } else {
          range.setEnd(endNode.meta.$dom, endOffset);
        }
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
