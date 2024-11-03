


import { java, JavaObject, type char, type int, S } from "jree";



export  class Scanner extends JavaObject {

    /**
     * Character representing the end of input source (or outside of the text in case of the "previous" methods).
     * <p>
     * Note that we can use NULL to represent this because CommonMark does not allow those in the input (we replace them
     * in the beginning of parsing).
     */
    public static readonly  END:  char = '\0';

    // Lines without newlines at the end. The scanner will yield `\n` between lines because they're significant for
    // parsing and the final output. There is no `\n` after the last line.
    private readonly  lines:  java.util.List<SourceLine> | null;
    // Which line we're at.
    private  lineIndex:  int;
    // The index within the line. If index == length(), we pretend that there's a `\n` and only advance after we yield
    // that.
    private  index:  int;

    // Current line or "" if at the end of the lines (using "" instead of null saves a null check)
    private  line:  SourceLine | null = SourceLine.of("", null);
    private  lineLength:  int = 0;

    protected constructor(lines: java.util.List<SourceLine>| null, lineIndex: int, index: int) {
        super();
this.lines = lines;
        this.lineIndex = lineIndex;
        this.index = index;
        if (!lines.isEmpty()) {
            this.checkPosition(lineIndex, index);
            this.setLine(lines.get(lineIndex));
        }
    }

    public static  of(lines: SourceLines| null):  Scanner | null {
        return new  Scanner(lines.getLines(), 0, 0);
    }

    public  peek():  char {
        if (this.index < this.lineLength) {
            return this.line.getContent().charAt(this.index);
        } else {
            if (this.lineIndex < this.lines.size() - 1) {
                return '\n';
            } else {
                // Don't return newline for end of last line
                return Scanner.END;
            }
        }
    }

    public  peekCodePoint():  int {
        if (this.index < this.lineLength) {
            let  c: char = this.line.getContent().charAt(this.index);
            if (java.lang.Character.isHighSurrogate(c) && this.index + 1 < this.lineLength) {
                let  low: char = this.line.getContent().charAt(this.index + 1);
                if (java.lang.Character.isLowSurrogate(low)) {
                    return java.lang.Character.toCodePoint(c, low);
                }
            }
            return c;
        } else {
            if (this.lineIndex < this.lines.size() - 1) {
                return '\n';
            } else {
                // Don't return newline for end of last line
                return Scanner.END;
            }
        }
    }

    public  peekPreviousCodePoint():  int {
        if (this.index > 0) {
            let  prev: int = this.index - 1;
            let  c: char = this.line.getContent().charAt(prev);
            if (java.lang.Character.isLowSurrogate(c) && prev > 0) {
                let  high: char = this.line.getContent().charAt(prev - 1);
                if (java.lang.Character.isHighSurrogate(high)) {
                    return java.lang.Character.toCodePoint(high, c);
                }
            }
            return c;
        } else {
            if (this.lineIndex > 0) {
                return '\n';
            } else {
                return Scanner.END;
            }
        }
    }

    public  hasNext():  boolean {
        if (this.index < this.lineLength) {
            return true;
        } else {
            // No newline at end of last line
            return this.lineIndex < this.lines.size() - 1;
        }
    }

    public  next():  void;

    /**
     * Check if the specified char is next and advance the position.
     *
     * @param c the char to check (including newline characters)
     * @return true if matched and position was advanced, false otherwise
     */
    public  next(c: char):  boolean;

