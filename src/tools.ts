import { Text as MarkdownText, AbstractVisitor } from "./packages/commonmark";

import type { NodeMapAttributeProviderFactory } from "./attribute-provider";
import type { MarkdownNode } from "./packages/commonmark";

type TCallback = (
  newStartContainer: Node,
  newStartOffset: number,
  newEndContainer: Node,
  newEndOffset: number
) => void;

class FindVisitor extends AbstractVisitor {
  private cb!: TCallback;

  private newStartContainer!: Node;
  private newEndContainer!: Node;
  private newStartOffset!: number;
  private newEndOffset!: number;

  constructor(
    private startChangeOffset: number,
    private endChangeOffset: number,
    private nodeMapAttributeProviderFactory: NodeMapAttributeProviderFactory
  ) {
    super();
  }

  public setCallback(cb: TCallback) {
    this.cb = cb;
  }

  public override visit(curr: MarkdownNode) {
    const sourceSpans = curr.getSourceSpans()[0];
    const offset = sourceSpans.getInputIndex();
    const length = sourceSpans.getLength();
    const endOffset = offset + length;

    if (
      this.startChangeOffset >= offset &&
      this.startChangeOffset <= endOffset
    ) {
      if (curr instanceof MarkdownText) {
        this.newStartOffset = this.startChangeOffset - offset;

        const parentMarkdownNode = curr.getParent()!;
        const id =
          this.nodeMapAttributeProviderFactory.getId(parentMarkdownNode);

        const parentElement = window.document.querySelector(
          `[data-id="${id}"]`
        )!;
        const childNodes = parentElement.childNodes;

        let childMarkdownNode = parentMarkdownNode.getFirstChild();
        let index = 0;

        while (childMarkdownNode !== curr) {
          index++;
          childMarkdownNode = childMarkdownNode!.getNext();
        }

        this.newStartContainer = childNodes[index];
      }
    }

    if (this.endChangeOffset >= offset && this.endChangeOffset <= endOffset) {
      if (curr instanceof MarkdownText) {
        this.newEndOffset = this.endChangeOffset - offset;

        const parentMarkdownNode = curr.getParent()!;
        const id =
          this.nodeMapAttributeProviderFactory.getId(parentMarkdownNode);

        const parentElement = window.document.querySelector(
          `[data-id="${id}"]`
        )!;
        const childNodes = parentElement.childNodes;

        let childMarkdownNode = parentMarkdownNode.getFirstChild();
        let index = 0;

        while (childMarkdownNode !== curr) {
          index++;
          childMarkdownNode = childMarkdownNode!.getNext();
        }

        this.newEndContainer = childNodes[index];
      }
    }

    if (this.newStartContainer && this.newEndContainer) {
      this.cb(
        this.newStartContainer,
        this.newStartOffset,
        this.newEndContainer,
        this.newEndOffset
      );
      return true;
    }

    this.visitChildren(curr);
  }
}

export class MarkdownTools {
  constructor(
    private nodeMapAttributeProviderFactory: NodeMapAttributeProviderFactory
  ) {}

  getMarkdownChangeRange(range: StaticRange) {
    const { startContainer, endContainer, startOffset, endOffset } = range;

    const startChangeOffset = this.getMarkdownChangeOffset(
      startContainer,
      startOffset
    );
    const endChangeOffset = this.getMarkdownChangeOffset(
      endContainer,
      endOffset,
      true
    );

    return { startChangeOffset, endChangeOffset };
  }

  getUpdatedMarkdown(
    markdown: string,
    start: number,
    end: number,
    type: string,
    data: string
  ) {
    let newMarkdown = "";

    switch (type) {
      case "insertText":
        newMarkdown = markdown.slice(0, start) + data + markdown.slice(end);
        break;
      case "deleteContentBackward":
        newMarkdown = markdown.slice(0, start) + markdown.slice(end);
        break;
      default:
        break;
    }

    return newMarkdown;
  }

  getElementSelectionRange(
    root: MarkdownNode,
    startChangeOffset: number,
    endChangeOffset: number
  ) {
    const findVisitor = new FindVisitor(
      startChangeOffset,
      endChangeOffset,
      this.nodeMapAttributeProviderFactory
    );

    let newStartContainer!: Node;
    let newEndContainer!: Node;
    let newStartOffset!: number;
    let newEndOffset!: number;

    findVisitor.setCallback((nSC, nSF, nEC, nEF) => {
      newStartContainer = nSC;
      newStartOffset = nSF;
      newEndContainer = nEC;
      newEndOffset = nEF;
    });

    root.getFirstChild()?.accept(findVisitor);

    return { newStartContainer, newEndContainer, newStartOffset, newEndOffset };
  }

  private getMarkdownChangeOffset(
    container: Node,
    offset: number,
    isEnd = false
  ) {
    if (container instanceof Text) {
      const parent = container.parentElement!;

      const parentMarkdownNode = this.nodeMapAttributeProviderFactory.getNode(
        parent.dataset.id!
      );

      const index = Array.from(parent.childNodes).findIndex(
        (ele) => ele === container
      );
      let childMarkdownNode = parentMarkdownNode?.getFirstChild();

      let cursor = 0;
      while (cursor < index) {
        childMarkdownNode = childMarkdownNode?.getNext();
      }

      if (!childMarkdownNode) {
        throw new Error("Can not find the markdown node.");
      }

      const markdownOffset = childMarkdownNode
        .getSourceSpans()[0]
        .getInputIndex();

      return markdownOffset + offset;
    }

    const element = container as HTMLElement;
    const parentMarkdownNode = this.nodeMapAttributeProviderFactory.getNode(
      element.dataset.id!
    )!;

    if (offset === 0) {
      const markdownOffset = parentMarkdownNode
        .getSourceSpans()[0]
        .getInputIndex();

      if (isEnd) {
        const markdownLength = parentMarkdownNode
          .getSourceSpans()[0]
          .getLength();

        return markdownOffset + markdownLength;
      }

      return markdownOffset;
    }

    const childMarkdownNode = parentMarkdownNode.getFirstChild();
    while (offset-- && childMarkdownNode) {
      childMarkdownNode.getNext();
    }

    const markdownOffset = childMarkdownNode!
      .getSourceSpans()[0]
      .getInputIndex();
    const markdownLength = parentMarkdownNode.getSourceSpans()[0].getLength();

    if (isEnd) {
      return markdownOffset + markdownLength;
    }

    return markdownOffset;
  }
}
