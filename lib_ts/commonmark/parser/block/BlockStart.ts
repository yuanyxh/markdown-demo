


import { java, JavaObject, type int } from "jree";



/**
 * Result object for starting parsing of a block, see static methods for constructors.
 */
export abstract  class BlockStart extends JavaObject {

    protected  constructor() {
    super();
}

    public static  none():  BlockStart | null {
        return null;
    }

    public static  of(...blockParsers: BlockParser| null[]):  BlockStart | null {
        return new  BlockStartImpl(blockParsers);
    }

    public abstract  atIndex(newIndex: int):  BlockStart | null;

    public abstract  atColumn(newColumn: int):  BlockStart | null;

    public abstract  replaceActiveBlockParser():  BlockStart | null;

}
