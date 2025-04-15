import type { Visitor } from './interfaces/Visitor';
import Block from './abstracts/Block';
/**
 * A paragraph block, contains inline nodes such as {@link Text}
 */
declare class Paragraph extends Block {
    constructor();
    accept(visitor: Visitor): void;
}
export default Paragraph;
