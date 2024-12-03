/**
 * Sanitizes urls for img and a elements by whitelisting protocols.
 * This is intended to prevent XSS payloads like [Click this totally safe url](javascript:document.xss=true;)
 * <p>
 * Implementation based on https://github.com/OWASP/java-html-sanitizer/blob/f07e44b034a45d94d6fd010279073c38b6933072/src/main/java/org/owasp/html/FilterUrlByProtocolAttributePolicy.java
 *
 * 通过白名单协议清理 img 和 a 元素的 url
 * 这是为了防止 XSS 有效负载，例如 [单击这个完全安全的 url](javascript:document.xss=true;)
 * <p>
 * 基于 https://github.com/OWASP/java-html-sanitizer/blob/f07e44b034a45d94d6fd010279073c38b6933072/src/main/java/org/owasp/html/FilterUrlByProtocolAttributePolicy.java 实现
 *
 * @since 0.14.0
 */
export interface UrlSanitizer {
  /**
   * Sanitize a url for use in the href attribute of a {@link Link}.
   *
   * @param url Link to sanitize
   * @return Sanitized link
   */
  sanitizeLinkUrl(url: string): string;

  /**
   * Sanitize a url for use in the src attribute of a {@link Image}.
   *
   * @param url Link to sanitize
   * @return Sanitized link {@link Image}
   */
  sanitizeImageUrl(url: string): string;
}
