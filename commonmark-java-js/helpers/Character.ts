type UnicodeCategoryTypes = keyof typeof Character.UnicodeCategory;

class Character {
  private static map: { [key in UnicodeCategoryTypes]?: RegExp } = {};

  static isUnicodeCharOfCategory(type: UnicodeCategoryTypes, char: string) {
    if (this.map[type]) {
      this.map[type].lastIndex = 0;
    } else {
      this.map[type] = new RegExp('\\p{' + type + '}', 'u');
    }

    return this.map[type].test(char[0]);
  }

  static isISOControl(c: string) {
    const codePoint = c.charCodeAt(0);

    return codePoint <= 159 && (codePoint >= 127 || codePoint >>> 5 === 0);
  }

  static isLetter(char: string): boolean {
    return this.isUnicodeCharOfCategory(Character.UnicodeCategory.L, char);
  }

  static isHighSurrogate(codePoint: number) {
    const highSurrogateStart = 0xd800;
    const lowSurrogateStart = 0xdc00;
    return codePoint >= highSurrogateStart && codePoint < lowSurrogateStart;
  }

  static isLowSurrogate(codePoint: number) {
    const highSurrogateStart = 0xdc00;
    const lowSurrogateStart = 0xe000;
    return codePoint >= highSurrogateStart && codePoint < lowSurrogateStart;
  }

  static toCodePoint(char1: number, char2: number) {
    return (char1 << 10) + char2 + -56613888;
  }

  static readonly UnicodeCategory = {
    Ll: 'Ll',
    Lu: 'Lu',
    Lt: 'Lt',
    Lm: 'Lm',
    Lo: 'Lo',
    Mn: 'Mn',
    Mc: 'Mc',
    Me: 'Me',
    Nd: 'Nd',
    Nl: 'Nl',
    No: 'No',
    Pd: 'Pd',
    Ps: 'Ps',
    Pe: 'Pe',
    Pi: 'Pi',
    Pf: 'Pf',
    Pc: 'Pc',
    Po: 'Po',
    Sm: 'Sm',
    Sc: 'Sc',
    Sk: 'Sk',
    So: 'So',
    Zs: 'Zs',
    Zl: 'Zl',
    Zp: 'Zp',
    Cc: 'Cc',
    Cf: 'Cf',
    Co: 'Co',
    Cs: 'Cs',
    Cn: 'Cn',
    L: 'L',
    P: 'P',
    S: 'S'
  } as const;
}

export default Character;
