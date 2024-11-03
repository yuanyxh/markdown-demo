


import { java, JavaObject, type int, type char } from "jree";



export  class InlineParserImpl extends JavaObject implements InlineParser, InlineParserState {

    private readonly  context:  InlineParserContext | null;
    private readonly  inlineContentParserFactories:  java.util.List<InlineContentParserFactory> | null;
    private readonly  delimiterProcessors:  java.util.Map<java.lang.Character, DelimiterProcessor> | null;
    private readonly  linkProcessors:  java.util.List<LinkProcessor> | null;
    private readonly  specialCharacters:  java.util.BitSet | null;
    private readonly  linkMarkers:  java.util.BitSet | null;

    private  inlineParsers:  java.util.Map<java.lang.Character, java.util.List<InlineContentParser>> | null;
    private  scanner:  java.util.Scanner | null;
    private  includeSourceSpans:  boolean;
    private  trailingSpaces:  int;

    /**
     * Top delimiter (emphasis, strong emphasis or custom emphasis). (Brackets are on a separate stack, different
     * from the algorithm described in the spec.)
     */
    private  lastDelimiter:  Delimiter | null;

    /**
     * Top opening bracket (<code>[</code> or <code>![)</code>).
     */
    private  lastBracket:  Bracket | null;

    public  constructor(context: InlineParserContext| null) {
        super();
this.context = context;
        this.inlineContentParserFactories = this.calculateInlineContentParserFactories(context.getCustomInlineContentParserFactories());
        this.delimiterProcessors = InlineParserImpl.calculateDelimiterProcessors(context.getCustomDelimiterProcessors());
        this.linkProcessors = this.calculateLinkProcessors(context.getCustomLinkProcessors());
        this.linkMarkers = InlineParserImpl.calculateLinkMarkers(context.getCustomLinkMarkers());
        this.specialCharacters = InlineParserImpl.calculateSpecialCharacters(this.linkMarkers, this.delimiterProcessors.keySet(), this.inlineContentParserFactories);
    }

    private  calculateInlineContentParserFactories(customFactories: java.util.List<InlineContentParserFactory>| null):  java.util.List<InlineContentParserFactory> | null {
        // Custom parsers can override built-in parsers if they want, so make sure they are tried first
        let  list  = new  java.util.ArrayList(customFactories);
        list.add(new  BackslashInlineParser.Factory());
        list.add(new  BackticksInlineParser.Factory());
        list.add(new  EntityInlineParser.Factory());
        list.add(new  AutolinkInlineParser.Factory());
        list.add(new  HtmlInlineParser.Factory());
        return list;
    }

    private  calculateLinkProcessors(linkProcessors: java.util.List<LinkProcessor>| null):  java.util.List<LinkProcessor> | null {
        // Custom link processors can override the built-in behavior, so make sure they are tried first
        let  list  = new  java.util.ArrayList(linkProcessors);
        list.add(new  CoreLinkProcessor());
        return list;
    }

    private static  calculateDelimiterProcessors(delimiterProcessors: java.util.List<DelimiterProcessor>| null):  java.util.Map<java.lang.Character, DelimiterProcessor> | null {
        let  map  = new  java.util.HashMap<java.lang.Character, DelimiterProcessor>();
        InlineParserImpl.addDelimiterProcessors(java.util.List.of(new  AsteriskDelimiterProcessor(), new  UnderscoreDelimiterProcessor()), map);
        InlineParserImpl.addDelimiterProcessors(delimiterProcessors, map);
        return map;
    }

    private static  addDelimiterProcessors(delimiterProcessors: java.lang.Iterable<DelimiterProcessor>| null, map: java.util.Map<java.lang.Character, DelimiterProcessor>| null):  void {
        for (let delimiterProcessor of delimiterProcessors) {
            let  opening: char = delimiterProcessor.getOpeningCharacter();
            let  closing: char = delimiterProcessor.getClosingCharacter();
            if (opening === closing) {
                let  old: DelimiterProcessor = map.get(opening);
                if (old !== null && old.getOpeningCharacter() === old.getClosingCharacter()) {
                    let  s: StaggeredDelimiterProcessor;
                    if (old instanceof StaggeredDelimiterProcessor) {
                        s =  old as StaggeredDelimiterProcessor;
                    } else {
                        s = new  StaggeredDelimiterProcessor(opening);
                        s.add(old);
                    }
                    s.add(delimiterProcessor);
                    map.put(opening, s);
                } else {
                    InlineParserImpl.addDelimiterProcessorForChar(opening, delimiterProcessor, map);
                }
            } else {
                InlineParserImpl.addDelimiterProcessorForChar(opening, delimiterProcessor, map);
                InlineParserImpl.addDelimiterProcessorForChar(closing, delimiterProcessor, map);
            }
        }
    }

