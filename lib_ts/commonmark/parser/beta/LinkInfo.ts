import Position from "./Position";

/**
 * A parsed link/image. There are different types of links.
 * <p>
 * Inline links:
 * <pre>
 * [text](destination)
 * [text](destination "title")
 * </pre>
 * <p>
 * Reference links, which have different subtypes. Full::
 * <pre>
 * [text][label]
 * </pre>
 * Collapsed (label is ""):
 * <pre>
 * [text][]
 * </pre>
 * Shortcut (label is null):
 * <pre>
 * [text]
 * </pre>
 * Images use the same syntax as links but with a {@code !} {@link #marker()} front, e.g. {@code ![text](destination)}.
 */
export interface LinkInfo {
  /**
   * The marker if present, or null. A marker is e.g. {@code !} for an image, or a custom marker as specified in
   * {@link org.commonmark.parser.Parser.Builder#linkMarker}.
   */
  marker(): Text;

  /**
   * The text node of the opening bracket {@code [}.
   */
  openingBracket(): Text;

  /**
   * The text between the first brackets, e.g. `foo` in `[foo][bar]`.
   */
  text(): string;

  /**
   * The label, or null for inline links or for shortcut links (in which case {@link #text()} should be used as the label).
   */
  label(): string;

  /**
   * The destination if available, e.g. in `[foo](destination)`, or null
   */
  destination(): string;

  /**
   * The title if available, e.g. in `[foo](destination "title")`, or null
   */
  title(): string;

  /**
   * The position after the closing text bracket, e.g.:
   * <pre>
   * [foo][bar]
   *      ^
   * </pre>
   */
  afterTextBracket(): Position;
}
