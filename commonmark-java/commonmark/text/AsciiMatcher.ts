import { BitSet, fromCodePoint } from "../../common";
import { CharMatcher } from "./interfaces/CharMatcher";

class Builder {
  public readonly set: BitSet;

  public constructor(set: BitSet) {
    this.set = set;
  }

  public c(c: string): Builder {
    if (c.charCodeAt(0) > 127) {
      throw Error("Can only match ASCII characters");
    }

    this.set.set(c.charCodeAt(0));

    return this;
  }

  public anyOf(s: string): Builder;
  public anyOf(characters: Set<string>): Builder;
  public anyOf(data: string | Set<string>): Builder {
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

  public range(from: string, toInclusive: string): Builder {
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

  public constructor(builder: Builder) {
    this.set = builder.set;
  }

  public matches(c: string): boolean {
    return this.set.get(c.charCodeAt(0));
  }

  public newBuilder(): Builder {
    return new Builder(this.set.clone());
  }

  public static builder(matcher?: AsciiMatcher): Builder {
    if (matcher) {
      return new Builder(matcher.set.clone());
    } else {
      return new Builder(new BitSet());
    }
  }

  public static Builder = Builder;
}

export default AsciiMatcher;
