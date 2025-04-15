declare class Appendable {
    private data;
    constructor(initStr?: string);
    append(str: string, start?: number, end?: number): void;
    length(): number;
    toString(): string;
}
export default Appendable;
