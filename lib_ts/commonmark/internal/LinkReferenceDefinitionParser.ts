






/**
 * Parser for link reference definitions at the beginning of a paragraph.
 *
 * @see <a href="https://spec.commonmark.org/0.31.2/#link-reference-definitions">Link reference definitions</a>
 */
  class LinkReferenceDefinitionParser  {

    private  state:  LinkReferenceDefinitionParser.State | null = LinkReferenceDefinitionParser.State.START_DEFINITION;

    private readonly  paragraphLines:  java.util.List<SourceLine> | null = new  java.util.ArrayList();
    private readonly  definitions:  java.util.List<LinkReferenceDefinition> | null = new  java.util.ArrayList();
    private readonly  sourceSpans:  java.util.List<SourceSpan> | null = new  java.util.ArrayList();

    private  label:  stringBuilder | null;
    private  destination:  string | null;
    private  titleDelimiter:  char;
    private  title:  stringBuilder | null;
    private  referenceValid:  boolean = false;

    public  parse(line: SourceLine| null):  void {
        this.paragraphLines.add(line);
        if (this.state === LinkReferenceDefinitionParser.State.PARAGRAPH) {
            // We're in a paragraph now. Link reference definitions can only appear at the beginning, so once
            // we're in a paragraph, there's no going back.
            return;
        }

        let  scanner: java.util.Scanner = java.util.Scanner.of(SourceLines.of(line));
        while (scanner.hasNext()) {
            let  success: boolean;
            switch (this.state) {
                case LinkReferenceDefinitionParser.State.START_DEFINITION: {
                    success = this.startDefinition(scanner);
                    break;
                }
                case LinkReferenceDefinitionParser.State.LABEL: {
                    success = this.label(scanner);
                    break;
                }
                case LinkReferenceDefinitionParser.State.DESTINATION: {
                    success = this.destination(scanner);
                    break;
                }
                case LinkReferenceDefinitionParser.State.START_TITLE: {
                    success = this.startTitle(scanner);
                    break;
                }
                case LinkReferenceDefinitionParser.State.TITLE: {
                    success = this.title(scanner);
                    break;
                }
                default: {
                    throw new  java.lang.IllegalStateException("Unknown parsing state: " + this.state);
                }
            }
            // Parsing failed, which means we fall back to treating text as a paragraph.
            if (!success) {
                this.state = LinkReferenceDefinitionParser.State.PARAGRAPH;
                // If parsing of the title part failed, we still have a valid reference that we can add, and we need to
                // do it before the source span for this line is added.
                this.finishReference();
                return;
            }
        }
    }

    public  addSourceSpan(sourceSpan: SourceSpan| null):  void {
        this.sourceSpans.add(sourceSpan);
    }

    /**
     * @return the lines that are normal paragraph content, without newlines
     */
    protected  getParagraphLines(): SourceLines | null {
        return SourceLines.of(this.paragraphLines);
    }

    protected  getParagraphSourceSpans(): java.util.List<SourceSpan> | null {
        return this.sourceSpans;
    }

    protected  getDefinitions(): java.util.List<LinkReferenceDefinition> | null {
        this.finishReference();
        return this.definitions;
    }

    protected  getState(): LinkReferenceDefinitionParser.State | null {
        return this.state;
    }

    private  startDefinition(scanner: java.util.Scanner| null):  boolean {
        // Finish any outstanding references now. We don't do this earlier because we need addSourceSpan to have been
        // called before we do it.
        this.finishReference();

        scanner.whitespace();
        if (!scanner.next('[')) {
            return false;
        }

        this.state = LinkReferenceDefinitionParser.State.LABEL;
        this.label = new  stringBuilder();

        if (!scanner.hasNext()) {
            this.label.append('\n');
        }
        return true;
    }

    private  label(scanner: java.util.Scanner| null):  boolean {
        let  start: Position = scanner.position();
        if (!LinkScanner.scanLinkLabelContent(scanner)) {
            return false;
        }

        this.label.append(scanner.getSource(start, scanner.position()).getContent());

        if (!scanner.hasNext()) {
            // label might continue on next line
            this.label.append('\n');
            return true;
        } else if (scanner.next(']')) {
            // end of label
            if (!scanner.next(':')) {
                return false;
            }

            // spec: A link label can have at most 999 characters inside the square brackets.
            if (this.label.length() > 999) {
                return false;
            }

            let  normalizedLabel: string = Escaping.normalizeLabelContent(this.label.toString());
            if (normalizedLabel.isEmpty()) {
                return false;
            }

            this.state = LinkReferenceDefinitionParser.State.DESTINATION;

            scanner.whitespace();
            return true;
        } else {
            return false;
        }
    }

    private  destination(scanner: java.util.Scanner| null):  boolean {
        scanner.whitespace();
        let  start: Position = scanner.position();
        if (!LinkScanner.scanLinkDestination(scanner)) {
            return false;
        }

        let  rawDestination: string = scanner.getSource(start, scanner.position()).getContent();
        this.destination = rawDestination.startsWith("<") ?
                rawDestination.substring(1, rawDestination.length() - 1) :
                rawDestination;

        let  whitespace: int = scanner.whitespace();
        if (!scanner.hasNext()) {
            // Destination was at end of line, so this is a valid reference for sure (and maybe a title).
            // If not at end of line, wait for title to be valid first.
            this.referenceValid = true;
            this.paragraphLines.clear();
        } else if (whitespace === 0) {
            // spec: The title must be separated from the link destination by whitespace
            return false;
        }

        this.state = LinkReferenceDefinitionParser.State.START_TITLE;
        return true;
    }

    private  startTitle(scanner: java.util.Scanner| null):  boolean {
        scanner.whitespace();
        if (!scanner.hasNext()) {
            this.state = LinkReferenceDefinitionParser.State.START_DEFINITION;
            return true;
        }

        this.titleDelimiter = '\0';
        let  c: char = scanner.peek();
        switch (c) {
            case '"':
            case '\'':
                this.titleDelimiter = c;
                break;
            case '(':
                this.titleDelimiter = ')';
                break;

default:

        }

        if (this.titleDelimiter !== '\0') {
            this.state = LinkReferenceDefinitionParser.State.TITLE;
            this.title = new  stringBuilder();
            scanner.next();
            if (!scanner.hasNext()) {
                this.title.append('\n');
            }
        } else {
            // There might be another reference instead, try that for the same character.
            this.state = LinkReferenceDefinitionParser.State.START_DEFINITION;
        }
        return true;
    }

    private  title(scanner: java.util.Scanner| null):  boolean {
        let  start: Position = scanner.position();
        if (!LinkScanner.scanLinkTitleContent(scanner, this.titleDelimiter)) {
            // Invalid title, stop. Title collected so far must not be used.
            this.title = null;
            return false;
        }

        this.title.append(scanner.getSource(start, scanner.position()).getContent());

        if (!scanner.hasNext()) {
            // Title ran until the end of line, so continue on next line (until we find the delimiter)
            this.title.append('\n');
            return true;
        }

        // Skip delimiter character
        scanner.next();
        scanner.whitespace();
        if (scanner.hasNext()) {
            // spec: No further non-whitespace characters may occur on the line.
            // Title collected so far must not be used.
            this.title = null;
            return false;
        }
        this.referenceValid = true;
        this.paragraphLines.clear();

        // See if there's another definition.
        this.state = LinkReferenceDefinitionParser.State.START_DEFINITION;
        return true;
    }

    private  finishReference():  void {
        if (!this.referenceValid) {
            return;
        }

        let  d: string = Escaping.unescapeString(this.destination);
        let  t: string = this.title !== null ? Escaping.unescapeString(this.title.toString()) : null;
        let  definition: LinkReferenceDefinition = new  LinkReferenceDefinition(this.label.toString(), d, t);
        definition.setSourceSpans(this.sourceSpans);
        this.sourceSpans.clear();
        this.definitions.add(definition);

        this.label = null;
        this.referenceValid = false;
        this.destination = null;
        this.title = null;
    }

    protected static  State = class  State extends java.lang.Enum<State> {
        // Looking for the start of a definition, i.e. `[`
        public static readonly START_DEFINITION: State = new class extends State {
}(S`START_DEFINITION`, 0);
        // Parsing the label, i.e. `foo` within `[foo]`
        public static readonly LABEL: State = new class extends State {
}(S`LABEL`, 1);
        // Parsing the destination, i.e. `/url` in `[foo]: /url`
        public static readonly DESTINATION: State = new class extends State {
}(S`DESTINATION`, 2);
        // Looking for the start of a title, i.e. the first `"` in `[foo]: /url "title"`
        public static readonly START_TITLE: State = new class extends State {
}(S`START_TITLE`, 3);
        // Parsing the content of the title, i.e. `title` in `[foo]: /url "title"`
        public static readonly TITLE: State = new class extends State {
}(S`TITLE`, 4);

        // End state, no matter what kind of lines we add, they won't be references
        public static readonly PARAGRAPH: State = new class extends State {
}(S`PARAGRAPH`, 5),
    };

}

export default LinkReferenceDefinitionParser
