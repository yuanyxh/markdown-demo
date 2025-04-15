import type { BlockParser } from '../interfaces/BlockParser';

import { BlockStartImpl } from '@/internal';

/**
 * Result object for starting parsing of a block, see static methods for constructors.
 */
abstract class BlockStart {
  static none(): BlockStart | null {
    return null;
  }

  static of(...blockParsers: BlockParser[]): BlockStart {
    return new BlockStartImpl(...blockParsers);
  }

  abstract atIndex(newIndex: number): BlockStart;

  abstract atColumn(newColumn: number): BlockStart;

  abstract setReplaceActiveBlockParser(): BlockStart;
}

export default BlockStart;
