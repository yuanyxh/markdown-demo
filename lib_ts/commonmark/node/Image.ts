
import { java, S } from "jree";



export  class Image extends Node {

    private  destination:  java.lang.String | null;
    private  title:  java.lang.String | null;

    public  constructor();

    public  constructor(destination: java.lang.String| null, title: java.lang.String| null);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 0: {

    super();


				break;
			}

			case 2: {
				const [destination, title] = args as [java.lang.String, java.lang.String];


        super();
this.destination = destination;
        this.title = title;
    

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

    public  getDestination():  java.lang.String | null {
        return this.destination;
    }

    public  setDestination(destination: java.lang.String| null):  void {
        this.destination = destination;
    }

    public  getTitle():  java.lang.String | null {
        return this.title;
    }

    public  setTitle(title: java.lang.String| null):  void {
        this.title = title;
    }

    protected  toStringAttributes():  java.lang.String | null {
        return "destination=" + this.destination + ", title=" + this.title;
    }
}
