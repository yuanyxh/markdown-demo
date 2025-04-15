declare class BlockContent {
    private readonly sb;
    private lineCount;
    constructor(content?: string);
    add(line: string): void;
    getString(): string;
}
export default BlockContent;
