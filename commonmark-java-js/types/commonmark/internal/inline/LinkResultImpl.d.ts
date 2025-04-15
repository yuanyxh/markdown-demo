import type { Node } from '@/node';
import type { LinkResult, Position } from '@/parser';
declare enum Type {
    WRAP = "WRAP",
    REPLACE = "REPLACE"
}
declare class LinkResultImpl implements LinkResult {
    setIncludeMarker(): LinkResult;
    static Type: typeof Type;
    private readonly type;
    private readonly node;
    private readonly position;
    private includeMarker;
    constructor(type: Type, node: Node, position: Position);
    getType(): Type;
    getNode(): Node;
    getPosition(): Position;
    isIncludeMarker(): boolean;
}
export default LinkResultImpl;
