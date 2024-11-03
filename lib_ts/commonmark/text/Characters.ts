
import { java, JavaObject, type int, type char } from "jree";



/**
 * Functions for finding characters in strings or checking characters.
 */
export  class Characters extends JavaObject {

    public static  find(c: char, s: java.lang.CharSequence| null, startIndex: int):  int {
        let  length: int = s.length();
        for (let  i: int = startIndex; i < length; i++) {
            if (s.charAt(i) === c) {
                return i;
            }
        }
        return -1;
    }

    public static  findLineBreak(s: java.lang.CharSequence| null, startIndex: int):  int {
        let  length: int = s.length();
        for (let  i: int = startIndex; i < length; i++) {
            switch (s.charAt(i)) {
                case '\n':
                case '\r':
                    return i;

default:

            }
        }
        return -1;
    }

    /**
     * @see <a href="https://spec.commonmark.org/0.31.2/#blank-line">blank line</a>
     */
    public static  isBlank(s: java.lang.CharSequence| null):  boolean {
        return Characters.skipSpaceTab(s, 0, s.length()) === s.length();
    }

    public static  hasNonSpace(s: java.lang.CharSequence| null):  boolean {
        let  length: int = s.length();
        let  skipped: int = Characters.skip(' ', s, 0, length);
        return skipped !== length;
    }

    public static  isLetter(s: java.lang.CharSequence| null, index: int):  boolean {
        let  codePoint: int = java.lang.Character.codePointAt(s, index);
        return java.lang.Character.isLetter(codePoint);
    }

    public static  isSpaceOrTab(s: java.lang.CharSequence| null, index: int):  boolean {
        if (index < s.length()) {
            switch (s.charAt(index)) {
                case ' ':
                case '\t':
                    return true;

default:

            }
        }
        return false;
    }

    /**
     * @see <a href="https://spec.commonmark.org/0.31.2/#unicode-punctuation-character">Unicode punctuation character</a>
     */
    public static  isPunctuationCodePoint(codePoint: int):  boolean {
        switch (java.lang.Character.getType(codePoint)) {
            // General category "P" (punctuation)
            case java.lang.Character.DASH_PUNCTUATION:
            case java.lang.Character.START_PUNCTUATION:
            case java.lang.Character.END_PUNCTUATION:
            case java.lang.Character.CONNECTOR_PUNCTUATION:
            case java.lang.Character.OTHER_PUNCTUATION:
            case java.lang.Character.INITIAL_QUOTE_PUNCTUATION:
            case java.lang.Character.FINAL_QUOTE_PUNCTUATION:
                // General category "S" (symbol)
            case java.lang.Character.MATH_SYMBOL:
            case java.lang.Character.CURRENCY_SYMBOL:
            case java.lang.Character.MODIFIER_SYMBOL:
            case java.lang.Character.OTHER_SYMBOL:
                return true;
            default:
                switch (codePoint) {
                    case '$':
                    case '+':
                    case '<':
                    case '=':
                    case '>':
                    case '^':
                    case '`':
                    case '|':
                    case '~':
                        return true;
                    default:
                        return false;
                }
        }
    }

    /**
     * Check whether the provided code point is a Unicode whitespace character as defined in the spec.
     *
     * @see <a href="https://spec.commonmark.org/0.31.2/#unicode-whitespace-character">Unicode whitespace character</a>
     */
    public static  isWhitespaceCodePoint(codePoint: int):  boolean {
        switch (codePoint) {
            case ' ':
            case '\t':
            case '\n':
            case '\f':
            case '\r':
                return true;
            default:
                return java.lang.Character.getType(codePoint) === java.lang.Character.SPACE_SEPARATOR;
        }
    }

    public static  skip(skip: char, s: java.lang.CharSequence| null, startIndex: int, endIndex: int):  int {
        for (let  i: int = startIndex; i < endIndex; i++) {
            if (s.charAt(i) !== skip) {
                return i;
            }
        }
        return endIndex;
    }

    public static  skipBackwards(skip: char, s: java.lang.CharSequence| null, startIndex: int, lastIndex: int):  int {
        for (let  i: int = startIndex; i >= lastIndex; i--) {
            if (s.charAt(i) !== skip) {
                return i;
            }
        }
        return lastIndex - 1;
    }

    public static  skipSpaceTab(s: java.lang.CharSequence| null, startIndex: int, endIndex: int):  int {
        for (let  i: int = startIndex; i < endIndex; i++) {
            switch (s.charAt(i)) {
                case ' ':
                case '\t':
                    break;
                default:
                    return i;
            }
        }
        return endIndex;
    }

    public static  skipSpaceTabBackwards(s: java.lang.CharSequence| null, startIndex: int, lastIndex: int):  int {
        for (let  i: int = startIndex; i >= lastIndex; i--) {
            switch (s.charAt(i)) {
                case ' ':
                case '\t':
                    break;
                default:
                    return i;
            }
        }
        return lastIndex - 1;
    }
}
