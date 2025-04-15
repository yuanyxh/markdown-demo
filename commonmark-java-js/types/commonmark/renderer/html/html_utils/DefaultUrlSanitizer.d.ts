import type { UrlSanitizer } from '../interfaces/UrlSanitizer';
/**
 *
 * Allows http, https, mailto, and data protocols for url.
 * Also allows protocol relative urls, and relative urls.
 * Implementation based on https://github.com/OWASP/java-html-sanitizer/blob/f07e44b034a45d94d6fd010279073c38b6933072/src/main/java/org/owasp/html/FilterUrlByProtocolAttributePolicy.java
 */
declare class DefaultUrlSanitizer implements UrlSanitizer {
    private protocols;
    constructor(protocols?: string[]);
    sanitizeLinkUrl(url: string): string;
    sanitizeImageUrl(url: string): string;
    private stripHtmlSpaces;
    private isHtmlSpace;
}
export default DefaultUrlSanitizer;
