/**
 * Attempt to parse an autolink (URL or email in pointy brackets).
 */
export class AutolinkInlineParser
  extends JavaObject
  implements InlineContentParser
{
  private static readonly URI: java.util.regex.Pattern | null =
    java.util.regex.Pattern.compile(
      "^[a-zA-Z][a-zA-Z0-9.+-]{1,31}:[^<>\u0000-\u0020]*$"
    );

  private static readonly EMAIL: java.util.regex.Pattern | null =
    java.util.regex.Pattern.compile(
      "^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$"
    );

  public tryParse(
    inlineParserState: InlineParserState | null
  ): ParsedInline | null {
    let scanner: java.util.Scanner = inlineParserState.scanner();
    scanner.next();
    let textStart: Position = scanner.position();
    if (scanner.find(">") > 0) {
      let textSource: SourceLines = scanner.getSource(
        textStart,
        scanner.position()
      );
      let content: string = textSource.getContent();
      scanner.next();

      let destination: string = null;
      if (AutolinkInlineParser.URI.matcher(content).matches()) {
        destination = content;
      } else if (AutolinkInlineParser.EMAIL.matcher(content).matches()) {
        destination = "mailto:" + content;
      }

      if (destination !== null) {
        let link: Link = new Link(destination, null);
        let text: Text = new Text(content);
        text.setSourceSpans(textSource.getSourceSpans());
        link.appendChild(text);
        return ParsedInline.of(link, scanner.position());
      }
    }
    return ParsedInline.none();
  }

  public static Factory = class Factory
    extends JavaObject
    implements InlineContentParserFactory
  {
    public getTriggerCharacters(): java.util.Set<java.lang.Character> | null {
      return java.util.Set.of("<");
    }

    public create(): InlineContentParser | null {
      return new AutolinkInlineParser();
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace AutolinkInlineParser {
  export type Factory = InstanceType<typeof AutolinkInlineParser.Factory>;
}
