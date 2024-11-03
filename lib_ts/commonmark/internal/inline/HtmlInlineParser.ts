


import { java, JavaObject, type char } from "jree";



/**
 * Attempt to parse inline HTML.
 */
export  class HtmlInlineParser extends JavaObject implements InlineContentParser {

    private static readonly  asciiLetter:  AsciiMatcher | null = AsciiMatcher.builder().range('A', 'Z').range('a', 'z').build();

    // spec: A tag name consists of an ASCII letter followed by zero or more ASCII letters, digits, or hyphens (-).
    private static readonly  tagNameStart:  AsciiMatcher | null = HtmlInlineParser.asciiLetter;
    private static readonly  tagNameContinue:  AsciiMatcher | null = HtmlInlineParser.tagNameStart.newBuilder().range('0', '9').c('-').build();

    // spec: An attribute name consists of an ASCII letter, _, or :, followed by zero or more ASCII letters, digits,
    // _, ., :, or -. (Note: This is the XML specification restricted to ASCII. HTML5 is laxer.)
    private static readonly  attributeStart:  AsciiMatcher | null = HtmlInlineParser.asciiLetter.newBuilder().c('_').c(':').build();
    private static readonly  attributeContinue:  AsciiMatcher | null = HtmlInlineParser.attributeStart.newBuilder().range('0', '9').c('.').c('-').build();
    // spec: An unquoted attribute value is a nonempty string of characters not including whitespace, ", ', =, <, >, or `.
    private static readonly  attributeValueEnd:  AsciiMatcher | null = AsciiMatcher.builder()
            .c(' ').c('\t').c('\n').c('\u000B').c('\f').c('\r')
            .c('"').c('\'').c('=').c('<').c('>').c('`')
            .build();

    public  tryParse(inlineParserState: InlineParserState| null):  ParsedInline | null {
        let  scanner: java.util.Scanner = inlineParserState.scanner();
        let  start: Position = scanner.position();
        // Skip over `<`
        scanner.next();

        let  c: char = scanner.peek();
        if (HtmlInlineParser.tagNameStart.matches(c)) {
            if (HtmlInlineParser.tryOpenTag(scanner)) {
                return HtmlInlineParser.htmlInline(start, scanner);
            }
        } else if (c === '/') {
            if (HtmlInlineParser.tryClosingTag(scanner)) {
                return HtmlInlineParser.htmlInline(start, scanner);
            }
        } else if (c === '?') {
            if (HtmlInlineParser.tryProcessingInstruction(scanner)) {
                return HtmlInlineParser.htmlInline(start, scanner);
            }
        } else if (c === '!') {
            // comment, declaration or CDATA
            scanner.next();
            c = scanner.peek();
            if (c === '-') {
                if (HtmlInlineParser.tryComment(scanner)) {
                    return HtmlInlineParser.htmlInline(start, scanner);
                }
            } else if (c === '[') {
                if (HtmlInlineParser.tryCdata(scanner)) {
                    return HtmlInlineParser.htmlInline(start, scanner);
                }
            } else if (HtmlInlineParser.asciiLetter.matches(c)) {
                if (HtmlInlineParser.tryDeclaration(scanner)) {
                    return HtmlInlineParser.htmlInline(start, scanner);
                }
            }
        }

        return ParsedInline.none();
    }

    private static  htmlInline(start: Position| null, scanner: java.util.Scanner| null):  ParsedInline | null {
        let  text: java.lang.String = scanner.getSource(start, scanner.position()).getContent();
        let  node: HtmlInline = new  HtmlInline();
        node.setLiteral(text);
        return ParsedInline.of(node, scanner.position());
    }

