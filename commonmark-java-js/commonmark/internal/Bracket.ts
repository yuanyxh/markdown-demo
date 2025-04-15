import type Delimiter from './Delimiter';
import type { Text } from '@/node';
import type { Position } from '@/parser';

/**
 * Opening bracket for links ({@code [}), images ({@code ![}), or links with other markers.
 */
class Bracket {
  /**
   * The node of a marker such as {@code !} if present, null otherwise.
   */
  readonly markerNode: Text | null;

  /**
   * The position of the marker if present, null otherwise.
   */
  readonly markerPosition: Position | null;

  /**
   * The node of {@code [}.
   */
  readonly bracketNode: Text | null;

  /**
   * The position of {@code [}.
   */
  readonly bracketPosition: Position | null;

  /**
   * The position of the content (after the opening bracket)
   */
  readonly contentPosition: Position | null;

  /**
   * Previous bracket.
   */
  readonly previous: Bracket | null;

  /**
   * Previous delimiter (emphasis, etc) before this bracket.
   */
  readonly previousDelimiter: Delimiter | null;

  /**
   * Whether this bracket is allowed to form a link/image (also known as "active").
   */
  allowed: boolean = true;

  /**
   * Whether there is an unescaped bracket (opening or closing) after this opening bracket in the text parsed so far.
   */
  bracketAfter: boolean = false;

  private constructor(
    markerNode: Text | null,
    markerPosition: Position | null,
    bracketNode: Text | null,
    bracketPosition: Position | null,
    contentPosition: Position | null,
    previous: Bracket | null,
    previousDelimiter: Delimiter | null
  ) {
    this.markerNode = markerNode;
    this.markerPosition = markerPosition;
    this.bracketNode = bracketNode;
    this.bracketPosition = bracketPosition;
    this.contentPosition = contentPosition;
    this.previous = previous;
    this.previousDelimiter = previousDelimiter;
  }

  static link(
    bracketNode: Text,
    bracketPosition: Position,
    contentPosition: Position,
    previous: Bracket,
    previousDelimiter: Delimiter
  ): Bracket {
    return new Bracket(
      null,
      null,
      bracketNode,
      bracketPosition,
      contentPosition,
      previous,
      previousDelimiter
    );
  }

  static withMarker(
    markerNode: Text,
    markerPosition: Position,
    bracketNode: Text,
    bracketPosition: Position,
    contentPosition: Position,
    previous: Bracket,
    previousDelimiter: Delimiter
  ): Bracket {
    return new Bracket(
      markerNode,
      markerPosition,
      bracketNode,
      bracketPosition,
      contentPosition,
      previous,
      previousDelimiter
    );
  }
}

export default Bracket;
