import MarkdownNode from "./MarkdownNode";

/**
 * Block nodes such as paragraphs, list blocks, code blocks etc.
 *
 * 块节点的公共抽象类，例如段落、列表块、代码块等
 */
abstract class Block extends MarkdownNode {
  /**
   * 获取父级块节点
   *
   * @returns
   */
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

  /**
   * 设置当前块的父级块节点
   *
   * @param parent
   */
  public override setParent(parent: MarkdownNode): void {
    if (!(parent instanceof Block)) {
      throw Error("Parent of block must also be block (can not be inline)");
    }

    super.setParent(parent);
  }
}

export default Block;
