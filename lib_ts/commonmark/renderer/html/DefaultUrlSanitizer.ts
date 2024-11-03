


import { java, JavaObject, type int, S } from "jree";



/**
 *
 * Allows http, https, mailto, and data protocols for url.
 * Also allows protocol relative urls, and relative urls.
 * Implementation based on https://github.com/OWASP/java-html-sanitizer/blob/f07e44b034a45d94d6fd010279073c38b6933072/src/main/java/org/owasp/html/FilterUrlByProtocolAttributePolicy.java
 */
export  class DefaultUrlSanitizer extends JavaObject implements UrlSanitizer {
    private  protocols:  java.util.Set<java.lang.String> | null;

    public  constructor();

    public  constructor(protocols: java.util.Collection<java.lang.String>| null);
    public constructor(...args: unknown[]) {
		switch (args.length) {
			case 0: {

        this(java.util.List.of("http", "https", "mailto", "data"));
    

				break;
			}

			case 1: {
				const [protocols] = args as [java.util.Collection<java.lang.String>];


        super();
this.protocols = new  java.util.HashSet(protocols);
    

				break;
			}

			default: {
				throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
			}
		}
	}


    public  sanitizeLinkUrl(url: java.lang.String| null):  java.lang.String | null {
        url = this.stripHtmlSpaces(url);
        protocol_loop:
        for (let  i: int = 0;
let  n: int = url.length(); i < n; ++i) {
            switch (url.charAt(i)) {
                case '/':
                case '#':
                case '?':  // No protocol.
                    break protocol_loop;
                case ':':
                    let  protocol: java.lang.String = url.substring(0, i).toLowerCase();
                    if (!this.protocols.contains(protocol)) {
                        return "";
                    }
                    break protocol_loop;

default:

            }
        }
        return url;
    }


    public  sanitizeImageUrl(url: java.lang.String| null):  java.lang.String | null {
        return this.sanitizeLinkUrl(url);
    }

    private  stripHtmlSpaces(s: java.lang.String| null):  java.lang.String | null {
        let  i: int = 0;
let  n: int = s.length();
        for (; n > i; --n) {
            if (!this.isHtmlSpace(s.charAt(n - 1))) {
                break;
            }
        }
        for (; i < n; ++i) {
            if (!this.isHtmlSpace(s.charAt(i))) {
                break;
            }
        }
        if (i === 0 && n === s.length()) {
            return s;
        }
        return s.substring(i, n);
    }

    private  isHtmlSpace(ch: int):  boolean {
        switch (ch) {
            case ' ':
            case '\t':
            case '\n':
            case '\u000c':
            case '\r':
                return true;
            default:
                return false;

        }
    }
}
