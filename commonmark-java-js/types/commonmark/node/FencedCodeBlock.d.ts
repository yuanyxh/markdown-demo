import type { Visitor } from './interfaces/Visitor';
import Block from './abstracts/Block';
declare class FencedCodeBlock extends Block {
    private fenceCharacter;
    private openingFenceLength;
    private closingFenceLength;
    private fenceIndent;
    private info;
    private literal;
    constructor();
    accept(visitor: Visitor): void;
    /**
     * @return the fence character that was used, e.g. {@code `} or {@code ~}, if available, or null otherwise
     */
    getFenceCharacter(): string | undefined;
    /**
     * @param fenceCharacter
     */
    setFenceCharacter(fenceCharacter: string): void;
    /**
     * @return the length of the opening fence (how many of {{@link #getFenceCharacter()}} were used to start the code
     * block) if available, or null otherwise
     */
    getOpeningFenceLength(): number | undefined;
    /**
     * @param openingFenceLength
     */
    setOpeningFenceLength(openingFenceLength: number | undefined): void;
    /**
     * @return the length of the closing fence (how many of {@link #getFenceCharacter()} were used to end the code
     * block) if available, or null otherwise
     */
    getClosingFenceLength(): number | undefined;
    setClosingFenceLength(closingFenceLength: number | undefined): void;
    getFenceIndent(): number | undefined;
    setFenceIndent(fenceIndent: number): void;
    /**
     * @see <a href="http://spec.commonmark.org/0.31.2/#info-string">CommonMark spec</a>
     */
    getInfo(): string | undefined;
    setInfo(info: string): void;
    getLiteral(): string;
    setLiteral(literal: string): void;
    private static checkFenceLengths;
}
export default FencedCodeBlock;
