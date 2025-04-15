import type { Visitor } from './interfaces/Visitor';
import Block from './abstracts/Block';
declare class ThematicBreak extends Block {
    private literal;
    constructor();
    accept(visitor: Visitor): void;
    /**
     * @return the source literal that represents this node, if available
     */
    getLiteral(): string | undefined;
    setLiteral(literal: string): void;
}
export default ThematicBreak;
