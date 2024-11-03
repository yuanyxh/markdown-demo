


import { java, JavaObject, type char, type int } from "jree";



/**
 * Attempts to parse an HTML entity or numeric character reference.
 */
export  class EntityInlineParser extends JavaObject implements InlineContentParser {

    private static readonly  hex:  AsciiMatcher | null = AsciiMatcher.builder().range('0', '9').range('A', 'F').range('a', 'f').build();
    private static readonly  dec:  AsciiMatcher | null = AsciiMatcher.builder().range('0', '9').build();
    private static readonly  entityStart:  AsciiMatcher | null = AsciiMatcher.builder().range('A', 'Z').range('a', 'z').build();
    private static readonly  entityContinue:  AsciiMatcher | null = EntityInlineParser.entityStart.newBuilder().range('0', '9').build();

    public  tryParse(inlineParserState: InlineParserState| null):  ParsedInline | null {
        let  scanner: java.util.Scanner = inlineParserState.scanner();
        let  start: Position = scanner.position();
        // Skip `&`
        scanner.next();

        let  c: char = scanner.peek();
        if (c === '#') {
            // Numeric
            scanner.next();
            if (scanner.next('x') || scanner.next('X')) {
                let  digits: int = scanner.match(EntityInlineParser.hex);
                if (1 <= digits && digits <= 6 && scanner.next(';')) {
                    return this.entity(scanner, start);
                }
            } else {
                let  digits: int = scanner.match(EntityInlineParser.dec);
                if (1 <= digits && digits <= 7 && scanner.next(';')) {
                    return this.entity(scanner, start);
                }
            }
        } else if (EntityInlineParser.entityStart.matches(c)) {
            scanner.match(EntityInlineParser.entityContinue);
            if (scanner.next(';')) {
                return this.entity(scanner, start);
            }
        }

        return ParsedInline.none();
    }

    private  entity(scanner: java.util.Scanner| null, start: Position| null):  ParsedInline | null {
        let  text: java.lang.String = scanner.getSource(start, scanner.position()).getContent();
        return ParsedInline.of(new  Text(Html5Entities.entityToString(text)), scanner.position());
    }

    public static Factory =  class Factory extends JavaObject implements InlineContentParserFactory {

        public  getTriggerCharacters():  java.util.Set<java.lang.Character> | null {
            return java.util.Set.of('&');
        }

        public  create():  InlineContentParser | null {
            return new  EntityInlineParser();
        }
    };

}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace EntityInlineParser {
	export type Factory = InstanceType<typeof EntityInlineParser.Factory>;
}


