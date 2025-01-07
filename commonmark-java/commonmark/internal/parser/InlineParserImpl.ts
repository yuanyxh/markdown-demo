import type {
  DelimiterProcessor,
  InlineContentParser,
  InlineContentParserFactory,
  InlineParser,
  InlineParserContext,
  InlineParserFactory,
  InlineParserState,
  LinkInfo,
  LinkProcessor,
  Position,
  SourceLines,
} from "@/parser";

import { Appendable, BitSet } from "@helpers/index";
import { Scanner } from "@/parser";
import {
  HardLineBreak,
  MarkdownNode,
  SoftLineBreak,
  SourceSpans,
  Text,
} from "@/node";
import { Characters } from "@/text";

import AsteriskDelimiterProcessor from "../inline/AsteriskDelimiterProcessor";
import AutolinkInlineParser from "../inline/AutolinkInlineParser";
import BackslashInlineParser from "../inline/BackslashInlineParser";
import BackticksInlineParser from "../inline/BackticksInlineParser";
import CoreLinkProcessor from "../inline/CoreLinkProcessor";
import EntityInlineParser from "../inline/EntityInlineParser";
import HtmlInlineParser from "../inline/HtmlInlineParser";
import LinkResultImpl from "../inline/LinkResultImpl";
import ParsedInlineImpl from "../inline/ParsedInlineImpl";
import UnderscoreDelimiterProcessor from "../inline/UnderscoreDelimiterProcessor";
import Escaping from "../internal_util/Escaping";
import LinkScanner from "../internal_util/LinkScanner";
import Bracket from "../Bracket";
import Delimiter from "../Delimiter";
import StaggeredDelimiterProcessor from "../StaggeredDelimiterProcessor";

class DelimiterData {
  public readonly characters: Text[];
  public readonly canClose: boolean;
  public readonly canOpen: boolean;

  public constructor(characters: Text[], canOpen: boolean, canClose: boolean) {
    this.characters = characters;
    this.canOpen = canOpen;
    this.canClose = canClose;
  }
}

class DestinationTitle {
  public readonly destination: string;
  public readonly title: string;

  public constructor(destination: string, title: string) {
    this.destination = destination;
    this.title = title;
  }
}

class LinkInfoImpl implements LinkInfo {
  private readonly marker: Text | null;
  private readonly openingBracket: Text | null;
  private readonly text: string | null;
  private readonly label: string | null;
  private readonly destination: string | null;
  private readonly title: string | null;
  private readonly afterTextBracket: Position;

  public constructor(
    marker: Text | null,
    openingBracket: Text | null,
    text: string | null,
    label: string | null,
    destination: string | null,
    title: string | null,
    afterTextBracket: Position
  ) {
    this.marker = marker;
    this.openingBracket = openingBracket;
    this.text = text;
    this.label = label;
    this.destination = destination;
    this.title = title;
    this.afterTextBracket = afterTextBracket;
  }

  public getMarker(): Text | null {
    return this.marker;
  }

  public getOpeningBracket(): Text | null {
    return this.openingBracket;
  }

  public getText(): string | null {
    return this.text;
  }

  public getLabel(): string | null {
    return this.label;
  }

  public getDestination(): string | null {
    return this.destination;
  }

  public getTitle(): string | null {
    return this.title;
  }

  public getAfterTextBracket(): Position {
    return this.afterTextBracket;
  }
}

