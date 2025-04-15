import type { Visitor } from './interfaces/Visitor';
import Node from './abstracts/Node';
declare class SoftLineBreak extends Node {
    constructor();
    accept(visitor: Visitor): void;
}
export default SoftLineBreak;
