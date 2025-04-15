import type { BlockParser } from '../interfaces/BlockParser';
/**
 * Result object for starting parsing of a block, see static methods for constructors.
 */
declare abstract class BlockStart {
    static none(): BlockStart | null;
    static of(...blockParsers: BlockParser[]): BlockStart;
    abstract atIndex(newIndex: number): BlockStart;
    abstract atColumn(newColumn: number): BlockStart;
    abstract setReplaceActiveBlockParser(): BlockStart;
}
export default BlockStart;
