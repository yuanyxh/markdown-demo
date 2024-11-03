


import { java, JavaObject, type int, S } from "jree";



/**
 * A set of lines ({@link SourceLine}) from the input source.
 *
 * @since 0.16.0
 */
export  class SourceLines extends JavaObject {

    private readonly  lines:  java.util.List<SourceLine> | null = new  java.util.ArrayList();

    public static  empty():  SourceLines | null {
        return new  SourceLines();
    }

    public static  of(sourceLine: SourceLine| null):  SourceLines | null;

    public static  of(sourceLines: java.util.List<SourceLine>| null):  SourceLines | null;
public static of(...args: unknown[]):  SourceLines | null {
		switch (args.length) {
			case 1: {
				const [sourceLine] = args as [SourceLine];


        let  sourceLines: SourceLines = new  SourceLines();
        sourceLines.addLine(sourceLine);
        return sourceLines;
    

				break;
			}

			case 1: {
				const [sourceLines] = args as [java.util.List<SourceLine>];


        let  result: SourceLines = new  SourceLines();
        result.lines.addAll(sourceLines);
        return result;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  addLine(sourceLine: SourceLine| null):  void {
        this.lines.add(sourceLine);
    }

    public  getLines():  java.util.List<SourceLine> | null {
        return this.lines;
    }

    public  isEmpty():  boolean {
        return this.lines.isEmpty();
    }

    public  getContent():  java.lang.String | null {
        let  sb: java.lang.StringBuilder = new  java.lang.StringBuilder();
        for (let  i: int = 0; i < this.lines.size(); i++) {
            if (i !== 0) {
                sb.append('\n');
            }
            sb.append(this.lines.get(i).getContent());
        }
        return sb.toString();
    }

    public  getSourceSpans():  java.util.List<SourceSpan> | null {
        let  sourceSpans: java.util.List<SourceSpan> = new  java.util.ArrayList();
        for (let line of this.lines) {
            let  sourceSpan: SourceSpan = line.getSourceSpan();
            if (sourceSpan !== null) {
                sourceSpans.add(sourceSpan);
            }
        }
        return sourceSpans;
    }
}
