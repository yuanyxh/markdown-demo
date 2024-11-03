
import { java, type int, type char } from "jree";



export  class FencedCodeBlock extends Block {

    private  fenceCharacter:  java.lang.String | null;
    private  openingFenceLength:  java.lang.Integer | null;
    private  closingFenceLength:  java.lang.Integer | null;
    private  fenceIndent:  int;

    private  info:  java.lang.String | null;
    private  literal:  java.lang.String | null;

    public  accept(visitor: Visitor| null):  void {
        visitor.visit(this);
    }

    /**
     * @return the fence character that was used, e.g. {@code `} or {@code ~}, if available, or null otherwise
     */
    public  getFenceCharacter():  java.lang.String | null {
        return this.fenceCharacter;
    }

    public  setFenceCharacter(fenceCharacter: java.lang.String| null):  void {
        this.fenceCharacter = fenceCharacter;
    }

    /**
     * @return the length of the opening fence (how many of {{@link #getFenceCharacter()}} were used to start the code
     * block) if available, or null otherwise
     */
    public  getOpeningFenceLength():  java.lang.Integer | null {
        return this.openingFenceLength;
    }

    public  setOpeningFenceLength(openingFenceLength: java.lang.Integer| null):  void {
        if (openingFenceLength !== null && openingFenceLength < 3) {
            throw new  java.lang.IllegalArgumentException("openingFenceLength needs to be >= 3");
        }
        FencedCodeBlock.checkFenceLengths(openingFenceLength, this.closingFenceLength);
        this.openingFenceLength = openingFenceLength;
    }

    /**
     * @return the length of the closing fence (how many of {@link #getFenceCharacter()} were used to end the code
     * block) if available, or null otherwise
     */
    public  getClosingFenceLength():  java.lang.Integer | null {
        return this.closingFenceLength;
    }

    public  setClosingFenceLength(closingFenceLength: java.lang.Integer| null):  void {
        if (closingFenceLength !== null && closingFenceLength < 3) {
            throw new  java.lang.IllegalArgumentException("closingFenceLength needs to be >= 3");
        }
        FencedCodeBlock.checkFenceLengths(this.openingFenceLength, closingFenceLength);
        this.closingFenceLength = closingFenceLength;
    }

    public  getFenceIndent():  int {
        return this.fenceIndent;
    }

    public  setFenceIndent(fenceIndent: int):  void {
        this.fenceIndent = fenceIndent;
    }

    /**
     * @see <a href="http://spec.commonmark.org/0.31.2/#info-string">CommonMark spec</a>
     */
    public  getInfo():  java.lang.String | null {
        return this.info;
    }

    public  setInfo(info: java.lang.String| null):  void {
        this.info = info;
    }

    public  getLiteral():  java.lang.String | null {
        return this.literal;
    }

    public  setLiteral(literal: java.lang.String| null):  void {
        this.literal = literal;
    }

    /**
     * @deprecated use {@link #getFenceCharacter()} instead
     */
    public  getFenceChar():  char {
        return this.fenceCharacter !== null && !this.fenceCharacter.isEmpty() ? this.fenceCharacter.charAt(0) : '\0';
    }

    /**
     * @deprecated use {@link #setFenceCharacter} instead
     */
    public  setFenceChar(fenceChar: char):  void {
        this.fenceCharacter = fenceChar !== '\0' ? java.lang.String.valueOf(fenceChar) : null;
    }

    /**
     * @deprecated use {@link #getOpeningFenceLength} instead
     */
    public  getFenceLength():  int {
        return this.openingFenceLength !== null ? this.openingFenceLength : 0;
    }

    /**
     * @deprecated use {@link #setOpeningFenceLength} instead
     */
    public  setFenceLength(fenceLength: int):  void {
        this.openingFenceLength = fenceLength !== 0 ? fenceLength : null;
    }

    private static  checkFenceLengths(openingFenceLength: java.lang.Integer| null, closingFenceLength: java.lang.Integer| null):  void {
        if (openingFenceLength !== null && closingFenceLength !== null) {
            if (closingFenceLength < openingFenceLength) {
                throw new  java.lang.IllegalArgumentException("fence lengths required to be: closingFenceLength >= openingFenceLength");
            }
        }
    }
}
