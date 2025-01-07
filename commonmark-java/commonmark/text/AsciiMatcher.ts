import { BitSet, fromCodePoint } from "@/helpers/index";

import { CharMatcher } from "./interfaces/CharMatcher";

class AsciiMatcherBuilder {
  public readonly set: BitSet;

  public constructor(set: BitSet) {
    this.set = set;
  }

  public c(c: string): AsciiMatcherBuilder {
    if (c.charCodeAt(0) > 127) {
      throw Error("Can only match ASCII characters");
    }

    this.set.set(c.charCodeAt(0));

    return this;
  }

  public anyOf(s: string): AsciiMatcherBuilder;
  public anyOf(characters: Set<string>): AsciiMatcherBuilder;
  public anyOf(data: string | Set<string>): AsciiMatcherBuilder {
    if (typeof data === "string") {
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

  public range(from: string, toInclusive: string): AsciiMatcherBuilder {
    for (let c = from.charCodeAt(0); c <= toInclusive.charCodeAt(0); c++) {
      this.c(fromCodePoint(c));
    }

    return this;
  }

  public build(): AsciiMatcher {
    return new AsciiMatcher(this);
  }
}

/**
 * Char matcher that can match ASCII characters efficiently.
 */
class AsciiMatcher implements CharMatcher {
  private readonly set: BitSet;

  public constructor(builder: AsciiMatcherBuilder) {
    this.set = builder.set;
  }

  public matches(c: string): boolean {
    return this.set.get(c.charCodeAt(0));
  }

  public newBuilder(): AsciiMatcherBuilder {
    return new AsciiMatcherBuilder(this.set.clone());
  }

  public static builder(matcher?: AsciiMatcher): AsciiMatcherBuilder {
    if (matcher) {
      return new AsciiMatcherBuilder(matcher.set.clone());
    } else {
      return new AsciiMatcherBuilder(new BitSet());
    }
  }

  public static Builder = AsciiMatcherBuilder;
}

export default AsciiMatcher;
