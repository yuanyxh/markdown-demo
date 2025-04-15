declare class Escaping {
    static readonly ESCAPABLE: string;
    static readonly ENTITY: string;
    private static readonly BACKSLASH_OR_AMP;
    private static readonly ENTITY_OR_ESCAPED_CHAR;
    private static readonly ESCAPE_IN_URI;
    private static readonly HEX_DIGITS;
    private static readonly WHITESPACE;
    private static readonly UNESCAPE_REPLACER;
    private static readonly URI_REPLACER;
    static getBytes(input: string): number[];
    static escapeHtml(input: string): string;
    /**
     * Replace entities and backslash escapes with literal characters.
     */
    static unescapeString(s: string): string;
    static percentEncodeUrl(s: string): string;
    static normalizeLabelContent(input: string): string;
    private static replaceAll;
}
export default Escaping;
