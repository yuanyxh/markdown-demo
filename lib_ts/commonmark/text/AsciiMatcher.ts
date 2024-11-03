class Builder {
  public readonly set: java.util.BitSet;

  public constructor(set: java.util.BitSet) {
    this.set = set;
  }

  public c(c: string): Builder {
    if (c.codePointAt(0)! > 127) {
      throw Error("Can only match ASCII characters");
    }

    this.set.set(c);

    return this;
  }

  public anyOf(s: string): Builder;
  public anyOf(characters: Set<Character>): Builder;
  public anyOf(data: string | Set<Character>): Builder {
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
    for (let c = from.codePointAt(0)!; c <= toInclusive.codePointAt(0)!; c++) {
      this.c(String.fromCodePoint(c));
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
export class AsciiMatcher implements CharMatcher {
  private readonly set: java.util.BitSet;

  public constructor(builder: Builder) {
    this.set = builder.set;
  }

  public matches(c: string): boolean {
    return this.set.get(c.codePointAt(0));
  }

  public newBuilder(): Builder {
    return new Builder(this.set.clone() as java.util.BitSet);
  }

  public static builder(): Builder;
  public static builder(matcher: AsciiMatcher): Builder;
  public static builder(matcher?: AsciiMatcher): Builder {
    if (matcher) {
      return new Builder(matcher.set.clone());
    } else {
      new Builder(new BitSet());
    }
  }

  public static Builder = Builder;
}
