import type { Scanner } from '@/parser';
declare class LinkScanner {
    /**
     * Attempt to scan the contents of a link label (inside the brackets), stopping after the content or returning false.
     * The stopped position can bei either the closing {@code ]}, or the end of the line if the label continues on
     * the next line.
     */
    static scanLinkLabelContent(scanner: Scanner): boolean;
    /**
     * Attempt to scan a link destination, stopping after the destination or returning false.
     */
    static scanLinkDestination(scanner: Scanner): boolean;
    static scanLinkTitle(scanner: Scanner): boolean;
    static scanLinkTitleContent(scanner: Scanner, endDelimiter: string): boolean;
    private static scanLinkDestinationWithBalancedParens;
    private static isEscapable;
}
export default LinkScanner;
