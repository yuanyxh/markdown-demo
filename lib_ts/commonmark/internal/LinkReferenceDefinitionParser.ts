import Appendable from "../../common/Appendable";
import { LinkReferenceDefinition, SourceSpan } from "../node";
import { Scanner, SourceLine, SourceLines } from "../parser";
import Escaping from "./util/Escaping";
import LinkScanner from "./util/LinkScanner";

enum State {
  // Looking for the start of a definition, i.e. `[`
  START_DEFINITION = "START_DEFINITION",
  // Parsing the label, i.e. `foo` within `[foo]`
  LABEL = "LABEL",
  // Parsing the destination, i.e. `/url` in `[foo]: /url`
  DESTINATION = "DESTINATION",
  // Looking for the start of a title, i.e. the first `"` in `[foo]: /url "title"`
  START_TITLE = "START_TITLE",
  // Parsing the content of the title, i.e. `title` in `[foo]: /url "title"`
  TITLE = "TITLE",

  // End state, no matter what kind of lines we add, they won't be references
  PARAGRAPH = "PARAGRAPH",
}

/**
 * Parser for link reference definitions at the beginning of a paragraph.
 *
 * @see <a href="https://spec.commonmark.org/0.31.2/#link-reference-definitions">Link reference definitions</a>
 */
class LinkReferenceDefinitionParser {
  private state = State.START_DEFINITION;

  private readonly paragraphLines: SourceLine[] = [];
  private readonly definitions: LinkReferenceDefinition[] = [];
  private readonly sourceSpans: SourceSpan[] = [];

  private label: Appendable | null = null;
  private destination: string | null = null;
  private titleDelimiter: string | null = null;
  private title: Appendable | null = null;
  private referenceValid = false;

  public parse(line: SourceLine) {
    this.paragraphLines.push(line);
    if (this.state === State.PARAGRAPH) {
      // We're in a paragraph now. Link reference definitions can only appear at the beginning, so once
      // we're in a paragraph, there's no going back.
      return;
    }

    let scanner = Scanner.of(SourceLines.of([line]));

    while (scanner.hasNext()) {
      let success: boolean;

      switch (this.state) {
        case State.START_DEFINITION: {
          success = this.startDefinition(scanner);
          break;
        }
        case State.LABEL: {
          success = this.setLabel(scanner);
          break;
        }
        case State.DESTINATION: {
          success = this.setDestination(scanner);
          break;
        }
        case State.START_TITLE: {
          success = this.startTitle(scanner);
          break;
        }
        case State.TITLE: {
          success = this.setTitle(scanner);
          break;
        }
        default: {
          throw Error("Unknown parsing state: " + this.state);
        }
      }

      // Parsing failed, which means we fall back to treating text as a paragraph.
      if (!success) {
        this.state = State.PARAGRAPH;
        // If parsing of the title part failed, we still have a valid reference that we can add, and we need to
        // do it before the source span for this line is added.
        this.finishReference();
        return;
      }
    }
  }

  public addSourceSpan(sourceSpan: SourceSpan) {
    this.sourceSpans.push(sourceSpan);
  }

  /**
   * @return the lines that are normal paragraph content, without newlines
   */
  public getParagraphLines(): SourceLines {
    return SourceLines.of(this.paragraphLines);
  }

  public getParagraphSourceSpans(): SourceSpan[] {
    return this.sourceSpans;
  }

  public getDefinitions(): LinkReferenceDefinition[] {
    this.finishReference();
    return this.definitions;
  }

  protected getState(): State {
    return this.state;
  }

  private startDefinition(scanner: Scanner): boolean {
    // Finish any outstanding references now. We don't do this earlier because we need addSourceSpan to have been
    // called before we do it.
    this.finishReference();

    scanner.whitespace();
    if (!scanner.next("[")) {
      return false;
    }

    this.state = State.LABEL;
    this.label = new Appendable();

    if (!scanner.hasNext()) {
      this.label.append("\n");
    }

    return true;
  }

