var Ut = Object.defineProperty;
var Ht = (o, e, t) => e in o ? Ut(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var i = (o, e, t) => Ht(o, typeof e != "symbol" ? e + "" : e, t);
class Ge {
  constructor(e) {
    i(this, "values", []);
    e && (this.values = e);
  }
  set(e) {
    for (; e >= this.values.length; )
      this.values.push(!1);
    this.values[e] = !0;
  }
  get(e) {
    return this.values[e] || !1;
  }
  clone() {
    return new Ge(this.values.slice(0));
  }
}
class y {
  constructor(e) {
    i(this, "data", "");
    e !== void 0 && (this.data += e);
  }
  append(e, t = 0, r = e.length) {
    this.data += e.substring(t, r);
  }
  length() {
    return this.data.length;
  }
  toString() {
    return this.data;
  }
}
const Le = class Le {
  static isUnicodeCharOfCategory(e, t) {
    return this.map[e] ? this.map[e].lastIndex = 0 : this.map[e] = new RegExp("\\p{" + e + "}", "u"), this.map[e].test(t[0]);
  }
  static isISOControl(e) {
    const t = e.charCodeAt(0);
    return t <= 159 && (t >= 127 || t >>> 5 === 0);
  }
  static isLetter(e) {
    return this.isUnicodeCharOfCategory(Le.UnicodeCategory.L, e);
  }
  static isHighSurrogate(e) {
    return e >= 55296 && e < 56320;
  }
  static isLowSurrogate(e) {
    return e >= 56320 && e < 57344;
  }
  static toCodePoint(e, t) {
    return (e << 10) + t + -56613888;
  }
};
i(Le, "map", {}), i(Le, "UnicodeCategory", {
  Ll: "Ll",
  Lu: "Lu",
  Lt: "Lt",
  Lm: "Lm",
  Lo: "Lo",
  Mn: "Mn",
  Mc: "Mc",
  Me: "Me",
  Nd: "Nd",
  Nl: "Nl",
  No: "No",
  Pd: "Pd",
  Ps: "Ps",
  Pe: "Pe",
  Pi: "Pi",
  Pf: "Pf",
  Pc: "Pc",
  Po: "Po",
  Sm: "Sm",
  Sc: "Sc",
  Sk: "Sk",
  So: "So",
  Zs: "Zs",
  Zl: "Zl",
  Zp: "Zp",
  Cc: "Cc",
  Cf: "Cf",
  Co: "Co",
  Cs: "Cs",
  Cn: "Cn",
  L: "L",
  P: "P",
  S: "S"
});
let P = Le;
function ae(...o) {
  try {
    return String.fromCodePoint(...o);
  } catch (e) {
    if (e instanceof RangeError)
      return "�";
    throw e;
  }
}
function C(o) {
  return typeof o < "u";
}
function ct(o) {
  return typeof o > "u";
}
class zt {
  constructor(e = "") {
    i(this, "sb");
    i(this, "lineCount", 0);
    this.sb = new y(e);
  }
  add(e) {
    this.lineCount !== 0 && this.sb.append(`
`), this.sb.append(e), this.lineCount++;
  }
  getString() {
    return this.sb.toString();
  }
}
var Se = /* @__PURE__ */ ((o) => (o.NONE = "NONE", o.BLOCKS = "BLOCKS", o.BLOCKS_AND_INLINES = "BLOCKS_AND_INLINES", o))(Se || {});
class Pt {
  extend(e) {
  }
}
class ht {
  constructor() {
    i(this, "blockParserFactories", []);
    i(this, "inlineContentParserFactories", []);
    i(this, "delimiterProcessors", []);
    i(this, "linkProcessors", []);
    i(this, "postProcessors", []);
    i(this, "linkMarkers", /* @__PURE__ */ new Set());
    i(this, "enabledBlockTypes", xe.getDefaultBlockParserTypes());
    i(this, "inlineParserFactory", null);
    i(this, "includeSourceSpans", Se.NONE);
  }
  /**
   * @return the configured {@link Parser}
   */
  build() {
    return new Qe(this);
  }
  /**
   * @param extensions extensions to use on this parser
   * @return {@code this}
   */
  extensions(e) {
    for (const t of e)
      t instanceof Pt && t.extend(this);
    return this;
  }
  /**
   * Describe the list of markdown features the parser will recognize and parse.
   * <p>
   * By default, CommonMark will recognize and parse the following set of "block" elements:
   * <ul>
   * <li>{@link Heading} ({@code #})
   * <li>{@link HtmlBlock} ({@code <html></html>})
   * <li>{@link ThematicBreak} (Horizontal Rule) ({@code ---})
   * <li>{@link FencedCodeBlock} ({@code ```})
   * <li>{@link IndentedCodeBlock}
   * <li>{@link BlockQuote} ({@code >})
   * <li>{@link ListBlock} (Ordered / Unordered List) ({@code 1. / *})
   * </ul>
   * <p>
   * To parse only a subset of the features listed above, pass a list of each feature's associated {@link Block} class.
   * <p>
   * E.g., to only parse headings and lists:
   * <pre>
   *     {@code
   *     Parser.builder().enabledBlockTypes(Set.of(Heading.class, ListBlock.class));
   *     }
   * </pre>
   *
   * @param enabledBlockTypes A list of block nodes the parser will parse.
   *                          If this list is empty, the parser will not recognize any CommonMark core features.
   * @return {@code this}
   */
  setEnabledBlockTypes(e) {
    return xe.checkEnabledBlockTypes(e), this.enabledBlockTypes = e, this;
  }
  /**
   * Whether to calculate source positions for parsed {@link MarkdownNode Nodes}, see {@link MarkdownNode#getSourceSpans()}.
   * <p>
   * By default, source spans are disabled.
   *
   * @param includeSourceSpans which kind of source spans should be included
   * @return {@code this}
   * @since 0.16.0
   */
  setIncludeSourceSpans(e) {
    return this.includeSourceSpans = e, this;
  }
  /**
   * Add a custom block parser factory.
   * <p>
   * Note that custom factories are applied <em>before</em> the built-in factories. This is so that
   * extensions can change how some syntax is parsed that would otherwise be handled by built-in factories.
   * "With great power comes great responsibility."
   *
   * @param blockParserFactory a block parser factory implementation
   * @return {@code this}
   */
  customBlockParserFactory(e) {
    return this.blockParserFactories.push(e), this;
  }
  /**
   * Add a factory for a custom inline content parser, for extending inline parsing or overriding built-in parsing.
   * <p>
   * Note that parsers are triggered based on a special character as specified by
   * {@link InlineContentParserFactory#getTriggerCharacters()}. It is possible to register multiple parsers for the same
   * character, or even for some built-in special character such as {@code `}. The custom parsers are tried first
   * in order in which they are registered, and then the built-in ones.
   */
  customInlineContentParserFactory(e) {
    return this.inlineContentParserFactories.push(e), this;
  }
  /**
   * Add a custom delimiter processor for inline parsing.
   * <p>
   * Note that multiple delimiter processors with the same characters can be added, as long as they have a
   * different minimum length. In that case, the processor with the shortest matching length is used. Adding more
   * than one delimiter processor with the same character and minimum length is invalid.
   * <p>
   * If you want more control over how parsing is done, you might want to use
   * {@link #customInlineContentParserFactory} instead.
   *
   * @param delimiterProcessor a delimiter processor implementation
   * @return {@code this}
   */
  customDelimiterProcessor(e) {
    return this.delimiterProcessors.push(e), this;
  }
  /**
   * Add a custom link/image processor for inline parsing.
   * <p>
   * Multiple link processors can be added, and will be tried in order in which they were added. If no link
   * processor applies, the normal behavior applies. That means these can override built-in link parsing.
   *
   * @param linkProcessor a link processor implementation
   * @return {@code this}
   */
  linkProcessor(e) {
    return this.linkProcessors.push(e), this;
  }
  /**
   * Add a custom link marker for link processing. A link marker is a character like {@code !} which, if it
   * appears before the {@code [} of a link, changes the meaning of the link.
   * <p>
   * If a link marker followed by a valid link is parsed, the {@link LinkInfo}
   * that is passed to {@link LinkProcessor} will have its {@link LinkInfo#marker()} set. A link processor should
   * check the {@link Text#getLiteral()} and then do any processing, and will probably want to use {@link LinkResult#includeMarker()}.
   *
   * @param linkMarker a link marker character
   * @return {@code this}
   */
  linkMarker(e) {
    return this.linkMarkers.add(e), this;
  }
  postProcessor(e) {
    return this.postProcessors.push(e), this;
  }
  /**
   * Overrides the parser used for inline markdown processing.
   * <p>
   * Provide an implementation of InlineParserFactory which provides a custom inline parser
   * to modify how the following are parsed:
   * bold (**)
   * italic (*)
   * strikethrough (~~)
   * backtick quote (`)
   * link ([title](http://))
   * image (![alt](http://))
   * <p>
   * Note that if this method is not called or the inline parser factory is set to null, then the default
   * implementation will be used.
   *
   * @param inlineParserFactory an inline parser factory implementation
   * @return {@code this}
   */
  setInlineParserFactory(e) {
    return this.inlineParserFactory = e, this;
  }
  getInlineParserFactory() {
    return this.inlineParserFactory ? this.inlineParserFactory : {
      create(e) {
        return new _e(e);
      }
    };
  }
}
class Qe {
  constructor(e) {
    i(this, "blockParserFactories");
    i(this, "inlineContentParserFactories");
    i(this, "delimiterProcessors");
    i(this, "linkProcessors");
    i(this, "linkMarkers");
    i(this, "postProcessors");
    i(this, "inlineParserFactory");
    i(this, "includeSourceSpans");
    this.blockParserFactories = xe.calculateBlockParserFactories(
      e.blockParserFactories,
      e.enabledBlockTypes
    );
    const t = e.getInlineParserFactory();
    this.postProcessors = e.postProcessors, this.inlineContentParserFactories = e.inlineContentParserFactories, this.delimiterProcessors = e.delimiterProcessors, this.linkProcessors = e.linkProcessors, this.linkMarkers = e.linkMarkers, this.includeSourceSpans = e.includeSourceSpans;
    const r = new Nt(
      this.inlineContentParserFactories,
      this.delimiterProcessors,
      this.linkProcessors,
      this.linkMarkers,
      new Et()
    );
    this.inlineParserFactory = t.create(r);
  }
  /**
   * Create a new builder for configuring a {@link Parser}.
   *
   * @return a builder
   */
  static builder() {
    return new ht();
  }
  /**
   * Parse the specified input text into a tree of nodes.
   * <p>
   * This method is thread-safe (a new parser state is used for each invocation).
   *
   * @param input the text to parse - must not be null
   * @return the root node
   */
  parse(e) {
    const r = this.createDocumentParser().parse(e.toString());
    return this.postProcess(r);
  }
  /**
   * Parse the specified reader into a tree of nodes. The caller is responsible for closing the reader.
   * <pre><code>
   * Parser parser = Parser.builder().build();
   * try (InputStreamReader reader = new InputStreamReader(new FileInputStream("file.md"), StandardCharsets.UTF_8)) {
   *     MarkdownNode document = parser.parseReader(reader);
   *     // ...
   * }
   * </code></pre>
   * Note that if you have a file with a byte order mark (BOM), you need to skip it before handing the reader to this
   * library. There's existing classes that do that, e.g. see {@code BOMInputStream} in Commons IO.
   * <p>
   * This method is thread-safe (a new parser state is used for each invocation).
   *
   * @param input the reader to parse - must not be null
   * @return the root node
   * @throws IOException when reading throws an exception
   */
  async parseReader(e) {
    return new Promise((t, r) => {
      const s = new FileReader();
      s.onload = () => {
        const a = this.createDocumentParser().parse(s.result);
        t(this.postProcess(a));
      }, s.onerror = r, s.readAsText(e);
    });
  }
  createDocumentParser() {
    return new xe(
      this.blockParserFactories,
      this.inlineParserFactory,
      this.inlineContentParserFactories,
      this.delimiterProcessors,
      this.linkProcessors,
      this.linkMarkers,
      this.includeSourceSpans
    );
  }
  postProcess(e) {
    for (const t of this.postProcessors)
      e = t.process(e);
    return e;
  }
}
/**
 * Builder for configuring a {@link Parser}.
 */
i(Qe, "Builder", ht), i(Qe, "ParserExtension", Pt);
class w {
  static none() {
    return null;
  }
  static atIndex(e) {
    return new Be(e, -1, !1);
  }
  static atColumn(e) {
    return new Be(-1, e, !1);
  }
  static finished() {
    return new Be(-1, -1, !0);
  }
}
class q {
  constructor() {
    i(this, "lines", []);
  }
  static empty() {
    return new q();
  }
  static of(e) {
    const t = new q();
    return t.lines.push(...e), t;
  }
  addLine(e) {
    this.lines.push(e);
  }
  getLines() {
    return this.lines;
  }
  isEmpty() {
    return this.lines.length === 0;
  }
  getContent() {
    const e = new y();
    for (let t = 0; t < this.lines.length; t++)
      t !== 0 && e.append(`
`), e.append(this.lines[t].getContent());
    return e.toString();
  }
  getSourceSpans() {
    const e = [];
    for (const t of this.lines) {
      const r = t.getSourceSpan();
      r !== null && e.push(r);
    }
    return e;
  }
}
class U {
  constructor(e) {
    i(this, "innerType");
    i(this, "innerMeta", {});
    i(this, "innerChildren", []);
    i(this, "innerInputIndex", -1);
    i(this, "innerInputEndInput", -1);
    i(this, "parent", null);
    i(this, "firstChild", null);
    i(this, "lastChild", null);
    i(this, "prev", null);
    i(this, "next", null);
    i(this, "sourceSpans", null);
    this.innerType = e;
  }
  get meta() {
    return this.innerMeta;
  }
  set meta(e) {
    this.innerMeta = e;
  }
  get type() {
    return this.innerType;
  }
  get inputIndex() {
    var e;
    return this.innerInputIndex === -1 && (this.innerInputIndex = ((e = this.getSourceSpans()[0]) == null ? void 0 : e.getInputIndex()) || 0), this.innerInputIndex;
  }
  get inputEndIndex() {
    if (this.innerInputEndInput === -1) {
      const e = this.getSourceSpans(), t = e[e.length - 1];
      t ? this.innerInputEndInput = t.getInputIndex() + t.getLength() : this.innerInputEndInput = 0;
    }
    return this.innerInputEndInput;
  }
  get children() {
    if (this.innerChildren.length)
      return this.innerChildren;
    let e = this.getFirstChild();
    const t = [];
    if (!e)
      return t;
    for (t.push(e); e = e.getNext(); )
      t.push(e);
    return t;
  }
  isBlock() {
    return !1;
  }
  getNext() {
    return this.next;
  }
  getPrevious() {
    return this.prev;
  }
  getFirstChild() {
    return this.firstChild;
  }
  getLastChild() {
    return this.lastChild;
  }
  getParent() {
    return this.parent;
  }
  setParent(e) {
    this.parent = e;
  }
  appendChild(e) {
    e.unlink(), e.setParent(this), this.lastChild !== null ? (this.lastChild.next = e, e.prev = this.lastChild, this.lastChild = e) : (this.firstChild = e, this.lastChild = e);
  }
  prependChild(e) {
    e.unlink(), e.setParent(this), this.firstChild !== null ? (this.firstChild.prev = e, e.next = this.firstChild, this.firstChild = e) : (this.firstChild = e, this.lastChild = e);
  }
  unlink() {
    this.prev !== null ? this.prev.next = this.next : this.parent !== null && (this.parent.firstChild = this.next), this.next !== null ? this.next.prev = this.prev : this.parent !== null && (this.parent.lastChild = this.prev), this.parent = null, this.next = null, this.prev = null;
  }
  /**
   * Inserts the {@code sibling} node after {@code this} node.
   */
  insertAfter(e) {
    e.unlink(), e.next = this.next, e.next !== null && (e.next.prev = e), e.prev = this, this.next = e, e.parent = this.parent, e.parent && e.next === null && (e.parent.lastChild = e);
  }
  /**
   * Inserts the {@code sibling} node before {@code this} node.
   */
  insertBefore(e) {
    e.unlink(), e.prev = this.prev, e.prev !== null && (e.prev.next = e), e.next = this, this.prev = e, e.parent = this.parent, e.parent && e.prev === null && (e.parent.firstChild = e);
  }
  /**
   * @return the source spans of this node if included by the parser, an empty list otherwise
   * @since 0.16.0
   */
  getSourceSpans() {
    return this.sourceSpans !== null ? this.sourceSpans.slice(0) : [];
  }
  /**
   * Replace the current source spans with the provided list.
   *
   * @param sourceSpans the new source spans to set
   * @since 0.16.0
   */
  setSourceSpans(e) {
    e.length === 0 ? this.sourceSpans = null : this.sourceSpans = e.slice(0);
  }
  /**
   * Add a source span to the end of the list.
   *
   * @param sourceSpan the source span to add
   * @since 0.16.0
   */
  addSourceSpan(e) {
    this.sourceSpans === null && (this.sourceSpans = []), this.sourceSpans.push(e);
  }
}
class Ne {
  visit(e) {
    this.visitChildren(e);
  }
  visitChildren(e) {
    let t = e.getFirstChild();
    for (; t !== null; ) {
      const r = t.getNext();
      t.accept(this), t = r;
    }
  }
}
class N extends U {
  isBlock() {
    return !0;
  }
  getParent() {
    const e = super.getParent();
    if (e) {
      if (e instanceof N)
        return e;
      throw new Error("Warning: The parent node is not a block. This is an error.");
    }
    return null;
  }
  setParent(e) {
    if (!(e instanceof N))
      throw Error("Parent of block must also be block (can not be inline)");
    super.setParent(e);
  }
}
class mr extends N {
  accept(e) {
    e.visit(this);
  }
}
class wr extends U {
  accept(e) {
    e.visit(this);
  }
}
class Q extends N {
  constructor() {
    super("blockquote");
  }
  accept(e) {
    e.visit(this);
  }
}
class me extends N {
  constructor() {
    super(...arguments);
    i(this, "tight", !1);
  }
  /**
   * @return whether this list is tight or loose
   * @see <a href="https://spec.commonmark.org/0.31.2/#tight">CommonMark Spec for tight lists</a>
   */
  isTight() {
    return this.tight;
  }
  setTight(t) {
    this.tight = t;
  }
}
class Y extends me {
  constructor() {
    super("bullet-list");
    i(this, "marker");
  }
  accept(t) {
    t.visit(this);
  }
  /**
   * @return the bullet list marker that was used, e.g. {@code -}, {@code *} or {@code +}, if available, or null otherwise
   */
  getMarker() {
    return this.marker;
  }
  /**
   * @param marker
   */
  setMarker(t) {
    this.marker = t;
  }
}
class ue extends U {
  constructor(t = "") {
    super("code");
    i(this, "literal");
    this.literal = t;
  }
  accept(t) {
    t.visit(this);
  }
  getLiteral() {
    return this.literal;
  }
  setLiteral(t) {
    this.literal = t;
  }
}
class Vt {
  constructor(e) {
    i(this, "type");
    // LinkedHashMap for determinism and to preserve document order
    i(this, "definitions", /* @__PURE__ */ new Map());
    this.type = e;
  }
  getType() {
    return this.type;
  }
  addAll(e) {
    for (const t of e.definitions)
      this.definitions.has(t[0]) || this.definitions.set(t[0], t[1]);
  }
  /**
   * Store a new definition unless one is already in the map. If there is no definition for that label yet, return null.
   * Otherwise, return the existing definition.
   * <p>
   * The label is normalized by the definition map before storing.
   */
  putIfAbsent(e, t) {
    const r = E.normalizeLabelContent(e);
    return this.definitions.has(r) ? this.definitions.get(r) : (this.definitions.set(r, t), t);
  }
  /**
   * Look up a definition by label. The label is normalized by the definition map before lookup.
   *
   * @return the value or null
   */
  get(e) {
    const t = E.normalizeLabelContent(e);
    return this.definitions.get(t);
  }
  keySet() {
    return Array.from(this.definitions.keys());
  }
  values() {
    return Array.from(this.definitions.values());
  }
}
class ut {
  constructor(e, t) {
    i(this, "first");
    i(this, "end");
    this.first = e, this.end = t;
  }
  [Symbol.iterator]() {
    return this.iterator();
  }
  iterator() {
    return new At(this.first, this.end);
  }
}
class At {
  constructor(e, t) {
    i(this, "node");
    i(this, "end");
    this.node = e, this.end = t;
  }
  // public hasNext(): boolean {
  //   return this.node !== null && this.node !== this.end;
  // }
  next() {
    const e = this.node;
    return this.node = this.node ? this.node.getNext() : null, e === null || e === this.end ? { done: !0, value: e } : { done: !1, value: e };
  }
}
class Je {
  /**
   * The nodes between (not including) start and end.
   */
  static between(e, t) {
    const r = e.getNext();
    if (r !== null)
      return new ut(r, t);
    throw Error("Null first node.");
  }
}
i(Je, "MarkdownNodeIterable", ut), i(Je, "MarkdownNodeIterator", At);
class ce {
  constructor(e, t, r, s) {
    i(this, "lineIndex");
    i(this, "columnIndex");
    i(this, "inputIndex");
    i(this, "length");
    if (e < 0)
      throw new Error("lineIndex " + e + " must be >= 0");
    if (t < 0)
      throw new Error("columnIndex " + t + " must be >= 0");
    if (r < 0)
      throw new Error("inputIndex " + r + " must be >= 0");
    if (s < 0)
      throw new Error("length " + s + " must be >= 0");
    this.lineIndex = e, this.columnIndex = t, this.inputIndex = r, this.length = s;
  }
  /**
   * @return 0-based line index, e.g. 0 for first line, 1 for the second line, etc
   */
  getLineIndex() {
    return this.lineIndex;
  }
  /**
   * @return 0-based index of column (character on line) in source, e.g. 0 for the first character of a line, 1 for
   * the second character, etc
   */
  getColumnIndex() {
    return this.columnIndex;
  }
  /**
   * @return 0-based index in whole input
   * @since 0.24.0
   */
  getInputIndex() {
    return this.inputIndex;
  }
  /**
   * @return length of the span in characters
   */
  getLength() {
    return this.length;
  }
  subSpan(e, t = this.length) {
    if (e < 0)
      throw Error("beginIndex " + e + " + must be >= 0");
    if (e > this.length)
      throw Error(
        "beginIndex " + e + " must be <= length " + this.length
      );
    if (t < 0)
      throw Error("endIndex " + t + " + must be >= 0");
    if (t > this.length)
      throw Error("endIndex " + t + " must be <= length " + this.length);
    if (e > t)
      throw Error(
        "beginIndex " + e + " must be <= endIndex " + t
      );
    return e === 0 && t === this.length ? this : new ce(
      this.lineIndex,
      this.columnIndex + e,
      this.inputIndex + e,
      t - e
    );
  }
  equals(e) {
    if (this === e)
      return !0;
    if (!(e instanceof ce))
      return !1;
    const t = e;
    return this.lineIndex === t.lineIndex && this.columnIndex === t.columnIndex && this.inputIndex === t.inputIndex && this.length === t.length;
  }
  /**
   * Use {{@link #of(int, int, int, int)}} instead to also specify input index. Using the deprecated one
   * will set {@link #inputIndex} to 0.
   */
  static of(e, t, r = 0, s) {
    return new ce(e, t, r, s);
  }
}
class We {
  constructor() {
    i(this, "sourceSpans", null);
  }
  getSourceSpans() {
    return this.sourceSpans ? this.sourceSpans : [];
  }
  addAllFrom(e) {
    for (const t of e)
      this.addAll(t.getSourceSpans());
  }
  addAll(e) {
    if (e.length !== 0)
      if (this.sourceSpans || (this.sourceSpans = []), this.sourceSpans.length === 0)
        this.sourceSpans.push(...e);
      else {
        const t = this.sourceSpans.length - 1, r = this.sourceSpans[t], s = e[0];
        r.getInputIndex() + r.getLength() === s.getInputIndex() ? (this.sourceSpans[t] = ce.of(
          r.getLineIndex(),
          r.getColumnIndex(),
          r.getInputIndex(),
          r.getLength() + s.getLength()
        ), this.sourceSpans.push(...e.slice(1, e.length))) : this.sourceSpans.push(...e);
      }
  }
  static empty() {
    return new We();
  }
}
class pe extends N {
  constructor() {
    super("document");
  }
  accept(e) {
    e.visit(this);
  }
}
class we extends U {
  constructor(t = "") {
    super("emphasis");
    i(this, "delimiter");
    this.delimiter = t;
  }
  accept(t) {
    t.visit(this);
  }
  setDelimiter(t) {
    this.delimiter = t;
  }
  getOpeningDelimiter() {
    return this.delimiter;
  }
  getClosingDelimiter() {
    return this.delimiter;
  }
}
class F extends N {
  constructor() {
    super("fenced-code-block");
    i(this, "fenceCharacter");
    i(this, "openingFenceLength");
    i(this, "closingFenceLength");
    i(this, "fenceIndent");
    i(this, "info");
    i(this, "literal");
  }
  accept(t) {
    t.visit(this);
  }
  /**
   * @return the fence character that was used, e.g. {@code `} or {@code ~}, if available, or null otherwise
   */
  getFenceCharacter() {
    return this.fenceCharacter;
  }
  /**
   * @param fenceCharacter
   */
  setFenceCharacter(t) {
    this.fenceCharacter = t;
  }
  /**
   * @return the length of the opening fence (how many of {{@link #getFenceCharacter()}} were used to start the code
   * block) if available, or null otherwise
   */
  getOpeningFenceLength() {
    return this.openingFenceLength;
  }
  /**
   * @param openingFenceLength
   */
  setOpeningFenceLength(t) {
    if (C(t) && t < 3)
      throw Error("openingFenceLength needs to be >= 3");
    F.checkFenceLengths(
      t,
      this.closingFenceLength
    ), this.openingFenceLength = t;
  }
  /**
   * @return the length of the closing fence (how many of {@link #getFenceCharacter()} were used to end the code
   * block) if available, or null otherwise
   */
  getClosingFenceLength() {
    return this.closingFenceLength;
  }
  setClosingFenceLength(t) {
    if (C(t) && t < 3)
      throw Error("closingFenceLength needs to be >= 3");
    F.checkFenceLengths(
      this.openingFenceLength,
      t
    ), this.closingFenceLength = t;
  }
  getFenceIndent() {
    return this.fenceIndent;
  }
  setFenceIndent(t) {
    this.fenceIndent = t;
  }
  /**
   * @see <a href="http://spec.commonmark.org/0.31.2/#info-string">CommonMark spec</a>
   */
  getInfo() {
    return this.info;
  }
  setInfo(t) {
    this.info = t;
  }
  getLiteral() {
    return this.literal;
  }
  setLiteral(t) {
    this.literal = t;
  }
  static checkFenceLengths(t, r) {
    if (C(t) && C(r) && r < t)
      throw Error(
        "fence lengths required to be: closingFenceLength >= openingFenceLength"
      );
  }
}
class W extends U {
  constructor() {
    super("hardline-break");
  }
  accept(e) {
    e.visit(this);
  }
}
class G extends N {
  constructor() {
    super("heading");
    i(this, "level", -1);
  }
  accept(t) {
    t.visit(this);
  }
  getLevel() {
    return this.level;
  }
  setLevel(t) {
    this.level = t;
  }
}
class J extends N {
  constructor() {
    super("html-block");
    i(this, "literal", "");
  }
  accept(t) {
    t.visit(this);
  }
  getLiteral() {
    return this.literal;
  }
  setLiteral(t) {
    this.literal = t;
  }
}
class de extends U {
  constructor() {
    super("html-inline");
    i(this, "literal", "");
  }
  accept(t) {
    t.visit(this);
  }
  getLiteral() {
    return this.literal;
  }
  setLiteral(t) {
    this.literal = t;
  }
}
class ge extends U {
  constructor(t = "", r) {
    super("image");
    i(this, "destination", "");
    i(this, "title");
    this.destination = t, this.title = r;
  }
  accept(t) {
    t.visit(this);
  }
  getDestination() {
    return this.destination;
  }
  setDestination(t) {
    this.destination = t;
  }
  getTitle() {
    return this.title;
  }
  setTitle(t) {
    this.title = t;
  }
  toStringAttributes() {
    return "destination=" + this.destination + ", title=" + this.title;
  }
}
class X extends N {
  constructor() {
    super("indented-code-block");
    i(this, "literal", "");
  }
  accept(t) {
    t.visit(this);
  }
  getLiteral() {
    return this.literal;
  }
  setLiteral(t) {
    this.literal = t;
  }
}
class j extends U {
  constructor(t = "", r) {
    super("link");
    i(this, "destination", "");
    i(this, "title");
    this.destination = t, this.title = r;
  }
  accept(t) {
    t.visit(this);
  }
  getDestination() {
    return this.destination;
  }
  setDestination(t) {
    this.destination = t;
  }
  getTitle() {
    return this.title;
  }
  setTitle(t) {
    this.title = t;
  }
  toStringAttributes() {
    return "destination=" + this.destination + ", title=" + this.title;
  }
}
class Ke extends N {
  constructor(t = "", r = "", s = "") {
    super("link-reference-definition");
    i(this, "label", "");
    i(this, "destination", "");
    i(this, "title", "");
    this.label = t, this.destination = r, this.title = s;
  }
  accept(t) {
    t.visit(this);
  }
  getLabel() {
    return this.label;
  }
  setLabel(t) {
    this.label = t;
  }
  getDestination() {
    return this.destination;
  }
  setDestination(t) {
    this.destination = t;
  }
  getTitle() {
    return this.title;
  }
  setTitle(t) {
    this.title = t;
  }
}
class _ extends N {
  constructor() {
    super("list-item");
    i(this, "markerIndent");
    i(this, "contentIndent");
  }
  accept(t) {
    t.visit(this);
  }
  /**
   * Returns the indent of the marker such as "-" or "1." in columns (spaces or tab stop of 4) if available, or null
   * otherwise.
   * <p>
   * Some examples and their marker indent:
   * <pre>- Foo</pre>
   * Marker indent: 0
   * <pre> - Foo</pre>
   * Marker indent: 1
   * <pre>  1. Foo</pre>
   * Marker indent: 2
   */
  getMarkerIndent() {
    return this.markerIndent;
  }
  setMarkerIndent(t) {
    this.markerIndent = t;
  }
  /**
   * Returns the indent of the content in columns (spaces or tab stop of 4) if available, or null otherwise.
   * The content indent is counted from the beginning of the line and includes the marker on the first line.
   * <p>
   * Some examples and their content indent:
   * <pre>- Foo</pre>
   * Content indent: 2
   * <pre> - Foo</pre>
   * Content indent: 3
   * <pre>  1. Foo</pre>
   * Content indent: 5
   * <p>
   * Note that subsequent lines in the same list item need to be indented by at least the content indent to be counted
   * as part of the list item.
   */
  getContentIndent() {
    return this.contentIndent;
  }
  setContentIndent(t) {
    this.contentIndent = t;
  }
}
class V extends me {
  constructor() {
    super("ordered-list");
    i(this, "markerDelimiter");
    i(this, "markerStartNumber");
  }
  accept(t) {
    t.visit(this);
  }
  /**
   * @return the start number used in the marker, e.g. {@code 1}, if available, or null otherwise
   */
  getMarkerStartNumber() {
    return this.markerStartNumber;
  }
  setMarkerStartNumber(t) {
    this.markerStartNumber = t;
  }
  /**
   * @return the delimiter used in the marker, e.g. {@code .} or {@code )}, if available, or null otherwise
   */
  getMarkerDelimiter() {
    return this.markerDelimiter;
  }
  setMarkerDelimiter(t) {
    this.markerDelimiter = t;
  }
}
class M extends N {
  constructor() {
    super("paragraph");
  }
  accept(e) {
    e.visit(this);
  }
}
class ee extends U {
  constructor() {
    super("softline-break");
  }
  accept(e) {
    e.visit(this);
  }
}
class be extends U {
  constructor(t) {
    super("strong-emphasis");
    i(this, "delimiter");
    this.delimiter = t;
  }
  accept(t) {
    t.visit(this);
  }
  setDelimiter(t) {
    this.delimiter = t;
  }
  getOpeningDelimiter() {
    return this.delimiter;
  }
  getClosingDelimiter() {
    return this.delimiter;
  }
}
class A extends U {
  constructor(t) {
    super("text");
    i(this, "literal");
    this.literal = t;
  }
  accept(t) {
    t.visit(this);
  }
  getLiteral() {
    return this.literal;
  }
  setLiteral(t) {
    this.literal = t;
  }
  toStringAttributes() {
    return "literal=" + this.literal;
  }
}
class te extends N {
  constructor() {
    super("thematic-break");
    i(this, "literal");
  }
  accept(t) {
    t.visit(this);
  }
  /**
   * @return the source literal that represents this node, if available
   */
  getLiteral() {
    return this.literal;
  }
  setLiteral(t) {
    this.literal = t;
  }
}
class ne {
  constructor(e, t) {
    i(this, "content");
    i(this, "sourceSpan", null);
    this.content = e, this.sourceSpan = t;
  }
  static of(e, t) {
    return new ne(e, t);
  }
  getContent() {
    return this.content;
  }
  getSourceSpan() {
    return this.sourceSpan;
  }
  substring(e, t) {
    const r = this.content.substring(e, t);
    let s = null;
    if (this.sourceSpan !== null) {
      const n = t - e;
      if (n !== 0) {
        const a = this.sourceSpan.getColumnIndex() + e, l = this.sourceSpan.getInputIndex() + e;
        s = ce.of(
          this.sourceSpan.getLineIndex(),
          a,
          l,
          n
        );
      }
    }
    return ne.of(r, s);
  }
}
class K {
  getBlock() {
    throw new Error("Method not implemented.");
  }
  tryContinue(e) {
    return null;
  }
  isContainer() {
    return !1;
  }
  canHaveLazyContinuationLines() {
    return !1;
  }
  canContain(e) {
    return !1;
  }
  addLine(e) {
  }
  addSourceSpan(e) {
    this.getBlock().addSourceSpan(e);
  }
  getDefinitions() {
    return [];
  }
  closeBlock() {
  }
  parseInlines(e) {
  }
}
class b {
  static none() {
    return null;
  }
  static of(...e) {
    return new Tt(...e);
  }
}
class Ze {
  /**
   * Link not handled by processor.
   */
  static none() {
    return null;
  }
  /**
   * Wrap the link text in a node. This is the normal behavior for links, e.g. for this:
   * <pre><code>
   * [my *text*](destination)
   * </code></pre>
   * The text is {@code my *text*}, a text node and emphasis. The text is wrapped in a
   * {@link Link} node, which means the text is added as child nodes to it.
   *
   * @param node     the node to which the link text nodes will be added as child nodes
   * @param position the position to continue parsing from
   */
  static wrapTextIn(e, t) {
    return new ie(ie.Type.WRAP, e, t);
  }
  /**
   * Replace the link with a node. E.g. for this:
   * <pre><code>
   * [^foo]
   * </code></pre>
   * The processor could decide to create a {@code FootnoteReference} node instead which replaces the link.
   *
   * @param node     the node to replace the link with
   * @param position the position to continue parsing from
   */
  static replaceWith(e, t) {
    return new ie(ie.Type.REPLACE, e, t);
  }
}
class O {
  static none() {
    return null;
  }
  static of(e, t) {
    return new Dt(e, t);
  }
}
class Gt {
  constructor(e, t) {
    i(this, "lineIndex");
    i(this, "index");
    this.lineIndex = e, this.index = t;
  }
}
const Z = class Z {
  constructor(e, t, r) {
    // Lines without newlines at the end. The scanner will yield `\n` between lines because they're significant for
    // parsing and the final output. There is no `\n` after the last line.
    i(this, "lines");
    // Which line we're at.
    i(this, "lineIndex");
    // The index within the line. If index == length(), we pretend that there's a `\n` and only advance after we yield
    // that.
    i(this, "index");
    // Current line or "" if at the end of the lines (using "" instead of null saves a null check)
    i(this, "line", ne.of("", null));
    i(this, "lineLength", 0);
    this.lines = e, this.lineIndex = t, this.index = r, e.length !== 0 && (this.checkPosition(t, r), this.setLine(e[t]));
  }
  static of(e) {
    return new Z(e.getLines(), 0, 0);
  }
  peek() {
    return this.index < this.lineLength ? this.line.getContent().charAt(this.index) : this.lineIndex < this.lines.length - 1 ? `
` : Z.END;
  }
  peekCodePoint() {
    if (this.index < this.lineLength) {
      const e = this.line.getContent().charAt(this.index);
      if (P.isHighSurrogate(e.charCodeAt(0)) && this.index + 1 < this.lineLength) {
        const t = this.line.getContent().charAt(this.index + 1);
        if (P.isLowSurrogate(t.charCodeAt(0)))
          return P.toCodePoint(e.charCodeAt(0), t.charCodeAt(0));
      }
      return e.charCodeAt(0);
    } else
      return this.lineIndex < this.lines.length - 1 ? 10 : Z.END.charCodeAt(0);
  }
  peekPreviousCodePoint() {
    if (this.index > 0) {
      const e = this.index - 1, t = this.line.getContent().charAt(e);
      if (P.isLowSurrogate(t.charCodeAt(0)) && e > 0) {
        const r = this.line.getContent().charAt(e - 1);
        if (P.isHighSurrogate(r.charCodeAt(0)))
          return P.toCodePoint(r.charCodeAt(0), t.charCodeAt(0));
      }
      return t.charCodeAt(0);
    } else
      return this.lineIndex > 0 ? 10 : Z.END.charCodeAt(0);
  }
  hasNext() {
    return this.index < this.lineLength ? !0 : this.lineIndex < this.lines.length - 1;
  }
  /**
   * Check if we have the specified content on the line and advanced the position. Note that if you want to match
   * newline characters, use {@link #next(char)}.
   *
   * @param content the text content to match on a single line (excluding newline characters)
   * @return true if matched and position was advanced, false otherwise
   */
  next(e) {
    if (typeof e > "u")
      return this.index++, this.index > this.lineLength && (this.lineIndex++, this.lineIndex < this.lines.length ? this.setLine(this.lines[this.lineIndex]) : this.setLine(ne.of("", null)), this.index = 0), !0;
    if (this.index < this.lineLength && this.index + e.length <= this.lineLength) {
      for (let t = 0; t < e.length; t++)
        if (this.line.getContent().charAt(this.index + t) !== e.charAt(t))
          return !1;
      return this.index += e.length, !0;
    } else
      return !1;
  }
  matchMultiple(e) {
    let t = 0;
    for (; this.peek() === e; )
      t++, this.next();
    return t;
  }
  match(e) {
    let t = 0;
    for (; e.matches(this.peek()); )
      t++, this.next();
    return t;
  }
  whitespace() {
    let e = 0;
    for (; ; )
      switch (this.peek()) {
        case " ":
        case "	":
        case `
`:
        case "\v":
        case "\f":
        case "\r":
          e++, this.next();
          break;
        default:
          return e;
      }
  }
  find(e) {
    if (typeof e == "string") {
      let t = 0;
      for (; ; ) {
        const r = this.peek();
        if (r == Z.END)
          return -1;
        if (r == e)
          return t;
        t++, this.next();
      }
    } else {
      let t = 0;
      for (; ; ) {
        const r = this.peek();
        if (r == Z.END)
          return -1;
        if (e.matches(r))
          return t;
        t++, this.next();
      }
    }
  }
  // Don't expose the int index, because it would be good if we could switch input to a List<String> of lines later
  // instead of one contiguous String.
  position() {
    return new Gt(this.lineIndex, this.index);
  }
  setPosition(e) {
    this.checkPosition(e.lineIndex, e.index), this.lineIndex = e.lineIndex, this.index = e.index, this.setLine(this.lines[this.lineIndex]);
  }
  // For cases where the caller appends the result to a StringBuilder, we could offer another method to avoid some
  // unnecessary copying.
  getSource(e, t) {
    if (e.lineIndex === t.lineIndex) {
      const r = this.lines[e.lineIndex], s = r.getContent().substring(e.index, t.index);
      let n = null;
      const a = r.getSourceSpan();
      return a !== null && (n = a.subSpan(e.index, t.index)), q.of([ne.of(s, n)]);
    } else {
      let r = q.empty();
      const s = this.lines[e.lineIndex];
      r.addLine(
        s.substring(e.index, s.getContent().length)
      );
      for (let a = e.lineIndex + 1; a < t.lineIndex; a++)
        r.addLine(this.lines[a]);
      let n = this.lines[t.lineIndex];
      return r.addLine(n.substring(0, t.index)), r;
    }
  }
  setLine(e) {
    this.line = e, this.lineLength = e.getContent().length;
  }
  checkPosition(e, t) {
    if (e < 0 || e >= this.lines.length)
      throw new Error(
        "Line index " + e + " out of range, number of lines: " + this.lines.length
      );
    const r = this.lines[e];
    if (t < 0 || t > r.getContent().length)
      throw Error(
        "Index " + t + " out of range, line length: " + r.getContent().length
      );
  }
};
/**
 * Character representing the end of input source (or outside of the text in case of the "previous" methods).
 * <p>
 * Note that we can use NULL to represent this because CommonMark does not allow those in the input (we replace them
 * in the beginning of parsing).
 */
i(Z, "END", ae(0));
let se = Z;
class Be extends w {
  constructor(t, r, s) {
    super();
    i(this, "newIndex");
    i(this, "newColumn");
    i(this, "finalize");
    this.newIndex = t, this.newColumn = r, this.finalize = s;
  }
  getNewIndex() {
    return this.newIndex;
  }
  getNewColumn() {
    return this.newColumn;
  }
  isFinalize() {
    return this.finalize;
  }
}
class T {
  static columnsToNextTabStop(e) {
    return 4 - e % 4;
  }
}
i(T, "CODE_BLOCK_INDENT", 4);
class m {
  static find(e, t, r) {
    let s = t.length;
    for (let n = r; n < s; n++)
      if (t.charAt(n) === e)
        return n;
    return -1;
  }
  static findLineBreak(e, t) {
    let r = e.length;
    for (let s = t; s < r; s++)
      switch (e.charAt(s)) {
        case `
`:
        case "\r":
          return s;
      }
    return -1;
  }
  /**
   * @see <a href="https://spec.commonmark.org/0.31.2/#blank-line">blank line</a>
   */
  static isBlank(e) {
    return m.skipSpaceTab(e, 0, e.length) === e.length;
  }
  static hasNonSpace(e) {
    let t = e.length;
    return m.skip(" ", e, 0, t) !== t;
  }
  static isLetter(e, t) {
    return P.isLetter(e[t]);
  }
  static isSpaceOrTab(e, t) {
    if (t < e.length)
      switch (e.charAt(t)) {
        case " ":
        case "	":
          return !0;
      }
    return !1;
  }
  /**
   * @see <a href="https://spec.commonmark.org/0.31.2/#unicode-punctuation-character">Unicode punctuation character</a>
   */
  static isPunctuationCodePoint(e) {
    const t = ae(e);
    switch (!0) {
      // General category "P" (punctuation)
      // 类别为 P
      case P.isUnicodeCharOfCategory(P.UnicodeCategory.P, t):
      // General category "S" (symbol)
      // 类别为 S
      case P.isUnicodeCharOfCategory(P.UnicodeCategory.S, t):
        return !0;
      default:
        return !1;
    }
  }
  /**
   * Check whether the provided code point is a Unicode whitespace character as defined in the spec.
   *
   * @see <a href="https://spec.commonmark.org/0.31.2/#unicode-whitespace-character">Unicode whitespace character</a>
   */
  static isWhitespaceCodePoint(e) {
    const t = ae(e);
    switch (t) {
      case " ":
      case "	":
      case `
`:
      case "\f":
      case "\r":
        return !0;
      default:
        return P.isUnicodeCharOfCategory(
          P.UnicodeCategory.Zs,
          t
        );
    }
  }
  static skip(e, t, r, s) {
    for (let n = r; n < s; n++)
      if (t.charAt(n) !== e)
        return n;
    return s;
  }
  static skipBackwards(e, t, r, s) {
    for (let n = r; n >= s; n--)
      if (t.charAt(n) !== e)
        return n;
    return s - 1;
  }
  static skipSpaceTab(e, t, r) {
    for (let s = t; s < r; s++)
      switch (e.charAt(s)) {
        case " ":
        case "	":
          break;
        default:
          return s;
      }
    return r;
  }
  static skipSpaceTabBackwards(e, t, r) {
    for (let s = t; s >= r; s--)
      switch (e.charAt(s)) {
        case " ":
        case "	":
          break;
        default:
          return s;
      }
    return r - 1;
  }
}
class Ie {
  constructor(e) {
    i(this, "set");
    this.set = e;
  }
  c(e) {
    if (e.charCodeAt(0) > 127)
      throw Error("Can only match ASCII characters");
    return this.set.set(e.charCodeAt(0)), this;
  }
  anyOf(e) {
    if (typeof e == "string")
      for (let t = 0; t < e.length; t++)
        this.c(e.charAt(t));
    else
      for (const t of e)
        this.c(t);
    return this;
  }
  range(e, t) {
    for (let r = e.charCodeAt(0); r <= t.charCodeAt(0); r++)
      this.c(ae(r));
    return this;
  }
  build() {
    return new R(this);
  }
}
class R {
  constructor(e) {
    i(this, "set");
    this.set = e.set;
  }
  matches(e) {
    return this.set.get(e.charCodeAt(0));
  }
  newBuilder() {
    return new Ie(this.set.clone());
  }
  static builder(e) {
    return e ? new Ie(e.set.clone()) : new Ie(new Ge());
  }
}
i(R, "Builder", Ie);
let Wt = class {
  tryStart(e, t) {
    const r = e.getNextNonSpaceIndex();
    if (Te.isMarker(e, r)) {
      let s = e.getColumn() + e.getIndent() + 1;
      return m.isSpaceOrTab(e.getLine().getContent(), r + 1) && s++, b.of(new Te()).atColumn(s);
    } else
      return b.none();
  }
};
const He = class He extends K {
  constructor() {
    super(...arguments);
    i(this, "block", new Q());
  }
  isContainer() {
    return !0;
  }
  canContain(t) {
    return !0;
  }
  getBlock() {
    return this.block;
  }
  tryContinue(t) {
    const r = t.getNextNonSpaceIndex();
    if (He.isMarker(t, r)) {
      let s = t.getColumn() + t.getIndent() + 1;
      return m.isSpaceOrTab(t.getLine().getContent(), r + 1) && s++, w.atColumn(s);
    } else
      return w.none();
  }
  static isMarker(t, r) {
    const s = t.getLine().getContent();
    return t.getIndent() < T.CODE_BLOCK_INDENT && r < s.length && s.charAt(r) === ">";
  }
};
i(He, "Factory", Wt);
let Te = He;
class Tt extends b {
  constructor(...t) {
    super();
    i(this, "blockParsers");
    i(this, "newIndex", -1);
    i(this, "newColumn", -1);
    i(this, "replaceActiveBlockParser", !1);
    this.blockParsers = t;
  }
  getBlockParsers() {
    return this.blockParsers;
  }
  getNewIndex() {
    return this.newIndex;
  }
  getNewColumn() {
    return this.newColumn;
  }
  isReplaceActiveBlockParser() {
    return this.replaceActiveBlockParser;
  }
  atIndex(t) {
    return this.newIndex = t, this;
  }
  atColumn(t) {
    return this.newColumn = t, this;
  }
  setReplaceActiveBlockParser() {
    return this.replaceActiveBlockParser = !0, this;
  }
}
class Ee {
  constructor(e, t, r, s, n, a, l) {
    /**
     * The node of a marker such as {@code !} if present, null otherwise.
     */
    i(this, "markerNode");
    /**
     * The position of the marker if present, null otherwise.
     */
    i(this, "markerPosition");
    /**
     * The node of {@code [}.
     */
    i(this, "bracketNode");
    /**
     * The position of {@code [}.
     */
    i(this, "bracketPosition");
    /**
     * The position of the content (after the opening bracket)
     */
    i(this, "contentPosition");
    /**
     * Previous bracket.
     */
    i(this, "previous");
    /**
     * Previous delimiter (emphasis, etc) before this bracket.
     */
    i(this, "previousDelimiter");
    /**
     * Whether this bracket is allowed to form a link/image (also known as "active").
     */
    i(this, "allowed", !0);
    /**
     * Whether there is an unescaped bracket (opening or closing) after this opening bracket in the text parsed so far.
     */
    i(this, "bracketAfter", !1);
    this.markerNode = e, this.markerPosition = t, this.bracketNode = r, this.bracketPosition = s, this.contentPosition = n, this.previous = a, this.previousDelimiter = l;
  }
  static link(e, t, r, s, n) {
    return new Ee(
      null,
      null,
      e,
      t,
      r,
      s,
      n
    );
  }
  static withMarker(e, t, r, s, n, a, l) {
    return new Ee(
      e,
      t,
      r,
      s,
      n,
      a,
      l
    );
  }
}
class Et {
  constructor() {
    i(this, "definitionsByType", /* @__PURE__ */ new Map());
  }
  addDefinitions(e) {
    const t = this.getMap(e.getType());
    t ? t.addAll(e) : this.definitionsByType.set(e.getType(), e);
  }
  getDefinition(e, t) {
    let r = this.getMap(e);
    return r && r.get(t) || null;
  }
  getMap(e) {
    return this.definitionsByType.get(e) || null;
  }
}
class Kt {
  constructor(e, t, r, s, n) {
    i(this, "characters");
    i(this, "delimiterChar");
    i(this, "originalLength");
    // Can open emphasis, see spec.
    i(this, "canOpen");
    // Can close emphasis, see spec.
    i(this, "canClose");
    i(this, "previous", null);
    i(this, "next", null);
    this.characters = e, this.delimiterChar = t, this.canOpen = r, this.canClose = s, this.previous = n, this.originalLength = e.length;
  }
  getCanOpen() {
    return this.canOpen;
  }
  getCanClose() {
    return this.canClose;
  }
  length() {
    return this.characters.length;
  }
  getOriginalLength() {
    return this.originalLength;
  }
  getOpener() {
    return this.characters[this.characters.length - 1];
  }
  getCloser() {
    return this.characters[0];
  }
  getOpeners(e) {
    if (!(e >= 1 && e <= this.length()))
      throw Error(
        "length must be between 1 and " + this.length() + ", was " + e
      );
    return this.characters.slice(
      this.characters.length - e,
      this.characters.length
    );
  }
  getClosers(e) {
    if (!(e >= 1 && e <= this.length()))
      throw Error(
        "length must be between 1 and " + this.length() + ", was " + e
      );
    return this.characters.slice(0, e);
  }
}
class Zt extends K {
  constructor() {
    super(...arguments);
    i(this, "document", new pe());
  }
  isContainer() {
    return !0;
  }
  canContain(t) {
    return !0;
  }
  getBlock() {
    return this.document;
  }
  tryContinue(t) {
    return w.atIndex(t.getIndex());
  }
  addLine(t) {
  }
}
const $t = /* @__PURE__ */ new Map([
  ["Aacute", "Á"],
  ["aacute", "á"],
  ["Abreve", "Ă"],
  ["abreve", "ă"],
  ["ac", "∾"],
  ["acd", "∿"],
  ["acE", "∾̳"],
  ["Acirc", "Â"],
  ["acirc", "â"],
  ["acute", "´"],
  ["Acy", "А"],
  ["acy", "а"],
  ["AElig", "Æ"],
  ["aelig", "æ"],
  ["af", "⁡"],
  ["Afr", "𝔄"],
  ["afr", "𝔞"],
  ["Agrave", "À"],
  ["agrave", "à"],
  ["alefsym", "ℵ"],
  ["aleph", "ℵ"],
  ["Alpha", "Α"],
  ["alpha", "α"],
  ["Amacr", "Ā"],
  ["amacr", "ā"],
  ["amalg", "⨿"],
  ["amp", "&"],
  ["AMP", "&"],
  ["andand", "⩕"],
  ["And", "⩓"],
  ["and", "∧"],
  ["andd", "⩜"],
  ["andslope", "⩘"],
  ["andv", "⩚"],
  ["ang", "∠"],
  ["ange", "⦤"],
  ["angle", "∠"],
  ["angmsdaa", "⦨"],
  ["angmsdab", "⦩"],
  ["angmsdac", "⦪"],
  ["angmsdad", "⦫"],
  ["angmsdae", "⦬"],
  ["angmsdaf", "⦭"],
  ["angmsdag", "⦮"],
  ["angmsdah", "⦯"],
  ["angmsd", "∡"],
  ["angrt", "∟"],
  ["angrtvb", "⊾"],
  ["angrtvbd", "⦝"],
  ["angsph", "∢"],
  ["angst", "Å"],
  ["angzarr", "⍼"],
  ["Aogon", "Ą"],
  ["aogon", "ą"],
  ["Aopf", "𝔸"],
  ["aopf", "𝕒"],
  ["apacir", "⩯"],
  ["ap", "≈"],
  ["apE", "⩰"],
  ["ape", "≊"],
  ["apid", "≋"],
  ["apos", "'"],
  ["ApplyFunction", "⁡"],
  ["approx", "≈"],
  ["approxeq", "≊"],
  ["Aring", "Å"],
  ["aring", "å"],
  ["Ascr", "𝒜"],
  ["ascr", "𝒶"],
  ["Assign", "≔"],
  ["ast", "*"],
  ["asymp", "≈"],
  ["asympeq", "≍"],
  ["Atilde", "Ã"],
  ["atilde", "ã"],
  ["Auml", "Ä"],
  ["auml", "ä"],
  ["awconint", "∳"],
  ["awint", "⨑"],
  ["backcong", "≌"],
  ["backepsilon", "϶"],
  ["backprime", "‵"],
  ["backsim", "∽"],
  ["backsimeq", "⋍"],
  ["Backslash", "∖"],
  ["Barv", "⫧"],
  ["barvee", "⊽"],
  ["barwed", "⌅"],
  ["Barwed", "⌆"],
  ["barwedge", "⌅"],
  ["bbrk", "⎵"],
  ["bbrktbrk", "⎶"],
  ["bcong", "≌"],
  ["Bcy", "Б"],
  ["bcy", "б"],
  ["bdquo", "„"],
  ["becaus", "∵"],
  ["because", "∵"],
  ["Because", "∵"],
  ["bemptyv", "⦰"],
  ["bepsi", "϶"],
  ["bernou", "ℬ"],
  ["Bernoullis", "ℬ"],
  ["Beta", "Β"],
  ["beta", "β"],
  ["beth", "ℶ"],
  ["between", "≬"],
  ["Bfr", "𝔅"],
  ["bfr", "𝔟"],
  ["bigcap", "⋂"],
  ["bigcirc", "◯"],
  ["bigcup", "⋃"],
  ["bigodot", "⨀"],
  ["bigoplus", "⨁"],
  ["bigotimes", "⨂"],
  ["bigsqcup", "⨆"],
  ["bigstar", "★"],
  ["bigtriangledown", "▽"],
  ["bigtriangleup", "△"],
  ["biguplus", "⨄"],
  ["bigvee", "⋁"],
  ["bigwedge", "⋀"],
  ["bkarow", "⤍"],
  ["blacklozenge", "⧫"],
  ["blacksquare", "▪"],
  ["blacktriangle", "▴"],
  ["blacktriangledown", "▾"],
  ["blacktriangleleft", "◂"],
  ["blacktriangleright", "▸"],
  ["blank", "␣"],
  ["blk12", "▒"],
  ["blk14", "░"],
  ["blk34", "▓"],
  ["block", "█"],
  ["bne", "=⃥"],
  ["bnequiv", "≡⃥"],
  ["bNot", "⫭"],
  ["bnot", "⌐"],
  ["Bopf", "𝔹"],
  ["bopf", "𝕓"],
  ["bot", "⊥"],
  ["bottom", "⊥"],
  ["bowtie", "⋈"],
  ["boxbox", "⧉"],
  ["boxdl", "┐"],
  ["boxdL", "╕"],
  ["boxDl", "╖"],
  ["boxDL", "╗"],
  ["boxdr", "┌"],
  ["boxdR", "╒"],
  ["boxDr", "╓"],
  ["boxDR", "╔"],
  ["boxh", "─"],
  ["boxH", "═"],
  ["boxhd", "┬"],
  ["boxHd", "╤"],
  ["boxhD", "╥"],
  ["boxHD", "╦"],
  ["boxhu", "┴"],
  ["boxHu", "╧"],
  ["boxhU", "╨"],
  ["boxHU", "╩"],
  ["boxminus", "⊟"],
  ["boxplus", "⊞"],
  ["boxtimes", "⊠"],
  ["boxul", "┘"],
  ["boxuL", "╛"],
  ["boxUl", "╜"],
  ["boxUL", "╝"],
  ["boxur", "└"],
  ["boxuR", "╘"],
  ["boxUr", "╙"],
  ["boxUR", "╚"],
  ["boxv", "│"],
  ["boxV", "║"],
  ["boxvh", "┼"],
  ["boxvH", "╪"],
  ["boxVh", "╫"],
  ["boxVH", "╬"],
  ["boxvl", "┤"],
  ["boxvL", "╡"],
  ["boxVl", "╢"],
  ["boxVL", "╣"],
  ["boxvr", "├"],
  ["boxvR", "╞"],
  ["boxVr", "╟"],
  ["boxVR", "╠"],
  ["bprime", "‵"],
  ["breve", "˘"],
  ["Breve", "˘"],
  ["brvbar", "¦"],
  ["bscr", "𝒷"],
  ["Bscr", "ℬ"],
  ["bsemi", "⁏"],
  ["bsim", "∽"],
  ["bsime", "⋍"],
  ["bsolb", "⧅"],
  ["bsol", "\\"],
  ["bsolhsub", "⟈"],
  ["bull", "•"],
  ["bullet", "•"],
  ["bump", "≎"],
  ["bumpE", "⪮"],
  ["bumpe", "≏"],
  ["Bumpeq", "≎"],
  ["bumpeq", "≏"],
  ["Cacute", "Ć"],
  ["cacute", "ć"],
  ["capand", "⩄"],
  ["capbrcup", "⩉"],
  ["capcap", "⩋"],
  ["cap", "∩"],
  ["Cap", "⋒"],
  ["capcup", "⩇"],
  ["capdot", "⩀"],
  ["CapitalDifferentialD", "ⅅ"],
  ["caps", "∩︀"],
  ["caret", "⁁"],
  ["caron", "ˇ"],
  ["Cayleys", "ℭ"],
  ["ccaps", "⩍"],
  ["Ccaron", "Č"],
  ["ccaron", "č"],
  ["Ccedil", "Ç"],
  ["ccedil", "ç"],
  ["Ccirc", "Ĉ"],
  ["ccirc", "ĉ"],
  ["Cconint", "∰"],
  ["ccups", "⩌"],
  ["ccupssm", "⩐"],
  ["Cdot", "Ċ"],
  ["cdot", "ċ"],
  ["cedil", "¸"],
  ["Cedilla", "¸"],
  ["cemptyv", "⦲"],
  ["cent", "¢"],
  ["centerdot", "·"],
  ["CenterDot", "·"],
  ["cfr", "𝔠"],
  ["Cfr", "ℭ"],
  ["CHcy", "Ч"],
  ["chcy", "ч"],
  ["check", "✓"],
  ["checkmark", "✓"],
  ["Chi", "Χ"],
  ["chi", "χ"],
  ["circ", "ˆ"],
  ["circeq", "≗"],
  ["circlearrowleft", "↺"],
  ["circlearrowright", "↻"],
  ["circledast", "⊛"],
  ["circledcirc", "⊚"],
  ["circleddash", "⊝"],
  ["CircleDot", "⊙"],
  ["circledR", "®"],
  ["circledS", "Ⓢ"],
  ["CircleMinus", "⊖"],
  ["CirclePlus", "⊕"],
  ["CircleTimes", "⊗"],
  ["cir", "○"],
  ["cirE", "⧃"],
  ["cire", "≗"],
  ["cirfnint", "⨐"],
  ["cirmid", "⫯"],
  ["cirscir", "⧂"],
  ["ClockwiseContourIntegral", "∲"],
  ["CloseCurlyDoubleQuote", "”"],
  ["CloseCurlyQuote", "’"],
  ["clubs", "♣"],
  ["clubsuit", "♣"],
  ["colon", ":"],
  ["Colon", "∷"],
  ["Colone", "⩴"],
  ["colone", "≔"],
  ["coloneq", "≔"],
  ["comma", ","],
  ["commat", "@"],
  ["comp", "∁"],
  ["compfn", "∘"],
  ["complement", "∁"],
  ["complexes", "ℂ"],
  ["cong", "≅"],
  ["congdot", "⩭"],
  ["Congruent", "≡"],
  ["conint", "∮"],
  ["Conint", "∯"],
  ["ContourIntegral", "∮"],
  ["copf", "𝕔"],
  ["Copf", "ℂ"],
  ["coprod", "∐"],
  ["Coproduct", "∐"],
  ["copy", "©"],
  ["COPY", "©"],
  ["copysr", "℗"],
  ["CounterClockwiseContourIntegral", "∳"],
  ["crarr", "↵"],
  ["cross", "✗"],
  ["Cross", "⨯"],
  ["Cscr", "𝒞"],
  ["cscr", "𝒸"],
  ["csub", "⫏"],
  ["csube", "⫑"],
  ["csup", "⫐"],
  ["csupe", "⫒"],
  ["ctdot", "⋯"],
  ["cudarrl", "⤸"],
  ["cudarrr", "⤵"],
  ["cuepr", "⋞"],
  ["cuesc", "⋟"],
  ["cularr", "↶"],
  ["cularrp", "⤽"],
  ["cupbrcap", "⩈"],
  ["cupcap", "⩆"],
  ["CupCap", "≍"],
  ["cup", "∪"],
  ["Cup", "⋓"],
  ["cupcup", "⩊"],
  ["cupdot", "⊍"],
  ["cupor", "⩅"],
  ["cups", "∪︀"],
  ["curarr", "↷"],
  ["curarrm", "⤼"],
  ["curlyeqprec", "⋞"],
  ["curlyeqsucc", "⋟"],
  ["curlyvee", "⋎"],
  ["curlywedge", "⋏"],
  ["curren", "¤"],
  ["curvearrowleft", "↶"],
  ["curvearrowright", "↷"],
  ["cuvee", "⋎"],
  ["cuwed", "⋏"],
  ["cwconint", "∲"],
  ["cwint", "∱"],
  ["cylcty", "⌭"],
  ["dagger", "†"],
  ["Dagger", "‡"],
  ["daleth", "ℸ"],
  ["darr", "↓"],
  ["Darr", "↡"],
  ["dArr", "⇓"],
  ["dash", "‐"],
  ["Dashv", "⫤"],
  ["dashv", "⊣"],
  ["dbkarow", "⤏"],
  ["dblac", "˝"],
  ["Dcaron", "Ď"],
  ["dcaron", "ď"],
  ["Dcy", "Д"],
  ["dcy", "д"],
  ["ddagger", "‡"],
  ["ddarr", "⇊"],
  ["DD", "ⅅ"],
  ["dd", "ⅆ"],
  ["DDotrahd", "⤑"],
  ["ddotseq", "⩷"],
  ["deg", "°"],
  ["Del", "∇"],
  ["Delta", "Δ"],
  ["delta", "δ"],
  ["demptyv", "⦱"],
  ["dfisht", "⥿"],
  ["Dfr", "𝔇"],
  ["dfr", "𝔡"],
  ["dHar", "⥥"],
  ["dharl", "⇃"],
  ["dharr", "⇂"],
  ["DiacriticalAcute", "´"],
  ["DiacriticalDot", "˙"],
  ["DiacriticalDoubleAcute", "˝"],
  ["DiacriticalGrave", "`"],
  ["DiacriticalTilde", "˜"],
  ["diam", "⋄"],
  ["diamond", "⋄"],
  ["Diamond", "⋄"],
  ["diamondsuit", "♦"],
  ["diams", "♦"],
  ["die", "¨"],
  ["DifferentialD", "ⅆ"],
  ["digamma", "ϝ"],
  ["disin", "⋲"],
  ["div", "÷"],
  ["divide", "÷"],
  ["divideontimes", "⋇"],
  ["divonx", "⋇"],
  ["DJcy", "Ђ"],
  ["djcy", "ђ"],
  ["dlcorn", "⌞"],
  ["dlcrop", "⌍"],
  ["dollar", "$"],
  ["Dopf", "𝔻"],
  ["dopf", "𝕕"],
  ["Dot", "¨"],
  ["dot", "˙"],
  ["DotDot", "⃜"],
  ["doteq", "≐"],
  ["doteqdot", "≑"],
  ["DotEqual", "≐"],
  ["dotminus", "∸"],
  ["dotplus", "∔"],
  ["dotsquare", "⊡"],
  ["doublebarwedge", "⌆"],
  ["DoubleContourIntegral", "∯"],
  ["DoubleDot", "¨"],
  ["DoubleDownArrow", "⇓"],
  ["DoubleLeftArrow", "⇐"],
  ["DoubleLeftRightArrow", "⇔"],
  ["DoubleLeftTee", "⫤"],
  ["DoubleLongLeftArrow", "⟸"],
  ["DoubleLongLeftRightArrow", "⟺"],
  ["DoubleLongRightArrow", "⟹"],
  ["DoubleRightArrow", "⇒"],
  ["DoubleRightTee", "⊨"],
  ["DoubleUpArrow", "⇑"],
  ["DoubleUpDownArrow", "⇕"],
  ["DoubleVerticalBar", "∥"],
  ["DownArrowBar", "⤓"],
  ["downarrow", "↓"],
  ["DownArrow", "↓"],
  ["Downarrow", "⇓"],
  ["DownArrowUpArrow", "⇵"],
  ["DownBreve", "̑"],
  ["downdownarrows", "⇊"],
  ["downharpoonleft", "⇃"],
  ["downharpoonright", "⇂"],
  ["DownLeftRightVector", "⥐"],
  ["DownLeftTeeVector", "⥞"],
  ["DownLeftVectorBar", "⥖"],
  ["DownLeftVector", "↽"],
  ["DownRightTeeVector", "⥟"],
  ["DownRightVectorBar", "⥗"],
  ["DownRightVector", "⇁"],
  ["DownTeeArrow", "↧"],
  ["DownTee", "⊤"],
  ["drbkarow", "⤐"],
  ["drcorn", "⌟"],
  ["drcrop", "⌌"],
  ["Dscr", "𝒟"],
  ["dscr", "𝒹"],
  ["DScy", "Ѕ"],
  ["dscy", "ѕ"],
  ["dsol", "⧶"],
  ["Dstrok", "Đ"],
  ["dstrok", "đ"],
  ["dtdot", "⋱"],
  ["dtri", "▿"],
  ["dtrif", "▾"],
  ["duarr", "⇵"],
  ["duhar", "⥯"],
  ["dwangle", "⦦"],
  ["DZcy", "Џ"],
  ["dzcy", "џ"],
  ["dzigrarr", "⟿"],
  ["Eacute", "É"],
  ["eacute", "é"],
  ["easter", "⩮"],
  ["Ecaron", "Ě"],
  ["ecaron", "ě"],
  ["Ecirc", "Ê"],
  ["ecirc", "ê"],
  ["ecir", "≖"],
  ["ecolon", "≕"],
  ["Ecy", "Э"],
  ["ecy", "э"],
  ["eDDot", "⩷"],
  ["Edot", "Ė"],
  ["edot", "ė"],
  ["eDot", "≑"],
  ["ee", "ⅇ"],
  ["efDot", "≒"],
  ["Efr", "𝔈"],
  ["efr", "𝔢"],
  ["eg", "⪚"],
  ["Egrave", "È"],
  ["egrave", "è"],
  ["egs", "⪖"],
  ["egsdot", "⪘"],
  ["el", "⪙"],
  ["Element", "∈"],
  ["elinters", "⏧"],
  ["ell", "ℓ"],
  ["els", "⪕"],
  ["elsdot", "⪗"],
  ["Emacr", "Ē"],
  ["emacr", "ē"],
  ["empty", "∅"],
  ["emptyset", "∅"],
  ["EmptySmallSquare", "◻"],
  ["emptyv", "∅"],
  ["EmptyVerySmallSquare", "▫"],
  ["emsp13", " "],
  ["emsp14", " "],
  ["emsp", " "],
  ["ENG", "Ŋ"],
  ["eng", "ŋ"],
  ["ensp", " "],
  ["Eogon", "Ę"],
  ["eogon", "ę"],
  ["Eopf", "𝔼"],
  ["eopf", "𝕖"],
  ["epar", "⋕"],
  ["eparsl", "⧣"],
  ["eplus", "⩱"],
  ["epsi", "ε"],
  ["Epsilon", "Ε"],
  ["epsilon", "ε"],
  ["epsiv", "ϵ"],
  ["eqcirc", "≖"],
  ["eqcolon", "≕"],
  ["eqsim", "≂"],
  ["eqslantgtr", "⪖"],
  ["eqslantless", "⪕"],
  ["Equal", "⩵"],
  ["equals", "="],
  ["EqualTilde", "≂"],
  ["equest", "≟"],
  ["Equilibrium", "⇌"],
  ["equiv", "≡"],
  ["equivDD", "⩸"],
  ["eqvparsl", "⧥"],
  ["erarr", "⥱"],
  ["erDot", "≓"],
  ["escr", "ℯ"],
  ["Escr", "ℰ"],
  ["esdot", "≐"],
  ["Esim", "⩳"],
  ["esim", "≂"],
  ["Eta", "Η"],
  ["eta", "η"],
  ["ETH", "Ð"],
  ["eth", "ð"],
  ["Euml", "Ë"],
  ["euml", "ë"],
  ["euro", "€"],
  ["excl", "!"],
  ["exist", "∃"],
  ["Exists", "∃"],
  ["expectation", "ℰ"],
  ["exponentiale", "ⅇ"],
  ["ExponentialE", "ⅇ"],
  ["fallingdotseq", "≒"],
  ["Fcy", "Ф"],
  ["fcy", "ф"],
  ["female", "♀"],
  ["ffilig", "ﬃ"],
  ["fflig", "ﬀ"],
  ["ffllig", "ﬄ"],
  ["Ffr", "𝔉"],
  ["ffr", "𝔣"],
  ["filig", "ﬁ"],
  ["FilledSmallSquare", "◼"],
  ["FilledVerySmallSquare", "▪"],
  ["fjlig", "fj"],
  ["flat", "♭"],
  ["fllig", "ﬂ"],
  ["fltns", "▱"],
  ["fnof", "ƒ"],
  ["Fopf", "𝔽"],
  ["fopf", "𝕗"],
  ["forall", "∀"],
  ["ForAll", "∀"],
  ["fork", "⋔"],
  ["forkv", "⫙"],
  ["Fouriertrf", "ℱ"],
  ["fpartint", "⨍"],
  ["frac12", "½"],
  ["frac13", "⅓"],
  ["frac14", "¼"],
  ["frac15", "⅕"],
  ["frac16", "⅙"],
  ["frac18", "⅛"],
  ["frac23", "⅔"],
  ["frac25", "⅖"],
  ["frac34", "¾"],
  ["frac35", "⅗"],
  ["frac38", "⅜"],
  ["frac45", "⅘"],
  ["frac56", "⅚"],
  ["frac58", "⅝"],
  ["frac78", "⅞"],
  ["frasl", "⁄"],
  ["frown", "⌢"],
  ["fscr", "𝒻"],
  ["Fscr", "ℱ"],
  ["gacute", "ǵ"],
  ["Gamma", "Γ"],
  ["gamma", "γ"],
  ["Gammad", "Ϝ"],
  ["gammad", "ϝ"],
  ["gap", "⪆"],
  ["Gbreve", "Ğ"],
  ["gbreve", "ğ"],
  ["Gcedil", "Ģ"],
  ["Gcirc", "Ĝ"],
  ["gcirc", "ĝ"],
  ["Gcy", "Г"],
  ["gcy", "г"],
  ["Gdot", "Ġ"],
  ["gdot", "ġ"],
  ["ge", "≥"],
  ["gE", "≧"],
  ["gEl", "⪌"],
  ["gel", "⋛"],
  ["geq", "≥"],
  ["geqq", "≧"],
  ["geqslant", "⩾"],
  ["gescc", "⪩"],
  ["ges", "⩾"],
  ["gesdot", "⪀"],
  ["gesdoto", "⪂"],
  ["gesdotol", "⪄"],
  ["gesl", "⋛︀"],
  ["gesles", "⪔"],
  ["Gfr", "𝔊"],
  ["gfr", "𝔤"],
  ["gg", "≫"],
  ["Gg", "⋙"],
  ["ggg", "⋙"],
  ["gimel", "ℷ"],
  ["GJcy", "Ѓ"],
  ["gjcy", "ѓ"],
  ["gla", "⪥"],
  ["gl", "≷"],
  ["glE", "⪒"],
  ["glj", "⪤"],
  ["gnap", "⪊"],
  ["gnapprox", "⪊"],
  ["gne", "⪈"],
  ["gnE", "≩"],
  ["gneq", "⪈"],
  ["gneqq", "≩"],
  ["gnsim", "⋧"],
  ["Gopf", "𝔾"],
  ["gopf", "𝕘"],
  ["grave", "`"],
  ["GreaterEqual", "≥"],
  ["GreaterEqualLess", "⋛"],
  ["GreaterFullEqual", "≧"],
  ["GreaterGreater", "⪢"],
  ["GreaterLess", "≷"],
  ["GreaterSlantEqual", "⩾"],
  ["GreaterTilde", "≳"],
  ["Gscr", "𝒢"],
  ["gscr", "ℊ"],
  ["gsim", "≳"],
  ["gsime", "⪎"],
  ["gsiml", "⪐"],
  ["gtcc", "⪧"],
  ["gtcir", "⩺"],
  ["gt", ">"],
  ["GT", ">"],
  ["Gt", "≫"],
  ["gtdot", "⋗"],
  ["gtlPar", "⦕"],
  ["gtquest", "⩼"],
  ["gtrapprox", "⪆"],
  ["gtrarr", "⥸"],
  ["gtrdot", "⋗"],
  ["gtreqless", "⋛"],
  ["gtreqqless", "⪌"],
  ["gtrless", "≷"],
  ["gtrsim", "≳"],
  ["gvertneqq", "≩︀"],
  ["gvnE", "≩︀"],
  ["Hacek", "ˇ"],
  ["hairsp", " "],
  ["half", "½"],
  ["hamilt", "ℋ"],
  ["HARDcy", "Ъ"],
  ["hardcy", "ъ"],
  ["harrcir", "⥈"],
  ["harr", "↔"],
  ["hArr", "⇔"],
  ["harrw", "↭"],
  ["Hat", "^"],
  ["hbar", "ℏ"],
  ["Hcirc", "Ĥ"],
  ["hcirc", "ĥ"],
  ["hearts", "♥"],
  ["heartsuit", "♥"],
  ["hellip", "…"],
  ["hercon", "⊹"],
  ["hfr", "𝔥"],
  ["Hfr", "ℌ"],
  ["HilbertSpace", "ℋ"],
  ["hksearow", "⤥"],
  ["hkswarow", "⤦"],
  ["hoarr", "⇿"],
  ["homtht", "∻"],
  ["hookleftarrow", "↩"],
  ["hookrightarrow", "↪"],
  ["hopf", "𝕙"],
  ["Hopf", "ℍ"],
  ["horbar", "―"],
  ["HorizontalLine", "─"],
  ["hscr", "𝒽"],
  ["Hscr", "ℋ"],
  ["hslash", "ℏ"],
  ["Hstrok", "Ħ"],
  ["hstrok", "ħ"],
  ["HumpDownHump", "≎"],
  ["HumpEqual", "≏"],
  ["hybull", "⁃"],
  ["hyphen", "‐"],
  ["Iacute", "Í"],
  ["iacute", "í"],
  ["ic", "⁣"],
  ["Icirc", "Î"],
  ["icirc", "î"],
  ["Icy", "И"],
  ["icy", "и"],
  ["Idot", "İ"],
  ["IEcy", "Е"],
  ["iecy", "е"],
  ["iexcl", "¡"],
  ["iff", "⇔"],
  ["ifr", "𝔦"],
  ["Ifr", "ℑ"],
  ["Igrave", "Ì"],
  ["igrave", "ì"],
  ["ii", "ⅈ"],
  ["iiiint", "⨌"],
  ["iiint", "∭"],
  ["iinfin", "⧜"],
  ["iiota", "℩"],
  ["IJlig", "Ĳ"],
  ["ijlig", "ĳ"],
  ["Imacr", "Ī"],
  ["imacr", "ī"],
  ["image", "ℑ"],
  ["ImaginaryI", "ⅈ"],
  ["imagline", "ℐ"],
  ["imagpart", "ℑ"],
  ["imath", "ı"],
  ["Im", "ℑ"],
  ["imof", "⊷"],
  ["imped", "Ƶ"],
  ["Implies", "⇒"],
  ["incare", "℅"],
  ["in", "∈"],
  ["infin", "∞"],
  ["infintie", "⧝"],
  ["inodot", "ı"],
  ["intcal", "⊺"],
  ["int", "∫"],
  ["Int", "∬"],
  ["integers", "ℤ"],
  ["Integral", "∫"],
  ["intercal", "⊺"],
  ["Intersection", "⋂"],
  ["intlarhk", "⨗"],
  ["intprod", "⨼"],
  ["InvisibleComma", "⁣"],
  ["InvisibleTimes", "⁢"],
  ["IOcy", "Ё"],
  ["iocy", "ё"],
  ["Iogon", "Į"],
  ["iogon", "į"],
  ["Iopf", "𝕀"],
  ["iopf", "𝕚"],
  ["Iota", "Ι"],
  ["iota", "ι"],
  ["iprod", "⨼"],
  ["iquest", "¿"],
  ["iscr", "𝒾"],
  ["Iscr", "ℐ"],
  ["isin", "∈"],
  ["isindot", "⋵"],
  ["isinE", "⋹"],
  ["isins", "⋴"],
  ["isinsv", "⋳"],
  ["isinv", "∈"],
  ["it", "⁢"],
  ["Itilde", "Ĩ"],
  ["itilde", "ĩ"],
  ["Iukcy", "І"],
  ["iukcy", "і"],
  ["Iuml", "Ï"],
  ["iuml", "ï"],
  ["Jcirc", "Ĵ"],
  ["jcirc", "ĵ"],
  ["Jcy", "Й"],
  ["jcy", "й"],
  ["Jfr", "𝔍"],
  ["jfr", "𝔧"],
  ["jmath", "ȷ"],
  ["Jopf", "𝕁"],
  ["jopf", "𝕛"],
  ["Jscr", "𝒥"],
  ["jscr", "𝒿"],
  ["Jsercy", "Ј"],
  ["jsercy", "ј"],
  ["Jukcy", "Є"],
  ["jukcy", "є"],
  ["Kappa", "Κ"],
  ["kappa", "κ"],
  ["kappav", "ϰ"],
  ["Kcedil", "Ķ"],
  ["kcedil", "ķ"],
  ["Kcy", "К"],
  ["kcy", "к"],
  ["Kfr", "𝔎"],
  ["kfr", "𝔨"],
  ["kgreen", "ĸ"],
  ["KHcy", "Х"],
  ["khcy", "х"],
  ["KJcy", "Ќ"],
  ["kjcy", "ќ"],
  ["Kopf", "𝕂"],
  ["kopf", "𝕜"],
  ["Kscr", "𝒦"],
  ["kscr", "𝓀"],
  ["lAarr", "⇚"],
  ["Lacute", "Ĺ"],
  ["lacute", "ĺ"],
  ["laemptyv", "⦴"],
  ["lagran", "ℒ"],
  ["Lambda", "Λ"],
  ["lambda", "λ"],
  ["lang", "⟨"],
  ["Lang", "⟪"],
  ["langd", "⦑"],
  ["langle", "⟨"],
  ["lap", "⪅"],
  ["Laplacetrf", "ℒ"],
  ["laquo", "«"],
  ["larrb", "⇤"],
  ["larrbfs", "⤟"],
  ["larr", "←"],
  ["Larr", "↞"],
  ["lArr", "⇐"],
  ["larrfs", "⤝"],
  ["larrhk", "↩"],
  ["larrlp", "↫"],
  ["larrpl", "⤹"],
  ["larrsim", "⥳"],
  ["larrtl", "↢"],
  ["latail", "⤙"],
  ["lAtail", "⤛"],
  ["lat", "⪫"],
  ["late", "⪭"],
  ["lates", "⪭︀"],
  ["lbarr", "⤌"],
  ["lBarr", "⤎"],
  ["lbbrk", "❲"],
  ["lbrace", "{"],
  ["lbrack", "["],
  ["lbrke", "⦋"],
  ["lbrksld", "⦏"],
  ["lbrkslu", "⦍"],
  ["Lcaron", "Ľ"],
  ["lcaron", "ľ"],
  ["Lcedil", "Ļ"],
  ["lcedil", "ļ"],
  ["lceil", "⌈"],
  ["lcub", "{"],
  ["Lcy", "Л"],
  ["lcy", "л"],
  ["ldca", "⤶"],
  ["ldquo", "“"],
  ["ldquor", "„"],
  ["ldrdhar", "⥧"],
  ["ldrushar", "⥋"],
  ["ldsh", "↲"],
  ["le", "≤"],
  ["lE", "≦"],
  ["LeftAngleBracket", "⟨"],
  ["LeftArrowBar", "⇤"],
  ["leftarrow", "←"],
  ["LeftArrow", "←"],
  ["Leftarrow", "⇐"],
  ["LeftArrowRightArrow", "⇆"],
  ["leftarrowtail", "↢"],
  ["LeftCeiling", "⌈"],
  ["LeftDoubleBracket", "⟦"],
  ["LeftDownTeeVector", "⥡"],
  ["LeftDownVectorBar", "⥙"],
  ["LeftDownVector", "⇃"],
  ["LeftFloor", "⌊"],
  ["leftharpoondown", "↽"],
  ["leftharpoonup", "↼"],
  ["leftleftarrows", "⇇"],
  ["leftrightarrow", "↔"],
  ["LeftRightArrow", "↔"],
  ["Leftrightarrow", "⇔"],
  ["leftrightarrows", "⇆"],
  ["leftrightharpoons", "⇋"],
  ["leftrightsquigarrow", "↭"],
  ["LeftRightVector", "⥎"],
  ["LeftTeeArrow", "↤"],
  ["LeftTee", "⊣"],
  ["LeftTeeVector", "⥚"],
  ["leftthreetimes", "⋋"],
  ["LeftTriangleBar", "⧏"],
  ["LeftTriangle", "⊲"],
  ["LeftTriangleEqual", "⊴"],
  ["LeftUpDownVector", "⥑"],
  ["LeftUpTeeVector", "⥠"],
  ["LeftUpVectorBar", "⥘"],
  ["LeftUpVector", "↿"],
  ["LeftVectorBar", "⥒"],
  ["LeftVector", "↼"],
  ["lEg", "⪋"],
  ["leg", "⋚"],
  ["leq", "≤"],
  ["leqq", "≦"],
  ["leqslant", "⩽"],
  ["lescc", "⪨"],
  ["les", "⩽"],
  ["lesdot", "⩿"],
  ["lesdoto", "⪁"],
  ["lesdotor", "⪃"],
  ["lesg", "⋚︀"],
  ["lesges", "⪓"],
  ["lessapprox", "⪅"],
  ["lessdot", "⋖"],
  ["lesseqgtr", "⋚"],
  ["lesseqqgtr", "⪋"],
  ["LessEqualGreater", "⋚"],
  ["LessFullEqual", "≦"],
  ["LessGreater", "≶"],
  ["lessgtr", "≶"],
  ["LessLess", "⪡"],
  ["lesssim", "≲"],
  ["LessSlantEqual", "⩽"],
  ["LessTilde", "≲"],
  ["lfisht", "⥼"],
  ["lfloor", "⌊"],
  ["Lfr", "𝔏"],
  ["lfr", "𝔩"],
  ["lg", "≶"],
  ["lgE", "⪑"],
  ["lHar", "⥢"],
  ["lhard", "↽"],
  ["lharu", "↼"],
  ["lharul", "⥪"],
  ["lhblk", "▄"],
  ["LJcy", "Љ"],
  ["ljcy", "љ"],
  ["llarr", "⇇"],
  ["ll", "≪"],
  ["Ll", "⋘"],
  ["llcorner", "⌞"],
  ["Lleftarrow", "⇚"],
  ["llhard", "⥫"],
  ["lltri", "◺"],
  ["Lmidot", "Ŀ"],
  ["lmidot", "ŀ"],
  ["lmoustache", "⎰"],
  ["lmoust", "⎰"],
  ["lnap", "⪉"],
  ["lnapprox", "⪉"],
  ["lne", "⪇"],
  ["lnE", "≨"],
  ["lneq", "⪇"],
  ["lneqq", "≨"],
  ["lnsim", "⋦"],
  ["loang", "⟬"],
  ["loarr", "⇽"],
  ["lobrk", "⟦"],
  ["longleftarrow", "⟵"],
  ["LongLeftArrow", "⟵"],
  ["Longleftarrow", "⟸"],
  ["longleftrightarrow", "⟷"],
  ["LongLeftRightArrow", "⟷"],
  ["Longleftrightarrow", "⟺"],
  ["longmapsto", "⟼"],
  ["longrightarrow", "⟶"],
  ["LongRightArrow", "⟶"],
  ["Longrightarrow", "⟹"],
  ["looparrowleft", "↫"],
  ["looparrowright", "↬"],
  ["lopar", "⦅"],
  ["Lopf", "𝕃"],
  ["lopf", "𝕝"],
  ["loplus", "⨭"],
  ["lotimes", "⨴"],
  ["lowast", "∗"],
  ["lowbar", "_"],
  ["LowerLeftArrow", "↙"],
  ["LowerRightArrow", "↘"],
  ["loz", "◊"],
  ["lozenge", "◊"],
  ["lozf", "⧫"],
  ["lpar", "("],
  ["lparlt", "⦓"],
  ["lrarr", "⇆"],
  ["lrcorner", "⌟"],
  ["lrhar", "⇋"],
  ["lrhard", "⥭"],
  ["lrm", "‎"],
  ["lrtri", "⊿"],
  ["lsaquo", "‹"],
  ["lscr", "𝓁"],
  ["Lscr", "ℒ"],
  ["lsh", "↰"],
  ["Lsh", "↰"],
  ["lsim", "≲"],
  ["lsime", "⪍"],
  ["lsimg", "⪏"],
  ["lsqb", "["],
  ["lsquo", "‘"],
  ["lsquor", "‚"],
  ["Lstrok", "Ł"],
  ["lstrok", "ł"],
  ["ltcc", "⪦"],
  ["ltcir", "⩹"],
  ["lt", "<"],
  ["LT", "<"],
  ["Lt", "≪"],
  ["ltdot", "⋖"],
  ["lthree", "⋋"],
  ["ltimes", "⋉"],
  ["ltlarr", "⥶"],
  ["ltquest", "⩻"],
  ["ltri", "◃"],
  ["ltrie", "⊴"],
  ["ltrif", "◂"],
  ["ltrPar", "⦖"],
  ["lurdshar", "⥊"],
  ["luruhar", "⥦"],
  ["lvertneqq", "≨︀"],
  ["lvnE", "≨︀"],
  ["macr", "¯"],
  ["male", "♂"],
  ["malt", "✠"],
  ["maltese", "✠"],
  ["Map", "⤅"],
  ["map", "↦"],
  ["mapsto", "↦"],
  ["mapstodown", "↧"],
  ["mapstoleft", "↤"],
  ["mapstoup", "↥"],
  ["marker", "▮"],
  ["mcomma", "⨩"],
  ["Mcy", "М"],
  ["mcy", "м"],
  ["mdash", "—"],
  ["mDDot", "∺"],
  ["measuredangle", "∡"],
  ["MediumSpace", " "],
  ["Mellintrf", "ℳ"],
  ["Mfr", "𝔐"],
  ["mfr", "𝔪"],
  ["mho", "℧"],
  ["micro", "µ"],
  ["midast", "*"],
  ["midcir", "⫰"],
  ["mid", "∣"],
  ["middot", "·"],
  ["minusb", "⊟"],
  ["minus", "−"],
  ["minusd", "∸"],
  ["minusdu", "⨪"],
  ["MinusPlus", "∓"],
  ["mlcp", "⫛"],
  ["mldr", "…"],
  ["mnplus", "∓"],
  ["models", "⊧"],
  ["Mopf", "𝕄"],
  ["mopf", "𝕞"],
  ["mp", "∓"],
  ["mscr", "𝓂"],
  ["Mscr", "ℳ"],
  ["mstpos", "∾"],
  ["Mu", "Μ"],
  ["mu", "μ"],
  ["multimap", "⊸"],
  ["mumap", "⊸"],
  ["nabla", "∇"],
  ["Nacute", "Ń"],
  ["nacute", "ń"],
  ["nang", "∠⃒"],
  ["nap", "≉"],
  ["napE", "⩰̸"],
  ["napid", "≋̸"],
  ["napos", "ŉ"],
  ["napprox", "≉"],
  ["natural", "♮"],
  ["naturals", "ℕ"],
  ["natur", "♮"],
  ["nbsp", " "],
  ["nbump", "≎̸"],
  ["nbumpe", "≏̸"],
  ["ncap", "⩃"],
  ["Ncaron", "Ň"],
  ["ncaron", "ň"],
  ["Ncedil", "Ņ"],
  ["ncedil", "ņ"],
  ["ncong", "≇"],
  ["ncongdot", "⩭̸"],
  ["ncup", "⩂"],
  ["Ncy", "Н"],
  ["ncy", "н"],
  ["ndash", "–"],
  ["nearhk", "⤤"],
  ["nearr", "↗"],
  ["neArr", "⇗"],
  ["nearrow", "↗"],
  ["ne", "≠"],
  ["nedot", "≐̸"],
  ["NegativeMediumSpace", "​"],
  ["NegativeThickSpace", "​"],
  ["NegativeThinSpace", "​"],
  ["NegativeVeryThinSpace", "​"],
  ["nequiv", "≢"],
  ["nesear", "⤨"],
  ["nesim", "≂̸"],
  ["NestedGreaterGreater", "≫"],
  ["NestedLessLess", "≪"],
  ["NewLine", ""],
  ["nexist", "∄"],
  ["nexists", "∄"],
  ["Nfr", "𝔑"],
  ["nfr", "𝔫"],
  ["ngE", "≧̸"],
  ["nge", "≱"],
  ["ngeq", "≱"],
  ["ngeqq", "≧̸"],
  ["ngeqslant", "⩾̸"],
  ["nges", "⩾̸"],
  ["nGg", "⋙̸"],
  ["ngsim", "≵"],
  ["nGt", "≫⃒"],
  ["ngt", "≯"],
  ["ngtr", "≯"],
  ["nGtv", "≫̸"],
  ["nharr", "↮"],
  ["nhArr", "⇎"],
  ["nhpar", "⫲"],
  ["ni", "∋"],
  ["nis", "⋼"],
  ["nisd", "⋺"],
  ["niv", "∋"],
  ["NJcy", "Њ"],
  ["njcy", "њ"],
  ["nlarr", "↚"],
  ["nlArr", "⇍"],
  ["nldr", "‥"],
  ["nlE", "≦̸"],
  ["nle", "≰"],
  ["nleftarrow", "↚"],
  ["nLeftarrow", "⇍"],
  ["nleftrightarrow", "↮"],
  ["nLeftrightarrow", "⇎"],
  ["nleq", "≰"],
  ["nleqq", "≦̸"],
  ["nleqslant", "⩽̸"],
  ["nles", "⩽̸"],
  ["nless", "≮"],
  ["nLl", "⋘̸"],
  ["nlsim", "≴"],
  ["nLt", "≪⃒"],
  ["nlt", "≮"],
  ["nltri", "⋪"],
  ["nltrie", "⋬"],
  ["nLtv", "≪̸"],
  ["nmid", "∤"],
  ["NoBreak", "⁠"],
  ["NonBreakingSpace", " "],
  ["nopf", "𝕟"],
  ["Nopf", "ℕ"],
  ["Not", "⫬"],
  ["not", "¬"],
  ["NotCongruent", "≢"],
  ["NotCupCap", "≭"],
  ["NotDoubleVerticalBar", "∦"],
  ["NotElement", "∉"],
  ["NotEqual", "≠"],
  ["NotEqualTilde", "≂̸"],
  ["NotExists", "∄"],
  ["NotGreater", "≯"],
  ["NotGreaterEqual", "≱"],
  ["NotGreaterFullEqual", "≧̸"],
  ["NotGreaterGreater", "≫̸"],
  ["NotGreaterLess", "≹"],
  ["NotGreaterSlantEqual", "⩾̸"],
  ["NotGreaterTilde", "≵"],
  ["NotHumpDownHump", "≎̸"],
  ["NotHumpEqual", "≏̸"],
  ["notin", "∉"],
  ["notindot", "⋵̸"],
  ["notinE", "⋹̸"],
  ["notinva", "∉"],
  ["notinvb", "⋷"],
  ["notinvc", "⋶"],
  ["NotLeftTriangleBar", "⧏̸"],
  ["NotLeftTriangle", "⋪"],
  ["NotLeftTriangleEqual", "⋬"],
  ["NotLess", "≮"],
  ["NotLessEqual", "≰"],
  ["NotLessGreater", "≸"],
  ["NotLessLess", "≪̸"],
  ["NotLessSlantEqual", "⩽̸"],
  ["NotLessTilde", "≴"],
  ["NotNestedGreaterGreater", "⪢̸"],
  ["NotNestedLessLess", "⪡̸"],
  ["notni", "∌"],
  ["notniva", "∌"],
  ["notnivb", "⋾"],
  ["notnivc", "⋽"],
  ["NotPrecedes", "⊀"],
  ["NotPrecedesEqual", "⪯̸"],
  ["NotPrecedesSlantEqual", "⋠"],
  ["NotReverseElement", "∌"],
  ["NotRightTriangleBar", "⧐̸"],
  ["NotRightTriangle", "⋫"],
  ["NotRightTriangleEqual", "⋭"],
  ["NotSquareSubset", "⊏̸"],
  ["NotSquareSubsetEqual", "⋢"],
  ["NotSquareSuperset", "⊐̸"],
  ["NotSquareSupersetEqual", "⋣"],
  ["NotSubset", "⊂⃒"],
  ["NotSubsetEqual", "⊈"],
  ["NotSucceeds", "⊁"],
  ["NotSucceedsEqual", "⪰̸"],
  ["NotSucceedsSlantEqual", "⋡"],
  ["NotSucceedsTilde", "≿̸"],
  ["NotSuperset", "⊃⃒"],
  ["NotSupersetEqual", "⊉"],
  ["NotTilde", "≁"],
  ["NotTildeEqual", "≄"],
  ["NotTildeFullEqual", "≇"],
  ["NotTildeTilde", "≉"],
  ["NotVerticalBar", "∤"],
  ["nparallel", "∦"],
  ["npar", "∦"],
  ["nparsl", "⫽⃥"],
  ["npart", "∂̸"],
  ["npolint", "⨔"],
  ["npr", "⊀"],
  ["nprcue", "⋠"],
  ["nprec", "⊀"],
  ["npreceq", "⪯̸"],
  ["npre", "⪯̸"],
  ["nrarrc", "⤳̸"],
  ["nrarr", "↛"],
  ["nrArr", "⇏"],
  ["nrarrw", "↝̸"],
  ["nrightarrow", "↛"],
  ["nRightarrow", "⇏"],
  ["nrtri", "⋫"],
  ["nrtrie", "⋭"],
  ["nsc", "⊁"],
  ["nsccue", "⋡"],
  ["nsce", "⪰̸"],
  ["Nscr", "𝒩"],
  ["nscr", "𝓃"],
  ["nshortmid", "∤"],
  ["nshortparallel", "∦"],
  ["nsim", "≁"],
  ["nsime", "≄"],
  ["nsimeq", "≄"],
  ["nsmid", "∤"],
  ["nspar", "∦"],
  ["nsqsube", "⋢"],
  ["nsqsupe", "⋣"],
  ["nsub", "⊄"],
  ["nsubE", "⫅̸"],
  ["nsube", "⊈"],
  ["nsubset", "⊂⃒"],
  ["nsubseteq", "⊈"],
  ["nsubseteqq", "⫅̸"],
  ["nsucc", "⊁"],
  ["nsucceq", "⪰̸"],
  ["nsup", "⊅"],
  ["nsupE", "⫆̸"],
  ["nsupe", "⊉"],
  ["nsupset", "⊃⃒"],
  ["nsupseteq", "⊉"],
  ["nsupseteqq", "⫆̸"],
  ["ntgl", "≹"],
  ["Ntilde", "Ñ"],
  ["ntilde", "ñ"],
  ["ntlg", "≸"],
  ["ntriangleleft", "⋪"],
  ["ntrianglelefteq", "⋬"],
  ["ntriangleright", "⋫"],
  ["ntrianglerighteq", "⋭"],
  ["Nu", "Ν"],
  ["nu", "ν"],
  ["num", "#"],
  ["numero", "№"],
  ["numsp", " "],
  ["nvap", "≍⃒"],
  ["nvdash", "⊬"],
  ["nvDash", "⊭"],
  ["nVdash", "⊮"],
  ["nVDash", "⊯"],
  ["nvge", "≥⃒"],
  ["nvgt", ">⃒"],
  ["nvHarr", "⤄"],
  ["nvinfin", "⧞"],
  ["nvlArr", "⤂"],
  ["nvle", "≤⃒"],
  ["nvlt", "<⃒"],
  ["nvltrie", "⊴⃒"],
  ["nvrArr", "⤃"],
  ["nvrtrie", "⊵⃒"],
  ["nvsim", "∼⃒"],
  ["nwarhk", "⤣"],
  ["nwarr", "↖"],
  ["nwArr", "⇖"],
  ["nwarrow", "↖"],
  ["nwnear", "⤧"],
  ["Oacute", "Ó"],
  ["oacute", "ó"],
  ["oast", "⊛"],
  ["Ocirc", "Ô"],
  ["ocirc", "ô"],
  ["ocir", "⊚"],
  ["Ocy", "О"],
  ["ocy", "о"],
  ["odash", "⊝"],
  ["Odblac", "Ő"],
  ["odblac", "ő"],
  ["odiv", "⨸"],
  ["odot", "⊙"],
  ["odsold", "⦼"],
  ["OElig", "Œ"],
  ["oelig", "œ"],
  ["ofcir", "⦿"],
  ["Ofr", "𝔒"],
  ["ofr", "𝔬"],
  ["ogon", "˛"],
  ["Ograve", "Ò"],
  ["ograve", "ò"],
  ["ogt", "⧁"],
  ["ohbar", "⦵"],
  ["ohm", "Ω"],
  ["oint", "∮"],
  ["olarr", "↺"],
  ["olcir", "⦾"],
  ["olcross", "⦻"],
  ["oline", "‾"],
  ["olt", "⧀"],
  ["Omacr", "Ō"],
  ["omacr", "ō"],
  ["Omega", "Ω"],
  ["omega", "ω"],
  ["Omicron", "Ο"],
  ["omicron", "ο"],
  ["omid", "⦶"],
  ["ominus", "⊖"],
  ["Oopf", "𝕆"],
  ["oopf", "𝕠"],
  ["opar", "⦷"],
  ["OpenCurlyDoubleQuote", "“"],
  ["OpenCurlyQuote", "‘"],
  ["operp", "⦹"],
  ["oplus", "⊕"],
  ["orarr", "↻"],
  ["Or", "⩔"],
  ["or", "∨"],
  ["ord", "⩝"],
  ["order", "ℴ"],
  ["orderof", "ℴ"],
  ["ordf", "ª"],
  ["ordm", "º"],
  ["origof", "⊶"],
  ["oror", "⩖"],
  ["orslope", "⩗"],
  ["orv", "⩛"],
  ["oS", "Ⓢ"],
  ["Oscr", "𝒪"],
  ["oscr", "ℴ"],
  ["Oslash", "Ø"],
  ["oslash", "ø"],
  ["osol", "⊘"],
  ["Otilde", "Õ"],
  ["otilde", "õ"],
  ["otimesas", "⨶"],
  ["Otimes", "⨷"],
  ["otimes", "⊗"],
  ["Ouml", "Ö"],
  ["ouml", "ö"],
  ["ovbar", "⌽"],
  ["OverBar", "‾"],
  ["OverBrace", "⏞"],
  ["OverBracket", "⎴"],
  ["OverParenthesis", "⏜"],
  ["para", "¶"],
  ["parallel", "∥"],
  ["par", "∥"],
  ["parsim", "⫳"],
  ["parsl", "⫽"],
  ["part", "∂"],
  ["PartialD", "∂"],
  ["Pcy", "П"],
  ["pcy", "п"],
  ["percnt", "%"],
  ["period", "."],
  ["permil", "‰"],
  ["perp", "⊥"],
  ["pertenk", "‱"],
  ["Pfr", "𝔓"],
  ["pfr", "𝔭"],
  ["Phi", "Φ"],
  ["phi", "φ"],
  ["phiv", "ϕ"],
  ["phmmat", "ℳ"],
  ["phone", "☎"],
  ["Pi", "Π"],
  ["pi", "π"],
  ["pitchfork", "⋔"],
  ["piv", "ϖ"],
  ["planck", "ℏ"],
  ["planckh", "ℎ"],
  ["plankv", "ℏ"],
  ["plusacir", "⨣"],
  ["plusb", "⊞"],
  ["pluscir", "⨢"],
  ["plus", "+"],
  ["plusdo", "∔"],
  ["plusdu", "⨥"],
  ["pluse", "⩲"],
  ["PlusMinus", "±"],
  ["plusmn", "±"],
  ["plussim", "⨦"],
  ["plustwo", "⨧"],
  ["pm", "±"],
  ["Poincareplane", "ℌ"],
  ["pointint", "⨕"],
  ["popf", "𝕡"],
  ["Popf", "ℙ"],
  ["pound", "£"],
  ["prap", "⪷"],
  ["Pr", "⪻"],
  ["pr", "≺"],
  ["prcue", "≼"],
  ["precapprox", "⪷"],
  ["prec", "≺"],
  ["preccurlyeq", "≼"],
  ["Precedes", "≺"],
  ["PrecedesEqual", "⪯"],
  ["PrecedesSlantEqual", "≼"],
  ["PrecedesTilde", "≾"],
  ["preceq", "⪯"],
  ["precnapprox", "⪹"],
  ["precneqq", "⪵"],
  ["precnsim", "⋨"],
  ["pre", "⪯"],
  ["prE", "⪳"],
  ["precsim", "≾"],
  ["prime", "′"],
  ["Prime", "″"],
  ["primes", "ℙ"],
  ["prnap", "⪹"],
  ["prnE", "⪵"],
  ["prnsim", "⋨"],
  ["prod", "∏"],
  ["Product", "∏"],
  ["profalar", "⌮"],
  ["profline", "⌒"],
  ["profsurf", "⌓"],
  ["prop", "∝"],
  ["Proportional", "∝"],
  ["Proportion", "∷"],
  ["propto", "∝"],
  ["prsim", "≾"],
  ["prurel", "⊰"],
  ["Pscr", "𝒫"],
  ["pscr", "𝓅"],
  ["Psi", "Ψ"],
  ["psi", "ψ"],
  ["puncsp", " "],
  ["Qfr", "𝔔"],
  ["qfr", "𝔮"],
  ["qint", "⨌"],
  ["qopf", "𝕢"],
  ["Qopf", "ℚ"],
  ["qprime", "⁗"],
  ["Qscr", "𝒬"],
  ["qscr", "𝓆"],
  ["quaternions", "ℍ"],
  ["quatint", "⨖"],
  ["quest", "?"],
  ["questeq", "≟"],
  ["quot", '"'],
  ["QUOT", '"'],
  ["rAarr", "⇛"],
  ["race", "∽̱"],
  ["Racute", "Ŕ"],
  ["racute", "ŕ"],
  ["radic", "√"],
  ["raemptyv", "⦳"],
  ["rang", "⟩"],
  ["Rang", "⟫"],
  ["rangd", "⦒"],
  ["range", "⦥"],
  ["rangle", "⟩"],
  ["raquo", "»"],
  ["rarrap", "⥵"],
  ["rarrb", "⇥"],
  ["rarrbfs", "⤠"],
  ["rarrc", "⤳"],
  ["rarr", "→"],
  ["Rarr", "↠"],
  ["rArr", "⇒"],
  ["rarrfs", "⤞"],
  ["rarrhk", "↪"],
  ["rarrlp", "↬"],
  ["rarrpl", "⥅"],
  ["rarrsim", "⥴"],
  ["Rarrtl", "⤖"],
  ["rarrtl", "↣"],
  ["rarrw", "↝"],
  ["ratail", "⤚"],
  ["rAtail", "⤜"],
  ["ratio", "∶"],
  ["rationals", "ℚ"],
  ["rbarr", "⤍"],
  ["rBarr", "⤏"],
  ["RBarr", "⤐"],
  ["rbbrk", "❳"],
  ["rbrace", "}"],
  ["rbrack", "]"],
  ["rbrke", "⦌"],
  ["rbrksld", "⦎"],
  ["rbrkslu", "⦐"],
  ["Rcaron", "Ř"],
  ["rcaron", "ř"],
  ["Rcedil", "Ŗ"],
  ["rcedil", "ŗ"],
  ["rceil", "⌉"],
  ["rcub", "}"],
  ["Rcy", "Р"],
  ["rcy", "р"],
  ["rdca", "⤷"],
  ["rdldhar", "⥩"],
  ["rdquo", "”"],
  ["rdquor", "”"],
  ["rdsh", "↳"],
  ["real", "ℜ"],
  ["realine", "ℛ"],
  ["realpart", "ℜ"],
  ["reals", "ℝ"],
  ["Re", "ℜ"],
  ["rect", "▭"],
  ["reg", "®"],
  ["REG", "®"],
  ["ReverseElement", "∋"],
  ["ReverseEquilibrium", "⇋"],
  ["ReverseUpEquilibrium", "⥯"],
  ["rfisht", "⥽"],
  ["rfloor", "⌋"],
  ["rfr", "𝔯"],
  ["Rfr", "ℜ"],
  ["rHar", "⥤"],
  ["rhard", "⇁"],
  ["rharu", "⇀"],
  ["rharul", "⥬"],
  ["Rho", "Ρ"],
  ["rho", "ρ"],
  ["rhov", "ϱ"],
  ["RightAngleBracket", "⟩"],
  ["RightArrowBar", "⇥"],
  ["rightarrow", "→"],
  ["RightArrow", "→"],
  ["Rightarrow", "⇒"],
  ["RightArrowLeftArrow", "⇄"],
  ["rightarrowtail", "↣"],
  ["RightCeiling", "⌉"],
  ["RightDoubleBracket", "⟧"],
  ["RightDownTeeVector", "⥝"],
  ["RightDownVectorBar", "⥕"],
  ["RightDownVector", "⇂"],
  ["RightFloor", "⌋"],
  ["rightharpoondown", "⇁"],
  ["rightharpoonup", "⇀"],
  ["rightleftarrows", "⇄"],
  ["rightleftharpoons", "⇌"],
  ["rightrightarrows", "⇉"],
  ["rightsquigarrow", "↝"],
  ["RightTeeArrow", "↦"],
  ["RightTee", "⊢"],
  ["RightTeeVector", "⥛"],
  ["rightthreetimes", "⋌"],
  ["RightTriangleBar", "⧐"],
  ["RightTriangle", "⊳"],
  ["RightTriangleEqual", "⊵"],
  ["RightUpDownVector", "⥏"],
  ["RightUpTeeVector", "⥜"],
  ["RightUpVectorBar", "⥔"],
  ["RightUpVector", "↾"],
  ["RightVectorBar", "⥓"],
  ["RightVector", "⇀"],
  ["ring", "˚"],
  ["risingdotseq", "≓"],
  ["rlarr", "⇄"],
  ["rlhar", "⇌"],
  ["rlm", "‏"],
  ["rmoustache", "⎱"],
  ["rmoust", "⎱"],
  ["rnmid", "⫮"],
  ["roang", "⟭"],
  ["roarr", "⇾"],
  ["robrk", "⟧"],
  ["ropar", "⦆"],
  ["ropf", "𝕣"],
  ["Ropf", "ℝ"],
  ["roplus", "⨮"],
  ["rotimes", "⨵"],
  ["RoundImplies", "⥰"],
  ["rpar", ")"],
  ["rpargt", "⦔"],
  ["rppolint", "⨒"],
  ["rrarr", "⇉"],
  ["Rrightarrow", "⇛"],
  ["rsaquo", "›"],
  ["rscr", "𝓇"],
  ["Rscr", "ℛ"],
  ["rsh", "↱"],
  ["Rsh", "↱"],
  ["rsqb", "]"],
  ["rsquo", "’"],
  ["rsquor", "’"],
  ["rthree", "⋌"],
  ["rtimes", "⋊"],
  ["rtri", "▹"],
  ["rtrie", "⊵"],
  ["rtrif", "▸"],
  ["rtriltri", "⧎"],
  ["RuleDelayed", "⧴"],
  ["ruluhar", "⥨"],
  ["rx", "℞"],
  ["Sacute", "Ś"],
  ["sacute", "ś"],
  ["sbquo", "‚"],
  ["scap", "⪸"],
  ["Scaron", "Š"],
  ["scaron", "š"],
  ["Sc", "⪼"],
  ["sc", "≻"],
  ["sccue", "≽"],
  ["sce", "⪰"],
  ["scE", "⪴"],
  ["Scedil", "Ş"],
  ["scedil", "ş"],
  ["Scirc", "Ŝ"],
  ["scirc", "ŝ"],
  ["scnap", "⪺"],
  ["scnE", "⪶"],
  ["scnsim", "⋩"],
  ["scpolint", "⨓"],
  ["scsim", "≿"],
  ["Scy", "С"],
  ["scy", "с"],
  ["sdotb", "⊡"],
  ["sdot", "⋅"],
  ["sdote", "⩦"],
  ["searhk", "⤥"],
  ["searr", "↘"],
  ["seArr", "⇘"],
  ["searrow", "↘"],
  ["sect", "§"],
  ["semi", ";"],
  ["seswar", "⤩"],
  ["setminus", "∖"],
  ["setmn", "∖"],
  ["sext", "✶"],
  ["Sfr", "𝔖"],
  ["sfr", "𝔰"],
  ["sfrown", "⌢"],
  ["sharp", "♯"],
  ["SHCHcy", "Щ"],
  ["shchcy", "щ"],
  ["SHcy", "Ш"],
  ["shcy", "ш"],
  ["ShortDownArrow", "↓"],
  ["ShortLeftArrow", "←"],
  ["shortmid", "∣"],
  ["shortparallel", "∥"],
  ["ShortRightArrow", "→"],
  ["ShortUpArrow", "↑"],
  ["shy", "­"],
  ["Sigma", "Σ"],
  ["sigma", "σ"],
  ["sigmaf", "ς"],
  ["sigmav", "ς"],
  ["sim", "∼"],
  ["simdot", "⩪"],
  ["sime", "≃"],
  ["simeq", "≃"],
  ["simg", "⪞"],
  ["simgE", "⪠"],
  ["siml", "⪝"],
  ["simlE", "⪟"],
  ["simne", "≆"],
  ["simplus", "⨤"],
  ["simrarr", "⥲"],
  ["slarr", "←"],
  ["SmallCircle", "∘"],
  ["smallsetminus", "∖"],
  ["smashp", "⨳"],
  ["smeparsl", "⧤"],
  ["smid", "∣"],
  ["smile", "⌣"],
  ["smt", "⪪"],
  ["smte", "⪬"],
  ["smtes", "⪬︀"],
  ["SOFTcy", "Ь"],
  ["softcy", "ь"],
  ["solbar", "⌿"],
  ["solb", "⧄"],
  ["sol", "/"],
  ["Sopf", "𝕊"],
  ["sopf", "𝕤"],
  ["spades", "♠"],
  ["spadesuit", "♠"],
  ["spar", "∥"],
  ["sqcap", "⊓"],
  ["sqcaps", "⊓︀"],
  ["sqcup", "⊔"],
  ["sqcups", "⊔︀"],
  ["Sqrt", "√"],
  ["sqsub", "⊏"],
  ["sqsube", "⊑"],
  ["sqsubset", "⊏"],
  ["sqsubseteq", "⊑"],
  ["sqsup", "⊐"],
  ["sqsupe", "⊒"],
  ["sqsupset", "⊐"],
  ["sqsupseteq", "⊒"],
  ["square", "□"],
  ["Square", "□"],
  ["SquareIntersection", "⊓"],
  ["SquareSubset", "⊏"],
  ["SquareSubsetEqual", "⊑"],
  ["SquareSuperset", "⊐"],
  ["SquareSupersetEqual", "⊒"],
  ["SquareUnion", "⊔"],
  ["squarf", "▪"],
  ["squ", "□"],
  ["squf", "▪"],
  ["srarr", "→"],
  ["Sscr", "𝒮"],
  ["sscr", "𝓈"],
  ["ssetmn", "∖"],
  ["ssmile", "⌣"],
  ["sstarf", "⋆"],
  ["Star", "⋆"],
  ["star", "☆"],
  ["starf", "★"],
  ["straightepsilon", "ϵ"],
  ["straightphi", "ϕ"],
  ["strns", "¯"],
  ["sub", "⊂"],
  ["Sub", "⋐"],
  ["subdot", "⪽"],
  ["subE", "⫅"],
  ["sube", "⊆"],
  ["subedot", "⫃"],
  ["submult", "⫁"],
  ["subnE", "⫋"],
  ["subne", "⊊"],
  ["subplus", "⪿"],
  ["subrarr", "⥹"],
  ["subset", "⊂"],
  ["Subset", "⋐"],
  ["subseteq", "⊆"],
  ["subseteqq", "⫅"],
  ["SubsetEqual", "⊆"],
  ["subsetneq", "⊊"],
  ["subsetneqq", "⫋"],
  ["subsim", "⫇"],
  ["subsub", "⫕"],
  ["subsup", "⫓"],
  ["succapprox", "⪸"],
  ["succ", "≻"],
  ["succcurlyeq", "≽"],
  ["Succeeds", "≻"],
  ["SucceedsEqual", "⪰"],
  ["SucceedsSlantEqual", "≽"],
  ["SucceedsTilde", "≿"],
  ["succeq", "⪰"],
  ["succnapprox", "⪺"],
  ["succneqq", "⪶"],
  ["succnsim", "⋩"],
  ["succsim", "≿"],
  ["SuchThat", "∋"],
  ["sum", "∑"],
  ["Sum", "∑"],
  ["sung", "♪"],
  ["sup1", "¹"],
  ["sup2", "²"],
  ["sup3", "³"],
  ["sup", "⊃"],
  ["Sup", "⋑"],
  ["supdot", "⪾"],
  ["supdsub", "⫘"],
  ["supE", "⫆"],
  ["supe", "⊇"],
  ["supedot", "⫄"],
  ["Superset", "⊃"],
  ["SupersetEqual", "⊇"],
  ["suphsol", "⟉"],
  ["suphsub", "⫗"],
  ["suplarr", "⥻"],
  ["supmult", "⫂"],
  ["supnE", "⫌"],
  ["supne", "⊋"],
  ["supplus", "⫀"],
  ["supset", "⊃"],
  ["Supset", "⋑"],
  ["supseteq", "⊇"],
  ["supseteqq", "⫆"],
  ["supsetneq", "⊋"],
  ["supsetneqq", "⫌"],
  ["supsim", "⫈"],
  ["supsub", "⫔"],
  ["supsup", "⫖"],
  ["swarhk", "⤦"],
  ["swarr", "↙"],
  ["swArr", "⇙"],
  ["swarrow", "↙"],
  ["swnwar", "⤪"],
  ["szlig", "ß"],
  ["Tab", "	"],
  ["target", "⌖"],
  ["Tau", "Τ"],
  ["tau", "τ"],
  ["tbrk", "⎴"],
  ["Tcaron", "Ť"],
  ["tcaron", "ť"],
  ["Tcedil", "Ţ"],
  ["tcedil", "ţ"],
  ["Tcy", "Т"],
  ["tcy", "т"],
  ["tdot", "⃛"],
  ["telrec", "⌕"],
  ["Tfr", "𝔗"],
  ["tfr", "𝔱"],
  ["there4", "∴"],
  ["therefore", "∴"],
  ["Therefore", "∴"],
  ["Theta", "Θ"],
  ["theta", "θ"],
  ["thetasym", "ϑ"],
  ["thetav", "ϑ"],
  ["thickapprox", "≈"],
  ["thicksim", "∼"],
  ["ThickSpace", "  "],
  ["ThinSpace", " "],
  ["thinsp", " "],
  ["thkap", "≈"],
  ["thksim", "∼"],
  ["THORN", "Þ"],
  ["thorn", "þ"],
  ["tilde", "˜"],
  ["Tilde", "∼"],
  ["TildeEqual", "≃"],
  ["TildeFullEqual", "≅"],
  ["TildeTilde", "≈"],
  ["timesbar", "⨱"],
  ["timesb", "⊠"],
  ["times", "×"],
  ["timesd", "⨰"],
  ["tint", "∭"],
  ["toea", "⤨"],
  ["topbot", "⌶"],
  ["topcir", "⫱"],
  ["top", "⊤"],
  ["Topf", "𝕋"],
  ["topf", "𝕥"],
  ["topfork", "⫚"],
  ["tosa", "⤩"],
  ["tprime", "‴"],
  ["trade", "™"],
  ["TRADE", "™"],
  ["triangle", "▵"],
  ["triangledown", "▿"],
  ["triangleleft", "◃"],
  ["trianglelefteq", "⊴"],
  ["triangleq", "≜"],
  ["triangleright", "▹"],
  ["trianglerighteq", "⊵"],
  ["tridot", "◬"],
  ["trie", "≜"],
  ["triminus", "⨺"],
  ["TripleDot", "⃛"],
  ["triplus", "⨹"],
  ["trisb", "⧍"],
  ["tritime", "⨻"],
  ["trpezium", "⏢"],
  ["Tscr", "𝒯"],
  ["tscr", "𝓉"],
  ["TScy", "Ц"],
  ["tscy", "ц"],
  ["TSHcy", "Ћ"],
  ["tshcy", "ћ"],
  ["Tstrok", "Ŧ"],
  ["tstrok", "ŧ"],
  ["twixt", "≬"],
  ["twoheadleftarrow", "↞"],
  ["twoheadrightarrow", "↠"],
  ["Uacute", "Ú"],
  ["uacute", "ú"],
  ["uarr", "↑"],
  ["Uarr", "↟"],
  ["uArr", "⇑"],
  ["Uarrocir", "⥉"],
  ["Ubrcy", "Ў"],
  ["ubrcy", "ў"],
  ["Ubreve", "Ŭ"],
  ["ubreve", "ŭ"],
  ["Ucirc", "Û"],
  ["ucirc", "û"],
  ["Ucy", "У"],
  ["ucy", "у"],
  ["udarr", "⇅"],
  ["Udblac", "Ű"],
  ["udblac", "ű"],
  ["udhar", "⥮"],
  ["ufisht", "⥾"],
  ["Ufr", "𝔘"],
  ["ufr", "𝔲"],
  ["Ugrave", "Ù"],
  ["ugrave", "ù"],
  ["uHar", "⥣"],
  ["uharl", "↿"],
  ["uharr", "↾"],
  ["uhblk", "▀"],
  ["ulcorn", "⌜"],
  ["ulcorner", "⌜"],
  ["ulcrop", "⌏"],
  ["ultri", "◸"],
  ["Umacr", "Ū"],
  ["umacr", "ū"],
  ["uml", "¨"],
  ["UnderBar", "_"],
  ["UnderBrace", "⏟"],
  ["UnderBracket", "⎵"],
  ["UnderParenthesis", "⏝"],
  ["Union", "⋃"],
  ["UnionPlus", "⊎"],
  ["Uogon", "Ų"],
  ["uogon", "ų"],
  ["Uopf", "𝕌"],
  ["uopf", "𝕦"],
  ["UpArrowBar", "⤒"],
  ["uparrow", "↑"],
  ["UpArrow", "↑"],
  ["Uparrow", "⇑"],
  ["UpArrowDownArrow", "⇅"],
  ["updownarrow", "↕"],
  ["UpDownArrow", "↕"],
  ["Updownarrow", "⇕"],
  ["UpEquilibrium", "⥮"],
  ["upharpoonleft", "↿"],
  ["upharpoonright", "↾"],
  ["uplus", "⊎"],
  ["UpperLeftArrow", "↖"],
  ["UpperRightArrow", "↗"],
  ["upsi", "υ"],
  ["Upsi", "ϒ"],
  ["upsih", "ϒ"],
  ["Upsilon", "Υ"],
  ["upsilon", "υ"],
  ["UpTeeArrow", "↥"],
  ["UpTee", "⊥"],
  ["upuparrows", "⇈"],
  ["urcorn", "⌝"],
  ["urcorner", "⌝"],
  ["urcrop", "⌎"],
  ["Uring", "Ů"],
  ["uring", "ů"],
  ["urtri", "◹"],
  ["Uscr", "𝒰"],
  ["uscr", "𝓊"],
  ["utdot", "⋰"],
  ["Utilde", "Ũ"],
  ["utilde", "ũ"],
  ["utri", "▵"],
  ["utrif", "▴"],
  ["uuarr", "⇈"],
  ["Uuml", "Ü"],
  ["uuml", "ü"],
  ["uwangle", "⦧"],
  ["vangrt", "⦜"],
  ["varepsilon", "ϵ"],
  ["varkappa", "ϰ"],
  ["varnothing", "∅"],
  ["varphi", "ϕ"],
  ["varpi", "ϖ"],
  ["varpropto", "∝"],
  ["varr", "↕"],
  ["vArr", "⇕"],
  ["varrho", "ϱ"],
  ["varsigma", "ς"],
  ["varsubsetneq", "⊊︀"],
  ["varsubsetneqq", "⫋︀"],
  ["varsupsetneq", "⊋︀"],
  ["varsupsetneqq", "⫌︀"],
  ["vartheta", "ϑ"],
  ["vartriangleleft", "⊲"],
  ["vartriangleright", "⊳"],
  ["vBar", "⫨"],
  ["Vbar", "⫫"],
  ["vBarv", "⫩"],
  ["Vcy", "В"],
  ["vcy", "в"],
  ["vdash", "⊢"],
  ["vDash", "⊨"],
  ["Vdash", "⊩"],
  ["VDash", "⊫"],
  ["Vdashl", "⫦"],
  ["veebar", "⊻"],
  ["vee", "∨"],
  ["Vee", "⋁"],
  ["veeeq", "≚"],
  ["vellip", "⋮"],
  ["verbar", "|"],
  ["Verbar", "‖"],
  ["vert", "|"],
  ["Vert", "‖"],
  ["VerticalBar", "∣"],
  ["VerticalLine", "|"],
  ["VerticalSeparator", "❘"],
  ["VerticalTilde", "≀"],
  ["VeryThinSpace", " "],
  ["Vfr", "𝔙"],
  ["vfr", "𝔳"],
  ["vltri", "⊲"],
  ["vnsub", "⊂⃒"],
  ["vnsup", "⊃⃒"],
  ["Vopf", "𝕍"],
  ["vopf", "𝕧"],
  ["vprop", "∝"],
  ["vrtri", "⊳"],
  ["Vscr", "𝒱"],
  ["vscr", "𝓋"],
  ["vsubnE", "⫋︀"],
  ["vsubne", "⊊︀"],
  ["vsupnE", "⫌︀"],
  ["vsupne", "⊋︀"],
  ["Vvdash", "⊪"],
  ["vzigzag", "⦚"],
  ["Wcirc", "Ŵ"],
  ["wcirc", "ŵ"],
  ["wedbar", "⩟"],
  ["wedge", "∧"],
  ["Wedge", "⋀"],
  ["wedgeq", "≙"],
  ["weierp", "℘"],
  ["Wfr", "𝔚"],
  ["wfr", "𝔴"],
  ["Wopf", "𝕎"],
  ["wopf", "𝕨"],
  ["wp", "℘"],
  ["wr", "≀"],
  ["wreath", "≀"],
  ["Wscr", "𝒲"],
  ["wscr", "𝓌"],
  ["xcap", "⋂"],
  ["xcirc", "◯"],
  ["xcup", "⋃"],
  ["xdtri", "▽"],
  ["Xfr", "𝔛"],
  ["xfr", "𝔵"],
  ["xharr", "⟷"],
  ["xhArr", "⟺"],
  ["Xi", "Ξ"],
  ["xi", "ξ"],
  ["xlarr", "⟵"],
  ["xlArr", "⟸"],
  ["xmap", "⟼"],
  ["xnis", "⋻"],
  ["xodot", "⨀"],
  ["Xopf", "𝕏"],
  ["xopf", "𝕩"],
  ["xoplus", "⨁"],
  ["xotime", "⨂"],
  ["xrarr", "⟶"],
  ["xrArr", "⟹"],
  ["Xscr", "𝒳"],
  ["xscr", "𝓍"],
  ["xsqcup", "⨆"],
  ["xuplus", "⨄"],
  ["xutri", "△"],
  ["xvee", "⋁"],
  ["xwedge", "⋀"],
  ["Yacute", "Ý"],
  ["yacute", "ý"],
  ["YAcy", "Я"],
  ["yacy", "я"],
  ["Ycirc", "Ŷ"],
  ["ycirc", "ŷ"],
  ["Ycy", "Ы"],
  ["ycy", "ы"],
  ["yen", "¥"],
  ["Yfr", "𝔜"],
  ["yfr", "𝔶"],
  ["YIcy", "Ї"],
  ["yicy", "ї"],
  ["Yopf", "𝕐"],
  ["yopf", "𝕪"],
  ["Yscr", "𝒴"],
  ["yscr", "𝓎"],
  ["YUcy", "Ю"],
  ["yucy", "ю"],
  ["yuml", "ÿ"],
  ["Yuml", "Ÿ"],
  ["Zacute", "Ź"],
  ["zacute", "ź"],
  ["Zcaron", "Ž"],
  ["zcaron", "ž"],
  ["Zcy", "З"],
  ["zcy", "з"],
  ["Zdot", "Ż"],
  ["zdot", "ż"],
  ["zeetrf", "ℨ"],
  ["ZeroWidthSpace", "​"],
  ["Zeta", "Ζ"],
  ["zeta", "ζ"],
  ["zfr", "𝔷"],
  ["Zfr", "ℨ"],
  ["ZHcy", "Ж"],
  ["zhcy", "ж"],
  ["zigrarr", "⇝"],
  ["zopf", "𝕫"],
  ["Zopf", "ℤ"],
  ["Zscr", "𝒵"],
  ["zscr", "𝓏"],
  ["zwj", "‍"],
  ["zwnj", "‌"],
  ["NewLine", `
`]
]), ze = class ze {
  static entityToString(e) {
    if (!e.startsWith("&") || !e.endsWith(";"))
      return e;
    let t = e.substring(1, e.length - 1);
    if (t.startsWith("#")) {
      t = t.substring(1);
      let r = 10;
      (t.startsWith("x") || t.startsWith("X")) && (t = t.substring(1), r = 16);
      let s = window.parseInt(t, r);
      return s === 0 ? "�" : ae(s);
    } else {
      const r = ze.NAMED_CHARACTER_REFERENCES.get(t);
      return r !== void 0 ? r : e;
    }
  }
};
i(ze, "NAMED_CHARACTER_REFERENCES", $t);
let ve = ze;
const k = class k {
  static getBytes(e) {
    if (window.TextEncoder) {
      const s = new window.TextEncoder().encode(e);
      return Array.from(s);
    }
    const t = [];
    for (let r = 0; r < e.length; r++) {
      const s = e.charCodeAt(r);
      t.push(s & 255), s > 255 && t.push(s >> 8 & 255);
    }
    return t;
  }
  static escapeHtml(e) {
    let t = null;
    e: for (let r = 0; r < e.length; r++) {
      const s = e.charAt(r);
      let n;
      switch (s) {
        case "&":
          n = "&amp;";
          break;
        case "<":
          n = "&lt;";
          break;
        case ">":
          n = "&gt;";
          break;
        case '"':
          n = "&quot;";
          break;
        case " ":
          n = "&nbsp;";
          break;
        default:
          t !== null && t.append(s);
          continue e;
      }
      t === null && (t = new y(), t.append(e, 0, r)), t.append(n);
    }
    return t !== null ? t.toString() : e;
  }
  /**
   * Replace entities and backslash escapes with literal characters.
   */
  static unescapeString(e) {
    return k.BACKSLASH_OR_AMP.exec(e) ? k.replaceAll(
      k.ENTITY_OR_ESCAPED_CHAR,
      e,
      k.UNESCAPE_REPLACER
    ) : e;
  }
  static percentEncodeUrl(e) {
    return k.replaceAll(
      k.ESCAPE_IN_URI,
      e,
      k.URI_REPLACER
    );
  }
  static normalizeLabelContent(e) {
    return e.trim().toLocaleLowerCase().toLocaleLowerCase().replace(k.WHITESPACE, " ");
  }
  static replaceAll(e, t, r) {
    let s = e.exec(t);
    if (s === null)
      return t;
    const n = new y();
    let a = 0;
    do
      n.append(t, a, s.index), r.replace(s[0], n), a = s.index + s[0].length;
    while (s !== null);
    return a !== t.length && n.append(t, a, t.length), n.toString();
  }
};
i(k, "ESCAPABLE", "[!\"#$%&'()*+,./:;<=>?@\\[\\\\\\]^_`{|}~-]"), i(k, "ENTITY", "&(?:#x[a-f0-9]{1,6}|#[0-9]{1,7}|[a-z][a-z0-9]{1,31});"), i(k, "BACKSLASH_OR_AMP", /[\\&]/), i(k, "ENTITY_OR_ESCAPED_CHAR", new RegExp(
  "\\\\" + k.ESCAPABLE + "|" + k.ENTITY,
  "i"
)), // From RFC 3986 (see "reserved", "unreserved") except don't escape '[' or ']' to be compatible with JS encodeURI
i(k, "ESCAPE_IN_URI", /(%[a-fA-F0-9]{0,2}|[^:/?#@!$&'()*+,;=a-zA-Z0-9\-._~])/), i(k, "HEX_DIGITS", [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F"
]), i(k, "WHITESPACE", /[ \t\r\n]+/), i(k, "UNESCAPE_REPLACER", {
  replace(e, t) {
    e.charAt(0) === "\\" ? t.append(e, 1, e.length) : t.append(ve.entityToString(e));
  }
}), i(k, "URI_REPLACER", {
  replace(e, t) {
    if (e.startsWith("%"))
      e.length === 3 ? t.append(e) : (t.append("%25"), t.append(e, 1, e.length));
    else {
      const r = k.getBytes(e);
      for (const s of r)
        t.append("%"), t.append(k.HEX_DIGITS[s >> 4 & 15]), t.append(k.HEX_DIGITS[s & 15]);
    }
  }
});
let E = k, Yt = class {
  tryStart(e, t) {
    const r = e.getIndent();
    if (r >= T.CODE_BLOCK_INDENT)
      return b.none();
    let s = e.getNextNonSpaceIndex();
    const n = ye.checkOpener(
      e.getLine().getContent(),
      s,
      r
    );
    return n !== null ? b.of(n).atIndex(
      s + (n.block.getOpeningFenceLength() || 0)
    ) : b.none();
  }
};
const Pe = class Pe extends K {
  constructor(t, r, s) {
    super();
    i(this, "block", new F());
    i(this, "fenceChar");
    i(this, "openingFenceLength");
    i(this, "firstLine", null);
    i(this, "otherLines", new y());
    this.fenceChar = t, this.openingFenceLength = r, this.block.setFenceCharacter(t), this.block.setOpeningFenceLength(r), this.block.setFenceIndent(s);
  }
  getBlock() {
    return this.block;
  }
  tryContinue(t) {
    const r = t.getNextNonSpaceIndex();
    let s = t.getIndex();
    const n = t.getLine().getContent();
    if (t.getIndent() < T.CODE_BLOCK_INDENT && r < n.length && this.tryClosing(n, r))
      return w.finished();
    {
      let a = this.block.getFenceIndent() || 0;
      const l = n.length;
      for (; a > 0 && s < l && n.charAt(s) === " "; )
        s++, a--;
    }
    return w.atIndex(s);
  }
  addLine(t) {
    this.firstLine === null ? this.firstLine = t.getContent().toString() : (this.otherLines.append(t.getContent()), this.otherLines.append(`
`));
  }
  closeBlock() {
    var t;
    this.block.setInfo(E.unescapeString(((t = this.firstLine) == null ? void 0 : t.trim()) || "")), this.block.setLiteral(this.otherLines.toString());
  }
  // spec: A code fence is a sequence of at least three consecutive backtick characters (`) or tildes (~). (Tildes and
  // backticks cannot be mixed.)
  static checkOpener(t, r, s) {
    let n = 0, a = 0;
    const l = t.length;
    e: for (let c = r; c < l; c++)
      switch (t.charAt(c)) {
        case "`":
          n++;
          break;
        case "~":
          a++;
          break;
        default:
          break e;
      }
    return n >= 3 && a === 0 ? m.find("`", t, r + n) !== -1 ? null : new Pe("`", n, s) : a >= 3 && n === 0 ? new Pe("~", a, s) : null;
  }
  // spec: The content of the code block consists of all subsequent lines, until a closing code fence of the same type
  // as the code block began with (backticks or tildes), and with at least as many backticks or tildes as the opening
  // code fence.
  tryClosing(t, r) {
    let s = m.skip(this.fenceChar, t, r, t.length) - r;
    return s < this.openingFenceLength ? !1 : m.skipSpaceTab(t, r + s, t.length) === t.length ? (this.block.setClosingFenceLength(s), !0) : !1;
  }
};
i(Pe, "Factory", Yt);
let ye = Pe, jt = class {
  tryStart(e, t) {
    if (e.getIndent() >= T.CODE_BLOCK_INDENT)
      return b.none();
    const r = e.getLine();
    let s = e.getNextNonSpaceIndex();
    if (r.getContent().charAt(s) === "#") {
      let a = fe.getAtxHeading(
        r.substring(s, r.getContent().length)
      );
      if (a !== null)
        return b.of(a).atIndex(r.getContent().length);
    }
    const n = fe.getSetextHeadingLevel(
      r.getContent(),
      s
    );
    if (n > 0) {
      const a = t.getParagraphLines();
      if (!a.isEmpty())
        return b.of(new fe(n, a)).atIndex(r.getContent().length).setReplaceActiveBlockParser();
    }
    return b.none();
  }
};
const re = class re extends K {
  constructor(t, r) {
    super();
    i(this, "block", new G());
    i(this, "content");
    this.block.setLevel(t), this.content = r;
  }
  getBlock() {
    return this.block;
  }
  tryContinue(t) {
    return w.none();
  }
  parseInlines(t) {
    t.parse(this.content, this.block);
  }
  // spec: An ATX heading consists of a string of characters, parsed as inline content, between an opening sequence of
  // 1-6 unescaped # characters and an optional closing sequence of any number of unescaped # characters. The opening
  // sequence of # characters must be followed by a space or by the end of line. The optional closing sequence of #s
  // must be preceded by a space and may be followed by spaces only.
  static getAtxHeading(t) {
    const r = se.of(q.of([t])), s = r.matchMultiple("#");
    if (s === 0 || s > 6)
      return null;
    if (!r.hasNext())
      return new re(s, q.empty());
    const n = r.peek();
    if (!(n === " " || n === "	"))
      return null;
    r.whitespace();
    const a = r.position();
    let l = a, c = !0;
    for (; r.hasNext(); )
      switch (r.peek()) {
        case "#":
          if (c) {
            r.matchMultiple("#");
            const f = r.whitespace();
            r.hasNext() && (l = r.position()), c = f > 0;
          } else
            r.next(), l = r.position();
          break;
        case " ":
        case "	":
          c = !0, r.next();
          break;
        default:
          c = !1, r.next(), l = r.position();
      }
    const h = r.getSource(a, l);
    return h.getContent() === "" ? new re(s, q.empty()) : new re(s, h);
  }
  // spec: A setext heading underline is a sequence of = characters or a sequence of - characters, with no more than
  // 3 spaces indentation and any number of trailing spaces.
  static getSetextHeadingLevel(t, r) {
    switch (t.charAt(r)) {
      case "=":
        if (re.isSetextHeadingRest(t, r + 1, "="))
          return 1;
        break;
      case "-":
        if (re.isSetextHeadingRest(t, r + 1, "-"))
          return 2;
        break;
    }
    return 0;
  }
  static isSetextHeadingRest(t, r, s) {
    const n = m.skip(s, t, r, t.length);
    return m.skipSpaceTab(t, n, t.length) >= t.length;
  }
};
i(re, "Factory", jt);
let fe = re, Qt = class {
  tryStart(e, t) {
    const r = e.getNextNonSpaceIndex(), s = e.getLine().getContent();
    if (e.getIndent() < 4 && s.charAt(r) === "<")
      for (let n = 1; n <= 7; n++) {
        if (n === 7 && (t.getMatchedBlockParser().getBlock() instanceof M || e.getActiveBlockParser().canHaveLazyContinuationLines()))
          continue;
        const a = ke.BLOCK_PATTERNS[n][0], l = ke.BLOCK_PATTERNS[n][1];
        if (a == null ? void 0 : a.exec(s.substring(r, s.length)))
          return b.of(new ke(l)).atIndex(
            e.getIndex()
          );
      }
    return b.none();
  }
};
const g = class g extends K {
  constructor(t = null) {
    super();
    i(this, "block", new J());
    i(this, "closingPattern");
    i(this, "finished", !1);
    i(this, "content", new zt());
    this.closingPattern = t;
  }
  getBlock() {
    return this.block;
  }
  tryContinue(t) {
    return this.finished || t.isBlank() && this.closingPattern === null ? w.none() : w.atIndex(t.getIndex());
  }
  addLine(t) {
    var r;
    (r = this.content) == null || r.add(t.getContent()), this.closingPattern !== null && this.closingPattern.exec(t.getContent()) && (this.finished = !0);
  }
  closeBlock() {
    var t;
    this.block.setLiteral(((t = this.content) == null ? void 0 : t.getString()) || ""), this.content = null;
  }
};
i(g, "TAGNAME", "[A-Za-z][A-Za-z0-9-]*"), i(g, "ATTRIBUTENAME", "[a-zA-Z_:][a-zA-Z0-9:._-]*"), i(g, "UNQUOTEDVALUE", "[^\"'=<>`\\x00-\\x20]+"), i(g, "SINGLEQUOTEDVALUE", "'[^']*'"), i(g, "DOUBLEQUOTEDVALUE", '"[^"]*"'), i(g, "ATTRIBUTEVALUE", "(?:" + g.UNQUOTEDVALUE + "|" + g.SINGLEQUOTEDVALUE + "|" + g.DOUBLEQUOTEDVALUE + ")"), i(g, "ATTRIBUTEVALUESPEC", "(?:\\s*=\\s*" + g.ATTRIBUTEVALUE + ")"), i(g, "ATTRIBUTE", "(?:\\s+" + g.ATTRIBUTENAME + g.ATTRIBUTEVALUESPEC + "?)"), i(g, "OPENTAG", "<" + g.TAGNAME + g.ATTRIBUTE + "*\\s*/?>"), i(g, "CLOSETAG", "</" + g.TAGNAME + "\\s*[>]"), i(g, "BLOCK_PATTERNS", [
  [null, null],
  // not used (no type 0)
  [
    /^<(?:script|pre|style|textarea)(?:\\s|>|$)/i,
    /<\/(?:script|pre|style|textarea)>/i
  ],
  [/^<!--/, /-->/],
  [/^<[?]/, /\\?>/],
  [/^<![A-Z]/, />/],
  [/^<!\[CDATA\[/, /\]\]>/],
  [
    new RegExp(
      "^</?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\\s|[/]?[>]|$)",
      "i"
    ),
    null
    // terminated by blank line
  ],
  [
    new RegExp(
      "^(?:" + g.OPENTAG + "|" + g.CLOSETAG + ")\\s*$",
      "i"
    ),
    null
    // terminated by blank line
  ]
]), i(g, "Factory", Qt);
let ke = g, Jt = class {
  tryStart(e, t) {
    return e.getIndent() >= T.CODE_BLOCK_INDENT && !e.isBlank() && !(e.getActiveBlockParser().getBlock() instanceof M) ? b.of(new nt()).atColumn(
      e.getColumn() + T.CODE_BLOCK_INDENT
    ) : b.none();
  }
};
class nt extends K {
  constructor() {
    super(...arguments);
    i(this, "block", new X());
    i(this, "lines", []);
  }
  getBlock() {
    return this.block;
  }
  tryContinue(t) {
    return t.getIndent() >= T.CODE_BLOCK_INDENT ? w.atColumn(
      t.getColumn() + T.CODE_BLOCK_INDENT
    ) : t.isBlank() ? w.atIndex(t.getNextNonSpaceIndex()) : w.none();
  }
  addLine(t) {
    this.lines.push(t.getContent());
  }
  closeBlock() {
    let t = this.lines.length - 1;
    for (; t >= 0 && m.isBlank(this.lines[t]); )
      t--;
    const r = new y();
    for (let s = 0; s < t + 1; s++)
      r.append(this.lines[s]), r.append(`
`);
    this.block.setLiteral(r.toString());
  }
}
i(nt, "Factory", Jt);
class Nt {
  constructor(e, t, r, s, n) {
    i(this, "inlineContentParserFactories");
    i(this, "delimiterProcessors");
    i(this, "linkProcessors");
    i(this, "linkMarkers");
    i(this, "definitions");
    this.inlineContentParserFactories = e, this.delimiterProcessors = t, this.linkProcessors = r, this.linkMarkers = s, this.definitions = n;
  }
  getCustomInlineContentParserFactories() {
    return this.inlineContentParserFactories;
  }
  getCustomDelimiterProcessors() {
    return this.delimiterProcessors;
  }
  getCustomLinkProcessors() {
    return this.linkProcessors;
  }
  getCustomLinkMarkers() {
    return this.linkMarkers;
  }
  getLinkReferenceDefinition(e) {
    return this.definitions.getDefinition(Ke, e);
  }
  getDefinition(e, t) {
    return this.definitions.getDefinition(e, t);
  }
}
class Xt extends K {
  constructor(t, r) {
    super();
    i(this, "block", new _());
    /**
     * Minimum number of columns that the content has to be indented (relative to the containing block) to be part of
     * this list item.
     */
    i(this, "contentIndent");
    i(this, "hadBlankLine", !1);
    this.contentIndent = r, this.block.setMarkerIndent(t), this.block.setContentIndent(r);
  }
  isContainer() {
    return !0;
  }
  canContain(t) {
    if (this.hadBlankLine) {
      const r = this.block.getParent();
      r instanceof me && r.setTight(!1);
    }
    return !0;
  }
  getBlock() {
    return this.block;
  }
  tryContinue(t) {
    if (t.isBlank()) {
      if (this.block.getFirstChild() === null)
        return w.none();
      {
        const r = t.getActiveBlockParser().getBlock();
        return this.hadBlankLine = r instanceof M || r instanceof _, w.atIndex(t.getNextNonSpaceIndex());
      }
    }
    return t.getIndent() >= this.contentIndent ? w.atColumn(t.getColumn() + this.contentIndent) : w.none();
  }
}
let _t = class {
  tryStart(e, t) {
    const r = t.getMatchedBlockParser();
    if (e.getIndent() >= T.CODE_BLOCK_INDENT)
      return b.none();
    const s = e.getNextNonSpaceIndex(), n = e.getColumn() + e.getIndent(), a = !t.getParagraphLines().isEmpty(), l = le.parseList(
      e.getLine().getContent(),
      s,
      n,
      a
    );
    if (l === null)
      return b.none();
    const c = l.contentColumn, h = new Xt(
      e.getIndent(),
      c - e.getColumn()
    );
    if (!(r instanceof le) || !le.listsMatch(
      r.getBlock(),
      l.listBlock
    )) {
      const u = new le(
        l.listBlock
      );
      return l.listBlock.setTight(!0), b.of(u, h).atColumn(c);
    } else
      return b.of(h).atColumn(c);
  }
};
class pt {
  constructor(e, t) {
    i(this, "listBlock");
    i(this, "contentColumn");
    this.listBlock = e, this.contentColumn = t;
  }
}
class dt {
  constructor(e, t) {
    i(this, "listBlock");
    i(this, "indexAfterMarker");
    this.listBlock = e, this.indexAfterMarker = t;
  }
}
const z = class z extends K {
  constructor(t) {
    super();
    i(this, "block");
    i(this, "hadBlankLine", !1);
    i(this, "linesAfterBlank");
    this.block = t;
  }
  isContainer() {
    return !0;
  }
  canContain(t) {
    return t instanceof _ ? (this.hadBlankLine && this.linesAfterBlank === 1 && (this.block.setTight(!1), this.hadBlankLine = !1), !0) : !1;
  }
  getBlock() {
    return this.block;
  }
  tryContinue(t) {
    return t.isBlank() ? (this.hadBlankLine = !0, this.linesAfterBlank = 0) : this.hadBlankLine && (this.linesAfterBlank = (this.linesAfterBlank || 0) + 1), w.atIndex(t.getIndex());
  }
  /**
   * Parse a list marker and return data on the marker or null.
   */
  static parseList(t, r, s, n) {
    let a = z.parseListMarker(t, r);
    if (a === null)
      return null;
    let l = a.listBlock;
    const c = a.indexAfterMarker, h = c - r, u = s + h;
    let p = u, f = !1;
    const S = t.length;
    for (let H = c; H < S; H++) {
      const B = t.charAt(H);
      if (B === "	")
        p += T.columnsToNextTabStop(p);
      else if (B === " ")
        p++;
      else {
        f = !0;
        break;
      }
    }
    return n && (l instanceof V && l.getMarkerStartNumber() !== 1 || !f) ? null : ((!f || p - u > T.CODE_BLOCK_INDENT) && (p = u + 1), new pt(l, p));
  }
  static parseListMarker(t, r) {
    const s = t.charAt(r);
    switch (s) {
      // spec: A bullet list marker is a -, +, or * character.
      case "-":
      case "+":
      case "*":
        if (z.isSpaceTabOrEnd(t, r + 1)) {
          let n = new Y();
          return n.setMarker(s), new dt(n, r + 1);
        } else
          return null;
      default:
        return z.parseOrderedList(t, r);
    }
  }
  // spec: An ordered list marker is a sequence of 1-9 arabic digits (0-9), followed by either a `.` character or a
  // `)` character.
  static parseOrderedList(t, r) {
    let s = 0, n = t.length;
    for (let a = r; a < n; a++) {
      const l = t.charAt(a);
      switch (l) {
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          if (s++, s > 9)
            return null;
          break;
        case ".":
        case ")":
          if (s >= 1 && z.isSpaceTabOrEnd(t, a + 1)) {
            const c = t.substring(r, a), h = new V();
            return h.setMarkerStartNumber(window.parseInt(c)), h.setMarkerDelimiter(l), new z.ListMarkerData(h, a + 1);
          } else
            return null;
        default:
          return null;
      }
    }
    return null;
  }
  static isSpaceTabOrEnd(t, r) {
    if (r < t.length)
      switch (t.charAt(r)) {
        case " ":
        case "	":
          return !0;
        default:
          return !1;
      }
    else
      return !0;
  }
  /**
   * Returns true if the two list items are of the same type,
   * with the same delimiter and bullet character. This is used
   * in agglomerating list items into lists.
   */
  static listsMatch(t, r) {
    return t instanceof Y && r instanceof Y ? t.getMarker() === r.getMarker() : t instanceof V && r instanceof V ? t.getMarkerDelimiter() === r.getMarkerDelimiter() : !1;
  }
};
i(z, "Factory", _t), i(z, "ListData", pt), i(z, "ListMarkerData", dt);
let le = z;
class v {
  /**
   * Attempt to scan the contents of a link label (inside the brackets), stopping after the content or returning false.
   * The stopped position can bei either the closing {@code ]}, or the end of the line if the label continues on
   * the next line.
   */
  static scanLinkLabelContent(e) {
    for (; e.hasNext(); )
      switch (e.peek()) {
        case "\\":
          e.next(), v.isEscapable(e.peek()) && e.next();
          break;
        case "]":
          return !0;
        case "[":
          return !1;
        default:
          e.next();
      }
    return !0;
  }
  /**
   * Attempt to scan a link destination, stopping after the destination or returning false.
   */
  static scanLinkDestination(e) {
    if (!e.hasNext())
      return !1;
    if (e.next("<")) {
      for (; e.hasNext(); )
        switch (e.peek()) {
          case "\\":
            e.next(), v.isEscapable(e.peek()) && e.next();
            break;
          case `
`:
          case "<":
            return !1;
          case ">":
            return e.next(), !0;
          default:
            e.next();
        }
      return !1;
    } else
      return v.scanLinkDestinationWithBalancedParens(e);
  }
  static scanLinkTitle(e) {
    if (!e.hasNext())
      return !1;
    let t;
    switch (e.peek()) {
      case '"':
        t = '"';
        break;
      case "'":
        t = "'";
        break;
      case "(":
        t = ")";
        break;
      default:
        return !1;
    }
    return e.next(), !v.scanLinkTitleContent(e, t) || !e.hasNext() ? !1 : (e.next(), !0);
  }
  static scanLinkTitleContent(e, t) {
    for (; e.hasNext(); ) {
      let r = e.peek();
      if (r === "\\")
        e.next(), v.isEscapable(e.peek()) && e.next();
      else {
        if (r === t)
          return !0;
        if (t === ")" && r === "(")
          return !1;
        e.next();
      }
    }
    return !0;
  }
  // spec: a nonempty sequence of characters that does not start with <, does not include ASCII space or control
  // characters, and includes parentheses only if (a) they are backslash-escaped or (b) they are part of a balanced
  // pair of unescaped parentheses
  static scanLinkDestinationWithBalancedParens(e) {
    let t = 0, r = !0;
    for (; e.hasNext(); ) {
      let s = e.peek();
      switch (s) {
        case " ":
          return !r;
        case "\\":
          e.next(), v.isEscapable(e.peek()) && e.next();
          break;
        case "(":
          if (t++, t > 32)
            return !1;
          e.next();
          break;
        case ")":
          if (t === 0)
            return !0;
          t--, e.next();
          break;
        default:
          if (P.isISOControl(s))
            return !r;
          e.next();
          break;
      }
      r = !1;
    }
    return !0;
  }
  static isEscapable(e) {
    switch (e) {
      case "!":
      case '"':
      case "#":
      case "$":
      case "%":
      case "&":
      case "'":
      case "(":
      case ")":
      case "*":
      case "+":
      case ",":
      case "-":
      case ".":
      case "/":
      case ":":
      case ";":
      case "<":
      case "=":
      case ">":
      case "?":
      case "@":
      case "[":
      case "\\":
      case "]":
      case "^":
      case "_":
      case "`":
      case "{":
      case "|":
      case "}":
      case "~":
        return !0;
    }
    return !1;
  }
}
var It = /* @__PURE__ */ ((o) => (o.START_DEFINITION = "START_DEFINITION", o.LABEL = "LABEL", o.DESTINATION = "DESTINATION", o.START_TITLE = "START_TITLE", o.TITLE = "TITLE", o.PARAGRAPH = "PARAGRAPH", o))(It || {});
class Bt {
  constructor() {
    i(this, "state", "START_DEFINITION");
    i(this, "paragraphLines", []);
    i(this, "definitions", []);
    i(this, "sourceSpans", []);
    i(this, "label", null);
    i(this, "destination", null);
    i(this, "titleDelimiter", null);
    i(this, "title", null);
    i(this, "referenceValid", !1);
  }
  parse(e) {
    if (this.paragraphLines.push(e), this.state === "PARAGRAPH")
      return;
    let t = se.of(q.of([e]));
    for (; t.hasNext(); ) {
      let r;
      switch (this.state) {
        case "START_DEFINITION": {
          r = this.startDefinition(t);
          break;
        }
        case "LABEL": {
          r = this.setLabel(t);
          break;
        }
        case "DESTINATION": {
          r = this.setDestination(t);
          break;
        }
        case "START_TITLE": {
          r = this.startTitle(t);
          break;
        }
        case "TITLE": {
          r = this.setTitle(t);
          break;
        }
        default:
          throw Error("Unknown parsing state: " + this.state);
      }
      if (!r) {
        this.state = "PARAGRAPH", this.finishReference();
        return;
      }
    }
  }
  addSourceSpan(e) {
    this.sourceSpans.push(e);
  }
  /**
   * @return the lines that are normal paragraph content, without newlines
   */
  getParagraphLines() {
    return q.of(this.paragraphLines);
  }
  getParagraphSourceSpans() {
    return this.sourceSpans;
  }
  getDefinitions() {
    return this.finishReference(), this.definitions;
  }
  getState() {
    return this.state;
  }
  startDefinition(e) {
    return this.finishReference(), e.whitespace(), e.next("[") ? (this.state = "LABEL", this.label = new y(), e.hasNext() || this.label.append(`
`), !0) : !1;
  }
  setLabel(e) {
    var r, s;
    const t = e.position();
    return v.scanLinkLabelContent(e) ? ((r = this.label) == null || r.append(
      e.getSource(t, e.position()).getContent()
    ), e.hasNext() ? e.next("]") ? !e.next(":") || this.label && this.label.length() > 999 || E.normalizeLabelContent(
      this.label.toString()
    ) === "" ? !1 : (this.state = "DESTINATION", e.whitespace(), !0) : !1 : ((s = this.label) == null || s.append(`
`), !0)) : !1;
  }
  setDestination(e) {
    e.whitespace();
    const t = e.position();
    if (!v.scanLinkDestination(e))
      return !1;
    const r = e.getSource(t, e.position()).getContent();
    this.destination = r.startsWith("<") ? r.substring(1, r.length - 1) : r;
    const s = e.whitespace();
    if (!e.hasNext())
      this.referenceValid = !0, this.paragraphLines.length = 0;
    else if (s === 0)
      return !1;
    return this.state = "START_TITLE", !0;
  }
  startTitle(e) {
    if (e.whitespace(), !e.hasNext())
      return this.state = "START_DEFINITION", !0;
    this.titleDelimiter = "\0";
    let t = e.peek();
    switch (t) {
      case '"':
      case "'":
        this.titleDelimiter = t;
        break;
      case "(":
        this.titleDelimiter = ")";
        break;
    }
    return this.titleDelimiter !== "\0" ? (this.state = "TITLE", this.title = new y(), e.next(), e.hasNext() || this.title.append(`
`)) : this.state = "START_DEFINITION", !0;
  }
  setTitle(e) {
    var r, s;
    const t = e.position();
    return v.scanLinkTitleContent(e, this.titleDelimiter || "") ? ((r = this.title) == null || r.append(
      e.getSource(t, e.position()).getContent()
    ), e.hasNext() ? (e.next(), e.whitespace(), e.hasNext() ? (this.title = null, !1) : (this.referenceValid = !0, this.paragraphLines.length = 0, this.state = "START_DEFINITION", !0)) : ((s = this.title) == null || s.append(`
`), !0)) : (this.title = null, !1);
  }
  finishReference() {
    var s;
    if (!this.referenceValid)
      return;
    const e = E.unescapeString(this.destination), t = this.title !== null ? E.unescapeString(this.title.toString()) : "", r = new Ke(
      (s = this.label) == null ? void 0 : s.toString(),
      e,
      t
    );
    r.setSourceSpans(this.sourceSpans), this.sourceSpans.length = 0, this.definitions.push(r), this.label = null, this.referenceValid = !1, this.destination = null, this.title = null;
  }
}
i(Bt, "State", It);
class Xe extends K {
  constructor() {
    super(...arguments);
    i(this, "block", new M());
    i(this, "linkReferenceDefinitionParser", new Bt());
  }
  canHaveLazyContinuationLines() {
    return !0;
  }
  getBlock() {
    return this.block;
  }
  tryContinue(t) {
    return t.isBlank() ? w.none() : w.atIndex(t.getIndex());
  }
  addLine(t) {
    this.linkReferenceDefinitionParser.parse(t);
  }
  addSourceSpan(t) {
    this.linkReferenceDefinitionParser.addSourceSpan(t);
  }
  getDefinitions() {
    const t = new Vt(Ke);
    for (const r of this.linkReferenceDefinitionParser.getDefinitions())
      t.putIfAbsent(r.getLabel(), r);
    return [t];
  }
  closeBlock() {
    for (const t of this.linkReferenceDefinitionParser.getDefinitions())
      this.block.insertBefore(t);
    this.linkReferenceDefinitionParser.getParagraphLines().isEmpty() ? this.block.unlink() : this.block.setSourceSpans(
      this.linkReferenceDefinitionParser.getParagraphSourceSpans()
    );
  }
  parseInlines(t) {
    const r = this.linkReferenceDefinitionParser.getParagraphLines();
    r.isEmpty() || t.parse(r, this.block);
  }
  getParagraphLines() {
    return this.linkReferenceDefinitionParser.getParagraphLines();
  }
}
let er = class {
  tryStart(e, t) {
    if (e.getIndent() >= 4)
      return b.none();
    const r = e.getNextNonSpaceIndex(), s = e.getLine().getContent();
    if (De.isThematicBreak(s, r)) {
      const n = s.substring(e.getIndex(), s.length);
      return b.of(new De(n)).atIndex(
        s.length
      );
    } else
      return b.none();
  }
};
class De extends K {
  constructor(t) {
    super();
    i(this, "block", new te());
    this.block.setLiteral(t);
  }
  getBlock() {
    return this.block;
  }
  tryContinue(t) {
    return w.none();
  }
  // spec: A line consisting of 0-3 spaces of indentation, followed by a sequence of three or more matching -, _, or *
  // characters, each followed optionally by any number of spaces, forms a thematic break.
  static isThematicBreak(t, r) {
    let s = 0, n = 0, a = 0;
    const l = t.length;
    for (let c = r; c < l; c++)
      switch (t.charAt(c)) {
        case "-":
          s++;
          break;
        case "_":
          n++;
          break;
        case "*":
          a++;
          break;
        case " ":
        case "	":
          break;
        default:
          return !1;
      }
    return s >= 3 && n === 0 && a === 0 || n >= 3 && s === 0 && a === 0 || a >= 3 && s === 0 && n === 0;
  }
}
i(De, "Factory", er);
class tr {
  constructor(e) {
    i(this, "matchedBlockParser");
    this.matchedBlockParser = e;
  }
  getMatchedBlockParser() {
    return this.matchedBlockParser;
  }
  getParagraphLines() {
    return this.matchedBlockParser instanceof Xe ? this.matchedBlockParser.getParagraphLines() : q.empty();
  }
}
class gt {
  constructor(e, t) {
    i(this, "blockParser");
    i(this, "sourceIndex");
    this.blockParser = e, this.sourceIndex = t;
  }
}
const I = class I {
  constructor(e, t, r, s, n, a, l) {
    i(this, "line");
    /**
     * Line index (0-based)
     */
    i(this, "lineIndex", -1);
    /**
     * current index (offset) in input line (0-based)
     */
    i(this, "index", 0);
    /**
     * current column of input line (tab causes column to go to next 4-space tab stop) (0-based)
     */
    i(this, "column", 0);
    /**
     * if the current column is within a tab character (partially consumed tab)
     */
    i(this, "columnIsInTab", !1);
    i(this, "nextNonSpace", 0);
    i(this, "nextNonSpaceColumn", 0);
    i(this, "indent", 0);
    i(this, "blank", !1);
    i(this, "blockParserFactories");
    i(this, "inlineParserFactory");
    i(this, "inlineContentParserFactories");
    i(this, "delimiterProcessors");
    i(this, "linkProcessors");
    i(this, "linkMarkers");
    i(this, "includeSourceSpans");
    i(this, "documentBlockParser");
    i(this, "definitions", new Et());
    i(this, "openBlockParsers", []);
    i(this, "allBlockParsers", []);
    this.blockParserFactories = e, this.inlineParserFactory = t, this.inlineContentParserFactories = r, this.delimiterProcessors = s, this.linkProcessors = n, this.linkMarkers = a, this.includeSourceSpans = l, this.documentBlockParser = new Zt(), this.activateBlockParser(new gt(this.documentBlockParser, 0));
  }
  static getDefaultBlockParserTypes() {
    return I.CORE_FACTORY_TYPES;
  }
  static calculateBlockParserFactories(e, t) {
    const r = [];
    r.push(...e);
    for (const s of t)
      r.push(I.NODES_TO_CORE_FACTORIES.get(s));
    return r;
  }
  static checkEnabledBlockTypes(e) {
    for (const t of e)
      if (!I.NODES_TO_CORE_FACTORIES.has(t))
        throw new Error(
          "Can't enable block type " + t + ", possible options are: " + I.NODES_TO_CORE_FACTORIES.keys()
        );
  }
  /**
   * The main parsing function. Returns a parsed document AST.
   */
  parse(e) {
    let t = 0, r;
    for (; (r = m.findLineBreak(e, t)) !== -1; ) {
      let s = e.substring(t, r);
      this.parseLine(s, t), r + 1 < e.length && e.charAt(r) === "\r" && e.charAt(r + 1) === `
` ? t = r + 2 : t = r + 1;
    }
    if (e !== "" && (t === 0 || t < e.length)) {
      let s = e.substring(t);
      this.parseLine(s, t);
    }
    return this.finalizeAndProcess();
  }
  getLine() {
    return this.line;
  }
  getIndex() {
    return this.index;
  }
  getNextNonSpaceIndex() {
    return this.nextNonSpace;
  }
  getColumn() {
    return this.column;
  }
  getIndent() {
    return this.indent;
  }
  isBlank() {
    return this.blank;
  }
  getActiveBlockParser() {
    return this.openBlockParsers[this.openBlockParsers.length - 1].blockParser;
  }
  /**
   * Analyze a line of text and update the document appropriately. We parse markdown text by calling this on each
   * line of input, then finalizing the document.
   */
  parseLine(e, t) {
    this.setLine(e, t);
    let r = 1;
    for (let h = 1; h < this.openBlockParsers.length; h++) {
      const u = this.openBlockParsers[h], p = u.blockParser;
      this.findNextNonSpace();
      const f = p.tryContinue(this);
      if (f instanceof Be) {
        const S = f;
        if (u.sourceIndex = this.getIndex(), S.isFinalize()) {
          this.addSourceSpans(), this.closeBlockParsers(this.openBlockParsers.length - h);
          return;
        } else
          S.getNewIndex() !== -1 ? this.setNewIndex(S.getNewIndex()) : S.getNewColumn() !== -1 && this.setNewColumn(S.getNewColumn()), r++;
      } else
        break;
    }
    let s = this.openBlockParsers.length - r, n = this.openBlockParsers[r - 1].blockParser, a = !1, l = this.index, c = n.getBlock() instanceof M || n.isContainer();
    for (; c; ) {
      if (l = this.index, this.findNextNonSpace(), this.isBlank() || this.indent < T.CODE_BLOCK_INDENT && m.isLetter(this.line.getContent(), this.nextNonSpace)) {
        this.setNewIndex(this.nextNonSpace);
        break;
      }
      const h = this.findBlockStart(n);
      if (h === null) {
        this.setNewIndex(this.nextNonSpace);
        break;
      }
      a = !0;
      const u = this.getIndex();
      s > 0 && (this.closeBlockParsers(s), s = 0), h.getNewIndex() !== -1 ? this.setNewIndex(h.getNewIndex()) : h.getNewColumn() !== -1 && this.setNewColumn(h.getNewColumn());
      let p = null;
      h.isReplaceActiveBlockParser() && (p = this.prepareActiveBlockParserForReplacement().getSourceSpans());
      for (let f of h.getBlockParsers())
        this.addChild(
          new I.OpenBlockParser(f, u)
        ), p !== null && f.getBlock().setSourceSpans(p), n = f, c = f.isContainer();
    }
    if (!a && !this.isBlank() && this.getActiveBlockParser().canHaveLazyContinuationLines())
      this.openBlockParsers[this.openBlockParsers.length - 1].sourceIndex = l, this.addLine();
    else if (s > 0 && this.closeBlockParsers(s), !n.isContainer())
      this.addLine();
    else if (this.isBlank())
      this.addSourceSpans();
    else {
      let h = new Xe();
      this.addChild(
        new I.OpenBlockParser(h, l)
      ), this.addLine();
    }
  }
  setLine(e, t) {
    this.lineIndex++, this.index = 0, this.column = 0, this.columnIsInTab = !1;
    let r = I.prepareLine(e), s = null;
    this.includeSourceSpans !== Se.NONE && (s = ce.of(
      this.lineIndex,
      0,
      t,
      r.length
    )), this.line = ne.of(r, s);
  }
  findNextNonSpace() {
    var s;
    let e = this.index, t = this.column;
    this.blank = !0;
    let r = ((s = this.line) == null ? void 0 : s.getContent().length) || 0;
    for (; e < r; ) {
      switch (this.line.getContent().charAt(e)) {
        case " ":
          e++, t++;
          continue;
        case "	":
          e++, t += 4 - t % 4;
          continue;
      }
      this.blank = !1;
      break;
    }
    this.nextNonSpace = e, this.nextNonSpaceColumn = t, this.indent = this.nextNonSpaceColumn - this.column;
  }
  setNewIndex(e) {
    e >= this.nextNonSpace && (this.index = this.nextNonSpace, this.column = this.nextNonSpaceColumn);
    let t = this.line.getContent().length;
    for (; this.index < e && this.index !== t; )
      this.advance();
    this.columnIsInTab = !1;
  }
  setNewColumn(e) {
    e >= this.nextNonSpaceColumn && (this.index = this.nextNonSpace, this.column = this.nextNonSpaceColumn);
    let t = this.line.getContent().length;
    for (; this.column < e && this.index !== t; )
      this.advance();
    this.column > e ? (this.index--, this.column = e, this.columnIsInTab = !0) : this.columnIsInTab = !1;
  }
  advance() {
    const e = this.line.getContent().charAt(this.index);
    this.index++, e === "	" ? this.column += T.columnsToNextTabStop(this.column) : this.column++;
  }
  /**
   * Add line content to the active block parser. We assume it can accept lines -- that check should be done before
   * calling this.
   */
  addLine() {
    let e;
    if (this.columnIsInTab) {
      const r = this.index + 1, s = this.line.getContent().substring(r, this.line.getContent().length), n = T.columnsToNextTabStop(this.column), a = new y();
      for (let l = 0; l < n; l++)
        a.append(" ");
      a.append(s), e = a.toString();
    } else this.index === 0 ? e = this.line.getContent() : e = this.line.getContent().substring(this.index, this.line.getContent().length);
    let t = null;
    this.includeSourceSpans === Se.BLOCKS_AND_INLINES && this.index < this.line.getSourceSpan().getLength() && (t = this.line.getSourceSpan().subSpan(this.index)), this.getActiveBlockParser().addLine(ne.of(e, t)), this.addSourceSpans();
  }
  addSourceSpans() {
    if (this.includeSourceSpans !== Se.NONE)
      for (let e = 1; e < this.openBlockParsers.length; e++) {
        const t = this.openBlockParsers[e], r = Math.min(t.sourceIndex, this.index);
        this.line.getContent().length - r !== 0 && t.blockParser.addSourceSpan(
          this.line.getSourceSpan().subSpan(r)
        );
      }
  }
  findBlockStart(e) {
    const t = new I.MatchedBlockParserImpl(e);
    for (const r of this.blockParserFactories) {
      const s = r.tryStart(this, t);
      if (s instanceof Tt)
        return s;
    }
    return null;
  }
  /**
   * Walk through a block & children recursively, parsing string content into inline content where appropriate.
   */
  processInlines() {
    const e = new Nt(
      this.inlineContentParserFactories,
      this.delimiterProcessors,
      this.linkProcessors,
      this.linkMarkers,
      this.definitions
    ), t = this.inlineParserFactory.create(e);
    for (const r of this.allBlockParsers)
      r.parseInlines(t);
  }
  /**
   * Add block of type tag as a child of the tip. If the tip can't accept children, close and finalize it and try
   * its parent, and so on until we find a block that can accept children.
   */
  addChild(e) {
    for (; !this.getActiveBlockParser().canContain(
      e.blockParser.getBlock()
    ); )
      this.closeBlockParsers(1);
    this.getActiveBlockParser().getBlock().appendChild(e.blockParser.getBlock()), this.activateBlockParser(e);
  }
  activateBlockParser(e) {
    this.openBlockParsers.push(e);
  }
  deactivateBlockParser() {
    return this.openBlockParsers.splice(this.openBlockParsers.length - 1, 1)[0];
  }
  prepareActiveBlockParserForReplacement() {
    const e = this.deactivateBlockParser().blockParser;
    if (e instanceof Xe) {
      let t = e;
      this.addDefinitionsFrom(t);
    }
    return e.closeBlock(), e.getBlock().unlink(), e.getBlock();
  }
  finalizeAndProcess() {
    return this.closeBlockParsers(this.openBlockParsers.length), this.processInlines(), this.documentBlockParser.getBlock();
  }
  closeBlockParsers(e) {
    for (let t = 0; t < e; t++) {
      const r = this.deactivateBlockParser().blockParser;
      this.finalize(r), this.allBlockParsers.push(r);
    }
  }
  /**
   * Finalize a block. Close it and do any necessary postprocessing, e.g. setting the content of blocks and
   * collecting link reference definitions from paragraphs.
   */
  finalize(e) {
    this.addDefinitionsFrom(e), e.closeBlock();
  }
  addDefinitionsFrom(e) {
    for (let t of e.getDefinitions())
      this.definitions.addDefinitions(t);
  }
  /**
   * Prepares the input line replacing {@code \0}
   */
  static prepareLine(e) {
    return e.indexOf("\0") === -1 ? e : e.replace(/\0/g, "�");
  }
};
i(I, "CORE_FACTORY_TYPES", /* @__PURE__ */ new Set([
  Q,
  G,
  F,
  J,
  te,
  me,
  X
])), i(I, "NODES_TO_CORE_FACTORIES", /* @__PURE__ */ new Map([
  [Q, new Te.Factory()],
  [G, new fe.Factory()],
  [F, new ye.Factory()],
  [J, new ke.Factory()],
  [te, new De.Factory()],
  [me, new le.Factory()],
  [X, new nt.Factory()]
])), i(I, "MatchedBlockParserImpl", tr), i(I, "OpenBlockParser", gt);
let xe = I;
class vt {
  constructor(e) {
    i(this, "delimiterChar");
    this.delimiterChar = e;
  }
  getOpeningCharacter() {
    return this.delimiterChar;
  }
  getClosingCharacter() {
    return this.delimiterChar;
  }
  getMinLength() {
    return 1;
  }
  process(e, t) {
    if ((e.getCanClose() || t.getCanOpen()) && t.getOriginalLength() % 3 !== 0 && (e.getOriginalLength() + t.getOriginalLength()) % 3 === 0)
      return 0;
    let r, s;
    e.length() >= 2 && t.length() >= 2 ? (r = 2, s = new be(this.delimiterChar + this.delimiterChar)) : (r = 1, s = new we(this.delimiterChar));
    const n = We.empty();
    n.addAllFrom(e.getOpeners(r));
    const a = e.getOpener();
    for (const l of Je.between(a, t.getCloser()))
      s.appendChild(l), n.addAll(l.getSourceSpans());
    return n.addAllFrom(t.getClosers(r)), s.setSourceSpans(n.getSourceSpans()), a.insertAfter(s), r;
  }
}
class rr extends vt {
  constructor() {
    super("*");
  }
}
let sr = class {
  getTriggerCharacters() {
    return new Set("<");
  }
  create() {
    return new Re();
  }
};
const oe = class oe {
  tryParse(e) {
    const t = e.getScanner();
    t.next();
    let r = t.position();
    if (t.find(">") > 0) {
      const s = t.getSource(r, t.position()), n = s.getContent();
      t.next();
      let a = "";
      if (oe.URI.exec(n) ? a = n : oe.EMAIL.exec(n) && (a = "mailto:" + n), a !== "") {
        const l = new j(a), c = new A(n);
        return c.setSourceSpans(s.getSourceSpans()), l.appendChild(c), O.of(l, t.position());
      }
    }
    return O.none();
  }
};
i(oe, "URI", /^[a-zA-Z][a-zA-Z0-9.+-]{1,31}:[^<>\u0000-\u0020]*$/), i(oe, "EMAIL", /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/), i(oe, "Factory", sr);
let Re = oe, ir = class {
  getTriggerCharacters() {
    return new Set("\\");
  }
  create() {
    return new Fe();
  }
};
const Ae = class Ae {
  tryParse(e) {
    const t = e.getScanner();
    t.next();
    let r = t.peek();
    return r === `
` ? (t.next(), O.of(new W(), t.position())) : Ae.ESCAPABLE.exec(r) ? (t.next(), O.of(new A(r), t.position())) : O.of(new A("\\"), t.position());
  }
};
i(Ae, "ESCAPABLE", new RegExp("^" + E.ESCAPABLE)), i(Ae, "Factory", ir);
let Fe = Ae, nr = class {
  getTriggerCharacters() {
    return new Set("`");
  }
  create() {
    return new at();
  }
};
class at {
  tryParse(e) {
    const t = e.getScanner(), r = t.position(), s = t.matchMultiple("`"), n = t.position();
    for (; t.find("`") > 0; ) {
      const c = t.position();
      if (t.matchMultiple("`") === s) {
        const u = new ue();
        let p = t.getSource(n, c).getContent();
        return p = p.replace(`
`, " "), p.length >= 3 && p.charAt(0) === " " && p.charAt(p.length - 1) === " " && m.hasNonSpace(p) && (p = p.substring(1, p.length - 1)), u.setLiteral(p), O.of(u, t.position());
      }
    }
    const a = t.getSource(r, n), l = new A(a.getContent());
    return O.of(l, n);
  }
}
i(at, "Factory", nr);
class qe {
  process(e, t, r) {
    if (e.getDestination() !== null)
      return qe.process(
        e,
        t,
        e.getDestination(),
        e.getTitle()
      );
    const s = e.getLabel(), n = s || e.getText() || "", a = r.getDefinition(Ke, n);
    return a !== null ? qe.process(
      e,
      t,
      a.getDestination(),
      a.getTitle()
    ) : Ze.none();
  }
  static process(e, t, r, s) {
    const n = e.getMarker();
    return n !== null && n.getLiteral() === "!" ? Ze.wrapTextIn(
      new ge(r || "", s || void 0),
      t.position()
    ).setIncludeMarker() : Ze.wrapTextIn(
      new j(r || "", s || void 0),
      t.position()
    );
  }
}
let ar = class {
  getTriggerCharacters() {
    return new Set("&");
  }
  create() {
    return new Oe();
  }
};
const D = class D {
  tryParse(e) {
    const t = e.getScanner(), r = t.position();
    t.next();
    const s = t.peek();
    if (s === "#")
      if (t.next(), t.next("x") || t.next("X")) {
        const n = t.match(D.hex);
        if (1 <= n && n <= 6 && t.next(";"))
          return this.entity(t, r);
      } else {
        const n = t.match(D.dec);
        if (1 <= n && n <= 7 && t.next(";"))
          return this.entity(t, r);
      }
    else if (D.entityStart.matches(s) && (t.match(D.entityContinue), t.next(";")))
      return this.entity(t, r);
    return O.none();
  }
  entity(e, t) {
    const r = e.getSource(t, e.position()).getContent();
    return O.of(
      new A(ve.entityToString(r)),
      e.position()
    );
  }
};
i(D, "hex", R.builder().range("0", "9").range("A", "F").range("a", "f").build()), i(D, "dec", R.builder().range("0", "9").build()), i(D, "entityStart", R.builder().range("A", "Z").range("a", "z").build()), i(D, "entityContinue", D.entityStart.newBuilder().range("0", "9").build()), i(D, "Factory", ar);
let Oe = D;
class or {
  getTriggerCharacters() {
    return new Set("<");
  }
  create() {
    return new Me();
  }
}
const d = class d {
  tryParse(e) {
    const t = e.getScanner(), r = t.position();
    t.next();
    let s = t.peek();
    if (d.tagNameStart.matches(s)) {
      if (d.tryOpenTag(t))
        return d.htmlInline(r, t);
    } else if (s === "/") {
      if (d.tryClosingTag(t))
        return d.htmlInline(r, t);
    } else if (s === "?") {
      if (d.tryProcessingInstruction(t))
        return d.htmlInline(r, t);
    } else if (s === "!") {
      if (t.next(), s = t.peek(), s === "-") {
        if (d.tryComment(t))
          return d.htmlInline(r, t);
      } else if (s === "[") {
        if (d.tryCdata(t))
          return d.htmlInline(r, t);
      } else if (d.asciiLetter.matches(s) && d.tryDeclaration(t))
        return d.htmlInline(r, t);
    }
    return O.none();
  }
  static htmlInline(e, t) {
    const r = t.getSource(e, t.position()).getContent(), s = new de();
    return s.setLiteral(r), O.of(s, t.position());
  }
  static tryOpenTag(e) {
    e.next(), e.match(d.tagNameContinue);
    let t = e.whitespace() >= 1;
    for (; t && e.match(d.attributeStart) >= 1; )
      if (e.match(d.attributeContinue), t = e.whitespace() >= 1, e.next("=")) {
        e.whitespace();
        const r = e.peek();
        if (r === "'") {
          if (e.next(), e.find("'") < 0)
            return !1;
          e.next();
        } else if (r === '"') {
          if (e.next(), e.find('"') < 0)
            return !1;
          e.next();
        } else if (e.find(d.attributeValueEnd) <= 0)
          return !1;
        t = e.whitespace() >= 1;
      }
    return e.next("/"), e.next(">");
  }
  static tryClosingTag(e) {
    return e.next(), e.match(d.tagNameStart) >= 1 ? (e.match(d.tagNameContinue), e.whitespace(), e.next(">")) : !1;
  }
  static tryProcessingInstruction(e) {
    for (e.next(); e.find("?") > 0; )
      if (e.next(), e.next(">"))
        return !0;
    return !1;
  }
  static tryComment(e) {
    if (e.next(), !e.next("-"))
      return !1;
    if (e.next(">") || e.next("->"))
      return !0;
    for (; e.find("-") >= 0; ) {
      if (e.next("-->"))
        return !0;
      e.next();
    }
    return !1;
  }
  static tryCdata(e) {
    if (e.next(), e.next("CDATA["))
      for (; e.find("]") >= 0; ) {
        if (e.next("]]>"))
          return !0;
        e.next();
      }
    return !1;
  }
  static tryDeclaration(e) {
    return e.match(d.asciiLetter), e.whitespace() <= 0 ? !1 : e.find(">") >= 0 ? (e.next(), !0) : !1;
  }
};
i(d, "asciiLetter", R.builder().range("A", "Z").range("a", "z").build()), // spec: A tag name consists of an ASCII letter followed by zero or more ASCII letters, digits, or hyphens (-).
i(d, "tagNameStart", d.asciiLetter), i(d, "tagNameContinue", d.tagNameStart.newBuilder().range("0", "9").c("-").build()), // spec: An attribute name consists of an ASCII letter, _, or :, followed by zero or more ASCII letters, digits,
// _, ., :, or -. (Note: This is the XML specification restricted to ASCII. HTML5 is laxer.)
i(d, "attributeStart", d.asciiLetter.newBuilder().c("_").c(":").build()), i(d, "attributeContinue", d.attributeStart.newBuilder().range("0", "9").c(".").c("-").build()), // spec: An unquoted attribute value is a nonempty string of characters not including whitespace, ", ', =, <, >, or `.
i(d, "attributeValueEnd", R.builder().c(" ").c("	").c(`
`).c("\v").c("\f").c("\r").c('"').c("'").c("=").c("<").c(">").c("`").build()), i(d, "Factory", or);
let Me = d;
var yt = /* @__PURE__ */ ((o) => (o.WRAP = "WRAP", o.REPLACE = "REPLACE", o))(yt || {});
class ie {
  constructor(e, t, r) {
    i(this, "type");
    i(this, "node");
    i(this, "position");
    i(this, "includeMarker", !1);
    this.type = e, this.node = t, this.position = r;
  }
  setIncludeMarker() {
    return this.includeMarker = !0, this;
  }
  getType() {
    return this.type;
  }
  getNode() {
    return this.node;
  }
  getPosition() {
    return this.position;
  }
  isIncludeMarker() {
    return this.includeMarker;
  }
}
i(ie, "Type", yt);
class Dt {
  constructor(e, t) {
    i(this, "node");
    i(this, "position");
    this.node = e, this.position = t;
  }
  getNode() {
    return this.node;
  }
  getPosition() {
    return this.position;
  }
}
class lr extends vt {
  constructor() {
    super("_");
  }
}
class ft {
  // in reverse getMinLength order
  constructor(e) {
    i(this, "delim");
    i(this, "minLength", 0);
    i(this, "processors", []);
    this.delim = e;
  }
  getOpeningCharacter() {
    return this.delim;
  }
  getClosingCharacter() {
    return this.delim;
  }
  getMinLength() {
    return this.minLength;
  }
  add(e) {
    let t = e.getMinLength(), r = !1;
    for (let s = 0; s < this.processors.length; s++) {
      const n = this.processors[s], a = n.getMinLength();
      if (t > a) {
        this.processors.splice(s, 0, e), r = !0;
        break;
      } else if (t === a)
        throw Error(
          "Cannot add two delimiter processors for char '" + this.delim + "' and minimum length " + t + "; conflicting processors: " + n + ", " + e
        );
    }
    r || (this.processors.push(e), this.minLength = t);
  }
  findProcessor(e) {
    for (const t of this.processors)
      if (t.getMinLength() <= e)
        return t;
    return this.processors[0];
  }
  process(e, t) {
    return this.findProcessor(e.length()).process(
      e,
      t
    );
  }
}
class kt {
  constructor(e, t, r) {
    i(this, "characters");
    i(this, "canClose");
    i(this, "canOpen");
    this.characters = e, this.canOpen = t, this.canClose = r;
  }
}
class mt {
  constructor(e, t) {
    i(this, "destination");
    i(this, "title");
    this.destination = e, this.title = t;
  }
}
class $e {
  constructor(e, t, r, s, n, a, l) {
    i(this, "marker");
    i(this, "openingBracket");
    i(this, "text");
    i(this, "label");
    i(this, "destination");
    i(this, "title");
    i(this, "afterTextBracket");
    this.marker = e, this.openingBracket = t, this.text = r, this.label = s, this.destination = n, this.title = a, this.afterTextBracket = l;
  }
  getMarker() {
    return this.marker;
  }
  getOpeningBracket() {
    return this.openingBracket;
  }
  getText() {
    return this.text;
  }
  getLabel() {
    return this.label;
  }
  getDestination() {
    return this.destination;
  }
  getTitle() {
    return this.title;
  }
  getAfterTextBracket() {
    return this.afterTextBracket;
  }
}
const L = class L {
  constructor(e) {
    i(this, "context");
    i(this, "inlineContentParserFactories");
    i(this, "delimiterProcessors");
    i(this, "linkProcessors");
    i(this, "specialCharacters");
    i(this, "linkMarkers");
    i(this, "inlineParsers", null);
    i(this, "scanner");
    i(this, "includeSourceSpans", !1);
    i(this, "trailingSpaces", -1);
    /**
     * Top delimiter (emphasis, strong emphasis or custom emphasis). (Brackets are on a separate stack, different
     * from the algorithm described in the spec.)
     */
    i(this, "lastDelimiter", null);
    /**
     * Top opening bracket (<code>[</code> or <code>![)</code>).
     */
    i(this, "lastBracket", null);
    this.context = e, this.inlineContentParserFactories = this.calculateInlineContentParserFactories(
      e.getCustomInlineContentParserFactories()
    ), this.delimiterProcessors = L.calculateDelimiterProcessors(
      e.getCustomDelimiterProcessors()
    ), this.linkProcessors = this.calculateLinkProcessors(
      e.getCustomLinkProcessors()
    ), this.linkMarkers = L.calculateLinkMarkers(
      e.getCustomLinkMarkers()
    ), this.specialCharacters = L.calculateSpecialCharacters(
      this.linkMarkers,
      new Set(this.delimiterProcessors.keys()),
      this.inlineContentParserFactories
    );
  }
  calculateInlineContentParserFactories(e) {
    const t = [...e];
    return t.push(new Fe.Factory()), t.push(new at.Factory()), t.push(new Oe.Factory()), t.push(new Re.Factory()), t.push(new Me.Factory()), t;
  }
  calculateLinkProcessors(e) {
    const t = [...e];
    return t.push(new qe()), t;
  }
  static calculateDelimiterProcessors(e) {
    const t = /* @__PURE__ */ new Map();
    return L.addDelimiterProcessors(
      [new rr(), new lr()],
      t
    ), L.addDelimiterProcessors(e, t), t;
  }
  static addDelimiterProcessors(e, t) {
    for (const r of e) {
      const s = r.getOpeningCharacter(), n = r.getClosingCharacter();
      if (s === n) {
        const a = t.get(s);
        if (a && a.getOpeningCharacter() === a.getClosingCharacter()) {
          let l;
          a instanceof ft ? l = a : (l = new ft(s), l.add(a)), l.add(r), t.set(s, l);
        } else
          L.addDelimiterProcessorForChar(
            s,
            r,
            t
          );
      } else
        L.addDelimiterProcessorForChar(
          s,
          r,
          t
        ), L.addDelimiterProcessorForChar(
          n,
          r,
          t
        );
    }
  }
  static addDelimiterProcessorForChar(e, t, r) {
    let s = !1;
    if (r.has(e) && (s = !0), r.set(e, t), s)
      throw new Error(
        "Delimiter processor conflict with delimiter char '" + e + "'"
      );
  }
  static calculateLinkMarkers(e) {
    let t = new Ge();
    for (const r of e)
      t.set(r.charCodeAt(0));
    return t.set(33), t;
  }
  static calculateSpecialCharacters(e, t, r) {
    let s = e.clone();
    for (const n of t)
      s.set(n.charCodeAt(0));
    for (const n of r)
      for (const a of n.getTriggerCharacters())
        s.set(a.charCodeAt(0));
    return s.set(91), s.set(93), s.set(33), s.set(10), s;
  }
  createInlineContentParsers() {
    const e = /* @__PURE__ */ new Map();
    for (const t of this.inlineContentParserFactories) {
      const r = t.create();
      for (const s of t.getTriggerCharacters()) {
        const n = e.get(s) || [];
        n.push(r), e.set(s, n);
      }
    }
    return e;
  }
  getScanner() {
    return this.scanner;
  }
  /**
   * Parse content in block into inline children, appending them to the block node.
   */
  parse(e, t) {
    for (this.reset(e); ; ) {
      const r = this.parseInline();
      if (r === null)
        break;
      for (const s of r)
        t.appendChild(s);
    }
    this.processDelimiters(null), this.mergeChildTextNodes(t);
  }
  reset(e) {
    this.scanner = se.of(e), this.includeSourceSpans = e.getSourceSpans().length !== 0, this.trailingSpaces = 0, this.lastDelimiter = null, this.lastBracket = null, this.inlineParsers = this.createInlineContentParsers();
  }
  text(e) {
    const t = new A(e.getContent());
    return t.setSourceSpans(e.getSourceSpans()), t;
  }
  /**
   * Parse the next inline element in subject, advancing our position.
   * On success, return the new inline node.
   * On failure, return null.
   */
  parseInline() {
    var s;
    const e = this.scanner.peek();
    switch (e) {
      case "[":
        return [this.parseOpenBracket()];
      case "]":
        return [this.parseCloseBracket()];
      case `
`:
        return [this.parseLineBreak()];
      case se.END:
        return null;
    }
    if (this.linkMarkers.get(e.charCodeAt(0))) {
      let n = this.scanner.position(), a = this.parseLinkMarker();
      if (a !== null)
        return a;
      this.scanner.setPosition(n);
    }
    if (!this.specialCharacters.get(e.charCodeAt(0)))
      return [this.parseText()];
    const t = (s = this.inlineParsers) == null ? void 0 : s.get(e);
    if (t) {
      const n = this.scanner.position();
      for (const a of t) {
        const l = a.tryParse(this);
        if (l instanceof Dt) {
          const c = l.getNode();
          return this.scanner.setPosition(l.getPosition()), this.includeSourceSpans && c.getSourceSpans().length === 0 && c.setSourceSpans(
            this.scanner.getSource(n, this.scanner.position()).getSourceSpans()
          ), [c];
        } else
          this.scanner.setPosition(n);
      }
    }
    const r = this.delimiterProcessors.get(e);
    if (r) {
      const n = this.parseDelimiters(r, e);
      if (n !== null)
        return n;
    }
    return [this.parseText()];
  }
  /**
   * Attempt to parse delimiters like emphasis, strong emphasis or custom delimiters.
   */
  parseDelimiters(e, t) {
    const r = this.scanDelimiters(e, t);
    if (r === null)
      return null;
    const s = r.characters;
    return this.lastDelimiter = new Kt(
      s,
      t,
      r.canOpen,
      r.canClose,
      this.lastDelimiter
    ), this.lastDelimiter.previous !== null && (this.lastDelimiter.previous.next = this.lastDelimiter), s;
  }
  /**
   * Add open bracket to delimiter stack and add a text node to block's children.
   */
  parseOpenBracket() {
    const e = this.scanner.position();
    this.scanner.next();
    const t = this.scanner.position(), r = this.text(this.scanner.getSource(e, t));
    return this.addBracket(
      Ee.link(
        r,
        e,
        t,
        this.lastBracket,
        this.lastDelimiter
      )
    ), r;
  }
  /**
   * If next character is {@code [}, add a bracket to the stack.
   * Otherwise, return null.
   */
  parseLinkMarker() {
    const e = this.scanner.position();
    this.scanner.next();
    const t = this.scanner.position();
    if (this.scanner.next("[")) {
      const r = this.scanner.position(), s = this.text(
        this.scanner.getSource(e, t)
      ), n = this.text(
        this.scanner.getSource(t, r)
      );
      return this.addBracket(
        Ee.withMarker(
          s,
          e,
          n,
          t,
          r,
          this.lastBracket,
          this.lastDelimiter
        )
      ), [s, n];
    } else
      return null;
  }
  /**
   * Try to match close bracket against an opening in the delimiter stack. Return either a link or image, or a
   * plain [ character. If there is a matching delimiter, remove it from the delimiter stack.
   */
  parseCloseBracket() {
    const e = this.scanner.position();
    this.scanner.next();
    const t = this.scanner.position(), r = this.lastBracket;
    if (r === null)
      return this.text(this.scanner.getSource(e, t));
    if (r.allowed) {
      const s = this.parseLinkOrImage(r, e);
      return s !== null ? s : (this.scanner.setPosition(t), this.removeLastBracket(), this.text(this.scanner.getSource(e, t)));
    } else
      return this.removeLastBracket(), this.text(this.scanner.getSource(e, t));
  }
  parseLinkOrImage(e, t) {
    const r = this.parseLinkInfo(e, t);
    if (r === null)
      return null;
    const s = this.scanner.position();
    for (const n of this.linkProcessors) {
      const a = n.process(
        r,
        this.scanner,
        this.context
      );
      if (!(a instanceof ie)) {
        this.scanner.setPosition(s);
        continue;
      }
      const l = a, c = l.getNode(), h = l.getPosition(), u = l.isIncludeMarker();
      switch (l.getType()) {
        case ie.Type.WRAP:
          return this.scanner.setPosition(h), this.wrapBracket(e, c, u);
        case ie.Type.REPLACE:
          return this.scanner.setPosition(h), this.replaceBracket(e, c, u);
      }
    }
    return null;
  }
  parseLinkInfo(e, t) {
    const r = this.scanner.getSource(e.contentPosition, t).getContent(), s = this.scanner.position(), n = L.parseInlineDestinationTitle(
      this.scanner
    );
    if (n !== null)
      return new $e(
        e.markerNode,
        e.bracketNode,
        r,
        null,
        n.destination,
        n.title,
        s
      );
    this.scanner.setPosition(s);
    const a = L.parseLinkLabel(this.scanner);
    a === null && this.scanner.setPosition(s);
    const l = a === null || a === "";
    return e.bracketAfter && l && e.markerNode === null ? null : new $e(
      e.markerNode,
      e.bracketNode,
      r,
      a,
      null,
      null,
      s
    );
  }
  wrapBracket(e, t, r) {
    var n, a;
    let s = ((n = e.bracketNode) == null ? void 0 : n.getNext()) || null;
    for (; s !== null; ) {
      let l = s.getNext();
      t.appendChild(s), s = l;
    }
    if (this.includeSourceSpans) {
      const l = r && e.markerPosition !== null ? e.markerPosition : e.bracketPosition;
      t.setSourceSpans(
        this.scanner.getSource(l, this.scanner.position()).getSourceSpans()
      );
    }
    if (this.processDelimiters(e.previousDelimiter), this.mergeChildTextNodes(t), r && e.markerNode !== null && e.markerNode.unlink(), (a = e.bracketNode) == null || a.unlink(), this.removeLastBracket(), e.markerNode === null) {
      let l = this.lastBracket;
      for (; l !== null; )
        l.markerNode === null && (l.allowed = !1), l = l.previous;
    }
    return t;
  }
  replaceBracket(e, t, r) {
    for (; this.lastDelimiter !== null && this.lastDelimiter !== e.previousDelimiter; )
      this.removeDelimiterKeepNode(this.lastDelimiter);
    if (this.includeSourceSpans) {
      let n = r && e.markerPosition !== null ? e.markerPosition : e.bracketPosition;
      t.setSourceSpans(
        this.scanner.getSource(n, this.scanner.position()).getSourceSpans()
      );
    }
    this.removeLastBracket();
    let s = r && e.markerNode !== null ? e.markerNode : e.bracketNode;
    for (; s !== null; ) {
      let n = s.getNext();
      s.unlink(), s = n;
    }
    return t;
  }
  addBracket(e) {
    this.lastBracket !== null && (this.lastBracket.bracketAfter = !0), this.lastBracket = e;
  }
  removeLastBracket() {
    var e;
    this.lastBracket = ((e = this.lastBracket) == null ? void 0 : e.previous) || null;
  }
  /**
   * Try to parse the destination and an optional title for an inline link/image.
   */
  static parseInlineDestinationTitle(e) {
    if (!e.next("("))
      return null;
    e.whitespace();
    const t = L.parseLinkDestination(e);
    if (t === null)
      return null;
    let r = null;
    return e.whitespace() >= 1 && (r = L.parseLinkTitle(e), e.whitespace()), e.next(")") ? new mt(t, r || "") : null;
  }
  /**
   * Attempt to parse link destination, returning the string or null if no match.
   */
  static parseLinkDestination(e) {
    const t = e.peek(), r = e.position();
    if (!v.scanLinkDestination(e))
      return null;
    let s;
    if (t === "<") {
      const n = e.getSource(r, e.position()).getContent();
      s = n.substring(1, n.length - 1);
    } else
      s = e.getSource(r, e.position()).getContent();
    return E.unescapeString(s);
  }
  /**
   * Attempt to parse link title (sans quotes), returning the string or null if no match.
   */
  static parseLinkTitle(e) {
    const t = e.position();
    if (!v.scanLinkTitle(e))
      return null;
    const r = e.getSource(t, e.position()).getContent(), s = r.substring(1, r.length - 1);
    return E.unescapeString(s);
  }
  /**
   * Attempt to parse a link label, returning the label between the brackets or null.
   */
  static parseLinkLabel(e) {
    if (!e.next("["))
      return null;
    const t = e.position();
    if (!v.scanLinkLabelContent(e))
      return null;
    const r = e.position();
    if (!e.next("]"))
      return null;
    const s = e.getSource(t, r).getContent();
    return s.length > 999 ? null : s;
  }
  parseLineBreak() {
    return this.scanner.next(), this.trailingSpaces >= 2 ? new W() : new ee();
  }
  /**
   * Parse the next character as plain text, and possibly more if the following characters are non-special.
   */
  parseText() {
    const e = this.scanner.position();
    this.scanner.next();
    let t;
    for (; t = this.scanner.peek(), !(t === se.END || this.specialCharacters.get(t.charCodeAt(0))); )
      this.scanner.next();
    const r = this.scanner.getSource(e, this.scanner.position());
    let s = r.getContent();
    if (t === `
`) {
      const a = m.skipBackwards(" ", s, s.length - 1, 0) + 1;
      this.trailingSpaces = s.length - a, s = s.substring(0, a);
    } else if (t === se.END) {
      const a = m.skipSpaceTabBackwards(s, s.length - 1, 0) + 1;
      s = s.substring(0, a);
    }
    const n = new A(s);
    return n.setSourceSpans(r.getSourceSpans()), n;
  }
  /**
   * Scan a sequence of characters with code delimiterChar, and return information about the number of delimiters
   * and whether they are positioned such that they can open and/or close emphasis or strong emphasis.
   *
   * @return information about delimiter run, or {@code null}
   */
  scanDelimiters(e, t) {
    const r = this.scanner.peekPreviousCodePoint(), s = this.scanner.position();
    if (this.scanner.matchMultiple(t) < e.getMinLength())
      return this.scanner.setPosition(s), null;
    const a = [];
    this.scanner.setPosition(s);
    let l = s;
    for (; this.scanner.next(t); )
      a.push(
        this.text(
          this.scanner.getSource(l, this.scanner.position())
        )
      ), l = this.scanner.position();
    const c = this.scanner.peekCodePoint(), h = r === 0 || m.isPunctuationCodePoint(r), u = r === 0 || m.isWhitespaceCodePoint(r), p = c === 0 || m.isPunctuationCodePoint(c), f = c === 0 || m.isWhitespaceCodePoint(c), S = !f && (!p || u || h), H = !u && (!h || f || p);
    let B, Ce;
    return t === "_" ? (B = S && (!H || h), Ce = H && (!S || p)) : (B = S && t === e.getOpeningCharacter(), Ce = H && t === e.getClosingCharacter()), new kt(a, B, Ce);
  }
  processDelimiters(e) {
    let t = /* @__PURE__ */ new Map(), r = this.lastDelimiter;
    for (; r !== null && r.previous !== e; )
      r = r.previous;
    for (; r !== null; ) {
      const s = r.delimiterChar, n = this.delimiterProcessors.get(s) || null;
      if (!r.getCanClose() || n === null) {
        r = r.next;
        continue;
      }
      const a = n.getOpeningCharacter();
      let l = 0, c = !1, h = !1, u = r.previous;
      for (; u !== null && u !== e && u !== t.get(s); ) {
        if (u.getCanOpen() && u.delimiterChar === a && (h = !0, l = n.process(u, r), l > 0)) {
          c = !0;
          break;
        }
        u = u.previous;
      }
      if (!c) {
        h || (t.set(s, r.previous), r.getCanOpen() || this.removeDelimiterKeepNode(r)), r = r.next;
        continue;
      }
      for (let p = 0; p < l; p++) {
        const f = u == null ? void 0 : u.characters.splice(
          u.characters.length - 1,
          1
        );
        f == null || f.forEach((S) => S.unlink());
      }
      for (let p = 0; p < l; p++)
        r.characters.splice(0, 1).forEach((S) => S.unlink());
      if (this.removeDelimitersBetween(u, r), (u == null ? void 0 : u.length()) === 0 && this.removeDelimiterAndNodes(u), r.length() === 0) {
        let p = r.next;
        this.removeDelimiterAndNodes(r), r = p;
      }
    }
    for (; this.lastDelimiter !== null && this.lastDelimiter !== e; )
      this.removeDelimiterKeepNode(this.lastDelimiter);
  }
  removeDelimitersBetween(e, t) {
    let r = t.previous;
    for (; r !== null && r !== e; ) {
      let s = r.previous;
      this.removeDelimiterKeepNode(r), r = s;
    }
  }
  /**
   * Remove the delimiter and the corresponding text node. For used delimiters, e.g. `*` in `*foo*`.
   */
  removeDelimiterAndNodes(e) {
    this.removeDelimiter(e);
  }
  /**
   * Remove the delimiter but keep the corresponding node as text. For unused delimiters such as `_` in `foo_bar`.
   */
  removeDelimiterKeepNode(e) {
    this.removeDelimiter(e);
  }
  removeDelimiter(e) {
    e.previous !== null && (e.previous.next = e.next), e.next === null ? this.lastDelimiter = e.previous : e.next.previous = e.previous;
  }
  mergeChildTextNodes(e) {
    e.getFirstChild() !== null && this.mergeTextNodesInclusive(e.getFirstChild(), e.getLastChild());
  }
  mergeTextNodesInclusive(e, t) {
    let r = null, s = null, n = 0, a = e;
    for (; a !== null; ) {
      if (a instanceof A) {
        let l = a;
        r === null && (r = l), n += l.getLiteral().length, s = l;
      } else
        this.mergeIfNeeded(r, s, n), r = null, s = null, n = 0, this.mergeChildTextNodes(a);
      if (a === t)
        break;
      a = a.getNext();
    }
    this.mergeIfNeeded(r, s, n);
  }
  mergeIfNeeded(e, t, r) {
    if (e !== null && t !== null && e !== t) {
      const s = new y();
      s.append(e.getLiteral());
      let n = null;
      this.includeSourceSpans && (n = new We(), n.addAll(e.getSourceSpans()));
      let a = e.getNext(), l = t.getNext();
      for (; a !== l; ) {
        s.append(a.getLiteral()), n !== null && n.addAll((a == null ? void 0 : a.getSourceSpans()) || []);
        const h = a;
        a = (a == null ? void 0 : a.getNext()) || null, h == null || h.unlink();
      }
      const c = s.toString();
      e.setLiteral(c), n !== null && e.setSourceSpans(n.getSourceSpans());
    }
  }
  create(e) {
    return new L(e);
  }
};
i(L, "DelimiterData", kt), /**
 * A destination and optional title for a link or image.
 */
i(L, "DestinationTitle", mt), i(L, "LinkInfoImpl", $e);
let _e = L;
class ot {
  constructor() {
    i(this, "nodeRenderers", []);
    i(this, "renderers", /* @__PURE__ */ new Map());
  }
  add(e) {
    this.nodeRenderers.push(e);
    for (const t of e.getNodeTypes())
      this.renderers.has(t) || this.renderers.set(t, e);
  }
  render(e) {
    const t = this.renderers.get(
      e.constructor
    );
    t && t.render(e);
  }
  beforeRoot(e) {
    this.nodeRenderers.forEach((t) => t.beforeRoot(e));
  }
  afterRoot(e) {
    this.nodeRenderers.forEach((t) => t.afterRoot(e));
  }
}
var $;
let Rt = ($ = class {
  constructor(e) {
    i(this, "parent", null);
    i(this, "indent");
    this.parent = e, e !== null ? this.indent = e.indent + $.INDENT_DEFAULT : this.indent = $.INDENT_EMPTY;
  }
  getParent() {
    return this.parent;
  }
  getIndent() {
    return this.indent;
  }
}, i($, "INDENT_DEFAULT", "   "), i($, "INDENT_EMPTY", ""), $), wt = class extends Rt {
  constructor(t, r) {
    super(t);
    i(this, "marker");
    this.marker = r.getMarker();
  }
  getMarker() {
    return this.marker;
  }
}, bt = class extends Rt {
  constructor(t, r) {
    super(t);
    i(this, "delimiter");
    i(this, "counter");
    const s = r.getMarkerDelimiter(), n = r.getMarkerStartNumber();
    this.delimiter = C(s) ? s : ".", this.counter = C(n) ? n : 1;
  }
  getDelimiter() {
    return this.delimiter;
  }
  getCounter() {
    return this.counter;
  }
  increaseCounter() {
    this.counter++;
  }
};
var he = /* @__PURE__ */ ((o) => (o.STRIP = "STRIP", o.COMPACT = "COMPACT", o.SEPARATE_BLOCKS = "SEPARATE_BLOCKS", o))(he || {});
class Ue extends Ne {
  constructor(t) {
    super();
    i(this, "context");
    i(this, "textContent");
    i(this, "listHolder", null);
    this.context = t, this.textContent = t.getWriter();
  }
  beforeRoot(t) {
  }
  afterRoot(t) {
  }
  getNodeTypes() {
    return /* @__PURE__ */ new Set([
      pe,
      G,
      M,
      Q,
      Y,
      F,
      J,
      te,
      X,
      j,
      _,
      V,
      ge,
      we,
      be,
      A,
      ue,
      de,
      ee,
      W
    ]);
  }
  render(t) {
    t.accept(this);
  }
  visit(t) {
    switch (!0) {
      case t instanceof pe:
        this.visitChildren(t);
        break;
      case t instanceof Q:
        this.textContent.write("«"), this.visitChildren(t), this.textContent.resetBlock(), this.textContent.write("»"), this.textContent.block();
        break;
      case t instanceof Y:
        this.textContent.pushTight(t.isTight()), this.listHolder = new wt(this.listHolder, t), this.visitChildren(t), this.textContent.popTight(), this.textContent.block(), this.listHolder = this.listHolder.getParent();
        break;
      case t instanceof ue:
        this.textContent.write('"'), this.textContent.write(t.getLiteral()), this.textContent.write('"');
        break;
      case t instanceof F:
        const r = Ue.stripTrailingNewline(
          t.getLiteral() || ""
        );
        this.stripNewlines() ? this.textContent.writeStripped(r) : this.textContent.write(r), this.textContent.block();
        break;
      case t instanceof W:
        this.stripNewlines() ? this.textContent.whitespace() : this.textContent.line();
        break;
      case t instanceof G:
        this.visitChildren(t), this.stripNewlines() ? this.textContent.write(": ") : this.textContent.block();
        break;
      case t instanceof te:
        this.stripNewlines() || this.textContent.write("***"), this.textContent.block();
        break;
      case t instanceof de:
        this.writeText(t.getLiteral());
        break;
      case t instanceof J:
        this.writeText(t.getLiteral());
        break;
      case t instanceof ge:
        this.writeLink(t, t.getTitle() || "", t.getDestination());
        break;
      case t instanceof X:
        const s = Ue.stripTrailingNewline(t.getLiteral());
        this.stripNewlines() ? this.textContent.writeStripped(s) : this.textContent.write(s), this.textContent.block();
        break;
      case t instanceof j:
        this.writeLink(t, t.getTitle() || "", t.getDestination());
        break;
      case t instanceof _:
        if (this.listHolder !== null && this.listHolder instanceof bt) {
          const n = this.listHolder, a = this.stripNewlines() ? "" : n.getIndent();
          this.textContent.write(
            a + n.getCounter() + n.getDelimiter() + " "
          ), this.visitChildren(t), this.textContent.block(), n.increaseCounter();
        } else if (this.listHolder !== null && this.listHolder instanceof wt) {
          const n = this.listHolder;
          this.stripNewlines() || this.textContent.write(
            n.getIndent() + n.getMarker() + " "
          ), this.visitChildren(t), this.textContent.block();
        }
        break;
      case t instanceof V:
        this.textContent.pushTight(t.isTight()), this.listHolder = new bt(this.listHolder, t), this.visitChildren(t), this.textContent.popTight(), this.textContent.block(), this.listHolder = this.listHolder.getParent();
        break;
      case t instanceof M:
        this.visitChildren(t), this.textContent.block();
        break;
      case t instanceof ee:
        this.stripNewlines() ? this.textContent.whitespace() : this.textContent.line();
        break;
      case t instanceof A:
        this.writeText(t.getLiteral());
        break;
    }
  }
  visitChildren(t) {
    let r = t.getFirstChild();
    for (; r !== null; ) {
      let s = r.getNext();
      this.context.render(r), r = s;
    }
  }
  writeText(t) {
    this.stripNewlines() ? this.textContent.writeStripped(t) : this.textContent.write(t);
  }
  writeLink(t, r, s) {
    const n = t.getFirstChild() !== null, a = r !== s, l = s !== "";
    n && (this.textContent.write('"'), this.visitChildren(t), this.textContent.write('"'), (a || l) && (this.textContent.whitespace(), this.textContent.write("("))), a && (this.textContent.write(r), l && (this.textContent.colon(), this.textContent.whitespace())), l && this.textContent.write(s), n && (a || l) && this.textContent.write(")");
  }
  stripNewlines() {
    return this.context.lineBreakRendering() === he.STRIP;
  }
  static stripTrailingNewline(t) {
    return t.endsWith(`
`) ? t.substring(0, t.length - 1) : t;
  }
}
class cr {
  constructor(e, t = he.COMPACT) {
    i(this, "buffer");
    i(this, "lineBreakRendering");
    i(this, "tight", []);
    i(this, "blockSeparator");
    i(this, "lastChar", ae(0));
    this.buffer = e, this.lineBreakRendering = t;
  }
  whitespace() {
    this.lastChar.charCodeAt(0) !== 0 && this.lastChar !== " " && this.write(" ");
  }
  colon() {
    this.lastChar.charCodeAt(0) !== 0 && this.lastChar !== ":" && this.write(":");
  }
  line() {
    this.append(`
`);
  }
  block() {
    this.blockSeparator = this.lineBreakRendering === he.STRIP ? " " : this.lineBreakRendering === he.COMPACT || this.isTight() ? `
` : `

`;
  }
  resetBlock() {
    this.blockSeparator = void 0;
  }
  writeStripped(e) {
    this.write(e.replace(/[\r\n\s]+/g, " "));
  }
  write(e) {
    this.flushBlockSeparator(), this.append(e);
  }
  /**
   * Change whether blocks are tight or loose. Loose is the default where blocks are separated by a blank line. Tight
   * is where blocks are not separated by a blank line. Tight blocks are used in lists, if there are no blank lines
   * within the list.
   * <p>
   * Note that changing this does not affect block separators that have already been enqueued with {@link #block()},
   * only future ones.
   */
  pushTight(e) {
    this.tight.push(e);
  }
  /**
   * Remove the last "tight" setting from the top of the stack.
   */
  popTight() {
    this.tight.pop();
  }
  isTight() {
    return this.tight.length !== 0 && this.tight[this.tight.length - 1];
  }
  /**
   * If a block separator has been enqueued with {@link #block()} but not yet written, write it now.
   */
  flushBlockSeparator() {
    C(this.blockSeparator) && (this.append(this.blockSeparator), this.blockSeparator = void 0);
  }
  append(e) {
    this.buffer.append(e);
    const t = e.length;
    t !== 0 && (this.lastChar = e.charAt(t - 1));
  }
}
class Ft {
  extend(e) {
  }
}
class xt {
  constructor() {
    i(this, "nodeRendererFactories", []);
    i(this, "lineBreakRendering", he.COMPACT);
  }
  /**
   * @return the configured {@link TextContentRenderer}
   */
  build() {
    return new et(this);
  }
  /**
   * Configure how line breaks (newlines) are rendered, see {@link LineBreakRendering}.
   * The default is {@link LineBreakRendering#COMPACT}.
   *
   * @param lineBreakRendering the mode to use
   * @return {@code this}
   */
  setLineBreakRendering(e) {
    return this.lineBreakRendering = e, this;
  }
  /**
   * Add a factory for instantiating a node renderer (done when rendering). This allows to override the rendering
   * of node types or define rendering for custom node types.
   * <p>
   * If multiple node renderers for the same node type are created, the one from the factory that was added first
   * "wins". (This is how the rendering for core node types can be overridden; the default rendering comes last.)
   *
   * @param nodeRendererFactory the factory for creating a node renderer
   * @return {@code this}
   */
  nodeRendererFactory(e) {
    return this.nodeRendererFactories.push(e), this;
  }
  /**
   * @param extensions extensions to use on this text content renderer
   * @return {@code this}
   */
  extensions(e) {
    for (const t of e)
      t instanceof Ft && t.extend(this);
    return this;
  }
}
let hr = class {
  constructor(e, t) {
    i(this, "textContentWriter");
    i(this, "nodeRendererMap", new ot());
    i(this, "context");
    this.textContentWriter = t, this.context = e;
    for (const r of this.context.nodeRendererFactories) {
      const s = r.create(this);
      this.nodeRendererMap.add(s);
    }
  }
  lineBreakRendering() {
    return this.context.lineBreakRendering;
  }
  stripNewlines() {
    return this.context.lineBreakRendering == he.STRIP;
  }
  getWriter() {
    return this.textContentWriter;
  }
  render(e) {
    this.nodeRendererMap.render(e);
  }
};
class et {
  constructor(e) {
    i(this, "lineBreakRendering");
    i(this, "nodeRendererFactories");
    this.lineBreakRendering = e.lineBreakRendering, this.nodeRendererFactories = [], this.nodeRendererFactories.push(...e.nodeRendererFactories), this.nodeRendererFactories.push({
      create(t) {
        return new Ue(t);
      }
    });
  }
  /**
   * Create a new builder for configuring a {@link TextContentRenderer}.
   *
   * @return a builder
   */
  static builder() {
    return new xt();
  }
  render(e, t) {
    new hr(
      this,
      new cr(t, this.lineBreakRendering)
    ).render(e);
  }
}
/**
 * Builder for configuring a {@link TextContentRenderer}. See methods for default configuration.
 */
i(et, "Builder", xt), i(et, "TextContentRendererExtension", Ft);
class lt {
  constructor(e) {
    i(this, "parent");
    this.parent = e;
  }
}
class Ye extends lt {
  constructor(t, r) {
    super(t);
    i(this, "marker");
    const s = r.getMarker();
    this.marker = C(s) ? s : "-";
  }
}
class je extends lt {
  constructor(t, r) {
    super(t);
    i(this, "delimiter");
    i(this, "number");
    const s = r.getMarkerDelimiter(), n = r.getMarkerStartNumber();
    this.delimiter = C(s) ? s : ".", this.number = n || 1;
  }
}
class ur extends Ne {
  constructor() {
    super(...arguments);
    i(this, "lineBreak", !1);
  }
  hasLineBreak() {
    return this.lineBreak;
  }
  visit(t) {
    switch (!0) {
      case t instanceof ee: {
        const r = t;
        super.visit(r), this.lineBreak = !0;
        break;
      }
      case t instanceof W: {
        const r = t;
        super.visit(r), this.lineBreak = !0;
        break;
      }
    }
  }
}
const x = class x extends Ne {
  constructor(t) {
    super();
    i(this, "textEscape");
    i(this, "textEscapeInHeading");
    i(this, "linkDestinationNeedsAngleBrackets", R.builder().c(" ").c("(").c(")").c("<").c(">").c(`
`).c("\\").build());
    i(this, "linkDestinationEscapeInAngleBrackets", R.builder().c("<").c(">").c(`
`).c("\\").build());
    i(this, "linkTitleEscapeInQuotes", R.builder().c('"').c(`
`).c("\\").build());
    i(this, "orderedListMarkerPattern", /^([0-9]{1,9})([.)])/);
    i(this, "context");
    i(this, "writer");
    /**
     * If we're currently within a {@link BulletList} or {@link OrderedList}, this keeps the context of that list.
     * It has a parent field so that it can represent a stack (for nested lists).
     */
    i(this, "listHolder", null);
    this.context = t, this.writer = t.getWriter(), this.textEscape = R.builder().anyOf("[]<>`*_&\n\\").anyOf(t.getSpecialCharacters()).build(), this.textEscapeInHeading = R.builder(this.textEscape).anyOf("#").build();
  }
  beforeRoot(t) {
  }
  afterRoot(t) {
  }
  getNodeTypes() {
    return /* @__PURE__ */ new Set([
      Q,
      Y,
      ue,
      pe,
      we,
      F,
      W,
      G,
      J,
      de,
      ge,
      X,
      j,
      _,
      V,
      M,
      ee,
      be,
      A,
      te
    ]);
  }
  render(t) {
    t.accept(this);
  }
  visit(t) {
    switch (!0) {
      case t instanceof pe: {
        const r = t;
        this.visitChildren(r), this.writer.line();
        break;
      }
      case t instanceof te: {
        let s = t.getLiteral();
        ct(s) && (s = "___"), this.writer.raw(s), this.writer.block();
        break;
      }
      case t instanceof G: {
        const r = t;
        if (r.getLevel() <= 2) {
          const s = new x.LineBreakVisitor();
          if (r.accept(s), s.hasLineBreak()) {
            this.visitChildren(r), this.writer.line(), r.getLevel() === 1 ? this.writer.raw("===") : this.writer.raw("---"), this.writer.block();
            return;
          }
        }
        for (let s = 0; s < r.getLevel(); s++)
          this.writer.raw("#");
        this.writer.raw(" "), this.visitChildren(r), this.writer.block();
        break;
      }
      case t instanceof X: {
        let s = t.getLiteral();
        this.writer.writePrefix("    "), this.writer.pushPrefix("    ");
        const n = x.getLines(s);
        for (let a = 0; a < n.length; a++) {
          let l = n[a];
          this.writer.raw(l), a !== n.length - 1 && this.writer.line();
        }
        this.writer.popPrefix(), this.writer.block();
        break;
      }
      case t instanceof F: {
        const r = t, s = r.getLiteral(), n = r.getFenceCharacter(), a = C(n) ? n : "`";
        let l;
        const c = r.getOpeningFenceLength();
        if (C(c))
          l = c;
        else {
          const B = x.findMaxRunLength(
            a,
            s || ""
          );
          l = Math.max(B + 1, 3);
        }
        const h = r.getClosingFenceLength(), u = C(h) ? h : l, p = x.repeat(
          a,
          l
        ), f = x.repeat(
          a,
          u
        ), S = r.getFenceIndent() || 0;
        if (S > 0) {
          const B = x.repeat(" ", S);
          this.writer.writePrefix(B), this.writer.pushPrefix(B);
        }
        this.writer.raw(p);
        const H = r.getInfo();
        if (C(H) && this.writer.raw(H), this.writer.line(), C(s)) {
          const B = x.getLines(s);
          for (const Ce of B)
            this.writer.raw(Ce), this.writer.line();
        }
        this.writer.raw(f), S > 0 && this.writer.popPrefix(), this.writer.block();
        break;
      }
      case t instanceof J: {
        const r = t, s = x.getLines(
          r.getLiteral()
        );
        for (let n = 0; n < s.length; n++) {
          let a = s[n];
          this.writer.raw(a), n !== s.length - 1 && this.writer.line();
        }
        this.writer.block();
        break;
      }
      case t instanceof M: {
        const r = t;
        this.visitChildren(r), this.writer.block();
        break;
      }
      case t instanceof Q: {
        const r = t;
        this.writer.writePrefix("> "), this.writer.pushPrefix("> "), this.visitChildren(r), this.writer.popPrefix(), this.writer.block();
        break;
      }
      case t instanceof Y: {
        const r = t;
        this.writer.pushTight(r.isTight()), this.listHolder = new Ye(this.listHolder, r), this.visitChildren(r), this.listHolder = this.listHolder.parent, this.writer.popTight(), this.writer.block();
        break;
      }
      case t instanceof V: {
        const r = t;
        this.writer.pushTight(r.isTight()), this.listHolder = new je(this.listHolder, r), this.visitChildren(r), this.listHolder = this.listHolder.parent, this.writer.popTight(), this.writer.block();
        break;
      }
      case t instanceof _: {
        const r = t, s = r.getMarkerIndent(), n = C(s) ? s : 0;
        let a;
        if (this.listHolder instanceof Ye) {
          const h = this.listHolder;
          a = x.repeat(" ", n) + h.marker;
        } else if (this.listHolder instanceof je) {
          const h = this.listHolder;
          a = x.repeat(" ", n) + h.number + h.delimiter, h.number++;
        } else
          throw new Error("Unknown list holder type: " + this.listHolder);
        const l = r.getContentIndent(), c = C(l) ? x.repeat(" ", l - a.length) : " ";
        this.writer.writePrefix(a), this.writer.writePrefix(c), this.writer.pushPrefix(
          x.repeat(" ", a.length + c.length)
        ), r.getFirstChild() === null ? this.writer.block() : this.visitChildren(r), this.writer.popPrefix();
        break;
      }
      case t instanceof ue: {
        const s = t.getLiteral(), n = x.findMaxRunLength(
          "`",
          s
        );
        for (let l = 0; l < n + 1; l++)
          this.writer.raw("`");
        const a = s.startsWith("`") || s.endsWith("`") || s.startsWith(" ") && s.endsWith(" ") && m.hasNonSpace(s);
        a && this.writer.raw(" "), this.writer.raw(s), a && this.writer.raw(" ");
        for (let l = 0; l < n + 1; l++)
          this.writer.raw("`");
        break;
      }
      case t instanceof we: {
        const r = t;
        let s = r.getOpeningDelimiter();
        ct(s) && (s = this.writer.getLastChar() === "*" ? "_" : "*"), this.writer.raw(s), super.visit(r), this.writer.raw(s);
        break;
      }
      case t instanceof be: {
        const r = t;
        this.writer.raw("**"), super.visit(r), this.writer.raw("**");
        break;
      }
      case t instanceof j: {
        const r = t;
        this.writeLinkLike(r.getTitle(), r.getDestination(), r, "[");
        break;
      }
      case t instanceof ge: {
        const r = t;
        this.writeLinkLike(
          r.getTitle(),
          r.getDestination(),
          r,
          "!["
        );
        break;
      }
      case t instanceof de: {
        const r = t;
        this.writer.raw(r.getLiteral());
        break;
      }
      case t instanceof W: {
        this.writer.raw("  "), this.writer.line();
        break;
      }
      case t instanceof ee: {
        this.writer.line();
        break;
      }
      case t instanceof A: {
        const r = t;
        let s = r.getLiteral();
        if (this.writer.isAtLineStart() && s)
          switch (s.charAt(0)) {
            case "-":
              this.writer.raw("\\-"), s = s.substring(1);
              break;
            case "#":
              this.writer.raw("\\#"), s = s.substring(1);
              break;
            case "=":
              r.getPrevious() !== null && (this.writer.raw("\\="), s = s.substring(1));
              break;
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
              const l = this.orderedListMarkerPattern.exec(s);
              l && (this.writer.raw(l[1]), this.writer.raw("\\" + l[2]), s = s.substring(l.index, l[0].length), this.orderedListMarkerPattern.lastIndex = 0);
              break;
            case "	":
              this.writer.raw("&#9;"), s = s.substring(1);
              break;
            case " ":
              this.writer.raw("&#32;"), s = s.substring(1);
              break;
          }
        const n = r.getParent() instanceof G ? this.textEscapeInHeading : this.textEscape;
        s.endsWith("!") && r.getNext() instanceof j ? (this.writer.text(s.substring(0, s.length - 1), n), this.writer.raw("\\!")) : this.writer.text(s, n);
        break;
      }
    }
  }
  visitChildren(t) {
    let r = t.getFirstChild();
    for (; r !== null; ) {
      let s = r.getNext();
      this.context.render(r), r = s;
    }
  }
  static findMaxRunLength(t, r) {
    let s = 0, n = 0;
    for (; n < r.length; ) {
      if (n = r.indexOf(t, n), n === -1)
        return s;
      let a = 0;
      do
        n += t.length, a++;
      while (r.startsWith(t, n));
      s = Math.max(a, s);
    }
    return s;
  }
  static contains(t, r) {
    for (let s = 0; s < t.length; s++)
      if (r.matches(t.charAt(s)))
        return !0;
    return !1;
  }
  // Keep for Android compat (String.repeat only available on Android 12 and later)
  static repeat(t, r) {
    return t.repeat(r);
  }
  static getLines(t) {
    let r = t.split(`
`);
    return r[r.length - 1] === "" ? r.slice(0, r.length - 1) : r.slice(0);
  }
  writeLinkLike(t, r, s, n) {
    this.writer.raw(n), this.visitChildren(s), this.writer.raw("]"), this.writer.raw("("), x.contains(
      r,
      this.linkDestinationNeedsAngleBrackets
    ) ? (this.writer.raw("<"), this.writer.text(r, this.linkDestinationEscapeInAngleBrackets), this.writer.raw(">")) : this.writer.raw(r), C(t) && (this.writer.raw(" "), this.writer.raw('"'), this.writer.text(t, this.linkTitleEscapeInQuotes), this.writer.raw('"')), this.writer.raw(")");
  }
};
i(x, "ListHolder", lt), i(x, "BulletListHolder", Ye), i(x, "OrderedListHolder", je), /**
 * Visits nodes to check if there are any soft or hard line breaks.
 */
i(x, "LineBreakVisitor", ur);
let tt = x;
class pr {
  constructor(e) {
    i(this, "buffer");
    i(this, "blockSeparator", 0);
    i(this, "lastChar", ae(0));
    i(this, "atLineStart", !0);
    // Stacks of settings that affect various rendering behaviors. The common pattern here is that callers use "push" to
    // change a setting, render some nodes, and then "pop" the setting off the stack again to restore previous state.
    i(this, "prefixes", []);
    i(this, "tight", []);
    i(this, "rawEscapes", []);
    this.buffer = e;
  }
  /**
   * Write the supplied string (raw/unescaped except if {@link #pushRawEscape} was used).
   */
  raw(e) {
    this.flushBlockSeparator(), this.write(e, null);
  }
  /**
   * Write the supplied string with escaping.
   *
   * @param s      the string to write
   * @param escape which characters to escape
   */
  text(e, t) {
    e !== "" && (this.flushBlockSeparator(), this.write(e, t), this.lastChar = e.charAt(e.length - 1), this.atLineStart = !1);
  }
  /**
   * Write a newline (line terminator).
   */
  line() {
    this.write(`
`, null), this.writePrefixes(), this.atLineStart = !0;
  }
  /**
   * Enqueue a block separator to be written before the next text is written. Block separators are not written
   * straight away because if there are no more blocks to write we don't want a separator (at the end of the document).
   */
  block() {
    this.blockSeparator = this.isTight() ? 1 : 2, this.atLineStart = !0;
  }
  /**
   * Push a prefix onto the top of the stack. All prefixes are written at the beginning of each line, until the
   * prefix is popped again.
   *
   * @param prefix the raw prefix string
   */
  pushPrefix(e) {
    this.prefixes.push(e);
  }
  /**
   * Write a prefix.
   *
   * @param prefix the raw prefix string to write
   */
  writePrefix(e) {
    let t = this.atLineStart;
    this.raw(e), this.atLineStart = t;
  }
  /**
   * Remove the last prefix from the top of the stack.
   */
  popPrefix() {
    this.prefixes.pop();
  }
  /**
   * Change whether blocks are tight or loose. Loose is the default where blocks are separated by a blank line. Tight
   * is where blocks are not separated by a blank line. Tight blocks are used in lists, if there are no blank lines
   * within the list.
   * <p>
   * Note that changing this does not affect block separators that have already been enqueued with {@link #block()},
   * only future ones.
   */
  pushTight(e) {
    this.tight.push(e);
  }
  /**
   * Remove the last "tight" setting from the top of the stack.
   */
  popTight() {
    this.tight.pop();
  }
  /**
   * Escape the characters matching the supplied matcher, in all text (text and raw). This might be useful to
   * extensions that add another layer of syntax, e.g. the tables extension that uses `|` to separate cells and needs
   * all `|` characters to be escaped (even in code spans).
   *
   * @param rawEscape the characters to escape in raw text
   */
  pushRawEscape(e) {
    this.rawEscapes.push(e);
  }
  /**
   * Remove the last raw escape from the top of the stack.
   */
  popRawEscape() {
    this.rawEscapes.pop();
  }
  /**
   * @return the last character that was written
   */
  getLastChar() {
    return this.lastChar;
  }
  /**
   * @return whether we're at the line start (not counting any prefixes), i.e. after a {@link #line} or {@link #block}.
   */
  isAtLineStart() {
    return this.atLineStart;
  }
  write(e, t) {
    if (this.rawEscapes.length === 0 && t === null)
      this.buffer.append(e);
    else
      for (let s = 0; s < e.length; s++)
        this.append(e.charAt(s), t);
    const r = e.length;
    r !== 0 && (this.lastChar = e.charAt(r - 1)), this.atLineStart = !1;
  }
  writePrefixes() {
    if (this.prefixes.length)
      for (let e of this.prefixes)
        this.write(e, null);
  }
  /**
   * If a block separator has been enqueued with {@link #block()} but not yet written, write it now.
   */
  flushBlockSeparator() {
    this.blockSeparator !== 0 && (this.write(`
`, null), this.writePrefixes(), this.blockSeparator > 1 && (this.write(`
`, null), this.writePrefixes()), this.blockSeparator = 0);
  }
  append(e, t) {
    this.needsEscaping(e, t) ? e === `
` ? this.buffer.append("&#10;") : (this.buffer.append("\\"), this.buffer.append(e)) : this.buffer.append(e);
  }
  isTight() {
    return this.tight.length !== 0 && this.tight[this.tight.length - 1];
  }
  needsEscaping(e, t) {
    return t !== null && t.matches(e) || this.rawNeedsEscaping(e);
  }
  rawNeedsEscaping(e) {
    for (let t of this.rawEscapes)
      if (t.matches(e))
        return !0;
    return !1;
  }
}
class qt {
  /**
   * Extend Markdown rendering, usually by registering custom node renderers using {@link Builder#nodeRendererFactory}.
   *
   * @param rendererBuilder the renderer builder to extend
   */
  extend(e) {
  }
}
class Ct {
  constructor() {
    i(this, "nodeRendererFactories", []);
  }
  /**
   * @return the configured {@link MarkdownRenderer}
   */
  build() {
    return new rt(this);
  }
  /**
   * Add a factory for instantiating a node renderer (done when rendering). This allows to override the rendering
   * of node types or define rendering for custom node types.
   * <p>
   * If multiple node renderers for the same node type are created, the one from the factory that was added first
   * "wins". (This is how the rendering for core node types can be overridden; the default rendering comes last.)
   *
   * @param nodeRendererFactory the factory for creating a node renderer
   * @return {@code this}
   */
  nodeRendererFactory(e) {
    return this.nodeRendererFactories.push(e), this;
  }
  /**
   * @param extensions extensions to use on this renderer
   * @return {@code this}
   */
  extensions(e) {
    for (const t of e)
      t instanceof qt && t.extend(this);
    return this;
  }
}
let dr = class {
  constructor(e, t) {
    i(this, "writer");
    i(this, "nodeRendererMap", new ot());
    i(this, "additionalTextEscapes");
    i(this, "context");
    this.writer = t, this.context = e;
    const r = /* @__PURE__ */ new Set();
    for (const s of this.context.nodeRendererFactories)
      for (const n of s.getSpecialCharacters())
        r.add(n);
    this.additionalTextEscapes = r;
    for (let s = this.context.nodeRendererFactories.length - 1; s >= 0; s--) {
      const a = this.context.nodeRendererFactories[s].create(this);
      this.nodeRendererMap.add(a);
    }
  }
  getWriter() {
    return this.writer;
  }
  render(e) {
    this.nodeRendererMap.render(e);
  }
  getSpecialCharacters() {
    return this.additionalTextEscapes;
  }
};
class rt {
  constructor(e) {
    i(this, "nodeRendererFactories");
    this.nodeRendererFactories = [], this.nodeRendererFactories.push(...e.nodeRendererFactories), this.nodeRendererFactories.push({
      create(t) {
        return new tt(t);
      },
      getSpecialCharacters() {
        return /* @__PURE__ */ new Set();
      }
    });
  }
  /**
   * Create a new builder for configuring a {@link MarkdownRenderer}.
   *
   * @return a builder
   */
  static builder() {
    return new Ct();
  }
  render(e, t) {
    return t = t || new y(), new dr(this, new pr(t)).render(e), t.toString();
  }
}
/**
 * Builder for configuring a {@link MarkdownRenderer}. See methods for default configuration.
 */
i(rt, "Builder", Ct), i(rt, "MarkdownRendererExtension", qt);
class St extends Ne {
  constructor() {
    super(...arguments);
    i(this, "sb", new y());
  }
  getAltText() {
    return this.sb.toString();
  }
  visit(t) {
    switch (!0) {
      case t instanceof A: {
        const r = t;
        this.sb.append(r.getLiteral());
        break;
      }
      case t instanceof ee: {
        this.sb.append(`
`);
        break;
      }
      case t instanceof W: {
        this.sb.append(`
`);
        break;
      }
    }
  }
}
class Ot extends Ne {
  constructor(t) {
    super();
    i(this, "context");
    i(this, "html");
    this.context = t, this.html = t.getWriter();
  }
  beforeRoot(t) {
  }
  afterRoot(t) {
  }
  getNodeTypes() {
    return /* @__PURE__ */ new Set([
      pe,
      G,
      M,
      Q,
      Y,
      F,
      J,
      te,
      X,
      j,
      _,
      V,
      ge,
      we,
      be,
      A,
      ue,
      de,
      ee,
      W
    ]);
  }
  render(t) {
    t.accept(this);
  }
  visit(t) {
    switch (!0) {
      case t instanceof pe: {
        const r = t;
        this.visitChildren(r);
        break;
      }
      case t instanceof G: {
        const r = t, s = "h" + r.getLevel();
        this.html.line(), this.html.tag(s, this.getAttrs(r, s)), this.visitChildren(r), this.html.tag("/" + s), this.html.line();
        break;
      }
      case t instanceof M: {
        const r = t;
        this.html.line(), this.html.tag("p", this.getAttrs(r, "p")), this.visitChildren(r), this.html.tag("/p"), this.html.line();
        break;
      }
      case t instanceof Q: {
        const r = t;
        this.html.line(), this.html.tag("blockquote", this.getAttrs(r, "blockquote")), this.html.line(), this.visitChildren(r), this.html.line(), this.html.tag("/blockquote"), this.html.line();
        break;
      }
      case t instanceof Y: {
        const r = t;
        this.renderListBlock(r, "ul", this.getAttrs(r, "ul"));
        break;
      }
      case t instanceof F: {
        const r = t, s = r.getLiteral(), n = /* @__PURE__ */ new Map(), a = r.getInfo();
        if (a) {
          const l = a.indexOf(" ");
          let c;
          l === -1 ? c = a : c = a.substring(0, l), n.set("class", "language-" + c);
        }
        this.renderCodeBlock(s || "", r, n);
        break;
      }
      case t instanceof J: {
        const r = t;
        this.html.line(), this.context.shouldEscapeHtml() ? (this.html.tag("p", this.getAttrs(r, "p")), this.html.text(r.getLiteral()), this.html.tag("/p")) : this.html.raw(r.getLiteral()), this.html.line();
        break;
      }
      case t instanceof te: {
        const r = t;
        this.html.line(), this.html.tag("hr", this.getAttrs(r, "hr"), !0), this.html.line();
        break;
      }
      case t instanceof X: {
        const r = t;
        this.renderCodeBlock(
          r.getLiteral(),
          r,
          /* @__PURE__ */ new Map()
        );
        break;
      }
      case t instanceof j: {
        const r = t, s = /* @__PURE__ */ new Map();
        let n = r.getDestination();
        this.context.shouldSanitizeUrls() && (n = this.context.urlSanitizer().sanitizeLinkUrl(n), s.set("rel", "nofollow")), n = this.context.encodeUrl(n), s.set("href", n);
        const a = r.getTitle();
        C(a) && s.set("title", a), this.html.tag("a", this.getAttrs(r, "a", s)), this.visitChildren(r), this.html.tag("/a");
        break;
      }
      case t instanceof _: {
        const r = t;
        this.html.tag("li", this.getAttrs(r, "li")), this.visitChildren(r), this.html.tag("/li"), this.html.line();
        break;
      }
      case t instanceof V: {
        const r = t, s = r.getMarkerStartNumber(), n = C(s) ? s : 1, a = /* @__PURE__ */ new Map();
        n !== 1 && a.set("start", n.toString()), this.renderListBlock(
          r,
          "ol",
          this.getAttrs(r, "ol", a)
        );
        break;
      }
      case t instanceof ge: {
        const r = t;
        let s = r.getDestination();
        const n = new St();
        r.accept(n);
        const a = n.getAltText(), l = /* @__PURE__ */ new Map();
        this.context.shouldSanitizeUrls() && (s = this.context.urlSanitizer().sanitizeImageUrl(s)), l.set("src", this.context.encodeUrl(s)), l.set("alt", a);
        const c = r.getTitle();
        C(c) && l.set("title", c), this.html.tag("img", this.getAttrs(r, "img", l), !0);
        break;
      }
      case t instanceof we: {
        const r = t;
        this.html.tag("em", this.getAttrs(r, "em")), this.visitChildren(r), this.html.tag("/em");
        break;
      }
      case t instanceof be: {
        const r = t;
        this.html.tag("strong", this.getAttrs(r, "strong")), this.visitChildren(r), this.html.tag("/strong");
        break;
      }
      case t instanceof A: {
        const r = t;
        this.html.tag("span", this.getAttrs(r, "span")), this.html.text(r.getLiteral()), this.html.tag("/span");
        break;
      }
      case t instanceof ue: {
        const r = t;
        this.html.tag("code", this.getAttrs(r, "code")), this.html.text(r.getLiteral()), this.html.tag("/code");
        break;
      }
      case t instanceof de: {
        const r = t;
        this.context.shouldEscapeHtml() ? this.html.text(r.getLiteral()) : this.html.raw(r.getLiteral());
        break;
      }
      case t instanceof ee: {
        this.html.raw(this.context.getSoftbreak());
        break;
      }
      case t instanceof W: {
        const r = t;
        this.html.tag("br", this.getAttrs(r, "br"), !0), this.html.line();
        break;
      }
    }
  }
  visitChildren(t) {
    let r = t.getFirstChild();
    for (; r !== null; ) {
      let s = r.getNext();
      this.context.render(r), r = s;
    }
  }
  renderCodeBlock(t, r, s) {
    this.html.line(), this.html.tag("pre", this.getAttrs(r, "pre")), this.html.tag("code", this.getAttrs(r, "code", s)), this.html.text(t), this.html.tag("/code"), this.html.tag("/pre"), this.html.line();
  }
  renderListBlock(t, r, s) {
    this.html.line(), this.html.tag(r, s), this.html.line(), this.visitChildren(t), this.html.line(), this.html.tag("/" + r), this.html.line();
  }
  isInTightList(t) {
    let r = t.getParent();
    if (r !== null) {
      let s = r.getParent();
      if (s instanceof me)
        return s.isTight();
    }
    return !1;
  }
  getAttrs(t, r, s = /* @__PURE__ */ new Map()) {
    return this.context.extendAttributes(t, r, s);
  }
}
i(Ot, "AltTextVisitor", St);
class gr {
  constructor(e = ["http", "https", "mailto", "data"]) {
    i(this, "protocols");
    this.protocols = new Set(e);
  }
  sanitizeLinkUrl(e) {
    e = this.stripHtmlSpaces(e);
    e: for (let t = 0, r = e.length; t < r; ++t)
      switch (e.charAt(t)) {
        case "/":
        case "#":
        case "?":
          break e;
        case ":":
          const s = e.substring(0, t).toLowerCase();
          if (!this.protocols.has(s))
            return "";
          break e;
      }
    return e;
  }
  sanitizeImageUrl(e) {
    return this.sanitizeLinkUrl(e);
  }
  stripHtmlSpaces(e) {
    let t = 0, r = e.length;
    for (; r > t && this.isHtmlSpace(e.charAt(r - 1)); --r)
      ;
    for (; t < r && this.isHtmlSpace(e.charAt(t)); ++t)
      ;
    return t === 0 && r === e.length ? e : e.substring(t, r);
  }
  isHtmlSpace(e) {
    switch (e) {
      case " ":
      case "	":
      case `
`:
      case "\f":
      case "\r":
        return !0;
      default:
        return !1;
    }
  }
}
const Ve = class Ve {
  constructor(e) {
    i(this, "buffer");
    i(this, "lastChar", ae(0));
    this.buffer = e;
  }
  raw(e) {
    this.append(e);
  }
  text(e) {
    this.append(E.escapeHtml(e));
  }
  tag(e, t = Ve.NO_ATTRIBUTES, r = !1) {
    if (this.append("<"), this.append(e), t.size)
      for (const s of t)
        this.append(" "), this.append(E.escapeHtml(s[0])), this.append('="'), this.append(E.escapeHtml(s[1])), this.append('"');
    r && this.append(" /"), this.append(">");
  }
  line() {
    this.lastChar.charCodeAt(0) !== 0 && this.lastChar !== `
` && this.append(`
`);
  }
  append(e) {
    this.buffer.append(e);
    const t = e.length;
    t !== 0 && (this.lastChar = e.charAt(t - 1));
  }
};
i(Ve, "NO_ATTRIBUTES", /* @__PURE__ */ new Map());
let st = Ve;
class Mt {
  extend(e) {
  }
}
class Lt {
  constructor() {
    i(this, "softbreak", `
`);
    i(this, "escapeHtml", !1);
    i(this, "sanitizeUrls", !1);
    i(this, "urlSanitizer", new gr());
    i(this, "percentEncodeUrls", !1);
    i(this, "omitSingleParagraphP", !1);
    i(this, "attributeProviderFactories", []);
    i(this, "nodeRendererFactories", []);
  }
  /**
   * @return the configured {@link HtmlRenderer}
   */
  build() {
    return new it(this);
  }
  /**
   * The HTML to use for rendering a softbreak, defaults to {@code "\n"} (meaning the rendered result doesn't have
   * a line break).
   * <p>
   * Set it to {@code "<br>"} (or {@code "<br />"} to make them hard breaks.
   * <p>
   * Set it to {@code " "} to ignore line wrapping in the source.
   *
   * @param softbreak HTML for softbreak
   * @return {@code this}
   */
  setSoftbreak(e) {
    return this.softbreak = e, this;
  }
  /**
   * Whether {@link HtmlInline} and {@link HtmlBlock} should be escaped, defaults to {@code false}.
   * <p>
   * Note that {@link HtmlInline} is only a tag itself, not the text between an opening tag and a closing tag. So
   * markup in the text will be parsed as normal and is not affected by this option.
   *
   * @param escapeHtml true for escaping, false for preserving raw HTML
   * @return {@code this}
   */
  setEscapeHtml(e) {
    return this.escapeHtml = e, this;
  }
  /**
   * Whether {@link Image} src and {@link Link} href should be sanitized, defaults to {@code false}.
   *
   * @param sanitizeUrls true for sanitization, false for preserving raw attribute
   * @return {@code this}
   * @since 0.14.0
   */
  setSanitizeUrls(e) {
    return this.sanitizeUrls = e, this;
  }
  /**
   * {@link UrlSanitizer} used to filter URL's if {@link #sanitizeUrls} is true.
   *
   * @param urlSanitizer Filterer used to filter {@link Image} src and {@link Link}.
   * @return {@code this}
   * @since 0.14.0
   */
  setUrlSanitizer(e) {
    return this.urlSanitizer = e, this;
  }
  /**
   * Whether URLs of link or images should be percent-encoded, defaults to {@code false}.
   * <p>
   * If enabled, the following is done:
   * <ul>
   * <li>Existing percent-encoded parts are preserved (e.g. "%20" is kept as "%20")</li>
   * <li>Reserved characters such as "/" are preserved, except for "[" and "]" (see encodeURI in JS)</li>
   * <li>Unreserved characters such as "a" are preserved</li>
   * <li>Other characters such umlauts are percent-encoded</li>
   * </ul>
   *
   * @param percentEncodeUrls true to percent-encode, false for leaving as-is
   * @return {@code this}
   */
  setPercentEncodeUrls(e) {
    return this.percentEncodeUrls = e, this;
  }
  /**
   * Whether documents that only contain a single paragraph should be rendered without the {@code <p>} tag. Set to
   * {@code true} to render without the tag; the default of {@code false} always renders the tag.
   *
   * @return {@code this}
   */
  setOmitSingleParagraphP(e) {
    return this.omitSingleParagraphP = e, this;
  }
  /**
   * Add a factory for an attribute provider for adding/changing HTML attributes to the rendered tags.
   *
   * @param attributeProviderFactory the attribute provider factory to add
   * @return {@code this}
   */
  attributeProviderFactory(e) {
    return this.attributeProviderFactories.push(e), this;
  }
  /**
   * Add a factory for instantiating a node renderer (done when rendering). This allows to override the rendering
   * of node types or define rendering for custom node types.
   * <p>
   * If multiple node renderers for the same node type are created, the one from the factory that was added first
   * "wins". (This is how the rendering for core node types can be overridden; the default rendering comes last.)
   *
   * @param nodeRendererFactory the factory for creating a node renderer
   * @return {@code this}
   */
  nodeRendererFactory(e) {
    return this.nodeRendererFactories.push(e), this;
  }
  /**
   * @param extensions extensions to use on this HTML renderer
   * @return {@code this}
   */
  extensions(e) {
    for (const t of e)
      t instanceof Mt && t.extend(this);
    return this;
  }
}
class fr {
  constructor(e, t) {
    i(this, "htmlWriter");
    i(this, "attributeProviders");
    i(this, "nodeRendererMap", new ot());
    i(this, "context");
    this.context = e, this.htmlWriter = t, this.attributeProviders = [];
    for (const r of this.context.attributeProviderFactories)
      this.attributeProviders.push(r.create(this));
    for (const r of this.context.nodeRendererFactories) {
      let s = r.create(this);
      this.nodeRendererMap.add(s);
    }
  }
  shouldEscapeHtml() {
    return this.context.escapeHtml;
  }
  shouldOmitSingleParagraphP() {
    return this.context.omitSingleParagraphP;
  }
  shouldSanitizeUrls() {
    return this.context.sanitizeUrls;
  }
  urlSanitizer() {
    return this.context.urlSanitizer;
  }
  encodeUrl(e) {
    return this.context.percentEncodeUrls ? E.percentEncodeUrl(e) : e;
  }
  extendAttributes(e, t, r) {
    const s = new Map(r);
    return this.setCustomAttributes(e, t, s), s;
  }
  getWriter() {
    return this.htmlWriter;
  }
  getSoftbreak() {
    return this.context.softbreak;
  }
  render(e) {
    this.nodeRendererMap.render(e);
  }
  beforeRoot(e) {
    this.nodeRendererMap.beforeRoot(e);
  }
  afterRoot(e) {
    this.nodeRendererMap.afterRoot(e);
  }
  setCustomAttributes(e, t, r) {
    for (const s of this.attributeProviders)
      s.setAttributes(e, t, r);
  }
}
class it {
  constructor(e) {
    i(this, "softbreak");
    i(this, "escapeHtml");
    i(this, "percentEncodeUrls");
    i(this, "omitSingleParagraphP");
    i(this, "sanitizeUrls");
    i(this, "urlSanitizer");
    i(this, "attributeProviderFactories");
    i(this, "nodeRendererFactories");
    this.softbreak = e.softbreak, this.escapeHtml = e.escapeHtml, this.percentEncodeUrls = e.percentEncodeUrls, this.omitSingleParagraphP = e.omitSingleParagraphP, this.sanitizeUrls = e.sanitizeUrls, this.urlSanitizer = e.urlSanitizer, this.attributeProviderFactories = [...e.attributeProviderFactories], this.nodeRendererFactories = [], this.nodeRendererFactories.push(...e.nodeRendererFactories), this.nodeRendererFactories.push({
      create(t) {
        return new Ot(t);
      }
    });
  }
  /**
   * Create a new builder for configuring an {@link HtmlRenderer}.
   *
   * @return a builder
   */
  static builder() {
    return new Lt();
  }
  render(e, t) {
    t || (t = new y());
    const r = new fr(this, new st(t));
    return r.beforeRoot(e), r.render(e), r.afterRoot(e), t.toString();
  }
}
/**
 * Builder for configuring an {@link HtmlRenderer}. See methods for default configuration.
 */
i(it, "Builder", Lt), i(it, "HtmlRendererExtension", Mt);
export {
  Ne as AbstractVisitor,
  y as Appendable,
  Ge as BitSet,
  N as Block,
  Q as BlockQuote,
  Y as BulletList,
  P as Character,
  ue as Code,
  mr as CustomBlock,
  wr as CustomNode,
  pe as Document,
  we as Emphasis,
  E as Escaping,
  F as FencedCodeBlock,
  W as HardLineBreak,
  G as Heading,
  J as HtmlBlock,
  de as HtmlInline,
  it as HtmlRenderer,
  ge as Image,
  Se as IncludeSourceSpans,
  X as IndentedCodeBlock,
  j as Link,
  Ke as LinkReferenceDefinition,
  Ze as LinkResult,
  me as ListBlock,
  _ as ListItem,
  U as MarkdownNode,
  rt as MarkdownRenderer,
  ot as NodeRendererMap,
  Je as Nodes,
  V as OrderedList,
  M as Paragraph,
  Qe as Parser,
  se as Scanner,
  ee as SoftLineBreak,
  ce as SourceSpan,
  be as StrongEmphasis,
  A as Text,
  et as TextContentRenderer,
  te as ThematicBreak,
  ae as fromCodePoint,
  C as isNotUnDef,
  ct as isUnDef
};
