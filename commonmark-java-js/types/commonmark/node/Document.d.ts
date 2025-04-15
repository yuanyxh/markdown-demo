import type { Visitor } from './interfaces/Visitor';
import Block from './abstracts/Block';
declare class Document extends Block {
    constructor();
    accept(visitor: Visitor): void;
}
export default Document;
