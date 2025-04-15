import type { Visitor } from './interfaces/Visitor';
import Node from './abstracts/Node';
declare class Code extends Node {
    private literal;
    constructor(literal?: string);
    accept(visitor: Visitor): void;
    getLiteral(): string;
    setLiteral(literal: string): void;
}
export default Code;
