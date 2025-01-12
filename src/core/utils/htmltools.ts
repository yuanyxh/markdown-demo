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

/** Auxiliary tool class for HTML. */
class HtmlTools {
  /**
   * Decode the escaped character sequence.
   *
   * @param plain plain text
   * @returns {string} decoded text
   */
  public static unescape(plain: string): string {
    UNESCAPE_CHAR_REGEXP.lastIndex = 0;

    return plain.replace(UNESCAPE_CHAR_REGEXP, function (char: string) {
      return unescapeChar[char] || char;
    });
  }

  /**
   * Escape character sequence for replacing unsafe text.
   *
   * @param html html text
   * @returns {string} encoded text
   */
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

  /**
   * Obtain the position of the content in HTML in the correct format.
   *
   * @param html html text
   * @param content content text
   * @returns {number} Content offset in the html
   */
  public static indexOf(html: string, content: string): number {
    return this.unescape(html).indexOf(this.unescape(content));
  }
}

export default HtmlTools;
