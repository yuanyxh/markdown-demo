import { Text } from "../../node";

/**
 * A delimiter run is one or more of the same delimiter character, e.g. {@code ***}.
 */
export interface DelimiterRun {
  /**
   * @return whether this can open a delimiter
   */
  getCanOpen(): boolean;

  /**
   * @return whether this can close a delimiter
   */
  getCanClose(): boolean;

  /**
   * @return the number of characters in this delimiter run (that are left for processing)
   */
  length(): number;

  /**
   * @return the number of characters originally in this delimiter run; at the start of processing, this is the same
   * as {{@link #length()}}
   */
  getOriginalLength(): number;

  /**
   * @return the innermost opening delimiter, e.g. for {@code ***} this is the last {@code *}
   */
  getOpener(): Text;

  /**
   * @return the innermost closing delimiter, e.g. for {@code ***} this is the first {@code *}
   */
  getCloser(): Text;

  /**
   * Get the opening delimiter nodes for the specified length of delimiters. Length must be between 1 and
   * {@link #length()}.
   * <p>
   * For example, for a delimiter run {@code ***}, calling this with 1 would return the last {@code *}.
   * Calling it with 2 would return the second last {@code *} and the last {@code *}.
   */
  getOpeners(length: number): Text[];

  /**
   * Get the closing delimiter nodes for the specified length of delimiters. Length must be between 1 and
   * {@link #length()}.
   * <p>
   * For example, for a delimiter run {@code ***}, calling this with 1 would return the first {@code *}.
   * Calling it with 2 would return the first {@code *} and the second {@code *}.
   */
  getClosers(length: number): Text[];
}
