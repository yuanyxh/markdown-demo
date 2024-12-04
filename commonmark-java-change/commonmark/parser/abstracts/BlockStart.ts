import { BlockStartImpl } from "../../internal";
import type { BlockParser } from "../interfaces/BlockParser";

/**
 * Result object for starting parsing of a block, see static methods for constructors.
 *
 * 用于开始解析块的结果对象，请参阅构造函数的静态方法
 */
abstract class BlockStart {
  public static none(): BlockStart | null {
    return null;
  }

  public static of(...blockParsers: BlockParser[]): BlockStart {
    return new BlockStartImpl(...blockParsers);
  }

  public abstract atIndex(newIndex: number): BlockStart;

  public abstract atColumn(newColumn: number): BlockStart;

  public abstract setReplaceActiveBlockParser(): BlockStart;
}

export default BlockStart;
