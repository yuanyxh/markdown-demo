


import { java, type int, type char, JavaObject, S } from "jree";



/**
 * The node renderer that renders all the core nodes (comes last in the order of node renderers).
 * <p>
 * Note that while sometimes it would be easier to record what kind of syntax was used on parsing (e.g. ATX vs Setext
 * heading), this renderer is intended to also work for documents that were created by directly creating
 * {@link Node Nodes} instead. So in order to support that, it sometimes needs to do a bit more work.
 */
export  class CoreMarkdownNodeRenderer extends AbstractVisitor implements NodeRenderer {

    private readonly  textEscape:  AsciiMatcher | null;
    private readonly  textEscapeInHeading:  CharMatcher | null;
    private readonly  linkDestinationNeedsAngleBrackets:  CharMatcher | null =
            AsciiMatcher.builder().c(' ').c('(').c(')').c('<').c('>').c('\n').c('\\').build();
    private readonly  linkDestinationEscapeInAngleBrackets:  CharMatcher | null =
            AsciiMatcher.builder().c('<').c('>').c('\n').c('\\').build();
    private readonly  linkTitleEscapeInQuotes:  CharMatcher | null =
            AsciiMatcher.builder().c('"').c('\n').c('\\').build();

    private readonly  orderedListMarkerPattern:  java.util.regex.Pattern | null = java.util.regex.Pattern.compile("^([0-9]{1,9})([.)])");

    protected readonly  context:  MarkdownNodeRendererContext | null;
    private readonly  writer:  MarkdownWriter | null;
    /**
     * If we're currently within a {@link BulletList} or {@link OrderedList}, this keeps the context of that list.
     * It has a parent field so that it can represent a stack (for nested lists).
     */
    private  listHolder:  CoreMarkdownNodeRenderer.ListHolder | null;

    public  constructor(context: MarkdownNodeRendererContext| null) {
        super();
this.context = context;
        this.writer = context.getWriter();

        this.textEscape = AsciiMatcher.builder().anyOf("[]<>`*_&\n\\").anyOf(context.getSpecialCharacters()).build();
        this.textEscapeInHeading = AsciiMatcher.builder(this.textEscape).anyOf("#").build();
    }

    public  getNodeTypes():  java.util.Set<java.lang.Class< Node>> | null {
        return java.util.Set.of(
                BlockQuote.class,
                BulletList.class,
                Code.class,
                Document.class,
                Emphasis.class,
                FencedCodeBlock.class,
                HardLineBreak.class,
                Heading.class,
                HtmlBlock.class,
                HtmlInline.class,
                Image.class,
                IndentedCodeBlock.class,
                Link.class,
                ListItem.class,
                OrderedList.class,
                Paragraph.class,
                SoftLineBreak.class,
                StrongEmphasis.class,
                Text.class,
                ThematicBreak.class
        );
    }

    public  render(node: Node| null):  void {
        node.accept(this);
    }

    public  visit(document: Document| null):  void;

    public  visit(thematicBreak: ThematicBreak| null):  void;

    public  visit(heading: Heading| null):  void;

    public  visit(indentedCodeBlock: IndentedCodeBlock| null):  void;

    public  visit(codeBlock: FencedCodeBlock| null):  void;

    public  visit(htmlBlock: HtmlBlock| null):  void;

    public  visit(paragraph: Paragraph| null):  void;

    public  visit(blockQuote: BlockQuote| null):  void;

    public  visit(bulletList: BulletList| null):  void;

    public  visit(orderedList: OrderedList| null):  void;

    public  visit(listItem: ListItem| null):  void;

    public  visit(code: Code| null):  void;

    public  visit(emphasis: Emphasis| null):  void;

    public  visit(strongEmphasis: StrongEmphasis| null):  void;

    public  visit(link: Link| null):  void;

    public  visit(image: Image| null):  void;

    public  visit(htmlInline: HtmlInline| null):  void;

    public  visit(hardLineBreak: HardLineBreak| null):  void;

    public  visit(softLineBreak: SoftLineBreak| null):  void;

