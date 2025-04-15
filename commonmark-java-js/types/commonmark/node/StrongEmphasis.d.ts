import type { Delimited } from './interfaces/Delimited';
import type { Visitor } from './interfaces/Visitor';
import Node from './abstracts/Node';
declare class StrongEmphasis extends Node implements Delimited {
    private delimiter;
    constructor(delimiter: string);
    accept(visitor: Visitor): void;
    setDelimiter(delimiter: string): void;
    getOpeningDelimiter(): string;
    getClosingDelimiter(): string;
}
export default StrongEmphasis;
