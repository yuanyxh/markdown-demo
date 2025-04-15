import { BitSet } from '@helpers/index';
import { CharMatcher } from './interfaces/CharMatcher';
declare class AsciiMatcherBuilder {
    readonly set: BitSet;
    constructor(set: BitSet);
    c(c: string): AsciiMatcherBuilder;
    anyOf(s: string): AsciiMatcherBuilder;
    anyOf(characters: Set<string>): AsciiMatcherBuilder;
    range(from: string, toInclusive: string): AsciiMatcherBuilder;
    build(): AsciiMatcher;
}
/**
 * Char matcher that can match ASCII characters efficiently.
 */
declare class AsciiMatcher implements CharMatcher {
    private readonly set;
    constructor(builder: AsciiMatcherBuilder);
    matches(c: string): boolean;
    newBuilder(): AsciiMatcherBuilder;
    static builder(matcher?: AsciiMatcher): AsciiMatcherBuilder;
    static Builder: typeof AsciiMatcherBuilder;
}
export default AsciiMatcher;
