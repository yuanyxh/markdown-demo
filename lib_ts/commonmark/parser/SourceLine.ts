


import { java, JavaObject, type int } from "jree";



/**
 * A line or part of a line from the input source.
 *
 * @since 0.16.0
 */
export  class SourceLine extends JavaObject {

    private readonly  content:  java.lang.CharSequence | null;
    private readonly  sourceSpan:  SourceSpan | null;

    public static  of(content: java.lang.CharSequence| null, sourceSpan: SourceSpan| null):  SourceLine | null {
        return new  SourceLine(content, sourceSpan);
    }

    private  constructor(content: java.lang.CharSequence| null, sourceSpan: SourceSpan| null) {
        super();
this.content = java.util.Objects.requireNonNull(content, "content must not be null");
        this.sourceSpan = sourceSpan;
    }

    public  getContent():  java.lang.CharSequence | null {
        return this.content;
    }

    public  getSourceSpan():  SourceSpan | null {
        return this.sourceSpan;
    }

    public  substring(beginIndex: int, endIndex: int):  SourceLine | null {
        let  newContent: java.lang.CharSequence = this.content.subSequence(beginIndex, endIndex);
        let  newSourceSpan: SourceSpan = null;
        if (this.sourceSpan !== null) {
            let  length: int = endIndex - beginIndex;
            if (length !== 0) {
                let  columnIndex: int = this.sourceSpan.getColumnIndex() + beginIndex;
                let  inputIndex: int = this.sourceSpan.getInputIndex() + beginIndex;
                newSourceSpan = SourceSpan.of(this.sourceSpan.getLineIndex(), columnIndex, inputIndex, length);
            }
        }
        return SourceLine.of(newContent, newSourceSpan);
    }
}
