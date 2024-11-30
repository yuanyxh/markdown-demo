import type {
  InlineContentParserFactory,
  InlineParserState,
  InlineContentParser,
} from "../../parser";

import ParsedInline from "../../parser/abstracts/ParsedInline";
import Escaping from "../internal_util/Escaping";
import { HardLineBreak, Text } from "../../node";

class Factory implements InlineContentParserFactory {
  public getTriggerCharacters(): Set<string> {
    return new Set("\\");
  }

  public create(): InlineContentParser {
    return new BackslashInlineParser();
  }
}

/**
 * Parse a backslash-escaped special character, adding either the escaped  character, a hard line break
 * (if the backslash is followed by a newline), or a literal backslash to the block's children.
 */
class BackslashInlineParser implements InlineContentParser {
  private static readonly ESCAPABLE = new RegExp("^" + Escaping.ESCAPABLE);

  public tryParse(inlineParserState: InlineParserState): ParsedInline {
    const scanner = inlineParserState.getScanner();
    // Backslash
    scanner.next();

    let next = scanner.peek();
    if (next === "\n") {
      scanner.next();

      return ParsedInline.of(new HardLineBreak(), scanner.position());
    } else if (BackslashInlineParser.ESCAPABLE.exec(next)) {
      scanner.next();

      return ParsedInline.of(new Text(next), scanner.position());
    } else {
      return ParsedInline.of(new Text("\\"), scanner.position());
    }
  }

  public static Factory = Factory;
}

export default BackslashInlineParser;
