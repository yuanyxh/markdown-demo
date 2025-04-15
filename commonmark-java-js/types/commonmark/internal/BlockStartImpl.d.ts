import type { BlockParser } from '@/parser';
import { BlockStart } from '@/parser';
declare class BlockStartImpl extends BlockStart {
    private readonly blockParsers;
    private newIndex;
    private newColumn;
    private replaceActiveBlockParser;
    constructor(...blockParsers: BlockParser[]);
    getBlockParsers(): BlockParser[];
    getNewIndex(): number;
    getNewColumn(): number;
    isReplaceActiveBlockParser(): boolean;
    atIndex(newIndex: number): BlockStart;
    atColumn(newColumn: number): BlockStart;
    setReplaceActiveBlockParser(): BlockStart;
}
export default BlockStartImpl;
