
import { java, S } from "jree";



export  class Emphasis extends Node implements Delimited {

    private  delimiter:  java.lang.String | null;

    public  constructor();

    public  constructor(delimiter: java.lang.String| null);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 0: {

    super();


				break;
			}

			case 1: {
				const [delimiter] = args as [java.lang.String];


        super();
this.delimiter = delimiter;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  setDelimiter(delimiter: java.lang.String| null):  void {
        this.delimiter = delimiter;
    }

    public  getOpeningDelimiter():  java.lang.String | null {
        return this.delimiter;
    }

    public  getClosingDelimiter():  java.lang.String | null {
        return this.delimiter;
    }

    public  accept(visitor: Visitor| null):  void {
        visitor.visit(this);
    }
}
