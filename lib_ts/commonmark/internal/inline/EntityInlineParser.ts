import { Text } from "../../node";
import { InlineContentParser } from "../../parser/beta/InlineContentParser";
import { InlineContentParserFactory } from "../../parser/beta/InlineContentParserFactory";
import { InlineParserState } from "../../parser/beta/InlineParserState";
import ParsedInline from "../../parser/beta/ParsedInline";
import Position from "../../parser/beta/Position";
import Scanner from "../../parser/beta/Scanner";
import { AsciiMatcher } from "../../text";
import Html5Entities from "../util/Html5Entities";

class Factory implements InlineContentParserFactory {
  public getTriggerCharacters(): Set<string> {
    return new Set("&");
  }

  public create(): InlineContentParser {
    return new EntityInlineParser();
  }
}

/**
 * Attempts to parse an HTML entity or numeric character reference.
 */
class EntityInlineParser implements InlineContentParser {
  private static readonly hex = AsciiMatcher.builder()
    .range("0", "9")
    .range("A", "F")
    .range("a", "f")
    .build();
  private static readonly dec = AsciiMatcher.builder().range("0", "9").build();
  private static readonly entityStart = AsciiMatcher.builder()
    .range("A", "Z")
    .range("a", "z")
    .build();
  private static readonly entityContinue = EntityInlineParser.entityStart
    .newBuilder()
    .range("0", "9")
    .build();

  public tryParse(inlineParserState: InlineParserState): ParsedInline {
    const scanner = inlineParserState.scanner();
    const start = scanner.position();
    // Skip `&`
    scanner.next();

    const c = scanner.peek();
    if (c === "#") {
      // Numeric
      scanner.next();
      if (scanner.next("x") || scanner.next("X")) {
        const digits = scanner.match(EntityInlineParser.hex);
        if (1 <= digits && digits <= 6 && scanner.next(";")) {
          return this.entity(scanner, start);
        }
      } else {
        const digits = scanner.match(EntityInlineParser.dec);
        if (1 <= digits && digits <= 7 && scanner.next(";")) {
          return this.entity(scanner, start);
        }
      }
    } else if (EntityInlineParser.entityStart.matches(c)) {
      scanner.match(EntityInlineParser.entityContinue);

      if (scanner.next(";")) {
        return this.entity(scanner, start);
      }
    }

    return ParsedInline.none();
  }

  private entity(scanner: Scanner, start: Position): ParsedInline {
    const text = scanner.getSource(start, scanner.position()).getContent();

    return ParsedInline.of(
      new Text(Html5Entities.entityToString(text)),
      scanner.position()
    );
  }

  public static Factory = Factory;
}

export default EntityInlineParser;
