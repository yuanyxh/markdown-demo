class ListBlockParser extends AbstractBlockParser {
  private readonly block: ListBlock | null;

  private hadBlankLine: boolean;
  private linesAfterBlank: int;

  public constructor(block: ListBlock | null) {
    super();
    this.block = block;
  }

  public isContainer(): boolean {
    return true;
  }

  public canContain(childBlock: Block | null): boolean {
    if (childBlock instanceof ListItem) {
      // Another list item is added to this list block. If the previous line was blank, that means this list block
      // is "loose" (not tight).
      //
      // spec: A list is loose if any of its constituent list items are separated by blank lines
      if (this.hadBlankLine && this.linesAfterBlank === 1) {
        this.block.setTight(false);
        this.hadBlankLine = false;
      }
      return true;
    } else {
      return false;
    }
  }

  public getBlock(): Block | null {
    return this.block;
  }

  public tryContinue(state: ParserState | null): BlockContinue | null {
    if (state.isBlank()) {
      this.hadBlankLine = true;
      this.linesAfterBlank = 0;
    } else if (this.hadBlankLine) {
      this.linesAfterBlank++;
    }
    // List blocks themselves don't have any markers, only list items. So try to stay in the list.
    // If there is a block start other than list item, canContain makes sure that this list is closed.
    return BlockContinue.atIndex(state.getIndex());
  }

  /**
   * Parse a list marker and return data on the marker or null.
   */
  private static parseList(
    line: java.lang.CharSequence | null,
    /* final */ markerIndex: int,
    /* final */ markerColumn: int,
    /* final */ inParagraph: boolean
  ): ListBlockParser.ListData | null {
    let listMarker: ListBlockParser.ListMarkerData =
      ListBlockParser.parseListMarker(line, markerIndex);
    if (listMarker === null) {
      return null;
    }
    let listBlock: ListBlock = listMarker.listBlock;

    let indexAfterMarker: int = listMarker.indexAfterMarker;
    let markerLength: int = indexAfterMarker - markerIndex;
    // marker doesn't include tabs, so counting them as columns directly is ok
    let columnAfterMarker: int = markerColumn + markerLength;
    // the column within the line where the content starts
    let contentColumn: int = columnAfterMarker;

    // See at which column the content starts if there is content
    let hasContent: boolean = false;
    let length: int = line.length();
    for (let i: int = indexAfterMarker; i < length; i++) {
      let c: char = line.charAt(i);
      if (c === "\t") {
        contentColumn += Parsing.columnsToNextTabStop(contentColumn);
      } else if (c === " ") {
        contentColumn++;
      } else {
        hasContent = true;
        break;
      }
    }

    if (inParagraph) {
      // If the list item is ordered, the start number must be 1 to interrupt a paragraph.
      if (
        listBlock instanceof OrderedList &&
        (listBlock as OrderedList).getMarkerStartNumber() !== 1
      ) {
        return null;
      }
      // Empty list item can not interrupt a paragraph.
      if (!hasContent) {
        return null;
      }
    }

    if (
      !hasContent ||
      contentColumn - columnAfterMarker > Parsing.CODE_BLOCK_INDENT
    ) {
      // If this line is blank or has a code block, default to 1 space after marker
      contentColumn = columnAfterMarker + 1;
    }

    return new ListBlockParser.ListData(listBlock, contentColumn);
  }

  private static parseListMarker(
    line: java.lang.CharSequence | null,
    index: int
  ): ListBlockParser.ListMarkerData | null {
    let c: char = line.charAt(index);
    switch (c) {
      // spec: A bullet list marker is a -, +, or * character.
      case "-":
      case "+":
      case "*":
        if (ListBlockParser.isSpaceTabOrEnd(line, index + 1)) {
          let bulletList: BulletList = new BulletList();
          bulletList.setMarker(string.valueOf(c));
          return new ListBlockParser.ListMarkerData(bulletList, index + 1);
        } else {
          return null;
        }
      default:
        return ListBlockParser.parseOrderedList(line, index);
    }
  }

  // spec: An ordered list marker is a sequence of 1-9 arabic digits (0-9), followed by either a `.` character or a
  // `)` character.
  private static parseOrderedList(
    line: java.lang.CharSequence | null,
    index: int
  ): ListBlockParser.ListMarkerData | null {
    let digits: int = 0;
    let length: int = line.length();
    for (let i: int = index; i < length; i++) {
      let c: char = line.charAt(i);
      switch (c) {
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          digits++;
          if (digits > 9) {
            return null;
          }
          break;
        case ".":
        case ")":
          if (digits >= 1 && ListBlockParser.isSpaceTabOrEnd(line, i + 1)) {
            let number: string = line.subSequence(index, i).toString();
            let orderedList: OrderedList = new OrderedList();
            orderedList.setMarkerStartNumber(
              java.lang.Integer.parseInt(number)
            );
            orderedList.setMarkerDelimiter(string.valueOf(c));
            return new ListBlockParser.ListMarkerData(orderedList, i + 1);
          } else {
            return null;
          }
        default:
          return null;
      }
    }
    return null;
  }

  private static isSpaceTabOrEnd(
    line: java.lang.CharSequence | null,
    index: int
  ): boolean {
    if (index < line.length()) {
      switch (line.charAt(index)) {
        case " ":
        case "\t":
          return true;
        default:
          return false;
      }
    } else {
      return true;
    }
  }

  /**
   * Returns true if the two list items are of the same type,
   * with the same delimiter and bullet character. This is used
   * in agglomerating list items into lists.
   */
  private static listsMatch(a: ListBlock | null, b: ListBlock | null): boolean {
    if (a instanceof BulletList && b instanceof BulletList) {
      return java.util.Objects.equals(
        (a as BulletList).getMarker(),
        (b as BulletList).getMarker()
      );
    } else if (a instanceof OrderedList && b instanceof OrderedList) {
      return java.util.Objects.equals(
        (a as OrderedList).getMarkerDelimiter(),
        (b as OrderedList).getMarkerDelimiter()
      );
    }
    return false;
  }

  public static Factory = class Factory extends AbstractBlockParserFactory {
    public tryStart(
      state: ParserState | null,
      matchedBlockParser: MatchedBlockParser | null
    ): BlockStart | null {
      let matched: BlockParser = matchedBlockParser.getMatchedBlockParser();

      if (state.getIndent() >= Parsing.CODE_BLOCK_INDENT) {
        return BlockStart.none();
      }
      let markerIndex: int = state.getNextNonSpaceIndex();
      let markerColumn: int = state.getColumn() + state.getIndent();
      let inParagraph: boolean = !matchedBlockParser
        .getParagraphLines()
        .isEmpty();
      let listData: ListBlockParser.ListData = ListBlockParser.parseList(
        state.getLine().getContent(),
        markerIndex,
        markerColumn,
        inParagraph
      );
      if (listData === null) {
        return BlockStart.none();
      }

      let newColumn: int = listData.contentColumn;
      let listItemParser: ListItemParser = new ListItemParser(
        state.getIndent(),
        newColumn - state.getColumn()
      );

      // prepend the list block if needed
      if (
        !(matched instanceof ListBlockParser) ||
        !ListBlockParser.listsMatch(
          matched.getBlock() as ListBlock,
          listData.listBlock
        )
      ) {
        let listBlockParser: ListBlockParser = new ListBlockParser(
          listData.listBlock
        );
        // We start out with assuming a list is tight. If we find a blank line, we set it to loose later.
        listData.listBlock.setTight(true);

        return BlockStart.of(listBlockParser, listItemParser).atColumn(
          newColumn
        );
      } else {
        return BlockStart.of(listItemParser).atColumn(newColumn);
      }
    }
  };

  public static ListData = class ListData {
    protected readonly listBlock: ListBlock | null;
    protected readonly contentColumn: int;

    protected constructor(listBlock: ListBlock | null, contentColumn: int) {
      super();
      this.listBlock = listBlock;
      this.contentColumn = contentColumn;
    }
  };

  public static ListMarkerData = class ListMarkerData {
    protected readonly listBlock: ListBlock | null;
    protected readonly indexAfterMarker: int;

    protected constructor(listBlock: ListBlock | null, indexAfterMarker: int) {
      super();
      this.listBlock = listBlock;
      this.indexAfterMarker = indexAfterMarker;
    }
  };
}

export default ListBlockParser;
