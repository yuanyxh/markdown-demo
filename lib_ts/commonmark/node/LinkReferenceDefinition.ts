
import { java, S } from "jree";



/**
 * A link reference definition, e.g.:
 * <pre><code>
 * [foo]: /url "title"
 * </code></pre>
 * <p>
 * They can be referenced anywhere else in the document to produce a link using <code>[foo]</code>. The definitions
 * themselves are usually not rendered in the final output.
 *
 * @see <a href="https://spec.commonmark.org/0.31.2/#link-reference-definition">Link reference definitions</a>
 */
export  class LinkReferenceDefinition extends Block {

    private  label:  java.lang.String | null;
    private  destination:  java.lang.String | null;
    private  title:  java.lang.String | null;

    public  constructor();

    public  constructor(label: java.lang.String| null, destination: java.lang.String| null, title: java.lang.String| null);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 0: {

    super();


				break;
			}

			case 3: {
				const [label, destination, title] = args as [java.lang.String, java.lang.String, java.lang.String];


        super();
this.label = label;
        this.destination = destination;
        this.title = title;
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  getLabel():  java.lang.String | null {
        return this.label;
    }

    public  setLabel(label: java.lang.String| null):  void {
        this.label = label;
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

    public  accept(visitor: Visitor| null):  void {
        visitor.visit(this);
    }
}
