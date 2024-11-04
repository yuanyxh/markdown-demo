import { NodeRenderer } from "../NodeRenderer";

import {
  Node,
  Document,
  Heading,
  Paragraph,
  BlockQuote,
  BulletList,
  FencedCodeBlock,
  HtmlBlock,
  ThematicBreak,
  IndentedCodeBlock,
  Link,
  ListItem,
  OrderedList,
  Image,
  Emphasis,
  StrongEmphasis,
  Text,
  Code,
  HtmlInline,
  SoftLineBreak,
  HardLineBreak,
  AbstractVisitor,
} from "../../node";
import { HtmlNodeRendererContext } from "./HtmlNodeRendererContext";
import HtmlWriter from "./HtmlWriter";

/**
 * The node renderer that renders all the core nodes (comes last in the order of node renderers).
 */
class CoreHtmlNodeRenderer extends AbstractVisitor implements NodeRenderer {
  protected readonly context: HtmlNodeRendererContext;
  private readonly html: HtmlWriter;

  public constructor(context: HtmlNodeRendererContext) {
    super();
    this.context = context;
    this.html = context.getWriter();
  }

  public beforeRoot(rootNode: Node): void {}
  public afterRoot(rootNode: Node): void {}

  public getNodeTypes(): Set<Node> | null {
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

  public render(node: Node | null): void {
    node.accept(this);
  }

  public visit(document: Document | null): void;

  public visit(heading: Heading | null): void;

  public visit(paragraph: Paragraph | null): void;

  public visit(blockQuote: BlockQuote | null): void;

  public visit(bulletList: BulletList | null): void;

  public visit(fencedCodeBlock: FencedCodeBlock | null): void;

  public visit(htmlBlock: HtmlBlock | null): void;

  public visit(thematicBreak: ThematicBreak | null): void;

  public visit(indentedCodeBlock: IndentedCodeBlock | null): void;

  public visit(link: Link | null): void;

  public visit(listItem: ListItem | null): void;

  public visit(orderedList: OrderedList | null): void;

  public visit(image: Image | null): void;

  public visit(emphasis: Emphasis | null): void;

  public visit(strongEmphasis: StrongEmphasis | null): void;

  public visit(text: Text | null): void;

  public visit(code: Code | null): void;

  public visit(htmlInline: HtmlInline | null): void;

  public visit(softLineBreak: SoftLineBreak | null): void;

  public visit(hardLineBreak: HardLineBreak | null): void;
  public visit(...args: unknown[]): void {
    switch (args.length) {
      case 1: {
        const [document] = args as [Document];

        // No rendering itself
        this.visitChildren(document);

        break;
      }

      case 1: {
        const [heading] = args as [Heading];

        let htag: java.lang.String = "h" + heading.getLevel();
        this.html.line();
        this.html.tag(htag, this.getAttrs(heading, htag));
        this.visitChildren(heading);
        this.html.tag("/" + htag);
        this.html.line();

        break;
      }

      case 1: {
        const [paragraph] = args as [Paragraph];

        let omitP: boolean =
          this.isInTightList(paragraph) || //
          (this.context.shouldOmitSingleParagraphP() &&
            paragraph.getParent() instanceof Document && //
            paragraph.getPrevious() === null &&
            paragraph.getNext() === null);
        if (!omitP) {
          this.html.line();
          this.html.tag("p", this.getAttrs(paragraph, "p"));
        }
        this.visitChildren(paragraph);
        if (!omitP) {
          this.html.tag("/p");
          this.html.line();
        }

        break;
      }

      case 1: {
        const [blockQuote] = args as [BlockQuote];

        this.html.line();
        this.html.tag("blockquote", this.getAttrs(blockQuote, "blockquote"));
        this.html.line();
        this.visitChildren(blockQuote);
        this.html.line();
        this.html.tag("/blockquote");
        this.html.line();

        break;
      }

      case 1: {
        const [bulletList] = args as [BulletList];

        this.renderListBlock(bulletList, "ul", this.getAttrs(bulletList, "ul"));

        break;
      }

      case 1: {
        const [fencedCodeBlock] = args as [FencedCodeBlock];

        let literal: java.lang.String = fencedCodeBlock.getLiteral();
        let attributes: java.util.Map<java.lang.String, java.lang.String> =
          new java.util.LinkedHashMap();
        let info: java.lang.String = fencedCodeBlock.getInfo();
        if (info !== null && !info.isEmpty()) {
          let space: int = info.indexOf(" ");
          let language: java.lang.String;
          if (space === -1) {
            language = info;
          } else {
            language = info.substring(0, space);
          }
          attributes.put("class", "language-" + language);
        }
        this.renderCodeBlock(literal, fencedCodeBlock, attributes);

        break;
      }

      case 1: {
        const [htmlBlock] = args as [HtmlBlock];

        this.html.line();
        if (this.context.shouldEscapeHtml()) {
          this.html.tag("p", this.getAttrs(htmlBlock, "p"));
          this.html.text(htmlBlock.getLiteral());
          this.html.tag("/p");
        } else {
          this.html.raw(htmlBlock.getLiteral());
        }
        this.html.line();

        break;
      }

      case 1: {
        const [thematicBreak] = args as [ThematicBreak];

        this.html.line();
        this.html.tag("hr", this.getAttrs(thematicBreak, "hr"), true);
        this.html.line();

        break;
      }

      case 1: {
        const [indentedCodeBlock] = args as [IndentedCodeBlock];

        this.renderCodeBlock(
          indentedCodeBlock.getLiteral(),
          indentedCodeBlock,
          java.util.Map.of()
        );

        break;
      }

      case 1: {
        const [link] = args as [Link];

        let attrs: java.util.Map<java.lang.String, java.lang.String> =
          new java.util.LinkedHashMap();
        let url: java.lang.String = link.getDestination();

        if (this.context.shouldSanitizeUrls()) {
          url = this.context.urlSanitizer().sanitizeLinkUrl(url);
          attrs.put("rel", "nofollow");
        }

        url = this.context.encodeUrl(url);
        attrs.put("href", url);
        if (link.getTitle() !== null) {
          attrs.put("title", link.getTitle());
        }
        this.html.tag("a", this.getAttrs(link, "a", attrs));
        this.visitChildren(link);
        this.html.tag("/a");

        break;
      }

      case 1: {
        const [listItem] = args as [ListItem];

        this.html.tag("li", this.getAttrs(listItem, "li"));
        this.visitChildren(listItem);
        this.html.tag("/li");
        this.html.line();

        break;
      }

      case 1: {
        const [orderedList] = args as [OrderedList];

        let start: int =
          orderedList.getMarkerStartNumber() !== null
            ? orderedList.getMarkerStartNumber()
            : 1;
        let attrs: java.util.Map<java.lang.String, java.lang.String> =
          new java.util.LinkedHashMap();
        if (start !== 1) {
          attrs.put("start", java.lang.String.valueOf(start));
        }
        this.renderListBlock(
          orderedList,
          "ol",
          this.getAttrs(orderedList, "ol", attrs)
        );

        break;
      }

      case 1: {
        const [image] = args as [Image];

        let url: java.lang.String = image.getDestination();

        let altTextVisitor: CoreHtmlNodeRenderer.AltTextVisitor =
          new CoreHtmlNodeRenderer.AltTextVisitor();
        image.accept(altTextVisitor);
        let altText: java.lang.String = altTextVisitor.getAltText();

        let attrs: java.util.Map<java.lang.String, java.lang.String> =
          new java.util.LinkedHashMap();
        if (this.context.shouldSanitizeUrls()) {
          url = this.context.urlSanitizer().sanitizeImageUrl(url);
        }

        attrs.put("src", this.context.encodeUrl(url));
        attrs.put("alt", altText);
        if (image.getTitle() !== null) {
          attrs.put("title", image.getTitle());
        }

        this.html.tag("img", this.getAttrs(image, "img", attrs), true);

        break;
      }

      case 1: {
        const [emphasis] = args as [Emphasis];

        this.html.tag("em", this.getAttrs(emphasis, "em"));
        this.visitChildren(emphasis);
        this.html.tag("/em");

        break;
      }

      case 1: {
        const [strongEmphasis] = args as [StrongEmphasis];

        this.html.tag("strong", this.getAttrs(strongEmphasis, "strong"));
        this.visitChildren(strongEmphasis);
        this.html.tag("/strong");

        break;
      }

      case 1: {
        const [text] = args as [Text];

        this.html.text(text.getLiteral());

        break;
      }

      case 1: {
        const [code] = args as [Code];

        this.html.tag("code", this.getAttrs(code, "code"));
        this.html.text(code.getLiteral());
        this.html.tag("/code");

        break;
      }

      case 1: {
        const [htmlInline] = args as [HtmlInline];

        if (this.context.shouldEscapeHtml()) {
          this.html.text(htmlInline.getLiteral());
        } else {
          this.html.raw(htmlInline.getLiteral());
        }

        break;
      }

      case 1: {
        const [softLineBreak] = args as [SoftLineBreak];

        this.html.raw(this.context.getSoftbreak());

        break;
      }

      case 1: {
        const [hardLineBreak] = args as [HardLineBreak];

        this.html.tag("br", this.getAttrs(hardLineBreak, "br"), true);
        this.html.line();

        break;
      }

      default: {
        throw new java.lang.IllegalArgumentException(
          S`Invalid number of arguments`
        );
      }
    }
  }

  protected visitChildren(parent: Node | null): void {
    let node: Node = parent.getFirstChild();
    while (node !== null) {
      let next: Node = node.getNext();
      this.context.render(node);
      node = next;
    }
  }

  private renderCodeBlock(
    literal: java.lang.String | null,
    node: Node | null,
    attributes: java.util.Map<java.lang.String, java.lang.String> | null
  ): void {
    this.html.line();
    this.html.tag("pre", this.getAttrs(node, "pre"));
    this.html.tag("code", this.getAttrs(node, "code", attributes));
    this.html.text(literal);
    this.html.tag("/code");
    this.html.tag("/pre");
    this.html.line();
  }

  private renderListBlock(
    listBlock: ListBlock | null,
    tagName: java.lang.String | null,
    attributes: java.util.Map<java.lang.String, java.lang.String> | null
  ): void {
    this.html.line();
    this.html.tag(tagName, attributes);
    this.html.line();
    this.visitChildren(listBlock);
    this.html.line();
    this.html.tag("/" + tagName);
    this.html.line();
  }

  private isInTightList(paragraph: Paragraph | null): boolean {
    let parent: Node = paragraph.getParent();
    if (parent !== null) {
      let gramps: Node = parent.getParent();
      if (gramps instanceof ListBlock) {
        let list: ListBlock = gramps as ListBlock;
        return list.isTight();
      }
    }
    return false;
  }

  private getAttrs(
    node: Node | null,
    tagName: java.lang.String | null
  ): java.util.Map<java.lang.String, java.lang.String> | null;

  private getAttrs(
    node: Node | null,
    tagName: java.lang.String | null,
    defaultAttributes: java.util.Map<java.lang.String, java.lang.String> | null
  ): java.util.Map<java.lang.String, java.lang.String> | null;
  private getAttrs(
    ...args: unknown[]
  ): java.util.Map<java.lang.String, java.lang.String> | null {
    switch (args.length) {
      case 2: {
        const [node, tagName] = args as [Node, java.lang.String];

        return this.getAttrs(node, tagName, java.util.Map.of());

        break;
      }

      case 3: {
        const [node, tagName, defaultAttributes] = args as [
          Node,
          java.lang.String,
          java.util.Map<java.lang.String, java.lang.String>
        ];

        return this.context.extendAttributes(node, tagName, defaultAttributes);

        break;
      }

      default: {
        throw new java.lang.IllegalArgumentException(
          S`Invalid number of arguments`
        );
      }
    }
  }

  public static AltTextVisitor = class AltTextVisitor extends AbstractVisitor {
    private readonly sb: java.lang.StringBuilder | null =
      new java.lang.StringBuilder();

    protected getAltText(): java.lang.String | null {
      return this.sb.toString();
    }

    public visit(text: Text | null): void;

    public visit(softLineBreak: SoftLineBreak | null): void;

    public visit(hardLineBreak: HardLineBreak | null): void;
    public visit(...args: unknown[]): void {
      switch (args.length) {
        case 1: {
          const [text] = args as [Text];

          this.sb.append(text.getLiteral());

          break;
        }

        case 1: {
          const [softLineBreak] = args as [SoftLineBreak];

          this.sb.append("\n");

          break;
        }

        case 1: {
          const [hardLineBreak] = args as [HardLineBreak];

          this.sb.append("\n");

          break;
        }

        default: {
          throw new java.lang.IllegalArgumentException(
            S`Invalid number of arguments`
          );
        }
      }
    }
  };
}

export default CoreHtmlNodeRenderer;
