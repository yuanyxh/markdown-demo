


import { java, JavaObject, type int } from "jree";



/**
 * Result object for continuing parsing of a block, see static methods for constructors.
 */
export  class BlockContinue extends JavaObject {

    protected  constructor() {
    super();
}

    public static  none():  BlockContinue | null {
        return null;
    }

    public static  atIndex(newIndex: int):  BlockContinue | null {
        return new  BlockContinueImpl(newIndex, -1, false);
    }

    public static  atColumn(newColumn: int):  BlockContinue | null {
        return new  BlockContinueImpl(-1, newColumn, false);
    }

    public static  finished():  BlockContinue | null {
        return new  BlockContinueImpl(-1, -1, true);
    }

}
