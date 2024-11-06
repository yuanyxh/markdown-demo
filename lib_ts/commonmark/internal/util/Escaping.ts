class Escaping {
  public static readonly ESCAPABLE: string | null =
    "[!\"#$%&'()*+,./:;<=>?@\\[\\\\\\]^_`{|}~-]";

  public static readonly ENTITY: string | null =
    "&(?:#x[a-f0-9]{1,6}|#[0-9]{1,7}|[a-z][a-z0-9]{1,31});";

  private static readonly BACKSLASH_OR_AMP: java.util.regex.Pattern | null =
    java.util.regex.Pattern.compile("[\\\\&]");

  private static readonly ENTITY_OR_ESCAPED_CHAR: java.util.regex.Pattern | null =
    java.util.regex.Pattern.compile(
      "\\\\" + Escaping.ESCAPABLE + "|" + Escaping.ENTITY,
      java.util.regex.Pattern.CASE_INSENSITIVE
    );

  // From RFC 3986 (see "reserved", "unreserved") except don't escape '[' or ']' to be compatible with JS encodeURI
  private static readonly ESCAPE_IN_URI: java.util.regex.Pattern | null =
    java.util.regex.Pattern.compile(
      "(%[a-fA-F0-9]{0,2}|[^:/?#@!$&'()*+,;=a-zA-Z0-9\\-._~])"
    );

  private static readonly HEX_DIGITS: Uint16Array = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
  ];

  private static readonly WHITESPACE: java.util.regex.Pattern | null =
    java.util.regex.Pattern.compile("[ \t\r\n]+");

  private static readonly UNESCAPE_REPLACER: Escaping.Replacer | null =
    new (class implements Replacer {
      public replace(input: string | null, sb: stringBuilder | null): void {
        if (input.charAt(0) === "\\") {
          sb.append(input, 1, input.length());
        } else {
          sb.append(Html5Entities.entityToString(input));
        }
      }
    })();

  private static readonly URI_REPLACER: Escaping.Replacer | null = new (class
    implements Replacer
  {
    public replace(input: string | null, sb: stringBuilder | null): void {
      if (input.startsWith("%")) {
        if (input.length() === 3) {
          // Already percent-encoded, preserve
          sb.append(input);
        } else {
          // %25 is the percent-encoding for %
          sb.append("%25");
          sb.append(input, 1, input.length());
        }
      } else {
        let bytes: Int8Array = input.getBytes(
          java.nio.charset.StandardCharsets.UTF_8
        );
        for (let b of bytes) {
          sb.append("%");
          sb.append(Escaping.HEX_DIGITS[(b >> 4) & 0xf]);
          sb.append(Escaping.HEX_DIGITS[b & 0xf]);
        }
      }
    }
  })();

  public static escapeHtml(input: string | null): string | null {
    // Avoid building a new string in the majority of cases (nothing to escape)
    let sb: stringBuilder = null;

    loop: for (let i: int = 0; i < input.length(); i++) {
      let c: char = input.charAt(i);
      let replacement: string;
      switch (c) {
        case "&":
          replacement = "&amp;";
          break;
        case "<":
          replacement = "&lt;";
          break;
        case ">":
          replacement = "&gt;";
          break;
        case '"':
          replacement = "&quot;";
          break;
        default:
          if (sb !== null) {
            sb.append(c);
          }
          continue loop;
      }
      if (sb === null) {
        sb = new stringBuilder();
        sb.append(input, 0, i);
      }
      sb.append(replacement);
    }

    return sb !== null ? sb.toString() : input;
  }

  /**
   * Replace entities and backslash escapes with literal characters.
   */
  public static unescapeString(s: string | null): string | null {
    if (Escaping.BACKSLASH_OR_AMP.matcher(s).find()) {
      return Escaping.replaceAll(
        Escaping.ENTITY_OR_ESCAPED_CHAR,
        s,
        Escaping.UNESCAPE_REPLACER
      );
    } else {
      return s;
    }
  }

  public static percentEncodeUrl(s: string | null): string | null {
    return Escaping.replaceAll(
      Escaping.ESCAPE_IN_URI,
      s,
      Escaping.URI_REPLACER
    );
  }

  public static normalizeLabelContent(input: string | null): string | null {
    let trimmed: string = input.trim();

    // This is necessary to correctly case fold "\u1E9E" (LATIN CAPITAL LETTER SHARP S) to "SS":
    // "\u1E9E".toLowerCase(Locale.ROOT)  -> "\u00DF" (LATIN SMALL LETTER SHARP S)
    // "\u00DF".toUpperCase(Locale.ROOT)  -> "SS"
    // Note that doing upper first (or only upper without lower) wouldn't work because:
    // "\u1E9E".toUpperCase(Locale.ROOT)  -> "\u1E9E"
    let caseFolded: string = trimmed
      .toLowerCase(java.util.Locale.ROOT)
      .toUpperCase(java.util.Locale.ROOT);

    return Escaping.WHITESPACE.matcher(caseFolded).replaceAll(" ");
  }

  private static replaceAll(
    p: java.util.regex.Pattern | null,
    s: string | null,
    replacer: Escaping.Replacer | null
  ): string | null {
    let matcher: java.util.regex.Matcher = p.matcher(s);

    if (!matcher.find()) {
      return s;
    }

    let sb: stringBuilder = new stringBuilder(s.length() + 16);
    let lastEnd: int = 0;
    do {
      sb.append(s, lastEnd, matcher.start());
      replacer.replace(matcher.group(), sb);
      lastEnd = matcher.end();
    } while (matcher.find());

    if (lastEnd !== s.length()) {
      sb.append(s, lastEnd, s.length());
    }
    return sb.toString();
  }
}

export default Escaping;
