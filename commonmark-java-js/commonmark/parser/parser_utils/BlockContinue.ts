import { BlockContinueImpl } from '@/internal';

/**
 * Result object for continuing parsing of a block, see static methods for constructors.
 */
class BlockContinue {
  static none(): BlockContinue | null {
    return null;
  }

  static atIndex(newIndex: number): BlockContinue {
    return new BlockContinueImpl(newIndex, -1, false);
  }

  static atColumn(newColumn: number): BlockContinue {
    return new BlockContinueImpl(-1, newColumn, false);
  }

  static finished(): BlockContinue {
    return new BlockContinueImpl(-1, -1, true);
  }
}

export default BlockContinue;
