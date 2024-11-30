import MarkdownNode from "./node";
import * as common from "./common";
import fromCodePoint from "./from-code-point";
import { decodeHTMLStrict } from "entities";

import type { ILinkRefMap } from "./node";

interface IInlineParserDelimiter {
  cc: number;
  numdelims: number;
  origdelims: number;
  node: MarkdownNode;
  previous: IInlineParserDelimiter | null;
  next: IInlineParserDelimiter | null;
  can_open: boolean;
  can_close: boolean;
}

interface IInlineParserBracket {
  node: MarkdownNode;
  previous: IInlineParserBracket | null;
  previousDelimiter: IInlineParserDelimiter | null;
  bracketAfter?: boolean;
  index: number;
  image: boolean;
  active: boolean;
}

const normalizeURI = common.normalizeURI;
const unescapeString = common.unescapeString;

// Constants for character codes:

const C_NEWLINE = 10;
const C_ASTERISK = 42;
const C_UNDERSCORE = 95;
const C_BACKTICK = 96;
const C_OPEN_BRACKET = 91;
const C_CLOSE_BRACKET = 93;
const C_LESSTHAN = 60;
const C_BANG = 33;
const C_BACKSLASH = 92;
const C_AMPERSAND = 38;
const C_OPEN_PAREN = 40;
const C_CLOSE_PAREN = 41;
const C_COLON = 58;
const C_SINGLEQUOTE = 39;
const C_DOUBLEQUOTE = 34;

// Some regexps used in inline parser:

const ESCAPABLE = common.ESCAPABLE;
const ESCAPED_CHAR = "\\\\" + ESCAPABLE;

const ENTITY = common.ENTITY;
const reHtmlTag = common.reHtmlTag;

const rePunctuation = new RegExp(
  /^[!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~\p{P}\p{S}]/u
);

const reLinkTitle = new RegExp(
  '^(?:"(' +
    ESCAPED_CHAR +
    "|\\\\[^\\\\]" +
    '|[^\\\\"\\x00])*"' +
    "|" +
    "'(" +
    ESCAPED_CHAR +
    "|\\\\[^\\\\]" +
    "|[^\\\\'\\x00])*'" +
    "|" +
    "\\((" +
    ESCAPED_CHAR +
    "|\\\\[^\\\\]" +
    "|[^\\\\()\\x00])*\\))"
);

const reLinkDestinationBraces = /^(?:<(?:[^<>\n\\\x00]|\\.)*>)/;

const reEscapable = new RegExp("^" + ESCAPABLE);

const reEntityHere = new RegExp("^" + ENTITY, "i");

const reTicks = /`+/;

const reTicksHere = /^`+/;

const reEllipses = /\.\.\./g;

const reDash = /--+/g;

const reEmailAutolink =
  /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;

const reAutolink = /^<[A-Za-z][A-Za-z0-9.+-]{1,31}:[^<>\x00-\x20]*>/i;

const reSpnl = /^ *(?:\n *)?/;

const reWhitespaceChar = /^[ \t\n\x0b\x0c\x0d]/;

const reUnicodeWhitespaceChar = /^\s/;

const reFinalSpace = / *$/;

const reInitialSpace = /^ */;

const reSpaceAtEndOfLine = /^ *(?:\n|$)/;

const reLinkLabel = /^\[(?:[^\\\[\]]|\\.){0,1000}\]/s;

