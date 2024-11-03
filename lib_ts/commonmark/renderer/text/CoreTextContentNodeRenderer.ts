


import { java, S } from "jree";



/**
 * The node renderer that renders all the core nodes (comes last in the order of node renderers).
 */
export  class CoreTextContentNodeRenderer extends AbstractVisitor implements NodeRenderer {

    protected readonly  context:  TextContentNodeRendererContext | null;
    private readonly  textContent:  TextContentWriter | null;

    private  listHolder:  ListHolder | null;

    public  constructor(context: TextContentNodeRendererContext| null) {
        super();
this.context = context;
        this.textContent = context.getWriter();
    }

    public  getNodeTypes():  java.util.Set<java.lang.Class< Node>> | null {
        return java.util.Set.of(
                Document.class,
                Heading.class,
                Paragraph.class,
                BlockQuote.class,
                BulletList.class,
                FencedCodeBlock.class,
                HtmlBlock.class,
                ThematicBreak.class,
                IndentedCodeBlock.class,
                Link.class,
                ListItem.class,
                OrderedList.class,
                Image.class,
                Emphasis.class,
                StrongEmphasis.class,
                Text.class,
                Code.class,
                HtmlInline.class,
                SoftLineBreak.class,
                HardLineBreak.class
        );
    }

    public  render(node: Node| null):  void {
        node.accept(this);
    }

    public  visit(document: Document| null):  void;

    public  visit(blockQuote: BlockQuote| null):  void;

    public  visit(bulletList: BulletList| null):  void;

    public  visit(code: Code| null):  void;

    public  visit(fencedCodeBlock: FencedCodeBlock| null):  void;

    public  visit(hardLineBreak: HardLineBreak| null):  void;

    public  visit(heading: Heading| null):  void;

    public  visit(thematicBreak: ThematicBreak| null):  void;

    public  visit(htmlInline: HtmlInline| null):  void;

    public  visit(htmlBlock: HtmlBlock| null):  void;

    public  visit(image: Image| null):  void;

    public  visit(indentedCodeBlock: IndentedCodeBlock| null):  void;

    public  visit(link: Link| null):  void;

    public  visit(listItem: ListItem| null):  void;

    public  visit(orderedList: OrderedList| null):  void;

    public  visit(paragraph: Paragraph| null):  void;

    public  visit(softLineBreak: SoftLineBreak| null):  void;

