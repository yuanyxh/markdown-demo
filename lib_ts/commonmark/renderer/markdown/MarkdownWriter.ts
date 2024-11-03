


import { java, JavaObject, type int, type char, S } from "jree";



/**
 * Writer for Markdown (CommonMark) text.
 */
export  class MarkdownWriter extends JavaObject {

    private readonly  buffer:  java.lang.Appendable | null;

    private  blockSeparator:  int = 0;
    private  lastChar:  char;
    private  atLineStart:  boolean = true;

    // Stacks of settings that affect various rendering behaviors. The common pattern here is that callers use "push" to
    // change a setting, render some nodes, and then "pop" the setting off the stack again to restore previous state.
    private readonly  prefixes:  java.util.LinkedList<java.lang.String> | null = new  java.util.LinkedList();
    private readonly  tight:  java.util.LinkedList<java.lang.Boolean> | null = new  java.util.LinkedList();
    private readonly  rawEscapes:  java.util.LinkedList<CharMatcher> | null = new  java.util.LinkedList();

    public  constructor(out: java.lang.Appendable| null) {
        super();
this.buffer = out;
    }

    /**
     * Write the supplied string (raw/unescaped except if {@link #pushRawEscape} was used).
     */
    public  raw(s: java.lang.String| null):  void;

    /**
     * Write the supplied character (raw/unescaped except if {@link #pushRawEscape} was used).
     */
    public  raw(c: char):  void;
public raw(...args: unknown[]):  void {
		switch (args.length) {
			case 1: {
				const [s] = args as [java.lang.String];


        this.flushBlockSeparator();
        this.write(s, null);
    

				break;
			}

			case 1: {
				const [c] = args as [char];


        this.flushBlockSeparator();
        this.write(c);
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    /**
     * Write the supplied string with escaping.
     *
     * @param s      the string to write
     * @param escape which characters to escape
     */
    public  text(s: java.lang.String| null, escape: CharMatcher| null):  void {
        if (s.isEmpty()) {
            return;
        }
        this.flushBlockSeparator();
        this.write(s, escape);

        this.lastChar = s.charAt(s.length() - 1);
        this.atLineStart = false;
    }

    /**
     * Write a newline (line terminator).
     */
    public  line():  void {
        this.write('\n');
        this.writePrefixes();
        this.atLineStart = true;
    }

    /**
     * Enqueue a block separator to be written before the next text is written. Block separators are not written
     * straight away because if there are no more blocks to write we don't want a separator (at the end of the document).
     */
    public  block():  void {
        // Remember whether this should be a tight or loose separator now because tight could get changed in between
        // this and the next flush.
        this.blockSeparator = this.isTight() ? 1 : 2;
        this.atLineStart = true;
    }

    /**
     * Push a prefix onto the top of the stack. All prefixes are written at the beginning of each line, until the
     * prefix is popped again.
     *
     * @param prefix the raw prefix string
     */
    public  pushPrefix(prefix: java.lang.String| null):  void {
        this.prefixes.addLast(prefix);
    }

    /**
     * Write a prefix.
     *
     * @param prefix the raw prefix string to write
     */
    public  writePrefix(prefix: java.lang.String| null):  void {
        let  tmp: boolean = this.atLineStart;
        this.raw(prefix);
        this.atLineStart = tmp;
    }

    /**
     * Remove the last prefix from the top of the stack.
     */
    public  popPrefix():  void {
        this.prefixes.removeLast();
    }

    /**
     * Change whether blocks are tight or loose. Loose is the default where blocks are separated by a blank line. Tight
     * is where blocks are not separated by a blank line. Tight blocks are used in lists, if there are no blank lines
     * within the list.
     * <p>
     * Note that changing this does not affect block separators that have already been enqueued with {@link #block()},
     * only future ones.
     */
    public  pushTight(tight: boolean):  void {
        this.tight.addLast(tight);
    }

    /**
     * Remove the last "tight" setting from the top of the stack.
     */
    public  popTight():  void {
        this.tight.removeLast();
    }

    /**
     * Escape the characters matching the supplied matcher, in all text (text and raw). This might be useful to
     * extensions that add another layer of syntax, e.g. the tables extension that uses `|` to separate cells and needs
     * all `|` characters to be escaped (even in code spans).
     *
     * @param rawEscape the characters to escape in raw text
     */
    public  pushRawEscape(rawEscape: CharMatcher| null):  void {
        this.rawEscapes.add(rawEscape);
    }

    /**
     * Remove the last raw escape from the top of the stack.
     */
    public  popRawEscape():  void {
        this.rawEscapes.removeLast();
    }

    /**
     * @return the last character that was written
     */
    public  getLastChar():  char {
        return this.lastChar;
    }

    /**
     * @return whether we're at the line start (not counting any prefixes), i.e. after a {@link #line} or {@link #block}.
     */
    public  isAtLineStart():  boolean {
        return this.atLineStart;
    }

    private  write(c: char):  void;

    private  write(s: java.lang.String| null, escape: CharMatcher| null):  void;
private write(...args: unknown[]):  void {
		switch (args.length) {
			case 1: {
				const [c] = args as [char];


        try {
            this.append(c, null);
        } catch (e) {
if (e instanceof java.io.IOException) {
            throw new  java.lang.RuntimeException(e);
        } else {
	throw e;
	}
}

        this.lastChar = c;
        this.atLineStart = false;
    

				break;
			}

			case 2: {
				const [s, escape] = args as [java.lang.String, CharMatcher];


        try {
            if (this.rawEscapes.isEmpty() && escape === null) {
                // Normal fast path
                this.buffer.append(s);
            } else {
                for (let  i: int = 0; i < s.length(); i++) {
                    this.append(s.charAt(i), escape);
                }
            }
        } catch (e) {
if (e instanceof java.io.IOException) {
            throw new  java.lang.RuntimeException(e);
        } else {
	throw e;
	}
}

        let  length: int = s.length();
        if (length !== 0) {
            this.lastChar = s.charAt(length - 1);
        }
        this.atLineStart = false;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    private  writePrefixes():  void {
        if (!this.prefixes.isEmpty()) {
            for (let prefix of this.prefixes) {
                this.write(prefix, null);
            }
        }
    }

    /**
     * If a block separator has been enqueued with {@link #block()} but not yet written, write it now.
     */
    private  flushBlockSeparator():  void {
        if (this.blockSeparator !== 0) {
            this.write('\n');
            this.writePrefixes();
            if (this.blockSeparator > 1) {
                this.write('\n');
                this.writePrefixes();
            }
            this.blockSeparator = 0;
        }
    }

    private  append(c: char, escape: CharMatcher| null):  void {
        if (this.needsEscaping(c, escape)) {
            if (c === '\n') {
                // Can't escape this with \, use numeric character reference
                this.buffer.append("&#10;");
            } else {
                this.buffer.append('\\');
                this.buffer.append(c);
            }
        } else {
            this.buffer.append(c);
        }
    }

    private  isTight():  boolean {
        return !this.tight.isEmpty() && this.tight.getLast();
    }

    private  needsEscaping(c: char, escape: CharMatcher| null):  boolean {
        return (escape !== null && escape.matches(c)) || this.rawNeedsEscaping(c);
    }

    private  rawNeedsEscaping(c: char):  boolean {
        for (let rawEscape of this.rawEscapes) {
            if (rawEscape.matches(c)) {
                return true;
            }
        }
        return false;
    }
}