// Matches a string of non-special characters.
const reMain = /^[^\n`\[\]\\!<&*_'"]+/m;

const text = function (s: string) {
  const node = new MarkdownNode("text");
  node.literal = s;

  return node;
};

// normalize a reference in reference link (remove []s, trim,
// collapse internal space, unicode case fold.
// See commonmark/commonmark.js#168.
const normalizeReference = function (string: string) {
  return string
    .slice(1, string.length - 1)
    .trim()
    .replace(/[ \t\r\n]+/g, " ")
    .toLowerCase()
    .toUpperCase();
};

// INLINE PARSER

// These are methods of an InlineParser object, defined below.
// An InlineParser keeps track of a subject (a string to be
// parsed) and a position in that subject.

const removeDelimitersBetween = function (
  bottom: IInlineParserDelimiter,
  top: IInlineParserDelimiter
) {
  if (bottom.next !== top) {
    bottom.next = top;
    top.previous = bottom;
  }
};

// The InlineParser object.
class InlineParser {
  subject = "";
  delimiters: IInlineParserDelimiter | null = null; // used by handleDelim method
  brackets: IInlineParserBracket | null = null;

  pos = 0;
  refmap: ILinkRefMap = {};

  options: IParserOptions;

  constructor(options: IParserOptions = {}) {
    this.options = options;
  }

  // If re matches at current position in the subject, advance
  // position in subject and return the match; otherwise return null.
  match(re: RegExp) {
    const m = re.exec(this.subject.slice(this.pos));
    if (m === null) {
      return null;
    } else {
      this.pos += m.index + m[0].length;
      return m[0];
    }
  }

  // Returns the code for the character at the current subject position, or -1
  // there are no more characters.
  peek() {
    if (this.pos < this.subject.length) {
      return this.subject.charCodeAt(this.pos);
    } else {
      return -1;
    }
  }

  // Parse zero or more space characters, including at most one newline
  spnl() {
    this.match(reSpnl);

    return true;
  }

  // All of the parsers below try to match something at the current position
  // in the subject.  If they succeed in matching anything, they
  // return the inline matched, advancing the subject.

  // Attempt to parse backticks, adding either a backtick code span or a
  // literal sequence of backticks.
  parseBackticks(block: MarkdownNode) {
    const ticks = this.match(reTicksHere);
    if (ticks === null) {
      return false;
    }

    let afterOpenTicks = this.pos;
    let matched: string | null;
    let node: MarkdownNode;
    let contents: string;

    while ((matched = this.match(reTicks)) !== null) {
      if (matched === ticks) {
        node = new MarkdownNode("code");
        contents = this.subject
          .slice(afterOpenTicks, this.pos - ticks.length)
          .replace(/\n/gm, " ");

        if (
          contents.length > 0 &&
          contents.match(/[^ ]/) !== null &&
          contents[0] == " " &&
          contents[contents.length - 1] == " "
        ) {
          node.literal = contents.slice(1, contents.length - 1);
        } else {
          node.literal = contents;
        }

        block.appendChild(node);

        return true;
      }
    }

    // If we got here, we didn't match a closing backtick sequence.
    this.pos = afterOpenTicks;
    block.appendChild(text(ticks));

    return true;
  }

  // Parse a backslash-escaped special character, adding either the escaped
  // character, a hard line break (if the backslash is followed by a newline),
  // or a literal backslash to the block's children.  Assumes current character
  // is a backslash.
  parseBackslash(block: MarkdownNode) {
    const subj = this.subject;

    let node: MarkdownNode;

    this.pos += 1;

    if (this.peek() === C_NEWLINE) {
      this.pos += 1;

      node = new MarkdownNode("linebreak");
      block.appendChild(node);
    } else if (reEscapable.test(subj.charAt(this.pos))) {
      block.appendChild(text(subj.charAt(this.pos)));

      this.pos += 1;
    } else {
      block.appendChild(text("\\"));
    }

    return true;
  }

  // Attempt to parse an autolink (URL or email in pointy brackets).
  parseAutolink(block: MarkdownNode) {
    let m: string | null;
    let dest: string;
    let node: MarkdownNode;

    if ((m = this.match(reEmailAutolink))) {
      dest = m.slice(1, m.length - 1);
      node = new MarkdownNode("link");
      node.destination = normalizeURI("mailto:" + dest);
      node.title = "";

      node.appendChild(text(dest));
      block.appendChild(node);

      return true;
    } else if ((m = this.match(reAutolink))) {
      dest = m.slice(1, m.length - 1);
      node = new MarkdownNode("link");
      node.destination = normalizeURI(dest);
      node.title = "";

      node.appendChild(text(dest));
      block.appendChild(node);

      return true;
    } else {
      return false;
    }
  }

  // Attempt to parse a raw HTML tag.
  parseHtmlTag(block: MarkdownNode) {
    const m = this.match(reHtmlTag);

    if (m === null) {
      return false;
    } else {
      const node = new MarkdownNode("html_inline");
      node.literal = m;

      block.appendChild(node);
      return true;
    }
  }

  // Scan a sequence of characters with code cc, and return information about
  // the number of delimiters and whether they are positioned such that
  // they can open and/or close emphasis or strong emphasis.  A utility
  // function for strong/emph parsing.
  scanDelims(cc: number) {
    let numdelims = 0;

    let char_before: string;
    let char_after: string;
    let cc_after: number;

    const startpos = this.pos;

    let left_flanking: boolean;
    let right_flanking: boolean;

    let can_open: boolean;
    let can_close: boolean;

    let after_is_whitespace: boolean;
    let after_is_punctuation: boolean;
    let before_is_whitespace: boolean;
    let before_is_punctuation: boolean;

    if (cc === C_SINGLEQUOTE || cc === C_DOUBLEQUOTE) {
      numdelims++;
      this.pos++;
    } else {
      while (this.peek() === cc) {
        numdelims++;
        this.pos++;
      }
    }

    if (numdelims === 0) {
      return null;
    }

    char_before = startpos === 0 ? "\n" : this.subject.charAt(startpos - 1);

    cc_after = this.peek();
    if (cc_after === -1) {
      char_after = "\n";
    } else {
      char_after = fromCodePoint(cc_after);
    }

    after_is_whitespace = reUnicodeWhitespaceChar.test(char_after);
    after_is_punctuation = rePunctuation.test(char_after);
    before_is_whitespace = reUnicodeWhitespaceChar.test(char_before);
    before_is_punctuation = rePunctuation.test(char_before);

    left_flanking =
      !after_is_whitespace &&
      (!after_is_punctuation || before_is_whitespace || before_is_punctuation);

    right_flanking =
      !before_is_whitespace &&
      (!before_is_punctuation || after_is_whitespace || after_is_punctuation);

    if (cc === C_UNDERSCORE) {
      can_open = left_flanking && (!right_flanking || before_is_punctuation);
      can_close = right_flanking && (!left_flanking || after_is_punctuation);
    } else if (cc === C_SINGLEQUOTE || cc === C_DOUBLEQUOTE) {
      can_open = left_flanking && !right_flanking;
      can_close = right_flanking;
    } else {
      can_open = left_flanking;
      can_close = right_flanking;
    }

    this.pos = startpos;

    return { numdelims: numdelims, can_open: can_open, can_close: can_close };
  }

  // Handle a delimiter marker for emphasis or a quote.
  handleDelim(cc: number, block: MarkdownNode) {
    const res = this.scanDelims(cc);

    if (!res) {
      return false;
    }

    const numdelims = res.numdelims;
    const startpos = this.pos;

    let contents: string;

    this.pos += numdelims;
    if (cc === C_SINGLEQUOTE) {
      contents = "\u2019";
    } else if (cc === C_DOUBLEQUOTE) {
      contents = "\u201C";
    } else {
      contents = this.subject.slice(startpos, this.pos);
    }

    const node = text(contents);
    block.appendChild(node);

    // Add entry to stack for this opener
    if (
      (res.can_open || res.can_close) &&
      (this.options.smart || (cc !== C_SINGLEQUOTE && cc !== C_DOUBLEQUOTE))
    ) {
      this.delimiters = {
        cc: cc,
        numdelims: numdelims,
        origdelims: numdelims,
        node: node,
        previous: this.delimiters,
        next: null,
        can_open: res.can_open,
        can_close: res.can_close,
      };

      if (this.delimiters.previous !== null) {
        this.delimiters.previous.next = this.delimiters;
      }
    }

    return true;
  }

  // Attempt to parse link title (sans quotes), returning the string
  // or null if no match.
  parseLinkTitle() {
    const title = this.match(reLinkTitle);

    if (title === null) {
      return null;
    } else {
      // chop off quotes from title and unescape:
      return unescapeString(title.slice(1, -1));
    }
  }

  // Attempt to parse link destination, returning the string or
  // null if no match.
  parseLinkDestination() {
    let res = this.match(reLinkDestinationBraces);

    if (res === null) {
      if (this.peek() === C_LESSTHAN) {
        return null;
      }

      // TODO handrolled parser; res should be null or the string
      const savepos = this.pos;

      let openparens = 0;
      let c: number;

      while ((c = this.peek()) !== -1) {
        if (
          c === C_BACKSLASH &&
          reEscapable.test(this.subject.charAt(this.pos + 1))
        ) {
          this.pos += 1;

          if (this.peek() !== -1) {
            this.pos += 1;
          }
        } else if (c === C_OPEN_PAREN) {
          this.pos += 1;
          openparens += 1;
        } else if (c === C_CLOSE_PAREN) {
          if (openparens < 1) {
            break;
          } else {
            this.pos += 1;
            openparens -= 1;
          }
        } else if (reWhitespaceChar.exec(fromCodePoint(c)) !== null) {
          break;
        } else {
          this.pos += 1;
        }
      }

      if (this.pos === savepos && c !== C_CLOSE_PAREN) {
        return null;
      }

      if (openparens !== 0) {
        return null;
      }

      res = this.subject.slice(savepos, this.pos);

      return normalizeURI(unescapeString(res));
    } else {
      // chop off surrounding <..>:
      return normalizeURI(unescapeString(res.slice(1, -1)));
    }
  }

  // Attempt to parse a link label, returning number of characters parsed.
  parseLinkLabel() {
    const m = this.match(reLinkLabel);

    if (m === null || m.length > 1001) {
      return 0;
    } else {
      return m.length;
    }
  }

  // Add open bracket to delimiter stack and add a text node to block's children.
  parseOpenBracket(block: MarkdownNode) {
    const startpos = this.pos;

    this.pos += 1;

    const node = text("[");
    block.appendChild(node);

    // Add entry to stack for this opener
    this.addBracket(node, startpos, false);

    return true;
  }

  // IF next character is [, and ! delimiter to delimiter stack and
  // add a text node to block's children.  Otherwise just add a text node.
  parseBang(block: MarkdownNode) {
    const startpos = this.pos;

    this.pos += 1;

    if (this.peek() === C_OPEN_BRACKET) {
      this.pos += 1;

      const node = text("![");
      block.appendChild(node);

      // Add entry to stack for this opener
      this.addBracket(node, startpos + 1, true);
    } else {
      block.appendChild(text("!"));
    }

    return true;
  }

  // Try to match close bracket against an opening in the delimiter
  // stack.  Add either a link or image, or a plain [ character,
  // to block's children.  If there is a matching delimiter,
  // remove it from the delimiter stack.
  parseCloseBracket(block: MarkdownNode) {
    let startpos: number;
    let is_image: boolean;
    let dest: string | null = null;
    let title: string | null = null;
    let matched = false;
    let reflabel = "";
    let opener: IInlineParserBracket | null;

    this.pos += 1;
    startpos = this.pos;

    // get last [ or ![
    opener = this.brackets;

    if (opener === null) {
      // no matched opener, just return a literal
      block.appendChild(text("]"));

      return true;
    }

    if (!opener.active) {
      // no matched opener, just return a literal
      block.appendChild(text("]"));
      // take opener off brackets stack
      this.removeBracket();

      return true;
    }

    // If we got here, open is a potential opener
    is_image = opener.image;

    // Check to see if we have a link/image

    const savepos = this.pos;

    // Inline link?
    if (this.peek() === C_OPEN_PAREN) {
      this.pos++;

      if (
        this.spnl() &&
        (dest = this.parseLinkDestination()) !== null &&
        this.spnl() &&
        // make sure there's a space before the title:
        ((reWhitespaceChar.test(this.subject.charAt(this.pos - 1)) &&
          (title = this.parseLinkTitle())) ||
          true) &&
        this.spnl() &&
        this.peek() === C_CLOSE_PAREN
      ) {
        this.pos += 1;
        matched = true;
      } else {
        this.pos = savepos;
      }
    }

    if (!matched) {
      // Next, see if there's a link label
      const beforelabel = this.pos;
      const n = this.parseLinkLabel();

      if (n > 2) {
        reflabel = this.subject.slice(beforelabel, beforelabel + n);
      } else if (!opener.bracketAfter) {
        // Empty or missing second label means to use the first label as the reference.
        // The reference must not contain a bracket. If we know there's a bracket, we don't even bother checking it.
        reflabel = this.subject.slice(opener.index, startpos);
      }

      if (n === 0) {
        // If shortcut reference link, rewind before spaces we skipped.
        this.pos = savepos;
      }

      if (reflabel) {
        // lookup rawlabel in refmap
        const link = this.refmap[normalizeReference(reflabel)];

        if (link) {
          dest = link.destination;
          title = link.title;
          matched = true;
        }
      }
    }

    if (matched) {
      const node = new MarkdownNode(is_image ? "image" : "link");
      node.destination = dest;
      node.title = title || "";

      let tmp: MarkdownNode | null;
      let next: MarkdownNode | null;

      tmp = opener.node.next;

      while (tmp) {
        next = tmp.next;
        tmp.unlink();
        node.appendChild(tmp);

        tmp = next;
      }

      block.appendChild(node);
      this.processEmphasis(opener.previousDelimiter);
      this.removeBracket();

      opener.node.unlink();

      // We remove this bracket and processEmphasis will remove later delimiters.
      // Now, for a link, we also deactivate earlier link openers.
      // (no links in links)
      if (!is_image) {
        opener = this.brackets;

        while (opener !== null) {
          if (!opener.image) {
            opener.active = false; // deactivate this opener
          }

          opener = opener.previous;
        }
      }

      return true;
    } else {
      // no match

      this.removeBracket(); // remove this opener from stack
      this.pos = startpos;
      block.appendChild(text("]"));

      return true;
    }
  }

  addBracket(node: MarkdownNode, index: number, image: boolean) {
    if (this.brackets !== null) {
      this.brackets.bracketAfter = true;
    }

    this.brackets = {
      node: node,
      previous: this.brackets,
      previousDelimiter: this.delimiters,
      index: index,
      image: image,
      active: true,
    };
  }

  removeBracket() {
    // TODO: new add
    if (this.brackets === null) {
      throw new Error("Not have a brackets.");
    }

    this.brackets = this.brackets.previous;
  }

  // Attempt to parse an entity.
  parseEntity(block: MarkdownNode) {
    let m: string | null;

    if ((m = this.match(reEntityHere))) {
      block.appendChild(text(decodeHTMLStrict(m)));

      return true;
    } else {
      return false;
    }
  }

  // Parse a run of ordinary characters, or a single character with
  // a special meaning in markdown, as a plain string.
  parseString(block: MarkdownNode) {
    let m: string | null;

    if ((m = this.match(reMain))) {
      if (this.options.smart) {
        block.appendChild(
          text(
            m.replace(reEllipses, "\u2026").replace(reDash, function (chars) {
              let enCount = 0;
              let emCount = 0;

              if (chars.length % 3 === 0) {
                // If divisible by 3, use all em dashes
                emCount = chars.length / 3;
              } else if (chars.length % 2 === 0) {
                // If divisible by 2, use all en dashes
                enCount = chars.length / 2;
              } else if (chars.length % 3 === 2) {
                // If 2 extra dashes, use en dash for last 2; em dashes for rest
                enCount = 1;
                emCount = (chars.length - 2) / 3;
              } else {
                // Use en dashes for last 4 hyphens; em dashes for rest
                enCount = 2;
                emCount = (chars.length - 4) / 3;
              }

              return "\u2014".repeat(emCount) + "\u2013".repeat(enCount);
            })
          )
        );
      } else {
        block.appendChild(text(m));
      }

      return true;
    } else {
      return false;
    }
  }

  // Parse a newline.  If it was preceded by two spaces, return a hard
  // line break; otherwise a soft line break.
  parseNewline(block: MarkdownNode) {
    this.pos += 1; // assume we're at a \n
    // check previous node for trailing spaces

    const lastc = block.lastChild;

    // TODO: new add
    if (lastc?.literal === null) {
      throw new Error("Not have a lastc.literal.");
    }

    if (
      lastc &&
      lastc.type === "text" &&
      lastc.literal[lastc.literal.length - 1] === " "
    ) {
      const hardbreak = lastc.literal[lastc.literal.length - 2] === " ";
      lastc.literal = lastc.literal.replace(reFinalSpace, "");

      block.appendChild(
        new MarkdownNode(hardbreak ? "linebreak" : "softbreak")
      );
    } else {
      block.appendChild(new MarkdownNode("softbreak"));
    }

    this.match(reInitialSpace); // gobble leading spaces in next line

    return true;
  }

  // Attempt to parse a link reference, modifying refmap.
  parseReference(s: string, refmap: ILinkRefMap) {
    this.subject = s;
    this.pos = 0;

    let rawlabel: string;
    let dest: string | null = null;
    let title: string | null = null;
    let matchChars: number;
    const startpos = this.pos;

    // label:
    matchChars = this.parseLinkLabel();
    if (matchChars === 0) {
      return 0;
    } else {
      rawlabel = this.subject.slice(0, matchChars);
    }

    // colon:
    if (this.peek() === C_COLON) {
      this.pos++;
    } else {
      this.pos = startpos;
      return 0;
    }

    //  link url
    this.spnl();

    dest = this.parseLinkDestination();
    if (dest === null) {
      this.pos = startpos;
      return 0;
    }

    const beforetitle = this.pos;
    this.spnl();

    if (this.pos !== beforetitle) {
      title = this.parseLinkTitle();
    }

    if (title === null) {
      // rewind before spaces
      this.pos = beforetitle;
    }

    // make sure we're at line end:
    let atLineEnd = true;
    if (this.match(reSpaceAtEndOfLine) === null) {
      if (title === null) {
        atLineEnd = false;
      } else {
        // the potential title we found is not at the line end,
        // but it could still be a legal link reference if we
        // discard the title
        title = null;
        // rewind before spaces
        this.pos = beforetitle;
        // and instead check if the link URL is at the line end
        atLineEnd = this.match(reSpaceAtEndOfLine) !== null;
      }
    }

    if (!atLineEnd) {
      this.pos = startpos;

      return 0;
    }

    const normlabel = normalizeReference(rawlabel);
    if (normlabel === "") {
      // label must contain non-whitespace characters
      this.pos = startpos;

      return 0;
    }

    if (!refmap[normlabel]) {
      refmap[normlabel] = {
        destination: dest,
        title: title === null ? "" : title,
      };
    }

    return this.pos - startpos;
  }

  // Parse the next inline element in subject, advancing subject position.
  // On success, add the result to block's children and return true.
  // On failure, return false.
  parseInline(block: MarkdownNode) {
    let res = false;

    const c = this.peek();

    if (c === -1) {
      return false;
    }

    switch (c) {
      case C_NEWLINE:
        res = this.parseNewline(block);
        break;
      case C_BACKSLASH:
        res = this.parseBackslash(block);
        break;
      case C_BACKTICK:
        res = this.parseBackticks(block);
        break;
      case C_ASTERISK:
      case C_UNDERSCORE:
        res = this.handleDelim(c, block);
        break;
      case C_SINGLEQUOTE:
      case C_DOUBLEQUOTE:
        if (this.options.smart) {
          res = this.handleDelim(c, block);
        }

        break;
      case C_OPEN_BRACKET:
        res = this.parseOpenBracket(block);
        break;
      case C_BANG:
        res = this.parseBang(block);
        break;
      case C_CLOSE_BRACKET:
        res = this.parseCloseBracket(block);
        break;
      case C_LESSTHAN:
        res = this.parseAutolink(block) || this.parseHtmlTag(block);
        break;
      case C_AMPERSAND:
        res = this.parseEntity(block);
        break;
      default:
        res = this.parseString(block);
        break;
    }

    if (!res) {
      this.pos += 1;

      block.appendChild(text(fromCodePoint(c)));
    }

    return true;
  }

  processEmphasis(stack_bottom: IInlineParserDelimiter | null) {
    let opener: IInlineParserDelimiter | null;
    let closer: IInlineParserDelimiter | null;
    let old_closer: IInlineParserDelimiter | null;

    let opener_inl: MarkdownNode;
    let closer_inl: MarkdownNode;

    let tempstack;
    let use_delims;

    let tmp: MarkdownNode | null;
    let next: MarkdownNode | null;
    let opener_found: boolean;
    let openers_bottom: (IInlineParserDelimiter | null)[] = [];
    let openers_bottom_index = -1;
    let odd_match = false;

    for (let i = 0; i < 14; i++) {
      openers_bottom[i] = stack_bottom;
    }

    // find first closer above stack_bottom:
    closer = this.delimiters;
    while (closer !== null && closer.previous !== stack_bottom) {
      closer = closer.previous;
    }

    // move forward, looking for closers, and handling each
    while (closer !== null) {
      const closercc = closer.cc;

      if (!closer.can_close) {
        closer = closer.next;
      } else {
        // found emphasis closer. now look back for first matching opener:
        opener = closer.previous;
        opener_found = false;
        switch (closercc) {
          case C_SINGLEQUOTE:
            openers_bottom_index = 0;
            break;
          case C_DOUBLEQUOTE:
            openers_bottom_index = 1;
            break;
          case C_UNDERSCORE:
            openers_bottom_index =
              2 + (closer.can_open ? 3 : 0) + (closer.origdelims % 3);
            break;
          case C_ASTERISK:
            openers_bottom_index =
              8 + (closer.can_open ? 3 : 0) + (closer.origdelims % 3);
            break;
        }

        while (
          opener !== null &&
          opener !== stack_bottom &&
          opener !== openers_bottom[openers_bottom_index]
        ) {
          odd_match =
            (closer.can_open || opener.can_close) &&
            closer.origdelims % 3 !== 0 &&
            (opener.origdelims + closer.origdelims) % 3 === 0;

          if (opener.cc === closer.cc && opener.can_open && !odd_match) {
            opener_found = true;
            break;
          }

          opener = opener.previous;
        }

        old_closer = closer;

        if (closercc === C_ASTERISK || closercc === C_UNDERSCORE) {
          if (!opener_found) {
            closer = closer.next;
          } else {
            // TODO: new add
            if (opener === null) {
              throw new Error("Not have a opener.");
            }

            // calculate actual number of delimiters used from closer
            use_delims = closer.numdelims >= 2 && opener.numdelims >= 2 ? 2 : 1;

            opener_inl = opener.node;
            closer_inl = closer.node;

            // remove used delimiters from stack elts and inlines
            opener.numdelims -= use_delims;
            closer.numdelims -= use_delims;

            // TODO: new add
            if (opener_inl.literal === null) {
              throw new Error("Not have a opener_inl.literal.");
            }
            // TODO: new add
            if (closer_inl.literal === null) {
              throw new Error("Not have a closer_inl.literal.");
            }

            opener_inl.literal = opener_inl.literal.slice(
              0,
              opener_inl.literal.length - use_delims
            );
            closer_inl.literal = closer_inl.literal.slice(
              0,
              closer_inl.literal.length - use_delims
            );

            // build contents for new emph element
            const emph = new MarkdownNode(use_delims === 1 ? "emph" : "strong");

            tmp = opener_inl.next;

            while (tmp && tmp !== closer_inl) {
              next = tmp.next;

              tmp.unlink();
              emph.appendChild(tmp);
              tmp = next;
            }

            opener_inl.insertAfter(emph);

            // remove elts between opener and closer in delimiters stack
            removeDelimitersBetween(opener, closer);

            // if opener has 0 delims, remove it and the inline
            if (opener.numdelims === 0) {
              opener_inl.unlink();

              this.removeDelimiter(opener);
            }

            if (closer.numdelims === 0) {
              closer_inl.unlink();
              tempstack = closer.next;

              this.removeDelimiter(closer);

              closer = tempstack;
            }
          }
        } else if (closercc === C_SINGLEQUOTE) {
          closer.node.literal = "\u2019";

          if (opener_found) {
            // TODO: new add
            if (opener === null) {
              throw new Error("Not have a opener.");
            }

            opener.node.literal = "\u2018";
          }
          closer = closer.next;
        } else if (closercc === C_DOUBLEQUOTE) {
          closer.node.literal = "\u201D";

          if (opener_found) {
            // TODO: new add
            if (opener === null) {
              throw new Error("Not have a opener.");
            }

            opener.node.literal = "\u201C";
          }

          closer = closer.next;
        }
        if (!opener_found) {
          // Set lower bound for future searches for openers:
          openers_bottom[openers_bottom_index] = old_closer.previous;

          if (!old_closer.can_open) {
            // We can remove a closer that can't be an opener,
            // once we've seen there's no matching opener:
            this.removeDelimiter(old_closer);
          }
        }
      }
    }

    // remove all delimiters
    while (this.delimiters !== null && this.delimiters !== stack_bottom) {
      this.removeDelimiter(this.delimiters);
    }
  }

  removeDelimiter(delim: IInlineParserDelimiter) {
    if (delim.previous !== null) {
      delim.previous.next = delim.next;
    }

    if (delim.next === null) {
      // top of stack
      this.delimiters = delim.previous;
    } else {
      delim.next.previous = delim.previous;
    }
  }

  // Parse string content in block into inline children,
  // using refmap to resolve references.
  parse(block: MarkdownNode) {
    // trim() removes non-ASCII whitespaces, vertical tab, form feed and so on.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim#return_value
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#white_space
    // Removes only ASCII tab and space.
    this.subject = block.string_content.replace(/^[\t \r\n]+|[\t \r\n]+$/g, "");
    this.pos = 0;
    this.delimiters = null;
    this.brackets = null;

    while (this.parseInline(block)) {}

    block.string_content = ""; // allow raw string to be garbage collected

    this.processEmphasis(null);
  }
}

export default InlineParser;
