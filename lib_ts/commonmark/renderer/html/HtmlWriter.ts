


import { java, JavaObject, type char, type int, S } from "jree";



export  class HtmlWriter extends JavaObject {

    private static readonly  NO_ATTRIBUTES:  java.util.Map<java.lang.String, java.lang.String> | null = java.util.Map.of();

    private readonly  buffer:  java.lang.Appendable | null;
    private  lastChar:  char = 0;

    public  constructor(out: java.lang.Appendable| null) {
        super();
java.util.Objects.requireNonNull(out, "out must not be null");
        this.buffer = out;
    }

    public  raw(s: java.lang.String| null):  void {
        this.append(s);
    }

    public  text(text: java.lang.String| null):  void {
        this.append(Escaping.escapeHtml(text));
    }

    public  tag(name: java.lang.String| null):  void;

    public  tag(name: java.lang.String| null, attrs: java.util.Map<java.lang.String, java.lang.String>| null):  void;

    public  tag(name: java.lang.String| null, attrs: java.util.Map<java.lang.String, java.lang.String>| null, voidElement: boolean):  void;
public tag(...args: unknown[]):  void {
		switch (args.length) {
			case 1: {
				const [name] = args as [java.lang.String];


        this.tag(name, HtmlWriter.NO_ATTRIBUTES);
    

				break;
			}

			case 2: {
				const [name, attrs] = args as [java.lang.String, java.util.Map<java.lang.String, java.lang.String>];


        this.tag(name, attrs, false);
    

				break;
			}

			case 3: {
				const [name, attrs, voidElement] = args as [java.lang.String, java.util.Map<java.lang.String, java.lang.String>, boolean];


        this.append("<");
        this.append(name);
        if (attrs !== null && !attrs.isEmpty()) {
            for (let attr of attrs.entrySet()) {
                this.append(" ");
                this.append(Escaping.escapeHtml(attr.getKey()));
                if (attr.getValue() !== null) {
                    this.append("=\"");
                    this.append(Escaping.escapeHtml(attr.getValue()));
                    this.append("\"");
                }
            }
        }
        if (voidElement) {
            this.append(" /");
        }

        this.append(">");
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  line():  void {
        if (this.lastChar !== 0 && this.lastChar !== '\n') {
            this.append("\n");
        }
    }

    protected  append(s: java.lang.String| null):  void {
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
    }
}
