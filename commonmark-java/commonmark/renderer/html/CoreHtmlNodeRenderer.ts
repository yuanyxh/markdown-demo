import type { MarkdownNode } from "@/node";

import type { HtmlNodeRendererContext } from "./interfaces/HtmlNodeRendererContext";
import type { NodeRenderer } from "../interfaces/NodeRenderer";

import { Appendable, isNotUnDef } from "@/helpers/index";
import {
  ListBlock,
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
} from "@/node";

import HtmlWriter from "./HtmlWriter";

class AltTextVisitor extends AbstractVisitor {
  private readonly sb: Appendable = new Appendable();

  public getAltText() {
    return this.sb.toString();
  }

  public visit(node: Text | SoftLineBreak | HardLineBreak) {
    switch (true) {
      case node instanceof Text: {
        const text = node;

        this.sb.append(text.getLiteral());

        break;
      }

      case node instanceof SoftLineBreak: {
        this.sb.append("\n");

        break;
      }

      case node instanceof HardLineBreak: {
        this.sb.append("\n");

        break;
      }
    }
  }
}

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

  public beforeRoot(rootNode: MarkdownNode) {}
  public afterRoot(rootNode: MarkdownNode) {}

  public getNodeTypes(): Set<typeof MarkdownNode> {
    return new Set([
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
    ] as unknown as (typeof MarkdownNode)[]);
  }

  public render(node: MarkdownNode) {
    node.accept(this);
  }

  public override visit(node: MarkdownNode) {
    switch (true) {
      case node instanceof Document: {
        const document = node;

        // No rendering itself
        this.visitChildren(document);

        break;
      }

      case node instanceof Heading: {
        const heading = node;

        const htag = "h" + heading.getLevel();
        this.html.line();
        this.html.tag(htag, this.getAttrs(heading, htag));
        this.visitChildren(heading);
        this.html.tag("/" + htag);
        this.html.line();

        break;
      }

      case node instanceof Paragraph: {
        // const paragraph = node;

        // const omitP: boolean =
        //   this.isInTightList(paragraph) || //
        //   (this.context.shouldOmitSingleParagraphP() &&
        //     paragraph.getParent() instanceof Document && //
        //     paragraph.getPrevious() === null &&
        //     paragraph.getNext() === null);

        // if (!omitP) {
        //   this.html.line();
        //   this.html.tag("p", this.getAttrs(paragraph, "p"));
        // }

        // this.visitChildren(paragraph);

        // if (!omitP) {
        //   this.html.tag("/p");
        //   this.html.line();
        // }

        const paragraph = node;
        this.html.line();
        this.html.tag("p", this.getAttrs(paragraph, "p"));
        this.visitChildren(paragraph);
        this.html.tag("/p");
        this.html.line();

        break;
      }

      case node instanceof BlockQuote: {
        const blockQuote = node;

        this.html.line();
        this.html.tag("blockquote", this.getAttrs(blockQuote, "blockquote"));
        this.html.line();
        this.visitChildren(blockQuote);
        this.html.line();
        this.html.tag("/blockquote");
        this.html.line();

        break;
      }

      case node instanceof BulletList: {
        const bulletList = node;

        this.renderListBlock(bulletList, "ul", this.getAttrs(bulletList, "ul"));

        break;
      }

      case node instanceof FencedCodeBlock: {
        const fencedCodeBlock = node;

        const literal = fencedCodeBlock.getLiteral();
        const attributes = new Map<string, string>();
        const info = fencedCodeBlock.getInfo();

        if (info) {
          const space = info.indexOf(" ");
          let language: string;

          if (space === -1) {
            language = info;
          } else {
            language = info.substring(0, space);
          }

          attributes.set("class", "language-" + language);
        }

        this.renderCodeBlock(literal || "", fencedCodeBlock, attributes);

        break;
      }

      case node instanceof HtmlBlock: {
        const htmlBlock = node;

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

      case node instanceof ThematicBreak: {
        const thematicBreak = node;

        this.html.line();
        this.html.tag("hr", this.getAttrs(thematicBreak, "hr"), true);
        this.html.line();

        break;
      }

      case node instanceof IndentedCodeBlock: {
        const indentedCodeBlock = node;

        this.renderCodeBlock(
          indentedCodeBlock.getLiteral(),
          indentedCodeBlock,
          new Map<string, string>()
        );

        break;
      }

      case node instanceof Link: {
        const link = node;

        const attrs = new Map<string, string>();
        let url = link.getDestination();

        if (this.context.shouldSanitizeUrls()) {
          url = this.context.urlSanitizer().sanitizeLinkUrl(url);
          attrs.set("rel", "nofollow");
        }

        url = this.context.encodeUrl(url);
        attrs.set("href", url);

        const title = link.getTitle();
        if (isNotUnDef(title)) {
          attrs.set("title", title);
        }

        this.html.tag("a", this.getAttrs(link, "a", attrs));
        this.visitChildren(link);
        this.html.tag("/a");

        break;
      }

      case node instanceof ListItem: {
        const listItem = node;

        this.html.tag("li", this.getAttrs(listItem, "li"));
        this.visitChildren(listItem);
        this.html.tag("/li");
        this.html.line();

        break;
      }

      case node instanceof OrderedList: {
        const orderedList = node;

        const markerStartNumber = orderedList.getMarkerStartNumber();
        const start = isNotUnDef(markerStartNumber) ? markerStartNumber : 1;

        const attrs = new Map<string, string>();

        if (start !== 1) {
          attrs.set("start", start.toString());
        }

        this.renderListBlock(
          orderedList,
          "ol",
          this.getAttrs(orderedList, "ol", attrs)
        );

        break;
      }

      case node instanceof Image: {
        const image = node;

        let url = image.getDestination();

        const altTextVisitor = new AltTextVisitor();
        image.accept(altTextVisitor);

        const altText = altTextVisitor.getAltText();

        const attrs = new Map<string, string>();

        if (this.context.shouldSanitizeUrls()) {
          url = this.context.urlSanitizer().sanitizeImageUrl(url);
        }

        attrs.set("src", this.context.encodeUrl(url));
        attrs.set("alt", altText);

        const title = image.getTitle();
        if (isNotUnDef(title)) {
          attrs.set("title", title);
        }

        this.html.tag("img", this.getAttrs(image, "img", attrs), true);

        break;
      }

      case node instanceof Emphasis: {
        const emphasis = node;

        this.html.tag("em", this.getAttrs(emphasis, "em"));
        this.visitChildren(emphasis);
        this.html.tag("/em");

        break;
      }

      case node instanceof StrongEmphasis: {
        const strongEmphasis = node;

        this.html.tag("strong", this.getAttrs(strongEmphasis, "strong"));
        this.visitChildren(strongEmphasis);
        this.html.tag("/strong");

        break;
      }

      case node instanceof Text: {
        const text = node;

        this.html.tag("span", this.getAttrs(text, "span"));
        this.html.text(text.getLiteral());
        this.html.tag("/span");

        break;
      }

      case node instanceof Code: {
        const code = node;

        this.html.tag("code", this.getAttrs(code, "code"));
        this.html.text(code.getLiteral());
        this.html.tag("/code");

        break;
      }

      case node instanceof HtmlInline: {
        const htmlInline = node;

        if (this.context.shouldEscapeHtml()) {
          this.html.text(htmlInline.getLiteral());
        } else {
          this.html.raw(htmlInline.getLiteral());
        }

        break;
      }

      case node instanceof SoftLineBreak: {
        this.html.raw(this.context.getSoftbreak());

        break;
      }

      case node instanceof HardLineBreak: {
        const hardLineBreak = node;

        this.html.tag("br", this.getAttrs(hardLineBreak, "br"), true);
        this.html.line();

        break;
      }
    }
  }

  protected override visitChildren(parent: MarkdownNode) {
    let node = parent.getFirstChild();

    while (node !== null) {
      let next = node.getNext();
      this.context.render(node);
      node = next;
    }
  }

  private renderCodeBlock(
    literal: string,
    node: MarkdownNode,
    attributes: Map<string, string>
  ) {
    this.html.line();
    this.html.tag("pre", this.getAttrs(node, "pre"));
    this.html.tag("code", this.getAttrs(node, "code", attributes));
    this.html.text(literal);
    this.html.tag("/code");
    this.html.tag("/pre");
    this.html.line();
  }

  private renderListBlock(
    listBlock: ListBlock,
    tagName: string,
    attributes: Map<string, string>
  ) {
    this.html.line();
    this.html.tag(tagName, attributes);
    this.html.line();
    this.visitChildren(listBlock);
    this.html.line();
    this.html.tag("/" + tagName);
    this.html.line();
  }

  private isInTightList(paragraph: Paragraph): boolean {
    let parent = paragraph.getParent();

    if (parent !== null) {
      let gramps = parent.getParent();
      if (gramps instanceof ListBlock) {
        return gramps.isTight();
      }
    }

    return false;
  }

  private getAttrs(
    node: MarkdownNode,
    tagName: string,
    defaultAttributes = new Map<string, string>()
  ): Map<string, string> {
    return this.context.extendAttributes(node, tagName, defaultAttributes);
  }

  public static AltTextVisitor = AltTextVisitor;
}

export default CoreHtmlNodeRenderer;
