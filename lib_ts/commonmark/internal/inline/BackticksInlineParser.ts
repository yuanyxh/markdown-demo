import { Code, Text } from "../../node";
import { InlineContentParser } from "../../parser/beta/InlineContentParser";
import { InlineContentParserFactory } from "../../parser/beta/InlineContentParserFactory";
import { InlineParserState } from "../../parser/beta/InlineParserState";
import ParsedInline from "../../parser/beta/ParsedInline";
import { Characters } from "../../text";

class Factory implements InlineContentParserFactory {
  public getTriggerCharacters(): Set<string> {
    return new Set("`");
  }

  public create(): InlineContentParser {
    return new BackticksInlineParser();
  }
}

/**
 * Attempt to parse backticks, returning either a backtick code span or a literal sequence of backticks.
 */
class BackticksInlineParser implements InlineContentParser {
  public tryParse(inlineParserState: InlineParserState): ParsedInline {
    const scanner = inlineParserState.scanner();
    const start = scanner.position();
    const openingTicks = scanner.matchMultiple("`");
    const afterOpening = scanner.position();

    while (scanner.find("`") > 0) {
      const beforeClosing = scanner.position();
      const count = scanner.matchMultiple("`");
      if (count === openingTicks) {
        const node = new Code();

        let content: string = scanner
          .getSource(afterOpening, beforeClosing)
          .getContent();
        content = content.replace("\n", " ");

        // spec: If the resulting string both begins and ends with a space character, but does not consist
        // entirely of space characters, a single space character is removed from the front and back.
        if (
          content.length >= 3 &&
          content.charAt(0) === " " &&
          content.charAt(content.length - 1) === " " &&
          Characters.hasNonSpace(content)
        ) {
          content = content.substring(1, content.length - 1);
        }

        node.setLiteral(content);

        return ParsedInline.of(node, scanner.position());
      }
    }

    // If we got here, we didn't find a matching closing backtick sequence.
    const source = scanner.getSource(start, afterOpening);
    const text = new Text(source.getContent());
    return ParsedInline.of(text, afterOpening);
  }

  public static Factory = Factory;
}

export default BackticksInlineParser;