    private static  addDelimiterProcessorForChar(delimiterChar: char, toAdd: DelimiterProcessor| null, delimiterProcessors: java.util.Map<java.lang.Character, DelimiterProcessor>| null):  void {
        let  existing: DelimiterProcessor = delimiterProcessors.put(delimiterChar, toAdd);
        if (existing !== null) {
            throw new  java.lang.IllegalArgumentException("Delimiter processor conflict with delimiter char '" + delimiterChar + "'");
        }
    }

    private static  calculateLinkMarkers(linkMarkers: java.util.Set<java.lang.Character>| null):  java.util.BitSet | null {
        let  bitSet  = new  java.util.BitSet();
        for (let c of linkMarkers) {
            bitSet.set(c);
        }
        bitSet.set('!');
        return bitSet;
    }

    private static  calculateSpecialCharacters(linkMarkers: java.util.BitSet| null,
                                                     delimiterCharacters: java.util.Set<java.lang.Character>| null,
                                                     inlineContentParserFactories: java.util.List<InlineContentParserFactory>| null):  java.util.BitSet | null {
        let  bitSet: java.util.BitSet =  linkMarkers.clone() as java.util.BitSet;
        for (let c of delimiterCharacters) {
            bitSet.set(c);
        }
        for (let factory of inlineContentParserFactories) {
            for (let c of factory.getTriggerCharacters()) {
                bitSet.set(c);
            }
        }
        bitSet.set('[');
        bitSet.set(']');
        bitSet.set('!');
        bitSet.set('\n');
        return bitSet;
    }

    private  createInlineContentParsers():  java.util.Map<java.lang.Character, java.util.List<InlineContentParser>> | null {
        let  map  = new  java.util.HashMap<java.lang.Character, java.util.List<InlineContentParser>>();
        for (let factory of this.inlineContentParserFactories) {
            let  parser  = factory.create();
            for (let c of factory.getTriggerCharacters()) {
                map.computeIfAbsent(c, k => new  java.util.ArrayList()).add(parser);
            }
        }
        return map;
    }

    public  scanner():  java.util.Scanner | null {
        return this.scanner;
    }

    /**
     * Parse content in block into inline children, appending them to the block node.
     */
    public  parse(lines: SourceLines| null, block: Node| null):  void {
        this.reset(lines);

        while (true) {
            let  nodes  = this.parseInline();
            if (nodes === null) {
                break;
            }
            for (let node of nodes) {
                block.appendChild(node);
            }
        }

        this.processDelimiters(null);
        this.mergeChildTextNodes(block);
    }

    protected  reset(lines: SourceLines| null): void {
        this.scanner = java.util.Scanner.of(lines);
        this.includeSourceSpans = !lines.getSourceSpans().isEmpty();
        this.trailingSpaces = 0;
        this.lastDelimiter = null;
        this.lastBracket = null;
        this.inlineParsers = this.createInlineContentParsers();
    }

    private  text(sourceLines: SourceLines| null):  Text | null {
        let  text: Text = new  Text(sourceLines.getContent());
        text.setSourceSpans(sourceLines.getSourceSpans());
        return text;
    }

