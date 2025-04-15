import Block from './abstracts/Block';
declare abstract class ListBlock extends Block {
    private tight;
    /**
     * @return whether this list is tight or loose
     * @see <a href="https://spec.commonmark.org/0.31.2/#tight">CommonMark Spec for tight lists</a>
     */
    isTight(): boolean;
    setTight(tight: boolean): void;
}
export default ListBlock;