    public  visit(text: Text| null):  void;
public visit(...args: unknown[]):  void {
		switch (args.length) {
			case 1: {
				const [document] = args as [Document];


        // No rendering itself
        this.visitChildren(document);
    

				break;
			}

			case 1: {
				const [blockQuote] = args as [BlockQuote];


        // LEFT-POINTING DOUBLE ANGLE QUOTATION MARK
        this.textContent.write('\u00AB');
        this.visitChildren(blockQuote);
        this.textContent.resetBlock();
        // RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK
        this.textContent.write('\u00BB');

        this.textContent.block();
    

				break;
			}

			case 1: {
				const [bulletList] = args as [BulletList];


        this.textContent.pushTight(bulletList.isTight());
        this.listHolder = new  BulletListHolder(this.listHolder, bulletList);
        this.visitChildren(bulletList);
        this.textContent.popTight();
        this.textContent.block();
        this.listHolder = this.listHolder.getParent();
    

				break;
			}

			case 1: {
				const [code] = args as [Code];


        this.textContent.write('\"');
        this.textContent.write(code.getLiteral());
        this.textContent.write('\"');
    

				break;
			}

			case 1: {
				const [fencedCodeBlock] = args as [FencedCodeBlock];


        let  literal  = CoreTextContentNodeRenderer.stripTrailingNewline(fencedCodeBlock.getLiteral());
        if (this.stripNewlines()) {
            this.textContent.writeStripped(literal);
        } else {
            this.textContent.write(literal);
        }
        this.textContent.block();
    

				break;
			}

			case 1: {
				const [hardLineBreak] = args as [HardLineBreak];


        if (this.stripNewlines()) {
            this.textContent.whitespace();
        } else {
            this.textContent.line();
        }
    

				break;
			}

			case 1: {
				const [heading] = args as [Heading];


        this.visitChildren(heading);
        if (this.stripNewlines()) {
            this.textContent.write(": ");
        } else {
            this.textContent.block();
        }
    

				break;
			}

			case 1: {
				const [thematicBreak] = args as [ThematicBreak];


        if (!this.stripNewlines()) {
            this.textContent.write("***");
        }
        this.textContent.block();
    

				break;
			}

			case 1: {
				const [htmlInline] = args as [HtmlInline];


        this.writeText(htmlInline.getLiteral());
    

				break;
			}

			case 1: {
				const [htmlBlock] = args as [HtmlBlock];


        this.writeText(htmlBlock.getLiteral());
    

				break;
			}

			case 1: {
				const [image] = args as [Image];


        this.writeLink(image, image.getTitle(), image.getDestination());
    

				break;
			}

			case 1: {
				const [indentedCodeBlock] = args as [IndentedCodeBlock];


        let  literal  = CoreTextContentNodeRenderer.stripTrailingNewline(indentedCodeBlock.getLiteral());
        if (this.stripNewlines()) {
            this.textContent.writeStripped(literal);
        } else {
            this.textContent.write(literal);
        }
        this.textContent.block();
    

				break;
			}

			case 1: {
				const [link] = args as [Link];


        this.writeLink(link, link.getTitle(), link.getDestination());
    

				break;
			}

			case 1: {
				const [listItem] = args as [ListItem];


        if (this.listHolder !== null && this.listHolder instanceof OrderedListHolder) {
            let  orderedListHolder: OrderedListHolder =  this.listHolder as OrderedListHolder;
            let  indent: java.lang.String = this.stripNewlines() ? "" : orderedListHolder.getIndent();
            this.textContent.write(indent + orderedListHolder.getCounter() + orderedListHolder.getDelimiter() + " ");
            this.visitChildren(listItem);
            this.textContent.block();
            orderedListHolder.increaseCounter();
        } else if (this.listHolder !== null && this.listHolder instanceof BulletListHolder) {
            let  bulletListHolder: BulletListHolder =  this.listHolder as BulletListHolder;
            if (!this.stripNewlines()) {
                this.textContent.write(bulletListHolder.getIndent() + bulletListHolder.getMarker() + " ");
            }
            this.visitChildren(listItem);
            this.textContent.block();
        }
    

				break;
			}

			case 1: {
				const [orderedList] = args as [OrderedList];


        this.textContent.pushTight(orderedList.isTight());
        this.listHolder = new  OrderedListHolder(this.listHolder, orderedList);
        this.visitChildren(orderedList);
        this.textContent.popTight();
        this.textContent.block();
        this.listHolder = this.listHolder.getParent();
    

				break;
			}

			case 1: {
				const [paragraph] = args as [Paragraph];


        this.visitChildren(paragraph);
        this.textContent.block();
    

				break;
			}

			case 1: {
				const [softLineBreak] = args as [SoftLineBreak];


        if (this.stripNewlines()) {
            this.textContent.whitespace();
        } else {
            this.textContent.line();
        }
    

				break;
			}

			case 1: {
				const [text] = args as [Text];


        this.writeText(text.getLiteral());
    

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

    private  writeText(text: java.lang.String| null):  void {
        if (this.stripNewlines()) {
            this.textContent.writeStripped(text);
        } else {
            this.textContent.write(text);
        }
    }

    private  writeLink(node: Node| null, title: java.lang.String| null, destination: java.lang.String| null):  void {
        let  hasChild: boolean = node.getFirstChild() !== null;
        let  hasTitle: boolean = title !== null && !title.equals(destination);
        let  hasDestination: boolean = destination !== null && !destination.equals("");

        if (hasChild) {
            this.textContent.write('"');
            this.visitChildren(node);
            this.textContent.write('"');
            if (hasTitle || hasDestination) {
                this.textContent.whitespace();
                this.textContent.write('(');
            }
        }

        if (hasTitle) {
            this.textContent.write(title);
            if (hasDestination) {
                this.textContent.colon();
                this.textContent.whitespace();
            }
        }

        if (hasDestination) {
            this.textContent.write(destination);
        }

        if (hasChild && (hasTitle || hasDestination)) {
            this.textContent.write(')');
        }
    }

    private  stripNewlines():  boolean {
        return this.context.lineBreakRendering() === LineBreakRendering.STRIP;
    }

    private static  stripTrailingNewline(s: java.lang.String| null):  java.lang.String | null {
        if (s.endsWith("\n")) {
            return s.substring(0, s.length() - 1);
        } else {
            return s;
        }
    }
}
