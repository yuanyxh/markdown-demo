import { BitSet, fromCodePoint } from '@helpers/index';

import { CharMatcher } from './interfaces/CharMatcher';

class AsciiMatcherBuilder {
  readonly set: BitSet;

  constructor(set: BitSet) {
    this.set = set;
  }

  c(c: string): AsciiMatcherBuilder {
    if (c.charCodeAt(0) > 127) {
      throw Error('Can only match ASCII characters');
    }

    this.set.set(c.charCodeAt(0));

    return this;
  }

  anyOf(s: string): AsciiMatcherBuilder;
  anyOf(characters: Set<string>): AsciiMatcherBuilder;
  anyOf(data: string | Set<string>): AsciiMatcherBuilder {
    if (typeof data === 'string') {
      for (let i = 0; i < data.length; i++) {
        this.c(data.charAt(i));
      }
    } else {
      for (const c of data) {
        this.c(c);
      }
    }

    return this;
  }

  range(from: string, toInclusive: string): AsciiMatcherBuilder {
    for (let c = from.charCodeAt(0); c <= toInclusive.charCodeAt(0); c++) {
      this.c(fromCodePoint(c));
    }

    return this;
  }

  build(): AsciiMatcher {
    return new AsciiMatcher(this);
  }
}

/**
 * Char matcher that can match ASCII characters efficiently.
 */
class AsciiMatcher implements CharMatcher {
  private readonly set: BitSet;

  constructor(builder: AsciiMatcherBuilder) {
    this.set = builder.set;
  }

  matches(c: string): boolean {
    return this.set.get(c.charCodeAt(0));
  }

  newBuilder(): AsciiMatcherBuilder {
    return new AsciiMatcherBuilder(this.set.clone());
  }

  static builder(matcher?: AsciiMatcher): AsciiMatcherBuilder {
    if (matcher) {
      return new AsciiMatcherBuilder(matcher.set.clone());
    } else {
      return new AsciiMatcherBuilder(new BitSet());
    }
  }

  static Builder = AsciiMatcherBuilder;
}

export default AsciiMatcher;
