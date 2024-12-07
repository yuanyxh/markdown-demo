import Block from "./abstracts/Block";

/**
 * 列表块的抽象类
 */
abstract class ListBlock extends Block {
  private tight = true;

  /**
   * 是否是紧凑列表
   *
   * @return whether this list is tight or loose
   * @see <a href="https://spec.commonmark.org/0.31.2/#tight">CommonMark Spec for tight lists</a>
   */
  public isTight(): boolean {
    return this.tight;
  }

  /**
   * 设置列表的松紧
   *
   * @param tight
   */
  public setTight(tight: boolean) {
    this.tight = tight;
  }
}

export default ListBlock;
