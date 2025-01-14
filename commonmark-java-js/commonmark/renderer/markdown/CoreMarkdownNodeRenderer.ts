import type { MarkdownNode } from '@/node';

import type { NodeRenderer } from '../interfaces/NodeRenderer';
import type { MarkdownNodeRendererContext } from './interfaces/MarkdownNodeRendererContext';

import { AsciiMatcher, Characters, CharMatcher } from '@/text';
import { isNotUnDef, isUnDef } from '@helpers/index';
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

import MarkdownWriter from './MarkdownWriter';

class ListHolder {
  public readonly parent: ListHolder;

  public constructor(parent: ListHolder) {
    this.parent = parent;
  }
}

class BulletListHolder extends ListHolder {
  public readonly marker: string;

  public constructor(parent: ListHolder, bulletList: BulletList) {
    super(parent);

    const marker = bulletList.getMarker();
    this.marker = isNotUnDef(marker) ? marker : '-';
  }
}

class OrderedListHolder extends ListHolder {
  public readonly delimiter: string;
  public number: number;

  public constructor(parent: ListHolder, orderedList: OrderedList) {
    super(parent);

    const markerDelimiter = orderedList.getMarkerDelimiter();
    const markerStartNumber = orderedList.getMarkerStartNumber();

    this.delimiter = isNotUnDef(markerDelimiter) ? markerDelimiter : '.';
    this.number = markerStartNumber ? markerStartNumber : 1;
  }
}

class LineBreakVisitor extends AbstractVisitor {
  private lineBreak: boolean = false;

  public hasLineBreak(): boolean {
    return this.lineBreak;
  }

  public visit(lineBreak: SoftLineBreak | HardLineBreak) {
    switch (true) {
      case lineBreak instanceof SoftLineBreak: {
        const softLineBreak = lineBreak;

        super.visit(softLineBreak);
        this.lineBreak = true;

        break;
      }

      case lineBreak instanceof HardLineBreak: {
        const hardLineBreak = lineBreak;

        super.visit(hardLineBreak);
        this.lineBreak = true;

        break;
      }
    }
  }
}

/**
 * The node renderer that renders all the core nodes (comes last in the order of node renderers).
 * <p>
 * Note that while sometimes it would be easier to record what kind of syntax was used on parsing (e.g. ATX vs Setext
 * heading), this renderer is intended to also work for documents that were created by directly creating
 * {@link MarkdownNode Nodes} instead. So in order to support that, it sometimes needs to do a bit more work.
 */
class CoreMarkdownNodeRenderer extends AbstractVisitor implements NodeRenderer {
  private readonly textEscape: AsciiMatcher;
  private readonly textEscapeInHeading: CharMatcher;

  private readonly linkDestinationNeedsAngleBrackets: CharMatcher = AsciiMatcher.builder()
    .c(' ')
    .c('(')
    .c(')')
    .c('<')
    .c('>')
    .c('\n')
    .c('\\')
    .build();

  private readonly linkDestinationEscapeInAngleBrackets: CharMatcher = AsciiMatcher.builder()
    .c('<')
    .c('>')
    .c('\n')
    .c('\\')
    .build();

  private readonly linkTitleEscapeInQuotes: CharMatcher = AsciiMatcher.builder()
    .c('"')
    .c('\n')
    .c('\\')
    .build();

