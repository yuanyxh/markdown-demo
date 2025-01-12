const unescapeChar: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': "'",
  '&nbsp;': ' ',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&mdash;': '—',
  '&ndash;': '–',
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&lsquo;': '‘',
  '&rsquo;': '’'
};

const escapeChar: Record<string, string> = {};

const UNESCAPE_CHAR_REGEXP = new RegExp(Object.keys(unescapeChar).join('|'), 'gi');
const ESCAPE_CHAR_REGEXP = new RegExp(Object.values(unescapeChar).join('|'), 'gi');

class HtmlTools {
  public static unescape(plain: string): string {
    UNESCAPE_CHAR_REGEXP.lastIndex = 0;

    return plain.replace(UNESCAPE_CHAR_REGEXP, function (char: string) {
      return unescapeChar[char] || char;
    });
  }

  public static escape(html: string): string {
    ESCAPE_CHAR_REGEXP.lastIndex = 0;

    return html.replace(ESCAPE_CHAR_REGEXP, function (char: string) {
      if (escapeChar[char]) {
        return escapeChar[char];
      }

      const safeChar = Object.entries(unescapeChar).find((value) => value[1] === char)?.[0];

      return safeChar ? (escapeChar[char] = safeChar) : char;
    });
  }

  public static indexOf(html: string, content: string): number {
    return this.unescape(html).indexOf(this.unescape(content));
  }
}

export default HtmlTools;
