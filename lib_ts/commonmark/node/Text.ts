
import { java, S } from "jree";



export  class Text extends Node {

    private  literal:  java.lang.String | null;

    public  constructor();

    public  constructor(literal: java.lang.String| null);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 0: {

    super();


				break;
			}

			case 1: {
				const [literal] = args as [java.lang.String];


        super();
this.literal = literal;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  accept(visitor: Visitor| null):  void {
        visitor.visit(this);
    }

    public  getLiteral():  java.lang.String | null {
        return this.literal;
    }

    public  setLiteral(literal: java.lang.String| null):  void {
        this.literal = literal;
    }

    protected  toStringAttributes():  java.lang.String | null {
        return "literal=" + this.literal;
    }
}