  private readonly orderedListMarkerPattern = /^([0-9]{1,9})([.)])/;

  protected readonly context: MarkdownNodeRendererContext;
  private readonly writer: MarkdownWriter;
  /**
   * If we're currently within a {@link BulletList} or {@link OrderedList}, this keeps the context of that list.
   * It has a parent field so that it can represent a stack (for nested lists).
   */
  private listHolder: ListHolder | null = null;

  public constructor(context: MarkdownNodeRendererContext) {
    super();

    this.context = context;
    this.writer = context.getWriter();

    this.textEscape = AsciiMatcher.builder()
      .anyOf('[]<>`*_&\n\\')
      .anyOf(context.getSpecialCharacters())
      .build();
    this.textEscapeInHeading = AsciiMatcher.builder(this.textEscape).anyOf('#').build();
  }

  public beforeRoot(rootNode: MarkdownNode) {}
  public afterRoot(rootNode: MarkdownNode) {}

  public getNodeTypes(): Set<typeof MarkdownNode> {
    return new Set([
      BlockQuote,
      BulletList,
      Code,
      Document,
      Emphasis,
      FencedCodeBlock,
      HardLineBreak,
      Heading,
      HtmlBlock,
      HtmlInline,
      Image,
      IndentedCodeBlock,
      Link,
      ListItem,
      OrderedList,
      Paragraph,
      SoftLineBreak,
      StrongEmphasis,
      Text,
      ThematicBreak
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
        this.writer.line();

        break;
      }

      case node instanceof ThematicBreak: {
        const thematicBreak = node;

        let literal = thematicBreak.getLiteral();

        if (isUnDef(literal)) {
          // Let's use ___ as it doesn't introduce ambiguity with * or - list item markers
          literal = '___';
        }

        this.writer.raw(literal);
        this.writer.block();

        break;
      }

      case node instanceof Heading: {
        const heading = node;

        if (heading.getLevel() <= 2) {
          const lineBreakVisitor = new CoreMarkdownNodeRenderer.LineBreakVisitor();

          heading.accept(lineBreakVisitor);
          const isMultipleLines = lineBreakVisitor.hasLineBreak();

          if (isMultipleLines) {
            // Setext headings: Can have multiple lines, but only level 1 or 2
            this.visitChildren(heading);
            this.writer.line();

            if (heading.getLevel() === 1) {
              // Note that it would be nice to match the length of the contents instead of just using 3, but that's
              // not easy.
              this.writer.raw('===');
            } else {
              this.writer.raw('---');
            }

            this.writer.block();

            return;
          }
        }

        // ATX headings: Can't have multiple lines, but up to level 6.
        for (let i = 0; i < heading.getLevel(); i++) {
          this.writer.raw('#');
        }

        this.writer.raw(' ');
        this.visitChildren(heading);

        this.writer.block();

        break;
      }

      case node instanceof IndentedCodeBlock: {
        const indentedCodeBlock = node;

        let literal = indentedCodeBlock.getLiteral();
        // We need to respect line prefixes which is why we need to write it line by line (e.g. an indented code block
        // within a block quote)
        this.writer.writePrefix('    ');
        this.writer.pushPrefix('    ');
        const lines: string[] = CoreMarkdownNodeRenderer.getLines(literal);

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          this.writer.raw(line);

          if (i !== lines.length - 1) {
            this.writer.line();
          }
        }

        this.writer.popPrefix();
        this.writer.block();

        break;
      }

      case node instanceof FencedCodeBlock: {
        const codeBlock = node;

        const literal = codeBlock.getLiteral();
        const fenceCharacter = codeBlock.getFenceCharacter();
        const fenceChar = isNotUnDef(fenceCharacter) ? fenceCharacter : '`';

        let openingFenceLength: number;

        const codeBlockOpeningFenceLength = codeBlock.getOpeningFenceLength();
        if (isNotUnDef(codeBlockOpeningFenceLength)) {
          // If we have a known fence length, use it
          openingFenceLength = codeBlockOpeningFenceLength;
        } else {
          // Otherwise, calculate the closing fence length pessimistically, e.g. if the code block itself contains a
          // line with ```, we need to use a fence of length 4. If ``` occurs with non-whitespace characters on a
          // line, we technically don't need a longer fence, but it's not incorrect to do so.
          const fenceCharsInLiteral = CoreMarkdownNodeRenderer.findMaxRunLength(fenceChar, literal);

          openingFenceLength = Math.max(fenceCharsInLiteral + 1, 3);
        }

        const codeBlockClosingFenceLength = codeBlock.getClosingFenceLength();
        const closingFenceLength = isNotUnDef(codeBlockClosingFenceLength)
          ? codeBlockClosingFenceLength
          : openingFenceLength;

        const openingFence = CoreMarkdownNodeRenderer.repeat(fenceChar, openingFenceLength);
        const closingFence = CoreMarkdownNodeRenderer.repeat(fenceChar, closingFenceLength);

        const indent = codeBlock.getFenceIndent() || 0;

        if (indent > 0) {
          const indentPrefix = CoreMarkdownNodeRenderer.repeat(' ', indent);

          this.writer.writePrefix(indentPrefix);
          this.writer.pushPrefix(indentPrefix);
        }

        this.writer.raw(openingFence);
        const info = codeBlock.getInfo();
        if (isNotUnDef(info)) {
          this.writer.raw(info);
        }

        this.writer.line();

        if (isNotUnDef(literal)) {
          const lines: string[] = CoreMarkdownNodeRenderer.getLines(literal);

          for (const line of lines) {
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

      case node instanceof HtmlBlock: {
        const htmlBlock = node;

        const lines: string[] = CoreMarkdownNodeRenderer.getLines(htmlBlock.getLiteral());

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          this.writer.raw(line);

          if (i !== lines.length - 1) {
            this.writer.line();
          }
        }

        this.writer.block();

        break;
      }

      case node instanceof Paragraph: {
        const paragraph = node;

        this.visitChildren(paragraph);
        this.writer.block();

        break;
      }

      case node instanceof BlockQuote: {
        const blockQuote = node;

        this.writer.writePrefix('> ');
        this.writer.pushPrefix('> ');
        this.visitChildren(blockQuote);
        this.writer.popPrefix();
        this.writer.block();

        break;
      }

      case node instanceof BulletList: {
        const bulletList = node;

        this.writer.pushTight(bulletList.isTight());
        this.listHolder = new BulletListHolder(this.listHolder!, bulletList);
        this.visitChildren(bulletList);
        this.listHolder = this.listHolder.parent;
        this.writer.popTight();
        this.writer.block();

        break;
      }

      case node instanceof OrderedList: {
        const orderedList = node;

        this.writer.pushTight(orderedList.isTight());
        this.listHolder = new OrderedListHolder(this.listHolder!, orderedList);
        this.visitChildren(orderedList);
        this.listHolder = this.listHolder.parent;
        this.writer.popTight();
        this.writer.block();

        break;
      }

      case node instanceof ListItem: {
        const listItem = node;

        const markderIndet = listItem.getMarkerIndent();
        const markerIndent = isNotUnDef(markderIndet) ? markderIndet : 0;

        let marker: string;

        if (this.listHolder instanceof BulletListHolder) {
          const bulletListHolder = this.listHolder as BulletListHolder;

          marker = CoreMarkdownNodeRenderer.repeat(' ', markerIndent) + bulletListHolder.marker;
        } else if (this.listHolder instanceof OrderedListHolder) {
          const orderedListHolder = this.listHolder as OrderedListHolder;

          marker =
            CoreMarkdownNodeRenderer.repeat(' ', markerIndent) +
            orderedListHolder.number +
            orderedListHolder.delimiter;
          orderedListHolder.number++;
        } else {
          throw new Error('Unknown list holder type: ' + this.listHolder);
        }

        const contentIndent = listItem.getContentIndent();
        const spaces = isNotUnDef(contentIndent)
          ? CoreMarkdownNodeRenderer.repeat(' ', contentIndent - marker.length)
          : ' ';

        this.writer.writePrefix(marker);
        this.writer.writePrefix(spaces);
        this.writer.pushPrefix(CoreMarkdownNodeRenderer.repeat(' ', marker.length + spaces.length));

        if (listItem.getFirstChild() === null) {
          // Empty list item
          this.writer.block();
        } else {
          this.visitChildren(listItem);
        }

        this.writer.popPrefix();

        break;
      }

      case node instanceof Code: {
        const code = node;

        const literal = code.getLiteral();
        // If the literal includes backticks, we can surround them by using one more backtick.
        const backticks = CoreMarkdownNodeRenderer.findMaxRunLength('`', literal);

        for (let i = 0; i < backticks + 1; i++) {
          this.writer.raw('`');
        }

        // If the literal starts or ends with a backtick, surround it with a single space.
        // If it starts and ends with a space (but is not only spaces), add an additional space (otherwise they would
        // get removed on parsing).
        const addSpace =
          literal.startsWith('`') ||
          literal.endsWith('`') ||
          (literal.startsWith(' ') && literal.endsWith(' ') && Characters.hasNonSpace(literal));

        if (addSpace) {
          this.writer.raw(' ');
        }

        this.writer.raw(literal);

        if (addSpace) {
          this.writer.raw(' ');
        }

        for (let i = 0; i < backticks + 1; i++) {
          this.writer.raw('`');
        }

        break;
      }

      case node instanceof Emphasis: {
        const emphasis = node;

        let delimiter = emphasis.getOpeningDelimiter();
        // Use delimiter that was parsed if available
        if (isUnDef(delimiter)) {
          // When emphasis is nested, a different delimiter needs to be used
          delimiter = this.writer.getLastChar() === '*' ? '_' : '*';
        }

        this.writer.raw(delimiter);
        super.visit(emphasis);
        this.writer.raw(delimiter);

        break;
      }

      case node instanceof StrongEmphasis: {
        const strongEmphasis = node;

        this.writer.raw('**');
        super.visit(strongEmphasis);
        this.writer.raw('**');

        break;
      }

      case node instanceof Link: {
        const link = node;

        this.writeLinkLike(link.getTitle(), link.getDestination(), link, '[');

        break;
      }

      case node instanceof Image: {
        const image = node;

        this.writeLinkLike(image.getTitle(), image.getDestination(), image, '![');

        break;
      }

      case node instanceof HtmlInline: {
        const htmlInline = node;

        this.writer.raw(htmlInline.getLiteral());

        break;
      }

      case node instanceof HardLineBreak: {
        this.writer.raw('  ');
        this.writer.line();

        break;
      }

      case node instanceof SoftLineBreak: {
        this.writer.line();

        break;
      }

      case node instanceof Text: {
        const text = node;

        // Text is tricky. In Markdown special characters (`-`, `#` etc.) can be escaped (`\-`, `\#` etc.) so that
        // they're parsed as plain text. Currently, whether a character was escaped or not is not recorded in the MarkdownNode,
        // so here we don't know. If we just wrote out those characters unescaped, the resulting Markdown would change
        // meaning (turn into a list item, heading, etc.).
        // You might say "Why not store that in the MarkdownNode when parsing", but that wouldn't work for the use case where
        // nodes are constructed directly instead of via parsing. This renderer needs to work for that too.
        // So currently, when in doubt, we escape. For special characters only occurring at the beginning of a line,
        // we only escape them then (we wouldn't want to escape every `.` for example).
        let literal = text.getLiteral();
        if (this.writer.isAtLineStart() && literal) {
          const c = literal.charAt(0);

          switch (c) {
            case '-':
              // Would be ambiguous with a bullet list marker, escape
              this.writer.raw('\\-');
              literal = literal.substring(1);

              break;

            case '#':
              // Would be ambiguous with an ATX heading, escape
              this.writer.raw('\\#');
              literal = literal.substring(1);

              break;

            case '=':
              // Would be ambiguous with a Setext heading, escape unless it's the first line in the block
              if (text.getPrevious() !== null) {
                this.writer.raw('\\=');
                literal = literal.substring(1);
              }

              break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
              // Check for ordered list marker
              const m = this.orderedListMarkerPattern.exec(literal);

              if (m) {
                this.writer.raw(m[1]);
                this.writer.raw('\\' + m[2]);
                literal = literal.substring(m.index, m[0].length);

                this.orderedListMarkerPattern.lastIndex = 0;
              }

              break;

            case '\t':
              this.writer.raw('&#9;');
              literal = literal.substring(1);

              break;

            case ' ':
              this.writer.raw('&#32;');
              literal = literal.substring(1);

              break;

            default:
          }
        }

        const escape =
          text.getParent() instanceof Heading ? this.textEscapeInHeading : this.textEscape;

        if (literal.endsWith('!') && text.getNext() instanceof Link) {
          // If we wrote the `!` unescaped, it would turn the link into an image instead.
          this.writer.text(literal.substring(0, literal.length - 1), escape);
          this.writer.raw('\\!');
        } else {
          this.writer.text(literal, escape);
        }

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

  private static findMaxRunLength(needle: string, s: string): number {
    let maxRunLength = 0;
    let pos = 0;

    while (pos < s.length) {
      pos = s.indexOf(needle, pos);
      if (pos === -1) {
        return maxRunLength;
      }

      let runLength = 0;
      do {
        pos += needle.length;
        runLength++;
      } while (s.startsWith(needle, pos));

      maxRunLength = Math.max(runLength, maxRunLength);
    }
    return maxRunLength;
  }

  private static contains(s: string, charMatcher: CharMatcher): boolean {
    for (let i = 0; i < s.length; i++) {
      if (charMatcher.matches(s.charAt(i))) {
        return true;
      }
    }

    return false;
  }

  // Keep for Android compat (String.repeat only available on Android 12 and later)
  private static repeat(s: string, count: number): string {
    return s.repeat(count);
  }

  private static getLines(literal: string): string[] {
    // Without -1, split would discard all trailing empty strings, which is not what we want, e.g. it would
    // return the same result for "abc", "abc\n" and "abc\n\n".
    // With -1, it returns ["abc"], ["abc", ""] and ["abc", "", ""].
    let parts: string[] = literal.split('\n');
    if (parts[parts.length - 1] === '') {
      // But we don't want the last empty string, as "\n" is used as a line terminator (not a separator),
      // so return without the last element.
      return parts.slice(0, parts.length - 1);
    } else {
      return parts.slice(0);
    }
  }

  private writeLinkLike(
    title: string | undefined,
    destination: string,
    node: MarkdownNode,
    opener: string
  ) {
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

    if (isNotUnDef(title)) {
      this.writer.raw(' ');
      this.writer.raw('"');
      this.writer.text(title, this.linkTitleEscapeInQuotes);
      this.writer.raw('"');
    }

    this.writer.raw(')');
  }

  public static ListHolder = ListHolder;

  public static BulletListHolder = BulletListHolder;

  public static OrderedListHolder = OrderedListHolder;

  /**
   * Visits nodes to check if there are any soft or hard line breaks.
   */
  public static LineBreakVisitor = LineBreakVisitor;
}

export default CoreMarkdownNodeRenderer;
