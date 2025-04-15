import type { Visitor } from './interfaces/Visitor';
import Node from './abstracts/Node';
declare class Image extends Node {
    private destination;
    private title;
    constructor(destination?: string, title?: string);
    accept(visitor: Visitor): void;
    getDestination(): string;
    setDestination(destination: string): void;
    getTitle(): string | undefined;
    setTitle(title?: string): void;
    protected toStringAttributes(): string;
}
export default Image;