    /**
     * Parse the next inline element in subject, advancing our position.
     * On success, return the new inline node.
     * On failure, return null.
     */
    private  parseInline():  java.util.List< Node> | null {
        let  c: char = this.scanner.peek();

        switch (c) {
            case '[':
                return java.util.List.of(this.parseOpenBracket());
            case ']':
                return java.util.List.of(this.parseCloseBracket());
            case '\n':
                return java.util.List.of(this.parseLineBreak());
            case java.util.Scanner.END:
                return null;

default:

        }

        if (this.linkMarkers.get(c)) {
            let  markerPosition  = this.scanner.position();
            let  nodes  = this.parseLinkMarker();
            if (nodes !== null) {
                return nodes;
            }
            // Reset and try other things (e.g. inline parsers below)
            this.scanner.setPosition(markerPosition);
        }

        // No inline parser, delimiter or other special handling.
        if (!this.specialCharacters.get(c)) {
            return java.util.List.of(this.parseText());
        }

        let  inlineParsers: java.util.List<InlineContentParser> = this.inlineParsers.get(c);
        if (inlineParsers !== null) {
            let  position: Position = this.scanner.position();
            for (let inlineParser of inlineParsers) {
                let  parsedInline: ParsedInline = inlineParser.tryParse(this);
                if (parsedInline instanceof ParsedInlineImpl) {
                    let  parsedInlineImpl: ParsedInlineImpl =  parsedInline as ParsedInlineImpl;
                    let  node: Node = parsedInlineImpl.getNode();
                    this.scanner.setPosition(parsedInlineImpl.getPosition());
                    if (this.includeSourceSpans && node.getSourceSpans().isEmpty()) {
                        node.setSourceSpans(this.scanner.getSource(position, this.scanner.position()).getSourceSpans());
                    }
                    return java.util.List.of(node);
                } else {
                    // Reset position
                    this.scanner.setPosition(position);
                }
            }
        }

        let  delimiterProcessor: DelimiterProcessor = this.delimiterProcessors.get(c);
        if (delimiterProcessor !== null) {
            let  nodes: java.util.List< Node> = this.parseDelimiters(delimiterProcessor, c);
            if (nodes !== null) {
                return nodes;
            }
        }

        // If we get here, even for a special/delimiter character, we will just treat it as text.
        return java.util.List.of(this.parseText());
    }

    /**
     * Attempt to parse delimiters like emphasis, strong emphasis or custom delimiters.
     */
    private  parseDelimiters(delimiterProcessor: DelimiterProcessor| null, delimiterChar: char):  java.util.List< Node> | null {
        let  res: InlineParserImpl.DelimiterData = this.scanDelimiters(delimiterProcessor, delimiterChar);
        if (res === null) {
            return null;
        }

        let  characters: java.util.List<Text> = res.characters;

        // Add entry to stack for this opener
        this.lastDelimiter = new  Delimiter(characters, delimiterChar, res.canOpen, res.canClose, this.lastDelimiter);
        if (this.lastDelimiter.previous !== null) {
            this.lastDelimiter.previous.next = this.lastDelimiter;
        }

        return characters;
    }

    /**
     * Add open bracket to delimiter stack and add a text node to block's children.
     */
    private  parseOpenBracket():  Node | null {
        let  start: Position = this.scanner.position();
        this.scanner.next();
        let  contentPosition: Position = this.scanner.position();

        let  node: Text = this.text(this.scanner.getSource(start, contentPosition));

        // Add entry to stack for this opener
        this.addBracket(Bracket.link(node, start, contentPosition, this.lastBracket, this.lastDelimiter));

        return node;
    }

    /**
     * If next character is {@code [}, add a bracket to the stack.
     * Otherwise, return null.
     */
    private  parseLinkMarker():  java.util.List< Node> | null {
        let  markerPosition  = this.scanner.position();
        this.scanner.next();
        let  bracketPosition  = this.scanner.position();
        if (this.scanner.next('[')) {
            let  contentPosition  = this.scanner.position();
            let  bangNode  = this.text(this.scanner.getSource(markerPosition, bracketPosition));
            let  bracketNode  = this.text(this.scanner.getSource(bracketPosition, contentPosition));

            // Add entry to stack for this opener
            this.addBracket(Bracket.withMarker(bangNode, markerPosition, bracketNode, bracketPosition, contentPosition, this.lastBracket, this.lastDelimiter));
            return java.util.List.of(bangNode, bracketNode);
        } else {
            return null;
        }
    }

