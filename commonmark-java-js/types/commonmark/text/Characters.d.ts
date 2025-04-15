/**
 * Class for finding characters in strings or checking characters.
 */
declare class Characters {
    static find(c: string, s: string, startIndex: number): number;
    static findLineBreak(s: string, startIndex: number): number;
    /**
     * @see <a href="https://spec.commonmark.org/0.31.2/#blank-line">blank line</a>
     */
    static isBlank(s: string): boolean;
    static hasNonSpace(s: string): boolean;
    static isLetter(s: string, index: number): boolean;
    static isSpaceOrTab(s: string, index: number): boolean;
    /**
     * @see <a href="https://spec.commonmark.org/0.31.2/#unicode-punctuation-character">Unicode punctuation character</a>
     */
    static isPunctuationCodePoint(codePoint: number): boolean;
    /**
     * Check whether the provided code point is a Unicode whitespace character as defined in the spec.
     *
     * @see <a href="https://spec.commonmark.org/0.31.2/#unicode-whitespace-character">Unicode whitespace character</a>
     */
    static isWhitespaceCodePoint(codePoint: number): boolean;
    static skip(skip: string, s: string, startIndex: number, endIndex: number): number;
    static skipBackwards(skip: string, s: string, startIndex: number, lastIndex: number): number;
    static skipSpaceTab(s: string, startIndex: number, endIndex: number): number;
    static skipSpaceTabBackwards(s: string, startIndex: number, lastIndex: number): number;
}
export default Characters;
