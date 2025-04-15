import type { Visitor } from './interfaces/Visitor';
import Block from './abstracts/Block';
/**
 * HTML block
 *
 * @see <a href="http://spec.commonmark.org/0.31.2/#html-blocks">CommonMark Spec</a>
 */
declare class HtmlBlock extends Block {
    private literal;
    constructor();
    accept(visitor: Visitor): void;
    getLiteral(): string;
    setLiteral(literal: string): void;
}
export default HtmlBlock;