class InlineParserImpl
  implements InlineParser, InlineParserState, InlineParserFactory
{
  private readonly context: InlineParserContext;
  private readonly inlineContentParserFactories: InlineContentParserFactory[];
  private readonly delimiterProcessors: Map<string, DelimiterProcessor>;
  private readonly linkProcessors: LinkProcessor[];
  private readonly specialCharacters: BitSet;
  private readonly linkMarkers: BitSet;

  private inlineParsers: Map<string, InlineContentParser[]> | null = null;
  private scanner!: Scanner;
  private includeSourceSpans = false;
  private trailingSpaces = -1;

  /**
   * Top delimiter (emphasis, strong emphasis or custom emphasis). (Brackets are on a separate stack, different
   * from the algorithm described in the spec.)
   */
  private lastDelimiter: Delimiter | null = null;

  /**
   * Top opening bracket (<code>[</code> or <code>![)</code>).
   */
  private lastBracket: Bracket | null = null;

  public constructor(context: InlineParserContext) {
    this.context = context;

    this.inlineContentParserFactories =
      this.calculateInlineContentParserFactories(
        context.getCustomInlineContentParserFactories()
      );
    this.delimiterProcessors = InlineParserImpl.calculateDelimiterProcessors(
      context.getCustomDelimiterProcessors()
    );
    this.linkProcessors = this.calculateLinkProcessors(
      context.getCustomLinkProcessors()
    );
    this.linkMarkers = InlineParserImpl.calculateLinkMarkers(
      context.getCustomLinkMarkers()
    );

    this.specialCharacters = InlineParserImpl.calculateSpecialCharacters(
      this.linkMarkers,
      new Set(this.delimiterProcessors.keys()),
      this.inlineContentParserFactories
    );
  }

  private calculateInlineContentParserFactories(
    customFactories: InlineContentParserFactory[]
  ): InlineContentParserFactory[] {
    // Custom parsers can override built-in parsers if they want, so make sure they are tried first
    const list = [...customFactories];

    list.push(new BackslashInlineParser.Factory());
    list.push(new BackticksInlineParser.Factory());
    list.push(new EntityInlineParser.Factory());
    list.push(new AutolinkInlineParser.Factory());
    list.push(new HtmlInlineParser.Factory());

    return list;
  }

  private calculateLinkProcessors(
    linkProcessors: LinkProcessor[]
  ): LinkProcessor[] {
    // Custom link processors can override the built-in behavior, so make sure they are tried first
    const list = [...linkProcessors];
    list.push(new CoreLinkProcessor());

    return list;
  }

  private static calculateDelimiterProcessors(
    delimiterProcessors: DelimiterProcessor[]
  ): Map<string, DelimiterProcessor> {
    const map = new Map<string, DelimiterProcessor>();

    InlineParserImpl.addDelimiterProcessors(
      [new AsteriskDelimiterProcessor(), new UnderscoreDelimiterProcessor()],
      map
    );
    InlineParserImpl.addDelimiterProcessors(delimiterProcessors, map);

    return map;
  }

  private static addDelimiterProcessors(
    delimiterProcessors: DelimiterProcessor[],
    map: Map<string, DelimiterProcessor>
  ) {
    for (const delimiterProcessor of delimiterProcessors) {
      const opening = delimiterProcessor.getOpeningCharacter();
      const closing = delimiterProcessor.getClosingCharacter();

      if (opening === closing) {
        const old = map.get(opening);

        if (old && old.getOpeningCharacter() === old.getClosingCharacter()) {
          let s: StaggeredDelimiterProcessor;

          if (old instanceof StaggeredDelimiterProcessor) {
            s = old;
          } else {
            s = new StaggeredDelimiterProcessor(opening);
            s.add(old);
          }

          s.add(delimiterProcessor);
          map.set(opening, s);
        } else {
          InlineParserImpl.addDelimiterProcessorForChar(
            opening,
            delimiterProcessor,
            map
          );
        }
      } else {
        InlineParserImpl.addDelimiterProcessorForChar(
          opening,
          delimiterProcessor,
          map
        );

        InlineParserImpl.addDelimiterProcessorForChar(
          closing,
          delimiterProcessor,
          map
        );
      }
    }
  }

  private static addDelimiterProcessorForChar(
    delimiterChar: string,
    toAdd: DelimiterProcessor,
    delimiterProcessors: Map<string, DelimiterProcessor>
  ) {
    let existing = false;

    if (delimiterProcessors.has(delimiterChar)) {
      existing = true;
    }

    delimiterProcessors.set(delimiterChar, toAdd);

    if (existing) {
      throw new Error(
        "Delimiter processor conflict with delimiter char '" +
          delimiterChar +
          "'"
      );
    }
  }

  private static calculateLinkMarkers(linkMarkers: Set<string>): BitSet {
    let bitSet = new BitSet();

    for (const c of linkMarkers) {
      bitSet.set(c.charCodeAt(0));
    }

    bitSet.set("!".charCodeAt(0));

    return bitSet;
  }

  private static calculateSpecialCharacters(
    linkMarkers: BitSet,
    delimiterCharacters: Set<string>,
    inlineContentParserFactories: InlineContentParserFactory[]
  ): BitSet {
    let bitSet = linkMarkers.clone();
    for (const c of delimiterCharacters) {
      bitSet.set(c.charCodeAt(0));
    }

    for (const factory of inlineContentParserFactories) {
      for (const c of factory.getTriggerCharacters()) {
        bitSet.set(c.charCodeAt(0));
      }
    }

    bitSet.set("[".charCodeAt(0));
    bitSet.set("]".charCodeAt(0));
    bitSet.set("!".charCodeAt(0));
    bitSet.set("\n".charCodeAt(0));

    return bitSet;
  }

  private createInlineContentParsers(): Map<string, InlineContentParser[]> {
    const map = new Map<string, InlineContentParser[]>();
    for (const factory of this.inlineContentParserFactories) {
      const parser = factory.create();

      for (const c of factory.getTriggerCharacters()) {
        const parserMap = map.get(c) || [];
        parserMap.push(parser);

        map.set(c, parserMap);
      }
    }

    return map;
  }

  public getScanner(): Scanner {
    return this.scanner;
  }

  /**
   * Parse content in block into inline children, appending them to the block node.
   */
  public parse(lines: SourceLines, block: MarkdownNode) {
    this.reset(lines);

    while (true) {
      const nodes = this.parseInline();

      if (nodes === null) {
        break;
      }

      for (const node of nodes) {
        block.appendChild(node);
      }
    }

    this.processDelimiters(null);
    this.mergeChildTextNodes(block);
  }

  protected reset(lines: SourceLines) {
    this.scanner = Scanner.of(lines);
    this.includeSourceSpans = lines.getSourceSpans().length !== 0;
    this.trailingSpaces = 0;
    this.lastDelimiter = null;
    this.lastBracket = null;
    this.inlineParsers = this.createInlineContentParsers();
  }

  private text(sourceLines: SourceLines): Text {
    const text = new Text(sourceLines.getContent());
    text.setSourceSpans(sourceLines.getSourceSpans());
    return text;
  }

  /**
   * Parse the next inline element in subject, advancing our position.
   * On success, return the new inline node.
   * On failure, return null.
   */
  private parseInline(): MarkdownNode[] | null {
    const c = this.scanner.peek();

    switch (c) {
      case "[":
        return [this.parseOpenBracket()];
      case "]":
        return [this.parseCloseBracket()];
      case "\n":
        return [this.parseLineBreak()];
      case Scanner.END:
        return null;

      default:
    }

    if (this.linkMarkers.get(c.charCodeAt(0))) {
      let markerPosition = this.scanner.position();
      let nodes = this.parseLinkMarker();

      if (nodes !== null) {
        return nodes;
      }

      // Reset and try other things (e.g. inline parsers below)
      this.scanner.setPosition(markerPosition);
    }

    // No inline parser, delimiter or other special handling.
    if (!this.specialCharacters.get(c.charCodeAt(0))) {
      return [this.parseText()];
    }

    const inlineParsers = this.inlineParsers?.get(c);
    if (inlineParsers) {
      const position = this.scanner.position();

      for (const inlineParser of inlineParsers) {
        const parsedInline = inlineParser.tryParse(this);

        if (parsedInline instanceof ParsedInlineImpl) {
          const node = parsedInline.getNode();
          this.scanner.setPosition(parsedInline.getPosition());
          if (this.includeSourceSpans && node.getSourceSpans().length === 0) {
            node.setSourceSpans(
              this.scanner
                .getSource(position, this.scanner.position())
                .getSourceSpans()
            );
          }

          return [node];
        } else {
          // Reset position
          this.scanner.setPosition(position);
        }
      }
    }

    const delimiterProcessor = this.delimiterProcessors.get(c);
    if (delimiterProcessor) {
      const nodes = this.parseDelimiters(delimiterProcessor, c);

      if (nodes !== null) {
        return nodes;
      }
    }

    // If we get here, even for a special/delimiter character, we will just treat it as text.
    return [this.parseText()];
  }

  /**
   * Attempt to parse delimiters like emphasis, strong emphasis or custom delimiters.
   */
  private parseDelimiters(
    delimiterProcessor: DelimiterProcessor,
    delimiterChar: string
  ): MarkdownNode[] | null {
    const res = this.scanDelimiters(delimiterProcessor, delimiterChar);

    if (res === null) {
      return null;
    }

    const characters = res.characters;

    // Add entry to stack for this opener
    this.lastDelimiter = new Delimiter(
      characters,
      delimiterChar,
      res.canOpen,
      res.canClose,
      this.lastDelimiter
    );

    if (this.lastDelimiter.previous !== null) {
      this.lastDelimiter.previous.next = this.lastDelimiter;
    }

    return characters;
  }

  /**
   * Add open bracket to delimiter stack and add a text node to block's children.
   */
  private parseOpenBracket(): MarkdownNode {
    const start: Position = this.scanner.position();
    this.scanner.next();
    const contentPosition: Position = this.scanner.position();

    const node = this.text(this.scanner.getSource(start, contentPosition));

    // Add entry to stack for this opener
    this.addBracket(
      Bracket.link(
        node,
        start,
        contentPosition,
        this.lastBracket!,
        this.lastDelimiter!
      )
    );

    return node;
  }

  /**
   * If next character is {@code [}, add a bracket to the stack.
   * Otherwise, return null.
   */
  private parseLinkMarker(): MarkdownNode[] | null {
    const markerPosition = this.scanner.position();
    this.scanner.next();
    const bracketPosition = this.scanner.position();

    if (this.scanner.next("[")) {
      const contentPosition = this.scanner.position();
      const bangNode = this.text(
        this.scanner.getSource(markerPosition, bracketPosition)
      );
      const bracketNode = this.text(
        this.scanner.getSource(bracketPosition, contentPosition)
      );

      // Add entry to stack for this opener
      this.addBracket(
        Bracket.withMarker(
          bangNode,
          markerPosition,
          bracketNode,
          bracketPosition,
          contentPosition,
          this.lastBracket!,
          this.lastDelimiter!
        )
      );
      return [bangNode, bracketNode];
    } else {
      return null;
    }
  }

  /**
   * Try to match close bracket against an opening in the delimiter stack. Return either a link or image, or a
   * plain [ character. If there is a matching delimiter, remove it from the delimiter stack.
   */
  private parseCloseBracket(): MarkdownNode {
    const beforeClose = this.scanner.position();
    this.scanner.next();
    const afterClose: Position = this.scanner.position();

    // Get previous `[` or `![`
    const opener = this.lastBracket;
    if (opener === null) {
      // No matching opener, just return a literal.
      return this.text(this.scanner.getSource(beforeClose, afterClose));
    } else if (!opener.allowed) {
      // Matching opener, but it's not allowed, just return a literal.
      this.removeLastBracket();
      return this.text(this.scanner.getSource(beforeClose, afterClose));
    } else {
      const linkOrImage = this.parseLinkOrImage(opener, beforeClose);

      if (linkOrImage !== null) {
        return linkOrImage;
      } else {
        this.scanner.setPosition(afterClose);

        // Nothing parsed, just parse the bracket as text and continue
        this.removeLastBracket();
        return this.text(this.scanner.getSource(beforeClose, afterClose));
      }
    }
  }

  private parseLinkOrImage(
    opener: Bracket,
    beforeClose: Position
  ): MarkdownNode | null {
    const linkInfo = this.parseLinkInfo(opener, beforeClose);
    if (linkInfo === null) {
      return null;
    }
    const processorStartPosition = this.scanner.position();

    for (const linkProcessor of this.linkProcessors) {
      const linkResult = linkProcessor.process(
        linkInfo,
        this.scanner,
        this.context
      );
      if (!(linkResult instanceof LinkResultImpl)) {
        // Reset position in case the processor used the scanner, and it didn't work out.
        this.scanner.setPosition(processorStartPosition);

        continue;
      }

      const result = linkResult;
      const node = result.getNode();
      const position = result.getPosition();
      const includeMarker = result.isIncludeMarker();

      switch (result.getType()) {
        case LinkResultImpl.Type.WRAP:
          this.scanner.setPosition(position);
          return this.wrapBracket(opener, node, includeMarker);
        case LinkResultImpl.Type.REPLACE:
          this.scanner.setPosition(position);
          return this.replaceBracket(opener, node, includeMarker);

        default:
      }
    }

    return null;
  }

  private parseLinkInfo(
    opener: Bracket,
    beforeClose: Position
  ): LinkInfo | null {
    // Check to see if we have a link (or image, with a ! in front). The different types:
    // - Inline:       `[foo](/uri)` or with optional title `[foo](/uri "title")`
    // - Reference links
    //   - Full:      `[foo][bar]` (foo is the text and bar is the label that needs to match a reference)
    //   - Collapsed: `[foo][]`    (foo is both the text and label)
    //   - Shortcut:  `[foo]`      (foo is both the text and label)

    const text = this.scanner
      .getSource(opener.contentPosition!, beforeClose)
      .getContent();

    // Starting position is after the closing `]`
    const afterClose = this.scanner.position();

    // Maybe an inline link/image
    const destinationTitle = InlineParserImpl.parseInlineDestinationTitle(
      this.scanner
    );

    if (destinationTitle !== null) {
      return new LinkInfoImpl(
        opener.markerNode,
        opener.bracketNode,
        text,
        null,
        destinationTitle.destination,
        destinationTitle.title,
        afterClose
      );
    }
    // Not an inline link/image, rewind back to after `]`.
    this.scanner.setPosition(afterClose);

    // Maybe a reference link/image like `[foo][bar]`, `[foo][]` or `[foo]`.
    // Note that even `[foo](` could be a valid link if foo is a reference, which is why we try this even if the `(`
    // failed to be parsed as an inline link/image before.

    // See if there's a link label like `[bar]` or `[]`
    const label = InlineParserImpl.parseLinkLabel(this.scanner);
    if (label === null) {
      // No label, rewind back
      this.scanner.setPosition(afterClose);
    }

    const textIsReference = label === null || label === "";
    if (opener.bracketAfter && textIsReference && opener.markerNode === null) {
      // In case of shortcut or collapsed links, the text is used as the reference. But the reference is not allowed to
      // contain an unescaped bracket, so if that's the case we don't need to continue. This is an optimization.
      return null;
    }

    return new LinkInfoImpl(
      opener.markerNode,
      opener.bracketNode,
      text,
      label,
      null,
      null,
      afterClose
    );
  }

  private wrapBracket(
    opener: Bracket,
    wrapperNode: MarkdownNode,
    includeMarker: boolean
  ): MarkdownNode {
    // Add all nodes between the opening bracket and now (closing bracket) as child nodes of the link
    let n = opener.bracketNode?.getNext() || null;
    while (n !== null) {
      let next = n.getNext();
      wrapperNode.appendChild(n);
      n = next;
    }

    if (this.includeSourceSpans) {
      const startPosition =
        includeMarker && opener.markerPosition !== null
          ? opener.markerPosition
          : opener.bracketPosition;

      wrapperNode.setSourceSpans(
        this.scanner
          .getSource(startPosition!, this.scanner.position())
          .getSourceSpans()
      );
    }

    // Process delimiters such as emphasis inside link/image
    this.processDelimiters(opener.previousDelimiter);
    this.mergeChildTextNodes(wrapperNode);

    // We don't need the corresponding text node anymore, we turned it into a link/image node
    if (includeMarker && opener.markerNode !== null) {
      opener.markerNode.unlink();
    }

    opener.bracketNode?.unlink();
    this.removeLastBracket();

    // Links within links are not allowed. We found this link, so there can be no other link around it.
    if (opener.markerNode === null) {
      let bracket = this.lastBracket;

      while (bracket !== null) {
        if (bracket.markerNode === null) {
          // Disallow link opener. It will still get matched, but will not result in a link.
          bracket.allowed = false;
        }

        bracket = bracket.previous;
      }
    }

    return wrapperNode;
  }

  private replaceBracket(
    opener: Bracket,
    node: MarkdownNode,
    includeMarker: boolean
  ): MarkdownNode {
    // Remove delimiters (but keep text nodes)
    while (
      this.lastDelimiter !== null &&
      this.lastDelimiter !== opener.previousDelimiter
    ) {
      this.removeDelimiterKeepNode(this.lastDelimiter);
    }

    if (this.includeSourceSpans) {
      let startPosition =
        includeMarker && opener.markerPosition !== null
          ? opener.markerPosition
          : opener.bracketPosition;
      node.setSourceSpans(
        this.scanner
          .getSource(startPosition!, this.scanner.position())
          .getSourceSpans()
      );
    }

    this.removeLastBracket();

    // Remove nodes that we added since the opener, because we're replacing them
    let n: MarkdownNode | null =
      includeMarker && opener.markerNode !== null
        ? opener.markerNode
        : opener.bracketNode;

    while (n !== null) {
      let next = n.getNext();
      n.unlink();
      n = next;
    }

    return node;
  }

  private addBracket(bracket: Bracket | null) {
    if (this.lastBracket !== null) {
      this.lastBracket.bracketAfter = true;
    }

    this.lastBracket = bracket;
  }

  private removeLastBracket() {
    this.lastBracket = this.lastBracket?.previous || null;
  }

  /**
   * Try to parse the destination and an optional title for an inline link/image.
   */
  private static parseInlineDestinationTitle(
    scanner: Scanner
  ): DestinationTitle | null {
    if (!scanner.next("(")) {
      return null;
    }

    scanner.whitespace();
    const dest = InlineParserImpl.parseLinkDestination(scanner);
    if (dest === null) {
      return null;
    }

    let title: string | null = null;
    const whitespace = scanner.whitespace();

    // title needs a whitespace before
    if (whitespace >= 1) {
      title = InlineParserImpl.parseLinkTitle(scanner);
      scanner.whitespace();
    }

    if (!scanner.next(")")) {
      // Don't have a closing `)`, so it's not a destination and title.
      // Note that something like `[foo](` could still be valid later, `(` will just be text.
      return null;
    }

    return new DestinationTitle(dest, title || "");
  }

  /**
   * Attempt to parse link destination, returning the string or null if no match.
   */
  private static parseLinkDestination(scanner: Scanner): string | null {
    const delimiter = scanner.peek();
    const start: Position = scanner.position();

    if (!LinkScanner.scanLinkDestination(scanner)) {
      return null;
    }

    let dest: string;
    if (delimiter === "<") {
      // chop off surrounding <..>:
      const rawDestination = scanner
        .getSource(start, scanner.position())
        .getContent();
      dest = rawDestination.substring(1, rawDestination.length - 1);
    } else {
      dest = scanner.getSource(start, scanner.position()).getContent();
    }

    return Escaping.unescapeString(dest);
  }

  /**
   * Attempt to parse link title (sans quotes), returning the string or null if no match.
   */
  private static parseLinkTitle(scanner: Scanner): string | null {
    const start: Position = scanner.position();

    if (!LinkScanner.scanLinkTitle(scanner)) {
      return null;
    }

    // chop off ', " or parens
    const rawTitle = scanner.getSource(start, scanner.position()).getContent();
    const title = rawTitle.substring(1, rawTitle.length - 1);

    return Escaping.unescapeString(title);
  }

  /**
   * Attempt to parse a link label, returning the label between the brackets or null.
   */
  protected static parseLinkLabel(scanner: Scanner): string | null {
    if (!scanner.next("[")) {
      return null;
    }

    const start: Position = scanner.position();
    if (!LinkScanner.scanLinkLabelContent(scanner)) {
      return null;
    }
    const end: Position = scanner.position();

    if (!scanner.next("]")) {
      return null;
    }

    const content: string = scanner.getSource(start, end).getContent();
    // spec: A link label can have at most 999 characters inside the square brackets.
    if (content.length > 999) {
      return null;
    }

    return content;
  }

  private parseLineBreak(): MarkdownNode {
    this.scanner.next();

    if (this.trailingSpaces >= 2) {
      return new HardLineBreak();
    } else {
      return new SoftLineBreak();
    }
  }

  /**
   * Parse the next character as plain text, and possibly more if the following characters are non-special.
   */
  private parseText(): MarkdownNode {
    const start: Position = this.scanner.position();
    this.scanner.next();

    let c: string;

    while (true) {
      c = this.scanner.peek();

      if (c === Scanner.END || this.specialCharacters.get(c.charCodeAt(0))) {
        break;
      }

      this.scanner.next();
    }

    const source = this.scanner.getSource(start, this.scanner.position());
    let content = source.getContent();

    if (c === "\n") {
      // We parsed until the end of the line. Trim any trailing spaces and remember them (for hard line breaks).
      const end =
        Characters.skipBackwards(" ", content, content.length - 1, 0) + 1;
      this.trailingSpaces = content.length - end;
      content = content.substring(0, end);
    } else if (c === Scanner.END) {
      // For the last line, both tabs and spaces are trimmed for some reason (checked with commonmark.js).
      const end =
        Characters.skipSpaceTabBackwards(content, content.length - 1, 0) + 1;
      content = content.substring(0, end);
    }

    const text = new Text(content);
    text.setSourceSpans(source.getSourceSpans());

    return text;
  }

  /**
   * Scan a sequence of characters with code delimiterChar, and return information about the number of delimiters
   * and whether they are positioned such that they can open and/or close emphasis or strong emphasis.
   *
   * @return information about delimiter run, or {@code null}
   */
  private scanDelimiters(
    delimiterProcessor: DelimiterProcessor,
    delimiterChar: string
  ): DelimiterData | null {
    const before = this.scanner.peekPreviousCodePoint();
    const start: Position = this.scanner.position();

    // Quick check to see if we have enough delimiters.
    const delimiterCount = this.scanner.matchMultiple(delimiterChar);
    if (delimiterCount < delimiterProcessor.getMinLength()) {
      this.scanner.setPosition(start);
      return null;
    }

    // We do have enough, extract a text node for each delimiter character.
    const delimiters: Text[] = [];
    this.scanner.setPosition(start);
    let positionBefore = start;

    while (this.scanner.next(delimiterChar)) {
      delimiters.push(
        this.text(
          this.scanner.getSource(positionBefore, this.scanner.position())
        )
      );

      positionBefore = this.scanner.position();
    }

    const after = this.scanner.peekCodePoint();

    // We could be more lazy here, in most cases we don't need to do every match case.
    const beforeIsPunctuation =
      before === 0 || Characters.isPunctuationCodePoint(before);
    const beforeIsWhitespace: boolean =
      before === 0 || Characters.isWhitespaceCodePoint(before);
    const afterIsPunctuation: boolean =
      after === 0 || Characters.isPunctuationCodePoint(after);
    const afterIsWhitespace: boolean =
      after === 0 || Characters.isWhitespaceCodePoint(after);

    const leftFlanking: boolean =
      !afterIsWhitespace &&
      (!afterIsPunctuation || beforeIsWhitespace || beforeIsPunctuation);
    const rightFlanking: boolean =
      !beforeIsWhitespace &&
      (!beforeIsPunctuation || afterIsWhitespace || afterIsPunctuation);

    let canOpen: boolean;
    let canClose: boolean;
    if (delimiterChar === "_") {
      canOpen = leftFlanking && (!rightFlanking || beforeIsPunctuation);
      canClose = rightFlanking && (!leftFlanking || afterIsPunctuation);
    } else {
      canOpen =
        leftFlanking &&
        delimiterChar === delimiterProcessor.getOpeningCharacter();
      canClose =
        rightFlanking &&
        delimiterChar === delimiterProcessor.getClosingCharacter();
    }

    return new DelimiterData(delimiters, canOpen, canClose);
  }

  private processDelimiters(stackBottom: Delimiter | null) {
    let openersBottom = new Map<string, Delimiter>();

    // find first closer above stackBottom:
    let closer = this.lastDelimiter;
    while (closer !== null && closer.previous !== stackBottom) {
      closer = closer.previous;
    }

    // move forward, looking for closers, and handling each
    while (closer !== null) {
      const delimiterChar = closer.delimiterChar;

      const delimiterProcessor =
        this.delimiterProcessors.get(delimiterChar) || null;
      if (!closer.getCanClose() || delimiterProcessor === null) {
        closer = closer.next;
        continue;
      }

      const openingDelimiterChar = delimiterProcessor.getOpeningCharacter();

      // Found delimiter closer. Now look back for first matching opener.
      let usedDelims = 0;
      let openerFound = false;
      let potentialOpenerFound = false;
      let opener = closer.previous;
      while (
        opener !== null &&
        opener !== stackBottom &&
        opener !== openersBottom.get(delimiterChar)
      ) {
        if (
          opener.getCanOpen() &&
          opener.delimiterChar === openingDelimiterChar
        ) {
          potentialOpenerFound = true;
          usedDelims = delimiterProcessor.process(opener, closer);

          if (usedDelims > 0) {
            openerFound = true;
            break;
          }
        }

        opener = opener.previous;
      }

      if (!openerFound) {
        if (!potentialOpenerFound) {
          // Set lower bound for future searches for openers.
          // Only do this when we didn't even have a potential
          // opener (one that matches the character and can open).
          // If an opener was rejected because of the number of
          // delimiters (e.g. because of the "multiple of 3" rule),
          // we want to consider it next time because the number
          // of delimiters can change as we continue processing.
          openersBottom.set(delimiterChar, closer.previous!);

          if (!closer.getCanOpen()) {
            // We can remove a closer that can't be an opener,
            // once we've seen there's no matching opener:
            this.removeDelimiterKeepNode(closer);
          }
        }

        closer = closer.next;
        continue;
      }

      // Remove number of used delimiters nodes.
      for (let i = 0; i < usedDelims; i++) {
        const delimiter = opener?.characters.splice(
          opener!.characters.length - 1,
          1
        );

        delimiter?.forEach((d) => d.unlink());
      }

      for (let i = 0; i < usedDelims; i++) {
        const delimiter = closer.characters.splice(0, 1);
        delimiter.forEach((d) => d.unlink());
      }

      this.removeDelimitersBetween(opener, closer);

      // No delimiter characters left to process, so we can remove delimiter and the now empty node.
      if (opener?.length() === 0) {
        this.removeDelimiterAndNodes(opener);
      }

      if (closer.length() === 0) {
        let next = closer.next;
        this.removeDelimiterAndNodes(closer);
        closer = next;
      }
    }

    // remove all delimiters
    while (this.lastDelimiter !== null && this.lastDelimiter !== stackBottom) {
      this.removeDelimiterKeepNode(this.lastDelimiter);
    }
  }

  private removeDelimitersBetween(opener: Delimiter | null, closer: Delimiter) {
    let delimiter = closer.previous;
    while (delimiter !== null && delimiter !== opener) {
      let previousDelimiter = delimiter.previous;
      this.removeDelimiterKeepNode(delimiter);
      delimiter = previousDelimiter;
    }
  }

  /**
   * Remove the delimiter and the corresponding text node. For used delimiters, e.g. `*` in `*foo*`.
   */
  private removeDelimiterAndNodes(delim: Delimiter) {
    this.removeDelimiter(delim);
  }

  /**
   * Remove the delimiter but keep the corresponding node as text. For unused delimiters such as `_` in `foo_bar`.
   */
  private removeDelimiterKeepNode(delim: Delimiter) {
    this.removeDelimiter(delim);
  }

  private removeDelimiter(delim: Delimiter) {
    if (delim.previous !== null) {
      delim.previous.next = delim.next;
    }

    if (delim.next === null) {
      // top of stack
      this.lastDelimiter = delim.previous;
    } else {
      delim.next.previous = delim.previous;
    }
  }

  private mergeChildTextNodes(node: MarkdownNode) {
    // No children, no need for merging
    if (node.getFirstChild() === null) {
      return;
    }

    this.mergeTextNodesInclusive(node.getFirstChild(), node.getLastChild());
  }

  private mergeTextNodesInclusive(
    fromNode: MarkdownNode | null,
    toNode: MarkdownNode | null
  ): void {
    let first: Text | null = null;
    let last: Text | null = null;
    let length = 0;

    let node: MarkdownNode | null = fromNode;
    while (node !== null) {
      if (node instanceof Text) {
        let text = node;

        if (first === null) {
          first = text;
        }

        length += text.getLiteral().length;
        last = text;
      } else {
        this.mergeIfNeeded(first, last, length);
        first = null;
        last = null;
        length = 0;

        this.mergeChildTextNodes(node);
      }

      if (node === toNode) {
        break;
      }

      node = node.getNext();
    }

    this.mergeIfNeeded(first, last, length);
  }

  private mergeIfNeeded(
    first: Text | null,
    last: Text | null,
    textLength: number
  ): void {
    if (first !== null && last !== null && first !== last) {
      const sb = new Appendable();
      sb.append(first.getLiteral());

      let sourceSpans: SourceSpans | null = null;

      if (this.includeSourceSpans) {
        sourceSpans = new SourceSpans();
        sourceSpans.addAll(first.getSourceSpans());
      }

      let node = first.getNext();
      let stop = last.getNext();

      while (node !== stop) {
        sb.append((node as Text).getLiteral());

        if (sourceSpans !== null) {
          sourceSpans.addAll(node?.getSourceSpans() || []);
        }

        const unlink = node;
        node = node?.getNext() || null;
        unlink?.unlink();
      }

      const literal: string = sb.toString();
      first.setLiteral(literal);

      if (sourceSpans !== null) {
        first.setSourceSpans(sourceSpans.getSourceSpans());
      }
    }
  }

  public create(inlineParserContext: InlineParserContext): InlineParserImpl {
    return new InlineParserImpl(inlineParserContext);
  }

  public static DelimiterData = DelimiterData;

  /**
   * A destination and optional title for a link or image.
   */
  public static DestinationTitle = DestinationTitle;

  public static LinkInfoImpl = LinkInfoImpl;
}

export default InlineParserImpl;
