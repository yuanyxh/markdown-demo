import Block from "./abstracts/Block";

abstract class ListBlock extends Block {
  private tight = true;

  /**
   * @return whether this list is tight or loose
   * @see <a href="https://spec.commonmark.org/0.31.2/#tight">CommonMark Spec for tight lists</a>
   */
  public isTight(): boolean {
    return this.tight;
  }

  public setTight(tight: boolean) {
    this.tight = tight;
  }
}

export default ListBlock;