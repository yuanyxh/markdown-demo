


import { java, JavaObject, type char } from "jree";



/**
 * Parse a backslash-escaped special character, adding either the escaped  character, a hard line break
 * (if the backslash is followed by a newline), or a literal backslash to the block's children.
 */
export  class BackslashInlineParser extends JavaObject implements InlineContentParser {

    private static readonly  ESCAPABLE:  java.util.regex.Pattern | null = java.util.regex.Pattern.compile('^' + Escaping.ESCAPABLE);

    public  tryParse(inlineParserState: InlineParserState| null):  ParsedInline | null {
        let  scanner: java.util.Scanner = inlineParserState.scanner();
        // Backslash
        scanner.next();

        let  next: char = scanner.peek();
        if (next === '\n') {
            scanner.next();
            return ParsedInline.of(new  HardLineBreak(), scanner.position());
        } else if (BackslashInlineParser.ESCAPABLE.matcher(java.lang.String.valueOf(next)).matches()) {
            scanner.next();
            return ParsedInline.of(new  Text(java.lang.String.valueOf(next)), scanner.position());
        } else {
            return ParsedInline.of(new  Text("\\"), scanner.position());
        }
    }

    public static Factory =  class Factory extends JavaObject implements InlineContentParserFactory {
        public  getTriggerCharacters():  java.util.Set<java.lang.Character> | null {
            return java.util.Set.of('\\');
        }

        public  create():  InlineContentParser | null {
            return new  BackslashInlineParser();
        }
    };

}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace BackslashInlineParser {
	export type Factory = InstanceType<typeof BackslashInlineParser.Factory>;
}


