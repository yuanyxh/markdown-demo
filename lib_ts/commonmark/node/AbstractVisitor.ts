import Node from "./Node";

/**
 * Abstract visitor that visits all children by default.
 * <p>
 * Can be used to only process certain nodes. If you override a method and want visiting to descend into children,
 * call {@link #visitChildren}.
 */
abstract class AbstractVisitor implements Visitor {
  public visit(blockQuote: BlockQuote | null): void;

  public visit(bulletList: BulletList | null): void;

  public visit(code: Code | null): void;

  public visit(document: Document | null): void;

  public visit(emphasis: Emphasis | null): void;

  public visit(fencedCodeBlock: FencedCodeBlock | null): void;

  public visit(hardLineBreak: HardLineBreak | null): void;

  public visit(heading: Heading | null): void;

  public visit(thematicBreak: ThematicBreak | null): void;

  public visit(htmlInline: HtmlInline | null): void;

  public visit(htmlBlock: HtmlBlock | null): void;

  public visit(image: Image | null): void;

  public visit(indentedCodeBlock: IndentedCodeBlock | null): void;

  public visit(link: Link | null): void;

  public visit(listItem: ListItem | null): void;

  public visit(orderedList: OrderedList | null): void;

  public visit(paragraph: Paragraph | null): void;

  public visit(softLineBreak: SoftLineBreak | null): void;

  public visit(strongEmphasis: StrongEmphasis | null): void;

  public visit(text: Text | null): void;

  public visit(linkReferenceDefinition: LinkReferenceDefinition | null): void;

  public visit(customBlock: CustomBlock | null): void;

  public visit(customNode: CustomNode | null): void;
  public visit(...args: unknown[]): void {
    switch (args.length) {
      case 1: {
        const [blockQuote] = args as [BlockQuote];

        this.visitChildren(blockQuote);

        break;
      }

      case 1: {
        const [bulletList] = args as [BulletList];

        this.visitChildren(bulletList);

        break;
      }

      case 1: {
        const [code] = args as [Code];

        this.visitChildren(code);

        break;
      }

      case 1: {
        const [document] = args as [Document];

        this.visitChildren(document);

        break;
      }

      case 1: {
        const [emphasis] = args as [Emphasis];

        this.visitChildren(emphasis);

        break;
      }

      case 1: {
        const [fencedCodeBlock] = args as [FencedCodeBlock];

        this.visitChildren(fencedCodeBlock);

        break;
      }

      case 1: {
        const [hardLineBreak] = args as [HardLineBreak];

        this.visitChildren(hardLineBreak);

        break;
      }

      case 1: {
        const [heading] = args as [Heading];

        this.visitChildren(heading);

        break;
      }

      case 1: {
        const [thematicBreak] = args as [ThematicBreak];

        this.visitChildren(thematicBreak);

        break;
      }

      case 1: {
        const [htmlInline] = args as [HtmlInline];

        this.visitChildren(htmlInline);

        break;
      }

      case 1: {
        const [htmlBlock] = args as [HtmlBlock];

        this.visitChildren(htmlBlock);

        break;
      }

      case 1: {
        const [image] = args as [Image];

        this.visitChildren(image);

        break;
      }

      case 1: {
        const [indentedCodeBlock] = args as [IndentedCodeBlock];

        this.visitChildren(indentedCodeBlock);

        break;
      }

      case 1: {
        const [link] = args as [Link];

        this.visitChildren(link);

        break;
      }

      case 1: {
        const [listItem] = args as [ListItem];

        this.visitChildren(listItem);

        break;
      }

      case 1: {
        const [orderedList] = args as [OrderedList];

        this.visitChildren(orderedList);

        break;
      }

      case 1: {
        const [paragraph] = args as [Paragraph];

        this.visitChildren(paragraph);

        break;
      }

      case 1: {
        const [softLineBreak] = args as [SoftLineBreak];

        this.visitChildren(softLineBreak);

        break;
      }

      case 1: {
        const [strongEmphasis] = args as [StrongEmphasis];

        this.visitChildren(strongEmphasis);

        break;
      }

      case 1: {
        const [text] = args as [Text];

        this.visitChildren(text);

        break;
      }

      case 1: {
        const [linkReferenceDefinition] = args as [LinkReferenceDefinition];

        this.visitChildren(linkReferenceDefinition);

        break;
      }

      case 1: {
        const [customBlock] = args as [CustomBlock];

        this.visitChildren(customBlock);

        break;
      }

      case 1: {
        const [customNode] = args as [CustomNode];

        this.visitChildren(customNode);

        break;
      }

      default: {
        throw new java.lang.IllegalArgumentException(
          S`Invalid number of arguments`
        );
      }
    }
  }

  /**
   * Visit the child nodes.
   *
   * @param parent the parent node whose children should be visited
   */
  protected visitChildren(parent: Node | null): void {
    let node: Node = parent.getFirstChild();
    while (node !== null) {
      // A subclass of this visitor might modify the node, resulting in getNext returning a different node or no
      // node after visiting it. So get the next node before visiting.
      let next: Node = node.getNext();
      node.accept(this);
      node = next;
    }
  }
}

export default AbstractVisitor;
