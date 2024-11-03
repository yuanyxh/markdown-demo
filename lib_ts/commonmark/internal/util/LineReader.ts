


import { java, JavaObject, type int, type char } from "jree";



/**
 * Reads lines from a reader like {@link java.io.BufferedReader} but also returns the line terminators.
 * <p>
 * Line terminators can be either a line feed {@code "\n"}, carriage return {@code "\r"}, or a carriage return followed
 * by a line feed {@code "\r\n"}. Call {@link #getLineTerminator()} after {@link #readLine()} to obtain the
 * corresponding line terminator. If a stream has a line at the end without a terminator, {@link #getLineTerminator()}
 * returns {@code null}.
 */
export  class LineReader extends JavaObject implements java.io.Closeable {

    // Same as java.io.BufferedReader
    protected static readonly  CHAR_BUFFER_SIZE:  int = 8192;
    protected static readonly  EXPECTED_LINE_LENGTH:  int = 80;

    private  reader:  java.io.Reader | null;
    private  cbuf:  Uint16Array;

    private  position:  int = 0;
    private  limit:  int = 0;

    private  lineTerminator:  java.lang.String | null = null;

    public  constructor(reader: java.io.Reader| null) {
        super();
this.reader = reader;
        this.cbuf = new  Uint16Array(LineReader.CHAR_BUFFER_SIZE);
    }

    /**
     * Read a line of text.
     *
     * @return the line, or {@code null} when the end of the stream has been reached and no more lines can be read
     */
    public  readLine():  java.lang.String | null {
        let  sb: java.lang.StringBuilder = null;
        let  cr: boolean = false;

        while (true) {
            if (this.position >= this.limit) {
                this.fill();
            }

            if (cr) {
                // We saw a CR before, check if we have CR LF or just CR.
                if (this.position < this.limit && this.cbuf[this.position] === '\n') {
                    this.position++;
                    return this.line(sb.toString(), "\r\n");
                } else {
                    return this.line(sb.toString(), "\r");
                }
            }

            if (this.position >= this.limit) {
                // End of stream, return either the last line without terminator or null for end.
                return this.line(sb !== null ? sb.toString() : null, null);
            }

            let  start: int = this.position;
            let  i: int = this.position;
            for (; i < this.limit; i++) {
                let  c: char = this.cbuf[i];
                if (c === '\n') {
                    this.position = i + 1;
                    return this.line(this.finish(sb, start, i), "\n");
                } else if (c === '\r') {
                    if (i + 1 < this.limit) {
                        // We know what the next character is, so we can check now whether we have
                        // a CR LF or just a CR and return.
                        if (this.cbuf[i + 1] === '\n') {
                            this.position = i + 2;
                            return this.line(this.finish(sb, start, i), "\r\n");
                        } else {
                            this.position = i + 1;
                            return this.line(this.finish(sb, start, i), "\r");
                        }
                    } else {
                        // We don't know what the next character is yet, check on next iteration.
                        cr = true;
                        this.position = i + 1;
                        break;
                    }
                }
            }

            if (this.position < i) {
                this.position = i;
            }

            // Haven't found a finished line yet, copy the data from the buffer so that we can fill
            // the buffer again.
            if (sb === null) {
                sb = new  java.lang.StringBuilder(LineReader.EXPECTED_LINE_LENGTH);
            }
            sb.append(this.cbuf, start, i - start);
        }
    }

    /**
     * Return the line terminator of the last read line from {@link #readLine()}.
     *
     * @return {@code "\n"}, {@code "\r"}, {@code "\r\n"}, or {@code null}
     */
    public  getLineTerminator():  java.lang.String | null {
        return this.lineTerminator;
    }

    public  close():  void {
        if (this.reader === null) {
            return;
        }
        try {
            this.reader.close();
        } finally {
            this.reader = null;
            this.cbuf = null;
        }
    }

    private  fill():  void {
        let  read: int;
        do {
            read = this.reader.read(this.cbuf, 0, this.cbuf.length);
        } while (read === 0);
        if (read > 0) {
            this.limit = read;
            this.position = 0;
        }
    }

    private  line(line: java.lang.String| null, lineTerminator: java.lang.String| null):  java.lang.String | null {
        this.lineTerminator = lineTerminator;
        return line;
    }

    private  finish(sb: java.lang.StringBuilder| null, start: int, end: int):  java.lang.String | null {
        let  len: int = end - start;
        if (sb === null) {
            return new  java.lang.String(this.cbuf, start, len);
        } else {
            return sb.append(this.cbuf, start, len).toString();
        }
    }
}
