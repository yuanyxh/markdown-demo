import type { Block } from "@/node";
import type { ParserState } from "@/parser";

import { ListBlock, ListItem, Paragraph } from "@/node";
import { AbstractBlockParser, BlockContinue } from "@/parser";

class ListItemParser extends AbstractBlockParser {
  private readonly block = new ListItem();

  /**
   * Minimum number of columns that the content has to be indented (relative to the containing block) to be part of
   * this list item.
   */
  private contentIndent: number;

  private hadBlankLine: boolean = false;

  public constructor(markerIndent: number, contentIndent: number) {
    super();
    this.contentIndent = contentIndent;
    this.block.setMarkerIndent(markerIndent);
    this.block.setContentIndent(contentIndent);
  }

  public override isContainer(): boolean {
    return true;
  }

  public canContain(childBlock: Block): boolean {
    if (this.hadBlankLine) {
      // We saw a blank line in this list item, that means the list block is loose.
      //
      // spec: if any of its constituent list items directly contain two block-level elements with a blank line
      // between them
      const parent = this.block.getParent();
      if (parent instanceof ListBlock) {
        parent.setTight(false);
      }
    }

    return true;
  }

  public override getBlock(): Block {
    return this.block;
  }

  public override tryContinue(state: ParserState): BlockContinue | null {
    if (state.isBlank()) {
      if (this.block.getFirstChild() === null) {
        // Blank line after empty list item
        return BlockContinue.none();
      } else {
        const activeBlock: Block = state.getActiveBlockParser().getBlock();
        // If the active block is a code block, blank lines in it should not affect if the list is tight.
        this.hadBlankLine =
          activeBlock instanceof Paragraph || activeBlock instanceof ListItem;

        return BlockContinue.atIndex(state.getNextNonSpaceIndex());
      }
    }

    if (state.getIndent() >= this.contentIndent) {
      return BlockContinue.atColumn(state.getColumn() + this.contentIndent);
    } else {
      // Note: We'll hit this case for lazy continuation lines, they will get added later.
      return BlockContinue.none();
    }
  }
}

export default ListItemParser;
