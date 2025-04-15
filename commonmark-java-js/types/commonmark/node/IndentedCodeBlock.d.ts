import type { Visitor } from './interfaces/Visitor';
import Block from './abstracts/Block';
declare class IndentedCodeBlock extends Block {
    private literal;
    constructor();
    accept(visitor: Visitor): void;
    getLiteral(): string;
    setLiteral(literal: string): void;
}
export default IndentedCodeBlock;
