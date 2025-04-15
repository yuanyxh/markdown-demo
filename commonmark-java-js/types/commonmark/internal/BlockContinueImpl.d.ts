import { BlockContinue } from '@/parser';
declare class BlockContinueImpl extends BlockContinue {
    private readonly newIndex;
    private readonly newColumn;
    private readonly finalize;
    constructor(newIndex: number, newColumn: number, finalize: boolean);
    getNewIndex(): number;
    getNewColumn(): number;
    isFinalize(): boolean;
}
export default BlockContinueImpl;