    /**
     * Try to match close bracket against an opening in the delimiter stack. Return either a link or image, or a
     * plain [ character. If there is a matching delimiter, remove it from the delimiter stack.
     */
    private  parseCloseBracket():  Node | null {
        let  beforeClose: Position = this.scanner.position();
        this.scanner.next();
        let  afterClose: Position = this.scanner.position();

        // Get previous `[` or `![`
        let  opener: Bracket = this.lastBracket;
        if (opener === null) {
            // No matching opener, just return a literal.
            return this.text(this.scanner.getSource(beforeClose, afterClose));
        }

        if (!opener.allowed) {
            // Matching opener, but it's not allowed, just return a literal.
            this.removeLastBracket();
            return this.text(this.scanner.getSource(beforeClose, afterClose));
        }

        let  linkOrImage  = this.parseLinkOrImage(opener, beforeClose);
        if (linkOrImage !== null) {
            return linkOrImage;
        }
        this.scanner.setPosition(afterClose);

        // Nothing parsed, just parse the bracket as text and continue
        this.removeLastBracket();
        return this.text(this.scanner.getSource(beforeClose, afterClose));
    }

    private  parseLinkOrImage(opener: Bracket| null, beforeClose: Position| null):  Node | null {
        let  linkInfo  = this.parseLinkInfo(opener, beforeClose);
        if (linkInfo === null) {
            return null;
        }
        let  processorStartPosition  = this.scanner.position();

        for (let linkProcessor of this.linkProcessors) {
            let  linkResult  = linkProcessor.process(linkInfo, this.scanner, this.context);
            if (!(linkResult instanceof LinkResultImpl)) {
                // Reset position in case the processor used the scanner, and it didn't work out.
                this.scanner.setPosition(processorStartPosition);
                continue;
            }

            let  result  =  linkResult as LinkResultImpl;
            let  node  = result.getNode();
            let  position  = result.getPosition();
            let  includeMarker  = result.isIncludeMarker();

            switch (result.getType()) {
                case WRAP:
                    this.scanner.setPosition(position);
                    return this.wrapBracket(opener, node, includeMarker);
                case java.nio.charset.CodingErrorAction.REPLACE:
                    this.scanner.setPosition(position);
                    return this.replaceBracket(opener, node, includeMarker);

default:

            }
        }

        return null;
    }

    private  parseLinkInfo(opener: Bracket| null, beforeClose: Position| null):  LinkInfo | null {
        // Check to see if we have a link (or image, with a ! in front). The different types:
        // - Inline:       `[foo](/uri)` or with optional title `[foo](/uri "title")`
        // - Reference links
        //   - Full:      `[foo][bar]` (foo is the text and bar is the label that needs to match a reference)
        //   - Collapsed: `[foo][]`    (foo is both the text and label)
        //   - Shortcut:  `[foo]`      (foo is both the text and label)

        let  text: java.lang.String = this.scanner.getSource(opener.contentPosition, beforeClose).getContent();

        // Starting position is after the closing `]`
        let  afterClose: Position = this.scanner.position();

        // Maybe an inline link/image
        let  destinationTitle  = InlineParserImpl.parseInlineDestinationTitle(this.scanner);
        if (destinationTitle !== null) {
            return new  InlineParserImpl.LinkInfoImpl(opener.markerNode, opener.bracketNode, text, null, destinationTitle.destination, destinationTitle.title, afterClose);
        }
        // Not an inline link/image, rewind back to after `]`.
        this.scanner.setPosition(afterClose);

        // Maybe a reference link/image like `[foo][bar]`, `[foo][]` or `[foo]`.
        // Note that even `[foo](` could be a valid link if foo is a reference, which is why we try this even if the `(`
        // failed to be parsed as an inline link/image before.

        // See if there's a link label like `[bar]` or `[]`
        let  label: java.lang.String = InlineParserImpl.parseLinkLabel(this.scanner);
        if (label === null) {
            // No label, rewind back
            this.scanner.setPosition(afterClose);
        }
        let  textIsReference  = label === null || label.isEmpty();
        if (opener.bracketAfter && textIsReference && opener.markerNode === null) {
            // In case of shortcut or collapsed links, the text is used as the reference. But the reference is not allowed to
            // contain an unescaped bracket, so if that's the case we don't need to continue. This is an optimization.
            return null;
        }

        return new  InlineParserImpl.LinkInfoImpl(opener.markerNode, opener.bracketNode, text, label, null, null, afterClose);
    }

