import MarkdownNode from "./MarkdownNode";

/**
 * Block nodes such as paragraphs, list blocks, code blocks etc.
 */
abstract class Block extends MarkdownNode {
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
