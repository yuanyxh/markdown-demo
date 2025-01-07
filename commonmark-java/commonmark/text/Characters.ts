import { fromCodePoint, Character } from "../../helpers";

/**
 * Class for finding characters in strings or checking characters.
 */
class Characters {
  public static find(c: string, s: string, startIndex: number): number {
    let length = s.length;

    for (let i = startIndex; i < length; i++) {
      if (s.charAt(i) === c) {
        return i;
      }
    }

    return -1;
  }

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
   */
  public static isBlank(s: string): boolean {
    return Characters.skipSpaceTab(s, 0, s.length) === s.length;
  }

  public static hasNonSpace(s: string): boolean {
    let length = s.length;
    let skipped = Characters.skip(" ", s, 0, length);

    return skipped !== length;
  }

  public static isLetter(s: string, index: number): boolean {
    return Character.isLetter(s[index]);
  }

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
   */
  public static isPunctuationCodePoint(codePoint: number): boolean {
    const char = fromCodePoint(codePoint);

    switch (true) {
      // General category "P" (punctuation)
      // 类别为 P
      case Character.isUnicodeCharOfCategory(Character.UnicodeCategory.P, char):
      // General category "S" (symbol)
      // 类别为 S
      case Character.isUnicodeCharOfCategory(Character.UnicodeCategory.S, char):
        return true;

      default:
        return false;
    }
  }

  /**
   * Check whether the provided code point is a Unicode whitespace character as defined in the spec.
   *
   * @see <a href="https://spec.commonmark.org/0.31.2/#unicode-whitespace-character">Unicode whitespace character</a>
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