    private  wrapBracket(opener: Bracket| null, wrapperNode: Node| null, includeMarker: boolean):  Node | null {
        // Add all nodes between the opening bracket and now (closing bracket) as child nodes of the link
        let  n: Node = opener.bracketNode.getNext();
        while (n !== null) {
            let  next: Node = n.getNext();
            wrapperNode.appendChild(n);
            n = next;
        }

        if (this.includeSourceSpans) {
            let  startPosition  = includeMarker && opener.markerPosition !== null ? opener.markerPosition : opener.bracketPosition;
            wrapperNode.setSourceSpans(this.scanner.getSource(startPosition, this.scanner.position()).getSourceSpans());
        }

        // Process delimiters such as emphasis inside link/image
        this.processDelimiters(opener.previousDelimiter);
        this.mergeChildTextNodes(wrapperNode);
        // We don't need the corresponding text node anymore, we turned it into a link/image node
        if (includeMarker && opener.markerNode !== null) {
            opener.markerNode.unlink();
        }
        opener.bracketNode.unlink();
        this.removeLastBracket();

        // Links within links are not allowed. We found this link, so there can be no other link around it.
        if (opener.markerNode === null) {
            let  bracket: Bracket = this.lastBracket;
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

    private  replaceBracket(opener: Bracket| null, node: Node| null, includeMarker: boolean):  Node | null {
        // Remove delimiters (but keep text nodes)
        while (this.lastDelimiter !== null && this.lastDelimiter !== opener.previousDelimiter) {
            this.removeDelimiterKeepNode(this.lastDelimiter);
        }

        if (this.includeSourceSpans) {
            let  startPosition  = includeMarker && opener.markerPosition !== null ? opener.markerPosition : opener.bracketPosition;
            node.setSourceSpans(this.scanner.getSource(startPosition, this.scanner.position()).getSourceSpans());
        }

        this.removeLastBracket();

        // Remove nodes that we added since the opener, because we're replacing them
        let  n: Node = includeMarker && opener.markerNode !== null ? opener.markerNode : opener.bracketNode;
        while (n !== null) {
            let  next  = n.getNext();
            n.unlink();
            n = next;
        }
        return node;
    }

    private  addBracket(bracket: Bracket| null):  void {
        if (this.lastBracket !== null) {
            this.lastBracket.bracketAfter = true;
        }
        this.lastBracket = bracket;
    }

    private  removeLastBracket():  void {
        this.lastBracket = this.lastBracket.previous;
    }

    /**
     * Try to parse the destination and an optional title for an inline link/image.
     */
    private static  parseInlineDestinationTitle(scanner: java.util.Scanner| null):  InlineParserImpl.DestinationTitle | null {
        if (!scanner.next('(')) {
            return null;
        }

        scanner.whitespace();
        let  dest: java.lang.String = InlineParserImpl.parseLinkDestination(scanner);
        if (dest === null) {
            return null;
        }

        let  title: java.lang.String = null;
        let  whitespace: int = scanner.whitespace();
        // title needs a whitespace before
        if (whitespace >= 1) {
            title = InlineParserImpl.parseLinkTitle(scanner);
            scanner.whitespace();
        }
        if (!scanner.next(')')) {
            // Don't have a closing `)`, so it's not a destination and title.
            // Note that something like `[foo](` could still be valid later, `(` will just be text.
            return null;
        }
        return new  InlineParserImpl.DestinationTitle(dest, title);
    }

    /**
     * Attempt to parse link destination, returning the string or null if no match.
     */
    private static  parseLinkDestination(scanner: java.util.Scanner| null):  java.lang.String | null {
        let  delimiter: char = scanner.peek();
        let  start: Position = scanner.position();
        if (!LinkScanner.scanLinkDestination(scanner)) {
            return null;
        }

        let  dest: java.lang.String;
        if (delimiter === '<') {
            // chop off surrounding <..>:
            let  rawDestination: java.lang.String = scanner.getSource(start, scanner.position()).getContent();
            dest = rawDestination.substring(1, rawDestination.length() - 1);
        } else {
            dest = scanner.getSource(start, scanner.position()).getContent();
        }

        return Escaping.unescapeString(dest);
    }

    /**
     * Attempt to parse link title (sans quotes), returning the string or null if no match.
     */
    private static  parseLinkTitle(scanner: java.util.Scanner| null):  java.lang.String | null {
        let  start: Position = scanner.position();
        if (!LinkScanner.scanLinkTitle(scanner)) {
            return null;
        }

        // chop off ', " or parens
        let  rawTitle: java.lang.String = scanner.getSource(start, scanner.position()).getContent();
        let  title: java.lang.String = rawTitle.substring(1, rawTitle.length() - 1);
        return Escaping.unescapeString(title);
    }

    /**
     * Attempt to parse a link label, returning the label between the brackets or null.
     */
    protected static  parseLinkLabel(scanner: java.util.Scanner| null):  java.lang.String | null {
        if (!scanner.next('[')) {
            return null;
        }

        let  start: Position = scanner.position();
        if (!LinkScanner.scanLinkLabelContent(scanner)) {
            return null;
        }
        let  end: Position = scanner.position();

        if (!scanner.next(']')) {
            return null;
        }

        let  content: java.lang.String = scanner.getSource(start, end).getContent();
        // spec: A link label can have at most 999 characters inside the square brackets.
        if (content.length() > 999) {
            return null;
        }

        return content;
    }

    private  parseLineBreak():  Node | null {
        this.scanner.next();

        if (this.trailingSpaces >= 2) {
            return new  HardLineBreak();
        } else {
            return new  SoftLineBreak();
        }
    }

    /**
     * Parse the next character as plain text, and possibly more if the following characters are non-special.
     */
    private  parseText():  Node | null {
        let  start: Position = this.scanner.position();
        this.scanner.next();
        let  c: char;
        while (true) {
            c = this.scanner.peek();
            if (c === java.util.Scanner.END || this.specialCharacters.get(c)) {
                break;
            }
            this.scanner.next();
        }

        let  source: SourceLines = this.scanner.getSource(start, this.scanner.position());
        let  content: java.lang.String = source.getContent();

        if (c === '\n') {
            // We parsed until the end of the line. Trim any trailing spaces and remember them (for hard line breaks).
            let  end: int = Characters.skipBackwards(' ', content, content.length() - 1, 0) + 1;
            this.trailingSpaces = content.length() - end;
            content = content.substring(0, end);
        } else if (c === java.util.Scanner.END) {
            // For the last line, both tabs and spaces are trimmed for some reason (checked with commonmark.js).
            let  end: int = Characters.skipSpaceTabBackwards(content, content.length() - 1, 0) + 1;
            content = content.substring(0, end);
        }

        let  text: Text = new  Text(content);
        text.setSourceSpans(source.getSourceSpans());
        return text;
    }

    /**
     * Scan a sequence of characters with code delimiterChar, and return information about the number of delimiters
     * and whether they are positioned such that they can open and/or close emphasis or strong emphasis.
     *
     * @return information about delimiter run, or {@code null}
     */
    private  scanDelimiters(delimiterProcessor: DelimiterProcessor| null, delimiterChar: char):  InlineParserImpl.DelimiterData | null {
        let  before: int = this.scanner.peekPreviousCodePoint();
        let  start: Position = this.scanner.position();

        // Quick check to see if we have enough delimiters.
        let  delimiterCount: int = this.scanner.matchMultiple(delimiterChar);
        if (delimiterCount < delimiterProcessor.getMinLength()) {
            this.scanner.setPosition(start);
            return null;
        }

        // We do have enough, extract a text node for each delimiter character.
        let  delimiters: java.util.List<Text> = new  java.util.ArrayList();
        this.scanner.setPosition(start);
        let  positionBefore: Position = start;
        while (this.scanner.next(delimiterChar)) {
            delimiters.add(this.text(this.scanner.getSource(positionBefore, this.scanner.position())));
            positionBefore = this.scanner.position();
        }

        let  after: int = this.scanner.peekCodePoint();

        // We could be more lazy here, in most cases we don't need to do every match case.
        let  beforeIsPunctuation: boolean = before === java.util.Scanner.END || Characters.isPunctuationCodePoint(before);
        let  beforeIsWhitespace: boolean = before === java.util.Scanner.END || Characters.isWhitespaceCodePoint(before);
        let  afterIsPunctuation: boolean = after === java.util.Scanner.END || Characters.isPunctuationCodePoint(after);
        let  afterIsWhitespace: boolean = after === java.util.Scanner.END || Characters.isWhitespaceCodePoint(after);

        let  leftFlanking: boolean = !afterIsWhitespace &&
                (!afterIsPunctuation || beforeIsWhitespace || beforeIsPunctuation);
        let  rightFlanking: boolean = !beforeIsWhitespace &&
                (!beforeIsPunctuation || afterIsWhitespace || afterIsPunctuation);
        let  canOpen: boolean;
        let  canClose: boolean;
        if (delimiterChar === '_') {
            canOpen = leftFlanking && (!rightFlanking || beforeIsPunctuation);
            canClose = rightFlanking && (!leftFlanking || afterIsPunctuation);
        } else {
            canOpen = leftFlanking && delimiterChar === delimiterProcessor.getOpeningCharacter();
            canClose = rightFlanking && delimiterChar === delimiterProcessor.getClosingCharacter();
        }

        return new  InlineParserImpl.DelimiterData(delimiters, canOpen, canClose);
    }

    private  processDelimiters(stackBottom: Delimiter| null):  void {

        let  openersBottom: java.util.Map<java.lang.Character, Delimiter> = new  java.util.HashMap();

        // find first closer above stackBottom:
        let  closer: Delimiter = this.lastDelimiter;
        while (closer !== null && closer.previous !== stackBottom) {
            closer = closer.previous;
        }
        // move forward, looking for closers, and handling each
        while (closer !== null) {
            let  delimiterChar: char = closer.delimiterChar;

            let  delimiterProcessor: DelimiterProcessor = this.delimiterProcessors.get(delimiterChar);
            if (!closer.canClose() || delimiterProcessor === null) {
                closer = closer.next;
                continue;
            }

            let  openingDelimiterChar: char = delimiterProcessor.getOpeningCharacter();

            // Found delimiter closer. Now look back for first matching opener.
            let  usedDelims: int = 0;
            let  openerFound: boolean = false;
            let  potentialOpenerFound: boolean = false;
            let  opener: Delimiter = closer.previous;
            while (opener !== null && opener !== stackBottom && opener !== openersBottom.get(delimiterChar)) {
                if (opener.canOpen() && opener.delimiterChar === openingDelimiterChar) {
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
                    openersBottom.put(delimiterChar, closer.previous);
                    if (!closer.canOpen()) {
                        // We can remove a closer that can't be an opener,
                        // once we've seen there's no matching opener:
                        this.removeDelimiterKeepNode(closer);
                    }
                }
                closer = closer.next;
                continue;
            }

            // Remove number of used delimiters nodes.
            for (let  i: int = 0; i < usedDelims; i++) {
                let  delimiter: Text = opener.characters.remove(opener.characters.size() - 1);
                delimiter.unlink();
            }
            for (let  i: int = 0; i < usedDelims; i++) {
                let  delimiter: Text = closer.characters.remove(0);
                delimiter.unlink();
            }

            this.removeDelimitersBetween(opener, closer);

            // No delimiter characters left to process, so we can remove delimiter and the now empty node.
            if (opener.length() === 0) {
                this.removeDelimiterAndNodes(opener);
            }

            if (closer.length() === 0) {
                let  next: Delimiter = closer.next;
                this.removeDelimiterAndNodes(closer);
                closer = next;
            }
        }

        // remove all delimiters
        while (this.lastDelimiter !== null && this.lastDelimiter !== stackBottom) {
            this.removeDelimiterKeepNode(this.lastDelimiter);
        }
    }

    private  removeDelimitersBetween(opener: Delimiter| null, closer: Delimiter| null):  void {
        let  delimiter: Delimiter = closer.previous;
        while (delimiter !== null && delimiter !== opener) {
            let  previousDelimiter: Delimiter = delimiter.previous;
            this.removeDelimiterKeepNode(delimiter);
            delimiter = previousDelimiter;
        }
    }

    /**
     * Remove the delimiter and the corresponding text node. For used delimiters, e.g. `*` in `*foo*`.
     */
    private  removeDelimiterAndNodes(delim: Delimiter| null):  void {
        this.removeDelimiter(delim);
    }

    /**
     * Remove the delimiter but keep the corresponding node as text. For unused delimiters such as `_` in `foo_bar`.
     */
    private  removeDelimiterKeepNode(delim: Delimiter| null):  void {
        this.removeDelimiter(delim);
    }

    private  removeDelimiter(delim: Delimiter| null):  void {
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

    private  mergeChildTextNodes(node: Node| null):  void {
        // No children, no need for merging
        if (node.getFirstChild() === null) {
            return;
        }

        this.mergeTextNodesInclusive(node.getFirstChild(), node.getLastChild());
    }

    private  mergeTextNodesInclusive(fromNode: Node| null, toNode: Node| null):  void {
        let  first: Text = null;
        let  last: Text = null;
        let  length: int = 0;

        let  node: Node = fromNode;
        while (node !== null) {
            if (node instanceof Text) {
                let  text: Text =  node as Text;
                if (first === null) {
                    first = text;
                }
                length += text.getLiteral().length();
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

    private  mergeIfNeeded(first: Text| null, last: Text| null, textLength: int):  void {
        if (first !== null && last !== null && first !== last) {
            let  sb: java.lang.StringBuilder = new  java.lang.StringBuilder(textLength);
            sb.append(first.getLiteral());
            let  sourceSpans: SourceSpans = null;
            if (this.includeSourceSpans) {
                sourceSpans = new  SourceSpans();
                sourceSpans.addAll(first.getSourceSpans());
            }
            let  node: Node = first.getNext();
            let  stop: Node = last.getNext();
            while (node !== stop) {
                sb.append(( node as Text).getLiteral());
                if (sourceSpans !== null) {
                    sourceSpans.addAll(node.getSourceSpans());
                }

                let  unlink: Node = node;
                node = node.getNext();
                unlink.unlink();
            }
            let  literal: java.lang.String = sb.toString();
            first.setLiteral(literal);
            if (sourceSpans !== null) {
                first.setSourceSpans(sourceSpans.getSourceSpans());
            }
        }
    }

    public static DelimiterData =  class DelimiterData extends JavaObject {

        protected readonly  characters:  java.util.List<Text> | null;
        protected readonly  canClose:  boolean;
        protected readonly  canOpen:  boolean;

        protected constructor(characters: java.util.List<Text>| null, canOpen: boolean, canClose: boolean) {
            super();
this.characters = characters;
            this.canOpen = canOpen;
            this.canClose = canClose;
        }
    };


    /**
     * A destination and optional title for a link or image.
     */
    public static DestinationTitle =  class DestinationTitle extends JavaObject {
        protected readonly  destination:  java.lang.String | null;
        protected readonly  title:  java.lang.String | null;

        public  constructor(destination: java.lang.String| null, title: java.lang.String| null) {
            super();
this.destination = destination;
            this.title = title;
        }
    };


    public static LinkInfoImpl =  class LinkInfoImpl extends JavaObject implements LinkInfo {

        private readonly  marker:  Text | null;
        private readonly  openingBracket:  Text | null;
        private readonly  text:  java.lang.String | null;
        private readonly  label:  java.lang.String | null;
        private readonly  destination:  java.lang.String | null;
        private readonly  title:  java.lang.String | null;
        private readonly  afterTextBracket:  Position | null;

        private  constructor(marker: Text| null, openingBracket: Text| null, text: java.lang.String| null, label: java.lang.String| null,
                             destination: java.lang.String| null, title: java.lang.String| null, afterTextBracket: Position| null) {
            super();
this.marker = marker;
            this.openingBracket = openingBracket;
            this.text = text;
            this.label = label;
            this.destination = destination;
            this.title = title;
            this.afterTextBracket = afterTextBracket;
        }

        public  marker():  Text | null {
            return this.marker;
        }

        public  openingBracket():  Text | null {
            return this.openingBracket;
        }

        public  text():  java.lang.String | null {
            return this.text;
        }

        public  label():  java.lang.String | null {
            return this.label;
        }

        public  destination():  java.lang.String | null {
            return this.destination;
        }

        public  title():  java.lang.String | null {
            return this.title;
        }

        public  afterTextBracket():  Position | null {
            return this.afterTextBracket;
        }
    };

}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace InlineParserImpl {
	export type DelimiterData = InstanceType<typeof InlineParserImpl.DelimiterData>;
	export type DestinationTitle = InstanceType<typeof InlineParserImpl.DestinationTitle>;
	export type LinkInfoImpl = InstanceType<typeof InlineParserImpl.LinkInfoImpl>;
}


