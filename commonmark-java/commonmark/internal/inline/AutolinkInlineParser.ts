import type {
  InlineContentParserFactory,
  InlineParserState,
  InlineContentParser,
} from "@/parser";

import { ParsedInline } from "@/parser";
import { Link, Text } from "@/node";

class Factory implements InlineContentParserFactory {
  public getTriggerCharacters(): Set<string> {
    return new Set("<");
  }

  public create(): InlineContentParser {
    return new AutolinkInlineParser();
  }
}

/**
 * Attempt to parse an autolink (URL or email in pointy brackets).
 */
class AutolinkInlineParser implements InlineContentParser {
  private static readonly URI =
    /^[a-zA-Z][a-zA-Z0-9.+-]{1,31}:[^<>\u0000-\u0020]*$/;

  private static readonly EMAIL =
    /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/;

  public tryParse(inlineParserState: InlineParserState): ParsedInline | null {
    const scanner = inlineParserState.getScanner();
    scanner.next();

    let textStart = scanner.position();
    if (scanner.find(">") > 0) {
      const textSource = scanner.getSource(textStart, scanner.position());
      const content: string = textSource.getContent();

      scanner.next();

      let destination: string = "";
      if (AutolinkInlineParser.URI.exec(content)) {
        destination = content;
      } else if (AutolinkInlineParser.EMAIL.exec(content)) {
        destination = "mailto:" + content;
      }

      if (destination !== "") {
        const link = new Link(destination);
        const text = new Text(content);
        text.setSourceSpans(textSource.getSourceSpans());
        link.appendChild(text);

        return ParsedInline.of(link, scanner.position());
      }
    }

    return ParsedInline.none();
  }

  public static Factory = Factory;
}

export default AutolinkInlineParser;
