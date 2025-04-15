import type { Node } from '@/node';
import type { Position } from '@/parser';
import { ParsedInline } from '@/parser';
declare class ParsedInlineImpl implements ParsedInline {
    private readonly node;
    private readonly position;
    constructor(node: Node, position: Position);
    getNode(): Node;
    getPosition(): Position;
}
export default ParsedInlineImpl;
