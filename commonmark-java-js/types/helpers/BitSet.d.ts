declare class BitSet {
    private readonly values;
    constructor(values?: boolean[]);
    set(index: number): void;
    get(index: number): boolean;
    clone(): BitSet;
}
export default BitSet;
