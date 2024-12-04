import { BlockContinueImpl } from "../../internal";

/**
 * Result object for continuing parsing of a block, see static methods for constructors.
 *
 * 用于继续解析块的结果对象
 */
class BlockContinue {
  public static none(): BlockContinue | null {
    return null;
  }

  public static atIndex(newIndex: number): BlockContinue {
    return new BlockContinueImpl(newIndex, -1, false);
  }

  public static atColumn(newColumn: number): BlockContinue {
    return new BlockContinueImpl(-1, newColumn, false);
  }

  public static finished(): BlockContinue {
    return new BlockContinueImpl(-1, -1, true);
  }
}

export default BlockContinue;
