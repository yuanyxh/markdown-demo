import type EditorContext from './EditorContext';
import type ContentView from './views/abstracts/contentview';

export interface EditorSelection {
  readonly start: number;
  readonly end: number;
}

export interface NodePoint {
  node: Node;
  offset: number;
}

class EditorCursor {
  private context: EditorContext;
  private _selection: EditorSelection = { start: 0, end: 0 };

  constructor(context: EditorContext) {
    this.context = context;
  }

  get selection(): EditorSelection {
    return this._selection;
  }

  private locateRange(): Omit<StaticRange, 'collapsed'> | null {
    let start: NodePoint | null;
    let end: NodePoint | null;

    const { start: from, end: to } = this.selection;

    start = this.findNodePoint(this.context.docView, from);

    if (to === from) {
      end = start;
    } else {
      end = this.findNodePoint(this.context.docView, to);
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

  private findNodePoint(view: ContentView, position: number): NodePoint | null {
    const children = view.children;

    let curr: ContentView;
    let next: ContentView;
    let nodePoint: NodePoint | null = null;

    for (let i = 0; i < children.length; i++) {
      curr = children[i];
      next = children[i + 1];

      if (next && position > curr.node.inputEndIndex && position < next.node.inputIndex) {
        return { node: view.dom, offset: i + 1 };
      }

      if (position >= curr.node.inputIndex && position <= curr.node.inputEndIndex) {
        nodePoint = this.findNodePoint(curr, position);

        if (nodePoint) {
          return nodePoint;
        }

        nodePoint = curr.locatePointFromSrcPos(position);

        if (!nodePoint) {
          if (position === curr.node.inputIndex) {
            nodePoint = { node: view.dom, offset: i };
          } else if (position === curr.node.inputEndIndex) {
            nodePoint = { node: view.dom, offset: i + 1 };
          } else {
            nodePoint = { node: view.dom, offset: i === 0 ? 0 : i + 1 };
          }
        }

        return nodePoint;
      }
    }

    return nodePoint;
  }

  private setRange() {
    const newRange = this.locateRange();
    const selection = window.document.getSelection();

    if (!selection || window.document.activeElement !== this.context.docView.dom || !newRange) {
      return;
    }

    let range: Range;

    if (selection.rangeCount) {
      range = selection.getRangeAt(0);
    } else {
      range = new Range();
    }

    range.setStart(newRange.startContainer, newRange.startOffset);

    if (
      newRange.startContainer !== newRange.endContainer ||
      newRange.startOffset !== newRange.endOffset
    ) {
      range.setEnd(newRange.endContainer, newRange.endOffset);
    } else {
      range.collapse(true);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  }

  leftShift(len: number, collapsed = true): void {
    const newStart = this.selection.start - len;

    this._selection = { start: newStart, end: collapsed ? newStart : this.selection.end - len };

    this.setRange();
  }

  rightShift(len: number, collapsed = true): void {
    const newStart = this.selection.start + len;

    this._selection = { start: newStart, end: collapsed ? newStart : this.selection.end + len };

    this.setRange();
  }

  setCursor(selection: EditorSelection): void {
    this.updateSelection(selection);

    this.setRange();
  }

  updateSelection(selection: EditorSelection): void {
    this._selection = selection;
  }
}

export default EditorCursor;
