/**
 * Attempt to parse backticks, returning either a backtick code span or a literal sequence of backticks.
 */
export class BackticksInlineParser
  extends JavaObject
  implements InlineContentParser
{
  public tryParse(
    inlineParserState: InlineParserState | null
  ): ParsedInline | null {
    let scanner: java.util.Scanner = inlineParserState.scanner();
    let start: Position = scanner.position();
    let openingTicks: int = scanner.matchMultiple("`");
    let afterOpening: Position = scanner.position();

    while (scanner.find("`") > 0) {
      let beforeClosing: Position = scanner.position();
      let count: int = scanner.matchMultiple("`");
      if (count === openingTicks) {
        let node: Code = new Code();

        let content: string = scanner
          .getSource(afterOpening, beforeClosing)
          .getContent();
        content = content.replace("\n", " ");

        // spec: If the resulting string both begins and ends with a space character, but does not consist
        // entirely of space characters, a single space character is removed from the front and back.
        if (
          content.length() >= 3 &&
          content.charAt(0) === " " &&
          content.charAt(content.length() - 1) === " " &&
          Characters.hasNonSpace(content)
        ) {
          content = content.substring(1, content.length() - 1);
        }

        node.setLiteral(content);
        return ParsedInline.of(node, scanner.position());
      }
    }

    // If we got here, we didn't find a matching closing backtick sequence.
    let source: SourceLines = scanner.getSource(start, afterOpening);
    let text: Text = new Text(source.getContent());
    return ParsedInline.of(text, afterOpening);
  }

  public static Factory = class Factory
    extends JavaObject
    implements InlineContentParserFactory
  {
    public getTriggerCharacters(): java.util.Set<java.lang.Character> | null {
      return java.util.Set.of("`");
    }

    public create(): InlineContentParser | null {
      return new BackticksInlineParser();
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace BackticksInlineParser {
  export type Factory = InstanceType<typeof BackticksInlineParser.Factory>;
}
