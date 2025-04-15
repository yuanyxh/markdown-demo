/**
 * Result object for continuing parsing of a block, see static methods for constructors.
 */
declare class BlockContinue {
    static none(): BlockContinue | null;
    static atIndex(newIndex: number): BlockContinue;
    static atColumn(newColumn: number): BlockContinue;
    static finished(): BlockContinue;
}
export default BlockContinue;