    /**
     * Check if we have the specified content on the line and advanced the position. Note that if you want to match
     * newline characters, use {@link #next(char)}.
     *
     * @param content the text content to match on a single line (excluding newline characters)
     * @return true if matched and position was advanced, false otherwise
     */
    public  next(content: java.lang.String| null):  boolean;
public next(...args: unknown[]):  void |  boolean {
		switch (args.length) {
			case 0: {

        this.index++;
        if (this.index > this.lineLength) {
            this.lineIndex++;
            if (this.lineIndex < this.lines.size()) {
                this.setLine(this.lines.get(this.lineIndex));
            } else {
                this.setLine(SourceLine.of("", null));
            }
            this.index = 0;
        }
    

				break;
			}

			case 1: {
				const [c] = args as [char];


        if (this.peek() === c) {
            this.next();
            return true;
        } else {
            return false;
        }
    

				break;
			}

			case 1: {
				const [content] = args as [java.lang.String];


        if (this.index < this.lineLength && this.index + content.length() <= this.lineLength) {
            // Can't use startsWith because it's not available on CharSequence
            for (let  i: int = 0; i < content.length(); i++) {
                if (this.line.getContent().charAt(this.index + i) !== content.charAt(i)) {
                    return false;
                }
            }
            this.index += content.length();
            return true;
        } else {
            return false;
        }
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  matchMultiple(c: char):  int {
        let  count: int = 0;
        while (this.peek() === c) {
            count++;
            this.next();
        }
        return count;
    }

    public  match(matcher: CharMatcher| null):  int {
        let  count: int = 0;
        while (matcher.matches(this.peek())) {
            count++;
            this.next();
        }
        return count;
    }

    public  whitespace():  int {
        let  count: int = 0;
        while (true) {
            switch (this.peek()) {
                case ' ':
                case '\t':
                case '\n':
                case '\u000B':
                case '\f':
                case '\r':
                    count++;
                    this.next();
                    break;
                default:
                    return count;
            }
        }
    }

    public  find(c: char):  int;

    public  find(matcher: CharMatcher| null):  int;
public find(...args: unknown[]):  int {
		switch (args.length) {
			case 1: {
				const [c] = args as [char];


        let  count: int = 0;
        while (true) {
            let  cur: char = this.peek();
            if (cur === Scanner.END) {
                return -1;
            } else if (cur === c) {
                return count;
            }
            count++;
            this.next();
        }
    

				break;
			}

			case 1: {
				const [matcher] = args as [CharMatcher];


        let  count: int = 0;
        while (true) {
            let  c: char = this.peek();
            if (c === Scanner.END) {
                return -1;
            } else if (matcher.matches(c)) {
                return count;
            }
            count++;
            this.next();
        }
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    // Don't expose the int index, because it would be good if we could switch input to a List<String> of lines later
    // instead of one contiguous String.
    public  position():  Position | null {
        return new  Position(this.lineIndex, this.index);
    }

    public  setPosition(position: Position| null):  void {
        this.checkPosition(position.lineIndex, position.index);
        this.lineIndex = position.lineIndex;
        this.index = position.index;
        this.setLine(this.lines.get(this.lineIndex));
    }

    // For cases where the caller appends the result to a StringBuilder, we could offer another method to avoid some
    // unnecessary copying.
    public  getSource(begin: Position| null, end: Position| null):  SourceLines | null {
        if (begin.lineIndex === end.lineIndex) {
            // Shortcut for common case of text from a single line
            let  line: SourceLine = this.lines.get(begin.lineIndex);
            let  newContent: java.lang.CharSequence = line.getContent().subSequence(begin.index, end.index);
            let  newSourceSpan: SourceSpan = null;
            let  sourceSpan: SourceSpan = line.getSourceSpan();
            if (sourceSpan !== null) {
                newSourceSpan = sourceSpan.subSpan(begin.index, end.index);
            }
            return SourceLines.of(SourceLine.of(newContent, newSourceSpan));
        } else {
            let  sourceLines: SourceLines = SourceLines.empty();

            let  firstLine: SourceLine = this.lines.get(begin.lineIndex);
            sourceLines.addLine(firstLine.substring(begin.index, firstLine.getContent().length()));

            // Lines between begin and end (we are appending the full line)
            for (let  line: int = begin.lineIndex + 1; line < end.lineIndex; line++) {
                sourceLines.addLine(this.lines.get(line));
            }

            let  lastLine: SourceLine = this.lines.get(end.lineIndex);
            sourceLines.addLine(lastLine.substring(0, end.index));
            return sourceLines;
        }
    }

    private  setLine(line: SourceLine| null):  void {
        this.line = line;
        this.lineLength = line.getContent().length();
    }

    private  checkPosition(lineIndex: int, index: int):  void {
        if (lineIndex < 0 || lineIndex >= this.lines.size()) {
            throw new  java.lang.IllegalArgumentException("Line index " + lineIndex + " out of range, number of lines: " + this.lines.size());
        }
        let  line: SourceLine = this.lines.get(lineIndex);
        if (index < 0 || index > line.getContent().length()) {
            throw new  java.lang.IllegalArgumentException("Index " + index + " out of range, line length: " + line.getContent().length());
        }
    }
}
