import { fromCodePoint, Character } from "../../helpers";

/**
 * Class for finding characters in strings or checking characters.
 *
 * 用于在字符串中查找字符或检查字符的类
 */
class Characters {
  /**
   * 在给定字符串中找到指定字符的位置
   *
   * @param c
   * @param s
   * @param startIndex
   * @returns
   */
  public static find(c: string, s: string, startIndex: number): number {
    let length = s.length;

    for (let i = startIndex; i < length; i++) {
      if (s.charAt(i) === c) {
        return i;
      }
    }

    return -1;
  }

  /**
   * 在给定字符串中找到换行符的位置
   *
   * @param s
   * @param startIndex
   * @returns
   */
  public static findLineBreak(s: string, startIndex: number): number {
    let length: number = s.length;

    for (let i = startIndex; i < length; i++) {
      switch (s.charAt(i)) {
        case "\n":
        case "\r":
          return i;

        default:
      }
    }

    return -1;
  }

  /**
   * @see <a href="https://spec.commonmark.org/0.31.2/#blank-line">blank line</a>
   *
   * 判断当前行是否是空行
   */
  public static isBlank(s: string): boolean {
    return Characters.skipSpaceTab(s, 0, s.length) === s.length;
  }

  /**
   * 判断当前行是否包含非空白字符
   *
   * @param s
   * @returns
   */
  public static hasNonSpace(s: string): boolean {
    let length = s.length;
    let skipped = Characters.skip(" ", s, 0, length);

    return skipped !== length;
  }

  /**
   * 判断某个字符是否是字母
   *
   * @param s
   * @param index
   * @returns
   */
  public static isLetter(s: string, index: number): boolean {
    return Character.isLetter(s[index]);
  }

  /**
   * 判断指定位置处的字符是否是空格或制表符
   *
   * @param s
   * @param index
   * @returns
   */
  public static isSpaceOrTab(s: string, index: number): boolean {
    if (index < s.length) {
      switch (s.charAt(index)) {
        case " ":
        case "\t":
          return true;

        default:
      }
    }

    return false;
  }

  /**
   * @see <a href="https://spec.commonmark.org/0.31.2/#unicode-punctuation-character">Unicode punctuation character</a>
   *
   * 判断某个码点对应字符是否是 Unicode 标点符号（Unicode 类别为 P 或 S）
   */
  public static isPunctuationCodePoint(codePoint: number): boolean {
    const char = fromCodePoint(codePoint);

    switch (true) {
      // General category "P" (punctuation)
      // 类别为 P
      case Character.isUnicodeCharOfCategory(
        Character.UnicodeCategory.Pd,
        char
      ):
      case Character.isUnicodeCharOfCategory(
        Character.UnicodeCategory.Pi,
        char
      ):
      case Character.isUnicodeCharOfCategory(
        Character.UnicodeCategory.Pf,
        char
      ):
      case Character.isUnicodeCharOfCategory(
        Character.UnicodeCategory.Pc,
        char
      ):
      case Character.isUnicodeCharOfCategory(
        Character.UnicodeCategory.Po,
        char
      ):
      case Character.isUnicodeCharOfCategory(
        Character.UnicodeCategory.Pi,
        char
      ):
      case Character.isUnicodeCharOfCategory(
        Character.UnicodeCategory.Pf,
        char
      ):

      // General category "S" (symbol)
      // 类别为 S
      case Character.isUnicodeCharOfCategory(
        Character.UnicodeCategory.Sm,
        char
      ):
      case Character.isUnicodeCharOfCategory(
        Character.UnicodeCategory.Sc,
        char
      ):
      case Character.isUnicodeCharOfCategory(
        Character.UnicodeCategory.Sk,
        char
      ):
      case Character.isUnicodeCharOfCategory(
        Character.UnicodeCategory.So,
        char
      ):
        return true;

      default:
        // ASCII 中的部分标点字符
        switch (char) {
          case "$":
          case "+":
          case "<":
          case "=":
          case ">":
          case "^":
          case "`":
          case "|":
          case "~":
            return true;

          default:
            return false;
        }
    }
  }

  /**
   * Check whether the provided code point is a Unicode whitespace character as defined in the spec.
   *
   * @see <a href="https://spec.commonmark.org/0.31.2/#unicode-whitespace-character">Unicode whitespace character</a>
   *
   * 检查提供的代码点是否是规范中定义的 Unicode 空白字符
   */
  public static isWhitespaceCodePoint(codePoint: number): boolean {
    const char = fromCodePoint(codePoint);

    switch (char) {
      case " ":
      case "\t":
      case "\n":
      case "\f":
      case "\r":
        return true;
      default:
        return Character.isUnicodeCharOfCategory(
          Character.UnicodeCategory.Zs,
          char
        );
    }
  }

  /**
   * 跳过任意个字符，直到遇到除 skip 外的字符，返回新位置
   *
   * @param skip
   * @param s
   * @param startIndex 开始位置
   * @param endIndex 结束位置
   * @returns
   */
  public static skip(
    skip: string,
    s: string,
    startIndex: number,
    endIndex: number
  ): number {
    for (let i = startIndex; i < endIndex; i++) {
      if (s.charAt(i) !== skip) {
        return i;
      }
    }

    return endIndex;
  }

  /**
   * 反方向的 skip 方法
   *
   * @param skip
   * @param s
   * @param startIndex
   * @param lastIndex
   * @returns
   */
  public static skipBackwards(
    skip: string,
    s: string,
    startIndex: number,
    lastIndex: number
  ): number {
    for (let i = startIndex; i >= lastIndex; i--) {
      if (s.charAt(i) !== skip) {
        return i;
      }
    }

    return lastIndex - 1;
  }

  /**
   * 跳过空格与制表符
   *
   * @param s
   * @param startIndex
   * @param endIndex
   * @returns
   */
  public static skipSpaceTab(
    s: string,
    startIndex: number,
    endIndex: number
  ): number {
    for (let i = startIndex; i < endIndex; i++) {
      switch (s.charAt(i)) {
        case " ":
        case "\t":
          break;
        default:
          return i;
      }
    }
    return endIndex;
  }

  /**
   * 反方向的 skipSpaceTab
   *
   * @param s
   * @param startIndex
   * @param lastIndex
   * @returns
   */
  public static skipSpaceTabBackwards(
    s: string,
    startIndex: number,
    lastIndex: number
  ): number {
    for (let i = startIndex; i >= lastIndex; i--) {
      switch (s.charAt(i)) {
        case " ":
        case "\t":
          break;
        default:
          return i;
      }
    }
    return lastIndex - 1;
  }
}

export default Characters;
