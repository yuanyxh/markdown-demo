import type { Visitor } from './interfaces/Visitor';
import Block from './abstracts/Block';
declare class BlockQuote extends Block {
    constructor();
    accept(visitor: Visitor): void;
}
export default BlockQuote;