  private setLabel(scanner: Scanner): boolean {
    const start = scanner.position();

    if (!LinkScanner.scanLinkLabelContent(scanner)) {
      return false;
    }

    this.label!.append(
      scanner.getSource(start, scanner.position()).getContent()
    );

    if (!scanner.hasNext()) {
      // label might continue on next line
      this.label!.append("\n");

      return true;
    } else if (scanner.next("]")) {
      // end of label
      if (!scanner.next(":")) {
        return false;
      }

      // spec: A link label can have at most 999 characters inside the square brackets.
      if (this.label!.length() > 999) {
        return false;
      }

      const normalizedLabel = Escaping.normalizeLabelContent(
        this.label!.toString()
      );

      if (normalizedLabel === "") {
        return false;
      }

      this.state = State.DESTINATION;

      scanner.whitespace();
      return true;
    } else {
      return false;
    }
  }

  private setDestination(scanner: Scanner): boolean {
    scanner.whitespace();
    const start = scanner.position();
    if (!LinkScanner.scanLinkDestination(scanner)) {
      return false;
    }

    const rawDestination = scanner
      .getSource(start, scanner.position())
      .getContent();
    this.destination = rawDestination.startsWith("<")
      ? rawDestination.substring(1, rawDestination.length - 1)
      : rawDestination;

    const whitespace = scanner.whitespace();
    if (!scanner.hasNext()) {
      // Destination was at end of line, so this is a valid reference for sure (and maybe a title).
      // If not at end of line, wait for title to be valid first.
      this.referenceValid = true;
      this.paragraphLines.length = 0;
    } else if (whitespace === 0) {
      // spec: The title must be separated from the link destination by whitespace
      return false;
    }

    this.state = State.START_TITLE;
    return true;
  }

  private startTitle(scanner: Scanner): boolean {
    scanner.whitespace();
    if (!scanner.hasNext()) {
      this.state = State.START_DEFINITION;
      return true;
    }

    this.titleDelimiter = "\0";
    let c = scanner.peek();
    switch (c) {
      case '"':
      case "'":
        this.titleDelimiter = c;
        break;
      case "(":
        this.titleDelimiter = ")";
        break;

      default:
    }

    if (this.titleDelimiter !== "\0") {
      this.state = State.TITLE;
      this.title = new Appendable();
      scanner.next();

      if (!scanner.hasNext()) {
        this.title.append("\n");
      }
    } else {
      // There might be another reference instead, try that for the same character.
      this.state = State.START_DEFINITION;
    }

    return true;
  }

  private setTitle(scanner: Scanner): boolean {
    const start = scanner.position();
    if (!LinkScanner.scanLinkTitleContent(scanner, this.titleDelimiter!)) {
      // Invalid title, stop. Title collected so far must not be used.
      this.title = null;

      return false;
    }

    this.title!.append(
      scanner.getSource(start, scanner.position()).getContent()
    );

    if (!scanner.hasNext()) {
      // Title ran until the end of line, so continue on next line (until we find the delimiter)
      this.title!.append("\n");
      return true;
    }

    // Skip delimiter character
    scanner.next();
    scanner.whitespace();
    if (scanner.hasNext()) {
      // spec: No further non-whitespace characters may occur on the line.
      // Title collected so far must not be used.
      this.title = null;
      return false;
    }
    this.referenceValid = true;
    this.paragraphLines.length = 0;

    // See if there's another definition.
    this.state = State.START_DEFINITION;
    return true;
  }

  private finishReference() {
    if (!this.referenceValid) {
      return;
    }

    const d = Escaping.unescapeString(this.destination!);
    const t =
      this.title !== null ? Escaping.unescapeString(this.title.toString()) : "";

    const definition: LinkReferenceDefinition = new LinkReferenceDefinition(
      this.label!.toString(),
      d,
      t
    );
    definition.setSourceSpans(this.sourceSpans);
    this.sourceSpans.length = 0;
    this.definitions.push(definition);

    this.label = null;
    this.referenceValid = false;
    this.destination = null;
    this.title = null;
  }

  protected static State = State;
}

export default LinkReferenceDefinitionParser;
