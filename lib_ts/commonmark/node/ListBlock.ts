import Block from "./Block";

abstract class ListBlock extends Block {
  private tight: boolean;

  /**
   * @return whether this list is tight or loose
   * @see <a href="https://spec.commonmark.org/0.31.2/#tight">CommonMark Spec for tight lists</a>
   */
  public isTight(): boolean {
    return this.tight;
  }

  public setTight(tight: boolean): void {
    this.tight = tight;
  }
}

export default ListBlock;
