


import { java, JavaObject, type char, type int } from "jree";



export  class LinkScanner extends JavaObject {

    /**
     * Attempt to scan the contents of a link label (inside the brackets), stopping after the content or returning false.
     * The stopped position can bei either the closing {@code ]}, or the end of the line if the label continues on
     * the next line.
     */
    public static  scanLinkLabelContent(scanner: java.util.Scanner| null):  boolean {
        while (scanner.hasNext()) {
            switch (scanner.peek()) {
                case '\\':
                    scanner.next();
                    if (LinkScanner.isEscapable(scanner.peek())) {
                        scanner.next();
                    }
                    break;
                case ']':
                    return true;
                case '[':
                    // spec: Unescaped square bracket characters are not allowed inside the opening and closing
                    // square brackets of link labels.
                    return false;
                default:
                    scanner.next();
            }
        }
        return true;
    }

    /**
     * Attempt to scan a link destination, stopping after the destination or returning false.
     */
    public static  scanLinkDestination(scanner: java.util.Scanner| null):  boolean {
        if (!scanner.hasNext()) {
            return false;
        }

        if (scanner.next('<')) {
            while (scanner.hasNext()) {
                switch (scanner.peek()) {
                    case '\\':
                        scanner.next();
                        if (LinkScanner.isEscapable(scanner.peek())) {
                            scanner.next();
                        }
                        break;
                    case '\n':
                    case '<':
                        return false;
                    case '>':
                        scanner.next();
                        return true;
                    default:
                        scanner.next();
                }
            }
            return false;
        } else {
            return LinkScanner.scanLinkDestinationWithBalancedParens(scanner);
        }
    }

    public static  scanLinkTitle(scanner: java.util.Scanner| null):  boolean {
        if (!scanner.hasNext()) {
            return false;
        }

        let  endDelimiter: char;
        switch (scanner.peek()) {
            case '"':
                endDelimiter = '"';
                break;
            case '\'':
                endDelimiter = '\'';
                break;
            case '(':
                endDelimiter = ')';
                break;
            default:
                return false;
        }
        scanner.next();

        if (!LinkScanner.scanLinkTitleContent(scanner, endDelimiter)) {
            return false;
        }
        if (!scanner.hasNext()) {
            return false;
        }
        scanner.next();
        return true;
    }

    public static  scanLinkTitleContent(scanner: java.util.Scanner| null, endDelimiter: char):  boolean {
        while (scanner.hasNext()) {
            let  c: char = scanner.peek();
            if (c === '\\') {
                scanner.next();
                if (LinkScanner.isEscapable(scanner.peek())) {
                    scanner.next();
                }
            } else if (c === endDelimiter) {
                return true;
            } else if (endDelimiter === ')' && c === '(') {
                // unescaped '(' in title within parens is invalid
                return false;
            } else {
                scanner.next();
            }
        }
        return true;
    }

    // spec: a nonempty sequence of characters that does not start with <, does not include ASCII space or control
    // characters, and includes parentheses only if (a) they are backslash-escaped or (b) they are part of a balanced
    // pair of unescaped parentheses
    private static  scanLinkDestinationWithBalancedParens(scanner: java.util.Scanner| null):  boolean {
        let  parens: int = 0;
        let  empty: boolean = true;
        while (scanner.hasNext()) {
            let  c: char = scanner.peek();
            switch (c) {
                case ' ':
                    return !empty;
                case '\\':
                    scanner.next();
                    if (LinkScanner.isEscapable(scanner.peek())) {
                        scanner.next();
                    }
                    break;
                case '(':
                    parens++;
                    // Limit to 32 nested parens for pathological cases
                    if (parens > 32) {
                        return false;
                    }
                    scanner.next();
                    break;
                case ')':
                    if (parens === 0) {
                        return true;
                    } else {
                        parens--;
                    }
                    scanner.next();
                    break;
                default:
                    // or control character
                    if (java.lang.Character.isISOControl(c)) {
                        return !empty;
                    }
                    scanner.next();
                    break;
            }
            empty = false;
        }
        return true;
    }

    private static  isEscapable(c: char):  boolean {
        switch (c) {
            case '!':
            case '"':
            case '#':
            case '$':
            case '%':
            case '&':
            case '\'':
            case '(':
            case ')':
            case '*':
            case '+':
            case ',':
            case '-':
            case '.':
            case '/':
            case ':':
            case ';':
            case '<':
            case '=':
            case '>':
            case '?':
            case '@':
            case '[':
            case '\\':
            case ']':
            case '^':
            case '_':
            case '`':
            case '{':
            case '|':
            case '}':
            case '~':
                return true;

default:

        }
        return false;
    }
}
