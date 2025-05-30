import type { ListHolder } from '@/internal';
import type { Node } from '@/node';

import type TextContentWriter from './TextContentWriter';
import type { TextContentNodeRendererContext } from './interfaces/TextContentNodeRendererContext';
import type { NodeRenderer } from '../interfaces/NodeRenderer';

import { OrderedListHolder, BulletListHolder } from '@/internal';
import {
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
} from '@/node';

import LineBreakRendering from './enums/LineBreakRendering';

/**
 * The node renderer that renders all the core nodes (comes last in the order of node renderers).
 *
 * 渲染所有核心节点的默认节点渲染器（按节点渲染器的顺序排在最后）
 */
class CoreTextContentNodeRenderer extends AbstractVisitor implements NodeRenderer {
  protected readonly context: TextContentNodeRendererContext;
  private readonly textContent: TextContentWriter;

  private listHolder: ListHolder | null = null;

  constructor(context: TextContentNodeRendererContext) {
    super();

    this.context = context;
    this.textContent = context.getWriter();
  }

  beforeRoot(rootNode: Node): void {}
  afterRoot(rootNode: Node): void {}

  getNodeTypes(): Set<typeof Node> {
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
    ]);
  }

  render(node: Node) {
    node.accept(this);
  }

  override visit(node: Node) {
    switch (true) {
      case node instanceof Document:
        this.visitChildren(node);

        break;

      case node instanceof BlockQuote:
        this.textContent.write('\u00AB');
        this.visitChildren(node);
        this.textContent.resetBlock();
        this.textContent.write('\u00BB');
        this.textContent.block();

        break;

      case node instanceof BulletList:
        this.textContent.pushTight(node.isTight());
        this.listHolder = new BulletListHolder(this.listHolder, node);
        this.visitChildren(node);
        this.textContent.popTight();
        this.textContent.block();
        this.listHolder = this.listHolder.getParent();

        break;

      case node instanceof Code:
        this.textContent.write('"');
        this.textContent.write(node.getLiteral());
        this.textContent.write('"');

        break;

      case node instanceof FencedCodeBlock:
        const fencedCodeBlockLiteral = CoreTextContentNodeRenderer.stripTrailingNewline(
          node.getLiteral()
        );

        if (this.stripNewlines()) {
          this.textContent.writeStripped(fencedCodeBlockLiteral);
        } else {
          this.textContent.write(fencedCodeBlockLiteral);
        }

        this.textContent.block();

        break;

      case node instanceof HardLineBreak:
        if (this.stripNewlines()) {
          this.textContent.whitespace();
        } else {
          this.textContent.line();
        }

        break;

      case node instanceof Heading:
        this.visitChildren(node);

        if (this.stripNewlines()) {
          this.textContent.write(': ');
        } else {
          this.textContent.block();
        }

        break;

      case node instanceof ThematicBreak:
        if (!this.stripNewlines()) {
          this.textContent.write('***');
        }

        this.textContent.block();

        break;

      case node instanceof HtmlInline:
        this.writeText(node.getLiteral());

        break;

      case node instanceof HtmlBlock:
        this.writeText(node.getLiteral());

        break;

      case node instanceof Image:
        this.writeLink(node, node.getTitle() || '', node.getDestination());

        break;

      case node instanceof IndentedCodeBlock:
        const indentedCodeBlockLiteral = CoreTextContentNodeRenderer.stripTrailingNewline(
          node.getLiteral()
        );

        if (this.stripNewlines()) {
          this.textContent.writeStripped(indentedCodeBlockLiteral);
        } else {
          this.textContent.write(indentedCodeBlockLiteral);
        }

        this.textContent.block();

        break;

      case node instanceof Link:
        this.writeLink(node, node.getTitle() || '', node.getDestination());

        break;

      case node instanceof ListItem:
        if (this.listHolder !== null && this.listHolder instanceof OrderedListHolder) {
          const orderedListHolder = this.listHolder;
          const indent = this.stripNewlines() ? '' : orderedListHolder.getIndent();

          this.textContent.write(
            indent + orderedListHolder.getCounter() + orderedListHolder.getDelimiter() + ' '
          );

          this.visitChildren(node);
          this.textContent.block();

          orderedListHolder.increaseCounter();
        } else if (this.listHolder !== null && this.listHolder instanceof BulletListHolder) {
          const bulletListHolder = this.listHolder;

          if (!this.stripNewlines()) {
            this.textContent.write(
              bulletListHolder.getIndent() + bulletListHolder.getMarker() + ' '
            );
          }

          this.visitChildren(node);
          this.textContent.block();
        }

        break;

      case node instanceof OrderedList:
        this.textContent.pushTight(node.isTight());
        this.listHolder = new OrderedListHolder(this.listHolder, node);
        this.visitChildren(node);
        this.textContent.popTight();
        this.textContent.block();
        this.listHolder = this.listHolder.getParent();

        break;

      case node instanceof Paragraph:
        this.visitChildren(node);
        this.textContent.block();

        break;

      case node instanceof SoftLineBreak:
        if (this.stripNewlines()) {
          this.textContent.whitespace();
        } else {
          this.textContent.line();
        }

        break;

      case node instanceof Text:
        this.writeText(node.getLiteral());

        break;
    }
  }

  protected override visitChildren(parent: Node) {
    let node = parent.getFirstChild();

    while (node !== null) {
      let next = node.getNext();
      this.context.render(node);
      node = next;
    }
  }

  private writeText(text: string) {
    if (this.stripNewlines()) {
      this.textContent.writeStripped(text);
    } else {
      this.textContent.write(text);
    }
  }

  private writeLink(node: Node, title: string, destination: string): void {
    const hasChild = node.getFirstChild() !== null;
    const hasTitle = title !== destination;
    const hasDestination = destination !== '';

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

  private stripNewlines() {
    return this.context.lineBreakRendering() === LineBreakRendering.STRIP;
  }

  private static stripTrailingNewline(s: string) {
    if (s.endsWith('\n')) {
      return s.substring(0, s.length - 1);
    } else {
      return s;
    }
  }
}

export default CoreTextContentNodeRenderer;
