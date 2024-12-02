import { BitSet, fromCodePoint } from "../../helpers";
import { CharMatcher } from "./interfaces/CharMatcher";

/**
 * AsciiMatcher 的编译器
 */
class AsciiMatcherBuilder {
  public readonly set: BitSet;

  public constructor(set: BitSet) {
    this.set = set;
  }

  /**
   * 设置字符到 set 中
   *
   * @param c
   * @returns
   */
  public c(c: string): AsciiMatcherBuilder {
    if (c.charCodeAt(0) > 127) {
      throw Error("Can only match ASCII characters");
    }

    this.set.set(c.charCodeAt(0));

    return this;
  }

  /**
   * 字符集设置到 set 中
   *
   * @param s
   */
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

  /**
   * 将 from 到 toInclusive 的字符设置到 set 中
   *
   * @param from
   * @param toInclusive
   * @returns
   */
  public range(from: string, toInclusive: string): AsciiMatcherBuilder {
    for (let c = from.charCodeAt(0); c <= toInclusive.charCodeAt(0); c++) {
      this.c(fromCodePoint(c));
    }

    return this;
  }

  /**
   * 编译一个 AsciiMatcher 实例
   *
   * @returns
   */
  public build(): AsciiMatcher {
    return new AsciiMatcher(this);
  }
}

/**
 * Char matcher that can match ASCII characters efficiently.
 *
 * 可以高效匹配 ASCII 字符的字符匹配器
 */
class AsciiMatcher implements CharMatcher {
  private readonly set: BitSet;

  public constructor(builder: AsciiMatcherBuilder) {
    this.set = builder.set;
  }

  /**
   * 给定字符是否在 this.bitset 集合中
   *
   * @param c
   * @returns
   */
  public matches(c: string): boolean {
    return this.set.get(c.charCodeAt(0));
  }

  /**
   * clone 一个新的 AsciiMatcherBuilder 实例
   *
   * @returns
   */
  public newBuilder(): AsciiMatcherBuilder {
    return new AsciiMatcherBuilder(this.set.clone());
  }

  /**
   * 创建新的 AsciiMatcherBuilder 实例
   *
   * @param matcher
   * @returns
   */
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
