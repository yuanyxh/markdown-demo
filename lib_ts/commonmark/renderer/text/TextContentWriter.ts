


import { java, JavaObject, type char, type int, S } from "jree";



export  class TextContentWriter extends JavaObject {

    private readonly  buffer:  java.lang.Appendable | null;
    private readonly  lineBreakRendering:  LineBreakRendering | null;

    private readonly  tight:  java.util.LinkedList<java.lang.Boolean> | null = new  java.util.LinkedList();

    private  blockSeparator:  java.lang.String | null = null;
    private  lastChar:  char;

    public  constructor(out: java.lang.Appendable| null);

    public  constructor(out: java.lang.Appendable| null, lineBreakRendering: LineBreakRendering| null);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 1: {
				const [out] = args as [java.lang.Appendable];


        this(out, LineBreakRendering.COMPACT);
    

				break;
			}

			case 2: {
				const [out, lineBreakRendering] = args as [java.lang.Appendable, LineBreakRendering];


        super();
this.buffer = out;
        this.lineBreakRendering = lineBreakRendering;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  whitespace():  void {
        if (this.lastChar !== 0 && this.lastChar !== ' ') {
            this.write(' ');
        }
    }

    public  colon():  void {
        if (this.lastChar !== 0 && this.lastChar !== ':') {
            this.write(':');
        }
    }

    public  line():  void {
        this.append('\n');
    }

    public  block():  void {
        this.blockSeparator = this.lineBreakRendering === LineBreakRendering.STRIP ? " " : //
                this.lineBreakRendering === LineBreakRendering.COMPACT || this.isTight() ? "\n" : "\n\n";
    }

    public  resetBlock():  void {
        this.blockSeparator = null;
    }

    public  writeStripped(s: java.lang.String| null):  void {
        this.write(s.replaceAll("[\\r\\n\\s]+", " "));
    }

    public  write(s: java.lang.String| null):  void;

    public  write(c: char):  void;
public write(...args: unknown[]):  void {
		switch (args.length) {
			case 1: {
				const [s] = args as [java.lang.String];


        this.flushBlockSeparator();
        this.append(s);
    

				break;
			}

			case 1: {
				const [c] = args as [char];


        this.flushBlockSeparator();
        this.append(c);
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
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

    private  isTight():  boolean {
        return !this.tight.isEmpty() && this.tight.getLast();
    }

    /**
     * If a block separator has been enqueued with {@link #block()} but not yet written, write it now.
     */
    private  flushBlockSeparator():  void {
        if (this.blockSeparator !== null) {
            this.append(this.blockSeparator);
            this.blockSeparator = null;
        }
    }

    private  append(s: java.lang.String| null):  void;

    private  append(c: char):  void;
private append(...args: unknown[]):  void {
		switch (args.length) {
			case 1: {
				const [s] = args as [java.lang.String];


        try {
            this.buffer.append(s);
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
    

				break;
			}

			case 1: {
				const [c] = args as [char];


        try {
            this.buffer.append(c);
        } catch (e) {
if (e instanceof java.io.IOException) {
            throw new  java.lang.RuntimeException(e);
        } else {
	throw e;
	}
}

        this.lastChar = c;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}

}
