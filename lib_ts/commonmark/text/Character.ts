type UnicodeCategoryTypes = keyof typeof Character.UnicodeCategory;

class Character {
  private static map: { [key in UnicodeCategoryTypes]?: RegExp } = {};

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

  public static isLetter(char: string): boolean {
    return this.isUnicodeCharOfCategory(Character.UnicodeCategory.L, char);
  }

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