    public  visit(text: Text| null):  void;
public visit(...args: unknown[]):  void {
		switch (args.length) {
			case 1: {
				const [document] = args as [Document];


        // No rendering itself
        this.visitChildren(document);
        this.writer.line();
    

				break;
			}

			case 1: {
				const [thematicBreak] = args as [ThematicBreak];


        let  literal: java.lang.String = thematicBreak.getLiteral();
        if (literal === null) {
            // Let's use ___ as it doesn't introduce ambiguity with * or - list item markers
            literal = "___";
        }
        this.writer.raw(literal);
        this.writer.block();
    

				break;
			}

			case 1: {
				const [heading] = args as [Heading];


        if (heading.getLevel() <= 2) {
            let  lineBreakVisitor: CoreMarkdownNodeRenderer.LineBreakVisitor = new  CoreMarkdownNodeRenderer.LineBreakVisitor();
            heading.accept(lineBreakVisitor);
            let  isMultipleLines: boolean = lineBreakVisitor.hasLineBreak();

            if (isMultipleLines) {
                // Setext headings: Can have multiple lines, but only level 1 or 2
                this.visitChildren(heading);
                this.writer.line();
                if (heading.getLevel() === 1) {
                    // Note that it would be nice to match the length of the contents instead of just using 3, but that's
                    // not easy.
                    this.writer.raw("===");
                } else {
                    this.writer.raw("---");
                }
                this.writer.block();
                return;
            }
        }

        // ATX headings: Can't have multiple lines, but up to level 6.
        for (let  i: int = 0; i < heading.getLevel(); i++) {
            this.writer.raw('#');
        }
        this.writer.raw(' ');
        this.visitChildren(heading);

        this.writer.block();
    

				break;
			}

			case 1: {
				const [indentedCodeBlock] = args as [IndentedCodeBlock];


        let  literal: java.lang.String = indentedCodeBlock.getLiteral();
        // We need to respect line prefixes which is why we need to write it line by line (e.g. an indented code block
        // within a block quote)
        this.writer.writePrefix("    ");
        this.writer.pushPrefix("    ");
        let  lines: java.util.List<java.lang.String> = CoreMarkdownNodeRenderer.getLines(literal);
        for (let  i: int = 0; i < lines.size(); i++) {
            let  line: java.lang.String = lines.get(i);
            this.writer.raw(line);
            if (i !== lines.size() - 1) {
                this.writer.line();
            }
        }
        this.writer.popPrefix();
        this.writer.block();
    

				break;
			}

			case 1: {
				const [codeBlock] = args as [FencedCodeBlock];


        let  literal: java.lang.String = codeBlock.getLiteral();
        let  fenceChar: java.lang.String = codeBlock.getFenceCharacter() !== null ? codeBlock.getFenceCharacter() : "`";
        let  openingFenceLength: int;
        if (codeBlock.getOpeningFenceLength() !== null) {
            // If we have a known fence length, use it
            openingFenceLength = codeBlock.getOpeningFenceLength();
        } else {
            // Otherwise, calculate the closing fence length pessimistically, e.g. if the code block itself contains a
            // line with ```, we need to use a fence of length 4. If ``` occurs with non-whitespace characters on a
            // line, we technically don't need a longer fence, but it's not incorrect to do so.
            let  fenceCharsInLiteral: int = CoreMarkdownNodeRenderer.findMaxRunLength(fenceChar, literal);
            openingFenceLength = java.lang.Math.max(fenceCharsInLiteral + 1, 3);
        }
        let  closingFenceLength: int = codeBlock.getClosingFenceLength() !== null ? codeBlock.getClosingFenceLength() : openingFenceLength;

        let  openingFence: java.lang.String = CoreMarkdownNodeRenderer.repeat(fenceChar, openingFenceLength);
        let  closingFence: java.lang.String = CoreMarkdownNodeRenderer.repeat(fenceChar, closingFenceLength);
        let  indent: int = codeBlock.getFenceIndent();

        if (indent > 0) {
            let  indentPrefix: java.lang.String = CoreMarkdownNodeRenderer.repeat(" ", indent);
            this.writer.writePrefix(indentPrefix);
            this.writer.pushPrefix(indentPrefix);
        }

        this.writer.raw(openingFence);
        if (codeBlock.getInfo() !== null) {
            this.writer.raw(codeBlock.getInfo());
        }
        this.writer.line();
        if (!literal.isEmpty()) {
            let  lines: java.util.List<java.lang.String> = CoreMarkdownNodeRenderer.getLines(literal);
            for (let line of lines) {
                this.writer.raw(line);
                this.writer.line();
            }
        }
        this.writer.raw(closingFence);
        if (indent > 0) {
            this.writer.popPrefix();
        }
        this.writer.block();
    

				break;
			}

			case 1: {
				const [htmlBlock] = args as [HtmlBlock];


        let  lines: java.util.List<java.lang.String> = CoreMarkdownNodeRenderer.getLines(htmlBlock.getLiteral());
        for (let  i: int = 0; i < lines.size(); i++) {
            let  line: java.lang.String = lines.get(i);
            this.writer.raw(line);
            if (i !== lines.size() - 1) {
                this.writer.line();
            }
        }
        this.writer.block();
    

				break;
			}

			case 1: {
				const [paragraph] = args as [Paragraph];


        this.visitChildren(paragraph);
        this.writer.block();
    

				break;
			}

			case 1: {
				const [blockQuote] = args as [BlockQuote];


        this.writer.writePrefix("> ");
        this.writer.pushPrefix("> ");
        this.visitChildren(blockQuote);
        this.writer.popPrefix();
        this.writer.block();
    

				break;
			}

			case 1: {
				const [bulletList] = args as [BulletList];


        this.writer.pushTight(bulletList.isTight());
        this.listHolder = new  CoreMarkdownNodeRenderer.BulletListHolder(this.listHolder, bulletList);
        this.visitChildren(bulletList);
        this.listHolder = this.listHolder.parent;
        this.writer.popTight();
        this.writer.block();
    

				break;
			}

			case 1: {
				const [orderedList] = args as [OrderedList];


        this.writer.pushTight(orderedList.isTight());
        this.listHolder = new  CoreMarkdownNodeRenderer.OrderedListHolder(this.listHolder, orderedList);
        this.visitChildren(orderedList);
        this.listHolder = this.listHolder.parent;
        this.writer.popTight();
        this.writer.block();
    

				break;
			}

			case 1: {
				const [listItem] = args as [ListItem];


        let  markerIndent: int = listItem.getMarkerIndent() !== null ? listItem.getMarkerIndent() : 0;
        let  marker: java.lang.String;
        if (this.listHolder instanceof CoreMarkdownNodeRenderer.BulletListHolder) {
            let  bulletListHolder: CoreMarkdownNodeRenderer.BulletListHolder =  this.listHolder as CoreMarkdownNodeRenderer.BulletListHolder;
            marker = CoreMarkdownNodeRenderer.repeat(" ", markerIndent) + bulletListHolder.marker;
        } else if (this.listHolder instanceof CoreMarkdownNodeRenderer.OrderedListHolder) {
            let  orderedListHolder: CoreMarkdownNodeRenderer.OrderedListHolder =  this.listHolder as CoreMarkdownNodeRenderer.OrderedListHolder;
            marker = CoreMarkdownNodeRenderer.repeat(" ", markerIndent) + orderedListHolder.number + orderedListHolder.delimiter;
            orderedListHolder.number++;
        } else {
            throw new  java.lang.IllegalStateException("Unknown list holder type: " + this.listHolder);
        }
        let  contentIndent: java.lang.Integer = listItem.getContentIndent();
        let  spaces: java.lang.String = contentIndent !== null ? CoreMarkdownNodeRenderer.repeat(" ", contentIndent - marker.length()) : " ";
        this.writer.writePrefix(marker);
        this.writer.writePrefix(spaces);
        this.writer.pushPrefix(CoreMarkdownNodeRenderer.repeat(" ", marker.length() + spaces.length()));

        if (listItem.getFirstChild() === null) {
            // Empty list item
            this.writer.block();
        } else {
            this.visitChildren(listItem);
        }

        this.writer.popPrefix();
    

				break;
			}

			case 1: {
				const [code] = args as [Code];


        let  literal: java.lang.String = code.getLiteral();
        // If the literal includes backticks, we can surround them by using one more backtick.
        let  backticks: int = CoreMarkdownNodeRenderer.findMaxRunLength("`", literal);
        for (let  i: int = 0; i < backticks + 1; i++) {
            this.writer.raw('`');
        }
        // If the literal starts or ends with a backtick, surround it with a single space.
        // If it starts and ends with a space (but is not only spaces), add an additional space (otherwise they would
        // get removed on parsing).
        let  addSpace: boolean = literal.startsWith("`") || literal.endsWith("`") ||
                (literal.startsWith(" ") && literal.endsWith(" ") && Characters.hasNonSpace(literal));
        if (addSpace) {
            this.writer.raw(' ');
        }
        this.writer.raw(literal);
        if (addSpace) {
            this.writer.raw(' ');
        }
        for (let  i: int = 0; i < backticks + 1; i++) {
            this.writer.raw('`');
        }
    

				break;
			}

			case 1: {
				const [emphasis] = args as [Emphasis];


        let  delimiter: java.lang.String = emphasis.getOpeningDelimiter();
        // Use delimiter that was parsed if available
        if (delimiter === null) {
            // When emphasis is nested, a different delimiter needs to be used
            delimiter = this.writer.getLastChar() === '*' ? "_" : "*";
        }
        this.writer.raw(delimiter);
        super.visit(emphasis);
        this.writer.raw(delimiter);
    

				break;
			}

			case 1: {
				const [strongEmphasis] = args as [StrongEmphasis];


        this.writer.raw("**");
        super.visit(strongEmphasis);
        this.writer.raw("**");
    

				break;
			}

			case 1: {
				const [link] = args as [Link];


        this.writeLinkLike(link.getTitle(), link.getDestination(), link, "[");
    

				break;
			}

			case 1: {
				const [image] = args as [Image];


        this.writeLinkLike(image.getTitle(), image.getDestination(), image, "![");
    

				break;
			}

			case 1: {
				const [htmlInline] = args as [HtmlInline];


        this.writer.raw(htmlInline.getLiteral());
    

				break;
			}

			case 1: {
				const [hardLineBreak] = args as [HardLineBreak];


        this.writer.raw("  ");
        this.writer.line();
    

				break;
			}

			case 1: {
				const [softLineBreak] = args as [SoftLineBreak];


        this.writer.line();
    

				break;
			}

			case 1: {
				const [text] = args as [Text];


        // Text is tricky. In Markdown special characters (`-`, `#` etc.) can be escaped (`\-`, `\#` etc.) so that
        // they're parsed as plain text. Currently, whether a character was escaped or not is not recorded in the Node,
        // so here we don't know. If we just wrote out those characters unescaped, the resulting Markdown would change
        // meaning (turn into a list item, heading, etc.).
        // You might say "Why not store that in the Node when parsing", but that wouldn't work for the use case where
        // nodes are constructed directly instead of via parsing. This renderer needs to work for that too.
        // So currently, when in doubt, we escape. For special characters only occurring at the beginning of a line,
        // we only escape them then (we wouldn't want to escape every `.` for example).
        let  literal: java.lang.String = text.getLiteral();
        if (this.writer.isAtLineStart() && !literal.isEmpty()) {
            let  c: char = literal.charAt(0);
            switch (c) {
                case '-': {
                    // Would be ambiguous with a bullet list marker, escape
                    this.writer.raw("\\-");
                    literal = literal.substring(1);
                    break;
                }
                case '#': {
                    // Would be ambiguous with an ATX heading, escape
                    this.writer.raw("\\#");
                    literal = literal.substring(1);
                    break;
                }
                case '=': {
                    // Would be ambiguous with a Setext heading, escape unless it's the first line in the block
                    if (text.getPrevious() !== null) {
                        this.writer.raw("\\=");
                        literal = literal.substring(1);
                    }
                    break;
                }
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9': {
                    // Check for ordered list marker
                    let  m: java.util.regex.Matcher = this.orderedListMarkerPattern.matcher(literal);
                    if (m.find()) {
                        this.writer.raw(m.group(1));
                        this.writer.raw("\\" + m.group(2));
                        literal = literal.substring(m.end());
                    }
                    break;
                }
                case '\t': {
                    this.writer.raw("&#9;");
                    literal = literal.substring(1);
                    break;
                }
                case ' ': {
                    this.writer.raw("&#32;");
                    literal = literal.substring(1);
                    break;
                }

default:

            }
        }

        let  escape: CharMatcher = text.getParent() instanceof Heading ? this.textEscapeInHeading : this.textEscape;

        if (literal.endsWith("!") && text.getNext() instanceof Link) {
            // If we wrote the `!` unescaped, it would turn the link into an image instead.
            this.writer.text(literal.substring(0, literal.length() - 1), escape);
            this.writer.raw("\\!");
        } else {
            this.writer.text(literal, escape);
        }
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    protected  visitChildren(parent: Node| null):  void {
        let  node: Node = parent.getFirstChild();
        while (node !== null) {
            let  next: Node = node.getNext();
            this.context.render(node);
            node = next;
        }
    }

    private static  findMaxRunLength(needle: java.lang.String| null, s: java.lang.String| null):  int {
        let  maxRunLength: int = 0;
        let  pos: int = 0;
        while (pos < s.length()) {
            pos = s.indexOf(needle, pos);
            if (pos === -1) {
                return maxRunLength;
            }
            let  runLength: int = 0;
            do {
                pos += needle.length();
                runLength++;
            } while (s.startsWith(needle, pos));
            maxRunLength = java.lang.Math.max(runLength, maxRunLength);
        }
        return maxRunLength;
    }

    private static  contains(s: java.lang.String| null, charMatcher: CharMatcher| null):  boolean {
        for (let  i: int = 0; i < s.length(); i++) {
            if (charMatcher.matches(s.charAt(i))) {
                return true;
            }
        }
        return false;
    }

    // Keep for Android compat (String.repeat only available on Android 12 and later)
    private static  repeat(s: java.lang.String| null, count: int):  java.lang.String | null {
        let  sb: java.lang.StringBuilder = new  java.lang.StringBuilder(s.length() * count);
        for (let  i: int = 0; i < count; i++) {
            sb.append(s);
        }
        return sb.toString();
    }

    private static  getLines(literal: java.lang.String| null):  java.util.List<java.lang.String> | null {
        // Without -1, split would discard all trailing empty strings, which is not what we want, e.g. it would
        // return the same result for "abc", "abc\n" and "abc\n\n".
        // With -1, it returns ["abc"], ["abc", ""] and ["abc", "", ""].
        let  parts: java.lang.String[] = literal.split("\n", -1);
        if (parts[parts.length - 1].isEmpty()) {
            // But we don't want the last empty string, as "\n" is used as a line terminator (not a separator),
            // so return without the last element.
            return java.util.List.of(parts).subList(0, parts.length - 1);
        } else {
            return java.util.List.of(parts);
        }
    }

    private  writeLinkLike(title: java.lang.String| null, destination: java.lang.String| null, node: Node| null, opener: java.lang.String| null):  void {
        this.writer.raw(opener);
        this.visitChildren(node);
        this.writer.raw(']');
        this.writer.raw('(');
        if (CoreMarkdownNodeRenderer.contains(destination, this.linkDestinationNeedsAngleBrackets)) {
            this.writer.raw('<');
            this.writer.text(destination, this.linkDestinationEscapeInAngleBrackets);
            this.writer.raw('>');
        } else {
            this.writer.raw(destination);
        }
        if (title !== null) {
            this.writer.raw(' ');
            this.writer.raw('"');
            this.writer.text(title, this.linkTitleEscapeInQuotes);
            this.writer.raw('"');
        }
        this.writer.raw(')');
    }

    public static ListHolder =  class ListHolder extends JavaObject {
        protected readonly  parent:  ListHolder | null;

        protected  constructor(parent: ListHolder| null) {
            super();
this.parent = parent;
        }
    };


    public static BulletListHolder =  class BulletListHolder extends CoreMarkdownNodeRenderer.ListHolder {
        protected readonly  marker:  java.lang.String | null;

        public  constructor(parent: CoreMarkdownNodeRenderer.ListHolder| null, bulletList: BulletList| null) {
            super(parent);
            this.marker = bulletList.getMarker() !== null ? bulletList.getMarker() : "-";
        }
    };


    public static OrderedListHolder =  class OrderedListHolder extends CoreMarkdownNodeRenderer.ListHolder {
        protected readonly  delimiter:  java.lang.String | null;
        private  number:  int;

        protected  constructor(parent: CoreMarkdownNodeRenderer.ListHolder| null, orderedList: OrderedList| null) {
            super(parent);
            this.delimiter = orderedList.getMarkerDelimiter() !== null ? orderedList.getMarkerDelimiter() : ".";
            this.number = orderedList.getMarkerStartNumber() !== null ? orderedList.getMarkerStartNumber() : 1;
        }
    };


    /**
     * Visits nodes to check if there are any soft or hard line breaks.
     */
    public static LineBreakVisitor =  class LineBreakVisitor extends AbstractVisitor {
        private  lineBreak:  boolean = false;

        public  hasLineBreak():  boolean {
            return this.lineBreak;
        }

        public  visit(softLineBreak: SoftLineBreak| null):  void;

        public  visit(hardLineBreak: HardLineBreak| null):  void;
public visit(...args: unknown[]):  void {
		switch (args.length) {
			case 1: {
				const [softLineBreak] = args as [SoftLineBreak];


            super.visit(softLineBreak);
            this.lineBreak = true;
        

				break;
			}

			case 1: {
				const [hardLineBreak] = args as [HardLineBreak];


            super.visit(hardLineBreak);
            this.lineBreak = true;
        

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}

    };

}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace CoreMarkdownNodeRenderer {
	export type ListHolder = InstanceType<typeof CoreMarkdownNodeRenderer.ListHolder>;
	export type BulletListHolder = InstanceType<typeof CoreMarkdownNodeRenderer.BulletListHolder>;
	export type OrderedListHolder = InstanceType<typeof CoreMarkdownNodeRenderer.OrderedListHolder>;
	export type LineBreakVisitor = InstanceType<typeof CoreMarkdownNodeRenderer.LineBreakVisitor>;
}


