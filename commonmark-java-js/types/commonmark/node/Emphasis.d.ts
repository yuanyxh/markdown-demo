import type { Delimited } from './interfaces/Delimited';
import type { Visitor } from './interfaces/Visitor';
import Node from './abstracts/Node';
declare class Emphasis extends Node implements Delimited {
    private delimiter;
    constructor(delimiter?: string);
    accept(visitor: Visitor): void;
    setDelimiter(delimiter: string): void;
    getOpeningDelimiter(): string | undefined;
    getClosingDelimiter(): string | undefined;
}
export default Emphasis;
