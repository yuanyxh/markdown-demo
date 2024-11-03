


import { java, JavaObject, type char, type int } from "jree";



export abstract  class EmphasisDelimiterProcessor extends JavaObject implements DelimiterProcessor {

    private readonly  delimiterChar:  char;

    protected  constructor(delimiterChar: char) {
        super();
this.delimiterChar = delimiterChar;
    }

    public  getOpeningCharacter():  char {
        return this.delimiterChar;
    }

    public  getClosingCharacter():  char {
        return this.delimiterChar;
    }

    public  getMinLength():  int {
        return 1;
    }

    public  process(openingRun: DelimiterRun| null, closingRun: DelimiterRun| null):  int {
        // "multiple of 3" rule for internal delimiter runs
        if ((openingRun.canClose() || closingRun.canOpen()) &&
                closingRun.originalLength() % 3 !== 0 &&
                (openingRun.originalLength() + closingRun.originalLength()) % 3 === 0) {
            return 0;
        }

        let  usedDelimiters: int;
        let  emphasis: Node;
        // calculate actual number of delimiters used from this closer
        if (openingRun.length() >= 2 && closingRun.length() >= 2) {
            usedDelimiters = 2;
            emphasis = new  StrongEmphasis(java.lang.String.valueOf(this.delimiterChar) + this.delimiterChar);
        } else {
            usedDelimiters = 1;
            emphasis = new  Emphasis(java.lang.String.valueOf(this.delimiterChar));
        }

        let  sourceSpans: SourceSpans = SourceSpans.empty();
        sourceSpans.addAllFrom(openingRun.getOpeners(usedDelimiters));

        let  opener: Text = openingRun.getOpener();
        for (let node of Nodes.between(opener, closingRun.getCloser())) {
            emphasis.appendChild(node);
            sourceSpans.addAll(node.getSourceSpans());
        }

        sourceSpans.addAllFrom(closingRun.getClosers(usedDelimiters));

        emphasis.setSourceSpans(sourceSpans.getSourceSpans());
        opener.insertAfter(emphasis);

        return usedDelimiters;
    }
}
