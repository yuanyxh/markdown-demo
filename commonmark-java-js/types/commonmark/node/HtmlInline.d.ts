import type { Visitor } from './interfaces/Visitor';
import Node from './abstracts/Node';
/**
 * Inline HTML element.
 *
 * @see <a href="http://spec.commonmark.org/0.31.2/#raw-html">CommonMark Spec</a>
 */
declare class HtmlInline extends Node {
    private literal;
    constructor();
    accept(visitor: Visitor): void;
    getLiteral(): string;
    setLiteral(literal: string): void;
}
export default HtmlInline;
