import type { Visitor } from './interfaces/Visitor';
import Node from './abstracts/Node';
declare class HardLineBreak extends Node {
    constructor();
    accept(visitor: Visitor): void;
}
export default HardLineBreak;
