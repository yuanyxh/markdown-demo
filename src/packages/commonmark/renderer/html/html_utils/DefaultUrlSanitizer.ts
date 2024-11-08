import type { UrlSanitizer } from "../interfaces/UrlSanitizer";

/**
 *
 * Allows http, https, mailto, and data protocols for url.
 * Also allows protocol relative urls, and relative urls.
 * Implementation based on https://github.com/OWASP/java-html-sanitizer/blob/f07e44b034a45d94d6fd010279073c38b6933072/src/main/java/org/owasp/html/FilterUrlByProtocolAttributePolicy.java
 */
class DefaultUrlSanitizer implements UrlSanitizer {
  private protocols: Set<string>;

  public constructor(protocols = ["http", "https", "mailto", "data"]) {
    this.protocols = new Set(protocols);
  }

  public sanitizeLinkUrl(url: string): string {
    url = this.stripHtmlSpaces(url);

    protocol_loop: for (let i = 0, n = url.length; i < n; ++i) {
      switch (url.charAt(i)) {
        case "/":
        case "#":
        case "?": // No protocol.
          break protocol_loop;
        case ":":
          const protocol = url.substring(0, i).toLowerCase();

          if (!this.protocols.has(protocol)) {
            return "";
          }

          break protocol_loop;

        default:
      }
    }

    return url;
  }

  public sanitizeImageUrl(url: string): string {
    return this.sanitizeLinkUrl(url);
  }

  private stripHtmlSpaces(s: string): string {
    let i = 0;
    let n = s.length;

    for (; n > i; --n) {
      if (!this.isHtmlSpace(s.charAt(n - 1))) {
        break;
      }
    }

    for (; i < n; ++i) {
      if (!this.isHtmlSpace(s.charAt(i))) {
        break;
      }
    }

    if (i === 0 && n === s.length) {
      return s;
    }

    return s.substring(i, n);
  }

  private isHtmlSpace(ch: string): boolean {
    switch (ch) {
      case " ":
      case "\t":
      case "\n":
      case "\u000c":
      case "\r":
        return true;
      default:
        return false;
    }
  }
}

export default DefaultUrlSanitizer;
