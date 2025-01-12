import type { MarkdownNode, NodeRenderer, Delimited } from 'commonmark-java-js';

import type { HtmlNodeRendererContext } from './interfaces/HtmlNodeRendererContext';

import { Appendable, isNotUnDef } from 'commonmark-java-js';
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
  AbstractVisitor
} from 'commonmark-java-js';

import HtmlWriter from './HtmlWriter';

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
        this.sb.append('\n');

        break;
      }

      case node instanceof HardLineBreak: {
        this.sb.append('\n');

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
      HardLineBreak
    ] as (typeof MarkdownNode)[]);
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

        const htag = 'h' + heading.getLevel();
        this.html.tag(htag, this.getAttrs(heading, htag));
        this.visitChildren(heading);
        this.html.tag('/' + htag);

        break;
      }

      case node instanceof Paragraph: {
        const paragraph = node;

        this.html.tag('p', this.getAttrs(paragraph, 'p'));
        this.visitChildren(paragraph);
        this.html.tag('/p');

        break;
      }

      case node instanceof BlockQuote: {
        const blockQuote = node;

        this.html.tag('blockquote', this.getAttrs(blockQuote, 'blockquote'));
        this.visitChildren(blockQuote);
        this.html.tag('/blockquote');

        break;
      }

      case node instanceof BulletList: {
        const bulletList = node;

        this.renderListBlock(bulletList, 'ul', this.getAttrs(bulletList, 'ul'));

        break;
      }

      case node instanceof FencedCodeBlock: {
        const fencedCodeBlock = node;

        const literal = fencedCodeBlock.getLiteral();
        const attributes = new Map<string, string>();
        const info = fencedCodeBlock.getInfo();

        if (info) {
          const space = info.indexOf(' ');
          let language: string;

          if (space === -1) {
            language = info;
          } else {
            language = info.substring(0, space);
          }

          attributes.set('class', 'language-' + language);
        }

        this.renderCodeBlock(literal || '', fencedCodeBlock, attributes);

        break;
      }

      case node instanceof HtmlBlock: {
        const htmlBlock = node;

        this.html.tag('div', this.getAttrs(htmlBlock, 'div'));
        this.html.raw(htmlBlock.getLiteral());
        this.html.tag('/div');

        break;
      }

      case node instanceof ThematicBreak: {
        const thematicBreak = node;

        this.html.tag('hr', this.getAttrs(thematicBreak, 'hr'), true);

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

        attrs.set('href', url);

        const title = link.getTitle();
        if (isNotUnDef(title)) {
          attrs.set('title', title);
        }

        this.html.tag('a', this.getAttrs(link, 'a', attrs));
        this.visitChildren(link);
        this.html.tag('/a');

        break;
      }

      case node instanceof ListItem: {
        const listItem = node;

        this.html.tag('li', this.getAttrs(listItem, 'li'));
        this.visitChildren(listItem);
        this.html.tag('/li');

        break;
      }

      case node instanceof OrderedList: {
        const orderedList = node;

        const markerStartNumber = orderedList.getMarkerStartNumber();
        const start = isNotUnDef(markerStartNumber) ? markerStartNumber : 1;

        const attrs = new Map<string, string>();

        if (start !== 1) {
          attrs.set('start', start.toString());
        }

        this.renderListBlock(orderedList, 'ol', this.getAttrs(orderedList, 'ol', attrs));

        break;
      }

      case node instanceof Image: {
        const image = node;

        const url = image.getDestination();

        const altTextVisitor = new AltTextVisitor();
        image.accept(altTextVisitor);

        const altText = altTextVisitor.getAltText();

        const attrs = new Map<string, string>();

        attrs.set('src', url);
        attrs.set('alt', altText);

        const title = image.getTitle();
        if (isNotUnDef(title)) {
          attrs.set('title', title);
        }

        this.html.tag('img', this.getAttrs(image, 'img', attrs), true);

        break;
      }

      case node instanceof Emphasis: {
        const emphasis = node;

        this.html.tag('em', this.getAttrs(emphasis, 'em'));
        this.visitChildren(emphasis);
        this.html.tag('/em');

        break;
      }

      case node instanceof StrongEmphasis: {
        const strongEmphasis = node;

        this.html.tag('strong', this.getAttrs(strongEmphasis, 'strong'));
        this.visitChildren(strongEmphasis);
        this.html.tag('/strong');

        break;
      }

      case node instanceof Text: {
        const text = node;

        this.html.tag('span', this.getAttrs(text, 'span'));
        this.html.text(text.getLiteral());
        this.html.tag('/span');

        break;
      }

      case node instanceof Code: {
        const code = node;

        this.html.tag(
          'code',
          this.getAttrs(code, 'code', new Map<string, string>([['data-inline', 'true']]))
        );
        this.html.text(code.getLiteral());
        this.html.tag('/code');

        break;
      }

      case node instanceof HtmlInline: {
        const htmlInline = node;

        this.html.raw(htmlInline.getLiteral());

        break;
      }

      case node instanceof SoftLineBreak: {
        this.html.raw(this.context.getSoftbreak());

        break;
      }

      case node instanceof HardLineBreak: {
        const hardLineBreak = node;

        this.html.tag('br', this.getAttrs(hardLineBreak, 'br'), true);

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

  private renderCodeBlock(literal: string, node: MarkdownNode, attributes: Map<string, string>) {
    this.html.tag('pre', this.getAttrs(node, 'pre'));
    this.html.tag('code', this.getAttrs(node, 'code', attributes));
    this.html.text(literal);
    this.html.tag('/code');
    this.html.tag('/pre');
  }

  private renderListBlock(listBlock: ListBlock, tagName: string, attributes: Map<string, string>) {
    this.html.tag(tagName, attributes);
    this.visitChildren(listBlock);
    this.html.tag('/' + tagName);
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
