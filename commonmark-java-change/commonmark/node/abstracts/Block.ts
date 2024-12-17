import MarkdownNode from "./MarkdownNode";

/**
 * Block nodes such as paragraphs, list blocks, code blocks etc.
 */
abstract class Block extends MarkdownNode {
  public getContentIndex() {
    const child = this.getFirstChild();

    if (child === null) {
      const sources = this.getSourceSpans();
      const source = sources[0];

      if (source) {
        return source.getInputIndex() + source.getLength();
      }

      return -1;
    }

    const childSources = child.getSourceSpans();
    const source = childSources[0];

    if (source) {
      return source.getInputIndex();
    }

    return -1;
  }

  public override getParent(): Block | null {
    const parent = super.getParent();

    if (parent) {
      if (parent instanceof Block) {
        return parent;
      } else {
        throw new Error(
          "Warning: The parent node is not a block. This is an error."
        );
      }
    }

    return null;
  }

  public override setParent(parent: MarkdownNode): void {
    if (!(parent instanceof Block)) {
      throw Error("Parent of block must also be block (can not be inline)");
    }

    super.setParent(parent);
  }
}

export default Block;
