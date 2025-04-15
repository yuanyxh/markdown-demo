import type { Node } from '@/node';

import type Position from '../parser_utils/Position';

import { ParsedInlineImpl } from '@/internal';

/**
 * The result of a single inline parser. Use the static methods to create instances.
 * <p>
 * <em>This interface is not intended to be implemented by clients.</em>
 */
abstract class ParsedInline {
  static none(): ParsedInline | null {
    return null;
  }

  static of(node: Node, position: Position): ParsedInline {
    return new ParsedInlineImpl(node, position);
  }
}

export default ParsedInline;
