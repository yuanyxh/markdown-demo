
import { java, JavaObject, type int, S } from "jree";



export class BlockContent extends JavaObject {

    private readonly  sb:  java.lang.StringBuilder | null;

    private  lineCount:  int = 0;

    public  constructor();

    public  constructor(content: java.lang.String| null);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 0: {

        super();
this.sb = new  java.lang.StringBuilder();
    

				break;
			}

			case 1: {
				const [content] = args as [java.lang.String];


        super();
this.sb = new  java.lang.StringBuilder(content);
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  add(line: java.lang.CharSequence| null):  void {
        if (this.lineCount !== 0) {
            this.sb.append('\n');
        }
        this.sb.append(line);
        this.lineCount++;
    }

    public  getString():  java.lang.String | null {
        return this.sb.toString();
    }

}
