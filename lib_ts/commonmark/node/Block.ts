
import { java } from "jree";



/**
 * Block nodes such as paragraphs, list blocks, code blocks etc.
 */
export abstract  class Block extends Node {

    public  getParent():  Block | null {
        return  super.getParent() as Block;
    }

    protected  setParent(parent: Node| null):  void {
        if (!(parent instanceof Block)) {
            throw new  java.lang.IllegalArgumentException("Parent of block must also be block (can not be inline)");
        }
        super.setParent(parent);
    }
}
