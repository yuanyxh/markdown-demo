import type { Visitor } from './interfaces/Visitor';
import Block from './abstracts/Block';
declare class Heading extends Block {
    private level;
    constructor();
    accept(visitor: Visitor): void;
    getLevel(): number;
    setLevel(level: number): void;
}
export default Heading;