    private static  tryOpenTag(scanner: java.util.Scanner| null):  boolean {
        // spec: An open tag consists of a < character, a tag name, zero or more attributes, optional whitespace,
        // an optional / character, and a > character.
        scanner.next();
        scanner.match(HtmlInlineParser.tagNameContinue);
        let  whitespace: boolean = scanner.whitespace() >= 1;
        // spec: An attribute consists of whitespace, an attribute name, and an optional attribute value specification.
        while (whitespace && scanner.match(HtmlInlineParser.attributeStart) >= 1) {
            scanner.match(HtmlInlineParser.attributeContinue);
            // spec: An attribute value specification consists of optional whitespace, a = character,
            // optional whitespace, and an attribute value.
            whitespace = scanner.whitespace() >= 1;
            if (scanner.next('=')) {
                scanner.whitespace();
                let  valueStart: char = scanner.peek();
                if (valueStart === '\'') {
                    scanner.next();
                    if (scanner.find('\'') < 0) {
                        return false;
                    }
                    scanner.next();
                } else if (valueStart === '"') {
                    scanner.next();
                    if (scanner.find('"') < 0) {
                        return false;
                    }
                    scanner.next();
                } else {
                    if (scanner.find(HtmlInlineParser.attributeValueEnd) <= 0) {
                        return false;
                    }
                }

                // Whitespace is required between attributes
                whitespace = scanner.whitespace() >= 1;
            }
        }

        scanner.next('/');
        return scanner.next('>');
    }

    private static  tryClosingTag(scanner: java.util.Scanner| null):  boolean {
        // spec: A closing tag consists of the string </, a tag name, optional whitespace, and the character >.
        scanner.next();
        if (scanner.match(HtmlInlineParser.tagNameStart) >= 1) {
            scanner.match(HtmlInlineParser.tagNameContinue);
            scanner.whitespace();
            return scanner.next('>');
        }
        return false;
    }

    private static  tryProcessingInstruction(scanner: java.util.Scanner| null):  boolean {
        // spec: A processing instruction consists of the string <?, a string of characters not including the string ?>,
        // and the string ?>.
        scanner.next();
        while (scanner.find('?') > 0) {
            scanner.next();
            if (scanner.next('>')) {
                return true;
            }
        }
        return false;
    }

    private static  tryComment(scanner: java.util.Scanner| null):  boolean {
        // spec: An [HTML comment](@) consists of `<!-->`, `<!--->`, or  `<!--`, a string of
        // characters not including the string `-->`, and `-->` (see the
        // [HTML spec](https://html.spec.whatwg.org/multipage/parsing.html#markup-declaration-open-state)).

        // Skip first `-`
        scanner.next();
        if (!scanner.next('-')) {
            return false;
        }

        if (scanner.next('>') || scanner.next("->")) {
            return true;
        }

        while (scanner.find('-') >= 0) {
            if (scanner.next("-->")) {
                return true;
            } else {
                scanner.next();
            }
        }

        return false;
    }

    private static  tryCdata(scanner: java.util.Scanner| null):  boolean {
        // spec: A CDATA section consists of the string <![CDATA[, a string of characters not including the string ]]>,
        // and the string ]]>.

        // Skip `[`
        scanner.next();

        if (scanner.next("CDATA[")) {
            while (scanner.find(']') >= 0) {
                if (scanner.next("]]>")) {
                    return true;
                } else {
                    scanner.next();
                }
            }
        }

        return false;
    }

    private static  tryDeclaration(scanner: java.util.Scanner| null):  boolean {
        // spec: A declaration consists of the string <!, an ASCII letter, zero or more characters not including
        // the character >, and the character >.
        scanner.match(HtmlInlineParser.asciiLetter);
        if (scanner.whitespace() <= 0) {
            return false;
        }
        if (scanner.find('>') >= 0) {
            scanner.next();
            return true;
        }
        return false;
    }

    public static Factory =  class Factory extends JavaObject implements InlineContentParserFactory {

        public  getTriggerCharacters():  java.util.Set<java.lang.Character> | null {
            return java.util.Set.of('<');
        }

        public  create():  InlineContentParser | null {
            return new  HtmlInlineParser();
        }
    };

}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace HtmlInlineParser {
	export type Factory = InstanceType<typeof HtmlInlineParser.Factory>;
}


