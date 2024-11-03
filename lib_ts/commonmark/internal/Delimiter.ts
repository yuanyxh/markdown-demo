


import { java, JavaObject, type char, type int } from "jree";



/**
 * Delimiter (emphasis, strong emphasis or custom emphasis).
 */
export  class Delimiter extends JavaObject implements DelimiterRun {

    public readonly  characters:  java.util.List<Text> | null;
    public readonly  delimiterChar:  char;
    private readonly  originalLength:  int;

    // Can open emphasis, see spec.
    private readonly  canOpen:  boolean;

    // Can close emphasis, see spec.
    private readonly  canClose:  boolean;

    public  previous:  Delimiter | null;
    public  next:  Delimiter | null;

    public  constructor(characters: java.util.List<Text>| null, delimiterChar: char, canOpen: boolean, canClose: boolean, previous: Delimiter| null) {
        super();
this.characters = characters;
        this.delimiterChar = delimiterChar;
        this.canOpen = canOpen;
        this.canClose = canClose;
        this.previous = previous;
        this.originalLength = characters.size();
    }

    public  canOpen():  boolean {
        return this.canOpen;
    }

    public  canClose():  boolean {
        return this.canClose;
    }

    public  length():  int {
        return this.characters.size();
    }

    public  originalLength():  int {
        return this.originalLength;
    }

    public  getOpener():  Text | null {
        return this.characters.get(this.characters.size() - 1);
    }

    public  getCloser():  Text | null {
        return this.characters.get(0);
    }

    public  getOpeners(length: int):  java.lang.Iterable<Text> | null {
        if (!(length >= 1 && length <= length())) {
            throw new  java.lang.IllegalArgumentException("length must be between 1 and " + length() + ", was " + length);
        }

        return this.characters.subList(this.characters.size() - length, this.characters.size());
    }

    public  getClosers(length: int):  java.lang.Iterable<Text> | null {
        if (!(length >= 1 && length <= length())) {
            throw new  java.lang.IllegalArgumentException("length must be between 1 and " + length() + ", was " + length);
        }

        return this.characters.subList(0, length);
    }
}
