import { Appendable } from "../../../common";
import Html5Entities from "./Html5Entities";

interface Replacer {
  replace(input: string, sb: Appendable): void;
}

class Escaping {
  public static readonly ESCAPABLE: string =
    "[!\"#$%&'()*+,./:;<=>?@\\[\\\\\\]^_`{|}~-]";

  public static readonly ENTITY: string =
    "&(?:#x[a-f0-9]{1,6}|#[0-9]{1,7}|[a-z][a-z0-9]{1,31});";

  private static readonly BACKSLASH_OR_AMP = /[\\&]/;

  private static readonly ENTITY_OR_ESCAPED_CHAR = new RegExp(
    "\\\\" + Escaping.ESCAPABLE + "|" + Escaping.ENTITY,
    "i"
  );

  // From RFC 3986 (see "reserved", "unreserved") except don't escape '[' or ']' to be compatible with JS encodeURI
  private static readonly ESCAPE_IN_URI =
    /(%[a-fA-F0-9]{0,2}|[^:/?#@!$&'()*+,;=a-zA-Z0-9\-._~])/;

  private static readonly HEX_DIGITS: string[] = [
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

  private static readonly WHITESPACE = /[ \t\r\n]+/;

  private static readonly UNESCAPE_REPLACER = {
    replace(input: string, sb: Appendable) {
      if (input.charAt(0) === "\\") {
        sb.append(input, 1, input.length);
      } else {
        sb.append(Html5Entities.entityToString(input));
      }
    },
  };

  private static readonly URI_REPLACER = {
    replace(input: string, sb: Appendable): void {
      if (input.startsWith("%")) {
        if (input.length === 3) {
          // Already percent-encoded, preserve
          sb.append(input);
        } else {
          // %25 is the percent-encoding for %
          sb.append("%25");
          sb.append(input, 1, input.length);
        }
      } else {
        const bytes = Escaping.getBytes(input);

        for (const b of bytes) {
          sb.append("%");
          sb.append(Escaping.HEX_DIGITS[(b >> 4) & 0xf]);
          sb.append(Escaping.HEX_DIGITS[b & 0xf]);
        }
      }
    },
  };

  public static getBytes(input: string) {
    if (window.TextEncoder) {
      const encoder = new window.TextEncoder();
      const encodedBytes = encoder.encode(input);

      const bytesArray = Array.from(encodedBytes);

      return bytesArray;
    }

    const bytes: number[] = [];
    for (let i = 0; i < input.length; i++) {
      const charCode = input.charCodeAt(i);
      bytes.push(charCode & 0xff);

      if (charCode > 255) {
        bytes.push((charCode >> 8) & 0xff);
      }
    }

    return bytes;
  }

  public static escapeHtml(input: string): string {
    // Avoid building a new string in the majority of cases (nothing to escape)
    let sb: Appendable | null = null;

    loop: for (let i = 0; i < input.length; i++) {
      const c = input.charAt(i);

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
        case " ":
          replacement = "&nbsp;";
          break;
        default:
          if (sb !== null) {
            sb.append(c);
          }
          continue loop;
      }

      if (sb === null) {
        sb = new Appendable();
        sb.append(input, 0, i);
      }

      sb.append(replacement);
    }

    return sb !== null ? sb.toString() : input;
  }

  /**
   * Replace entities and backslash escapes with literal characters.
   */
  public static unescapeString(s: string): string {
    if (Escaping.BACKSLASH_OR_AMP.exec(s)) {
      return Escaping.replaceAll(
        Escaping.ENTITY_OR_ESCAPED_CHAR,
        s,
        Escaping.UNESCAPE_REPLACER
      );
    } else {
      return s;
    }
  }

  public static percentEncodeUrl(s: string): string {
    return Escaping.replaceAll(
      Escaping.ESCAPE_IN_URI,
      s,
      Escaping.URI_REPLACER
    );
  }

  public static normalizeLabelContent(input: string): string {
    const trimmed: string = input.trim();

    // This is necessary to correctly case fold "\u1E9E" (LATIN CAPITAL LETTER SHARP S) to "SS":
    // "\u1E9E".toLowerCase(Locale.ROOT)  -> "\u00DF" (LATIN SMALL LETTER SHARP S)
    // "\u00DF".toUpperCase(Locale.ROOT)  -> "SS"
    // Note that doing upper first (or only upper without lower) wouldn't work because:
    // "\u1E9E".toUpperCase(Locale.ROOT)  -> "\u1E9E"
    const caseFolded = trimmed.toLocaleLowerCase().toLocaleLowerCase();

    return caseFolded.replace(Escaping.WHITESPACE, " ");
  }

  private static replaceAll(p: RegExp, s: string, replacer: Replacer): string {
    let matcher = p.exec(s);

    if (matcher === null) {
      return s;
    }

    const sb = new Appendable();
    let lastEnd = 0;

    do {
      sb.append(s, lastEnd, matcher.index);
      replacer.replace(matcher[0], sb);
      lastEnd = matcher.index + matcher[0].length;
    } while (matcher !== null);

    if (lastEnd !== s.length) {
      sb.append(s, lastEnd, s.length);
    }

    return sb.toString();
  }
}

export default Escaping;
