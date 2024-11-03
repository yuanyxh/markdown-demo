
import { java, S } from "jree";



/**
 * A link with a destination and an optional title; the link text is in child nodes.
 * <p>
 * Example for an inline link in a CommonMark document:
 * <pre><code>
 * [link](/uri "title")
 * </code></pre>
 * <p>
 * The corresponding Link node would look like this:
 * <ul>
 * <li>{@link #getDestination()} returns {@code "/uri"}
 * <li>{@link #getTitle()} returns {@code "title"}
 * <li>A {@link Text} child node with {@link Text#getLiteral() getLiteral} that returns {@code "link"}</li>
 * </ul>
 * <p>
 * Note that the text in the link can contain inline formatting, so it could also contain an {@link Image} or
 * {@link Emphasis}, etc.
 *
 * @see <a href="http://spec.commonmark.org/0.31.2/#links">CommonMark Spec for links</a>
 */
export  class Link extends Node {

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

    /**
     * @return the title or null
     */
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
