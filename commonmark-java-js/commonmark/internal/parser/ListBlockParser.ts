import type { Block, ListBlock } from '@/node';
import type { BlockParserFactory, MatchedBlockParser, ParserState } from '@/parser';

import { BulletList, ListItem, OrderedList } from '@/node';
import { AbstractBlockParser, BlockStart, BlockContinue } from '@/parser';

import ListItemParser from './ListItemParser';
import Parsing from '../internal_util/Parsing';

class Factory implements BlockParserFactory {
  tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart | null {
    const matched = matchedBlockParser.getMatchedBlockParser();

    if (state.getIndent() >= Parsing.CODE_BLOCK_INDENT) {
      return BlockStart.none();
    }

    const markerIndex = state.getNextNonSpaceIndex();
    const markerColumn = state.getColumn() + state.getIndent();
    const inParagraph: boolean = !matchedBlockParser.getParagraphLines().isEmpty();
    const listData = ListBlockParser.parseList(
      state.getLine().getContent(),
      markerIndex,
      markerColumn,
      inParagraph
    );

    if (listData === null) {
      return BlockStart.none();
    }

    const newColumn = listData.contentColumn;
    const listItemParser = new ListItemParser(state.getIndent(), newColumn - state.getColumn());

    // prepend the list block if needed
    if (
      !(matched instanceof ListBlockParser) ||
      !ListBlockParser.listsMatch(matched.getBlock() as ListBlock, listData.listBlock)
    ) {
      const listBlockParser: ListBlockParser = new ListBlockParser(listData.listBlock);
      // We start out with assuming a list is tight. If we find a blank line, we set it to loose later.
      listData.listBlock.setTight(true);

      return BlockStart.of(listBlockParser, listItemParser).atColumn(newColumn);
    } else {
      return BlockStart.of(listItemParser).atColumn(newColumn);
    }
  }
}

class ListData {
  readonly listBlock: ListBlock;
  readonly contentColumn: number;

  constructor(listBlock: ListBlock, contentColumn: number) {
    this.listBlock = listBlock;
    this.contentColumn = contentColumn;
  }
}

class ListMarkerData {
  readonly listBlock: ListBlock;
  readonly indexAfterMarker: number;

  constructor(listBlock: ListBlock, indexAfterMarker: number) {
    this.listBlock = listBlock;
    this.indexAfterMarker = indexAfterMarker;
  }
}

class ListBlockParser extends AbstractBlockParser {
  private readonly block: ListBlock;

  private hadBlankLine = false;
  private linesAfterBlank: number | undefined;

  constructor(block: ListBlock) {
    super();
    this.block = block;
  }

  override isContainer(): boolean {
    return true;
  }

  override canContain(childBlock: Block): boolean {
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

  override getBlock(): Block {
    return this.block;
  }

  override tryContinue(state: ParserState): BlockContinue {
    if (state.isBlank()) {
      this.hadBlankLine = true;
      this.linesAfterBlank = 0;
    } else if (this.hadBlankLine) {
      this.linesAfterBlank = (this.linesAfterBlank || 0) + 1;
    }

    // List blocks themselves don't have any markers, only list items. So try to stay in the list.
    // If there is a block start other than list item, canContain makes sure that this list is closed.
    return BlockContinue.atIndex(state.getIndex());
  }

  /**
   * Parse a list marker and return data on the marker or null.
   */
  static parseList(
    line: string,
    /* final */ markerIndex: number,
    /* final */ markerColumn: number,
    /* final */ inParagraph: boolean
  ): ListData | null {
    let listMarker = ListBlockParser.parseListMarker(line, markerIndex);
    if (listMarker === null) {
      return null;
    }

    let listBlock = listMarker.listBlock;

    const indexAfterMarker = listMarker.indexAfterMarker;
    const markerLength = indexAfterMarker - markerIndex;
    // marker doesn't include tabs, so counting them as columns directly is ok
    const columnAfterMarker = markerColumn + markerLength;
    // the column within the line where the content starts
    let contentColumn = columnAfterMarker;

    // See at which column the content starts if there is content
    let hasContent: boolean = false;
    const length = line.length;
    for (let i = indexAfterMarker; i < length; i++) {
      const c = line.charAt(i);
      if (c === '\t') {
        contentColumn += Parsing.columnsToNextTabStop(contentColumn);
      } else if (c === ' ') {
        contentColumn++;
      } else {
        hasContent = true;
        break;
      }
    }

    if (inParagraph) {
      // If the list item is ordered, the start number must be 1 to interrupt a paragraph.
      if (listBlock instanceof OrderedList && listBlock.getMarkerStartNumber() !== 1) {
        return null;
      }

      // Empty list item can not interrupt a paragraph.
      if (!hasContent) {
        return null;
      }
    }

    if (!hasContent || contentColumn - columnAfterMarker > Parsing.CODE_BLOCK_INDENT) {
      // If this line is blank or has a code block, default to 1 space after marker
      contentColumn = columnAfterMarker + 1;
    }

    return new ListData(listBlock, contentColumn);
  }

  private static parseListMarker(line: string, index: number): ListMarkerData | null {
    const c = line.charAt(index);
    switch (c) {
      // spec: A bullet list marker is a -, +, or * character.
      case '-':
      case '+':
      case '*':
        if (ListBlockParser.isSpaceTabOrEnd(line, index + 1)) {
          let bulletList = new BulletList();
          bulletList.setMarker(c);
          return new ListMarkerData(bulletList, index + 1);
        } else {
          return null;
        }
      default:
        return ListBlockParser.parseOrderedList(line, index);
    }
  }

  // spec: An ordered list marker is a sequence of 1-9 arabic digits (0-9), followed by either a `.` character or a
  // `)` character.
  private static parseOrderedList(line: string, index: number): ListMarkerData | null {
    let digits = 0;
    let length = line.length;
    for (let i = index; i < length; i++) {
      const c = line.charAt(i);

      switch (c) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          digits++;

          if (digits > 9) {
            return null;
          }
          break;
        case '.':
        case ')':
          if (digits >= 1 && ListBlockParser.isSpaceTabOrEnd(line, i + 1)) {
            const number: string = line.substring(index, i);
            const orderedList: OrderedList = new OrderedList();
            orderedList.setMarkerStartNumber(window.parseInt(number));
            orderedList.setMarkerDelimiter(c);

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

  private static isSpaceTabOrEnd(line: string, index: number): boolean {
    if (index < line.length) {
      switch (line.charAt(index)) {
        case ' ':
        case '\t':
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
  static listsMatch(a: ListBlock | null, b: ListBlock | null): boolean {
    if (a instanceof BulletList && b instanceof BulletList) {
      return a.getMarker() === b.getMarker();
    } else if (a instanceof OrderedList && b instanceof OrderedList) {
      return a.getMarkerDelimiter() === b.getMarkerDelimiter();
    }

    return false;
  }

  static Factory = Factory;

  static ListData = ListData;

  static ListMarkerData = ListMarkerData;
}

export default ListBlockParser;
