type UnicodeCategoryTypes = keyof typeof Character.UnicodeCategory;

/**
 * 字符工具类
 */
class Character {
  /** 已生成的 Unicode 类别检测正则 */
  private static map: { [key in UnicodeCategoryTypes]?: RegExp } = {};

  /**
   * 判断某个字符是否是指定类别的 Unicode 字符类型
   *
   * @param type
   * @param char
   * @returns
   */
  public static isUnicodeCharOfCategory(
    type: UnicodeCategoryTypes,
    char: string
  ) {
    if (this.map[type]) {
      this.map[type].lastIndex = 0;
    } else {
      this.map[type] = new RegExp("\\p{" + type + "}", "u");
    }

    return this.map[type].test(char[0]);
  }

  /**
   * 判断某个字符是否是 ISO 控制字符
   *
   * @param c
   * @returns
   */
  public static isISOControl(c: string) {
    const codePoint = c.charCodeAt(0);

    return codePoint <= 159 && (codePoint >= 127 || codePoint >>> 5 === 0);
  }

  /**
   * 判断某个字符是否是字母（非常规意义的英文字母，Unicode 中 L 类别的字符都可认为是字母）
   *
   * @param char
   * @returns
   */
  public static isLetter(char: string): boolean {
    return this.isUnicodeCharOfCategory(Character.UnicodeCategory.L, char);
  }

  /**
   * 判断给定的码点是否是高代理项
   *
   * @param codePoint
   * @returns
   */
  public static isHighSurrogate(codePoint: number) {
    const highSurrogateStart = 0xd800;
    const lowSurrogateStart = 0xdc00;
    return codePoint >= highSurrogateStart && codePoint < lowSurrogateStart;
  }

  /**
   * 判断给定的码点是否是低代理项
   *
   * @param codePoint
   * @returns
   */
  public static isLowSurrogate(codePoint: number) {
    const highSurrogateStart = 0xdc00;
    const lowSurrogateStart = 0xe000;
    return codePoint >= highSurrogateStart && codePoint < lowSurrogateStart;
  }

  /**
   * 将高代理项和低代理项转化为码点
   *
   * @param char1
   * @param char2
   * @returns
   */
  public static toCodePoint(char1: number, char2: number) {
    return (char1 << 10) + char2 + -56613888;
  }

  /** 常见的 Unicode 类别 */
  public static readonly UnicodeCategory = {
    Ll: "Ll",
    Lu: "Lu",
    Lt: "Lt",
    Lm: "Lm",
    Lo: "Lo",
    Mn: "Mn",
    Mc: "Mc",
    Me: "Me",
    Nd: "Nd",
    Nl: "Nl",
    No: "No",
    Pd: "Pd",
    Ps: "Ps",
    Pe: "Pe",
    Pi: "Pi",
    Pf: "Pf",
    Pc: "Pc",
    Po: "Po",
    Sm: "Sm",
    Sc: "Sc",
    Sk: "Sk",
    So: "So",
    Zs: "Zs",
    Zl: "Zl",
    Zp: "Zp",
    Cc: "Cc",
    Cf: "Cf",
    Co: "Co",
    Cs: "Cs",
    Cn: "Cn",
    L: "L",
    P: "P",
    S: "S",
  } as const;
}

export default Character;
