


import { java, type int } from "jree";



export  class ListItemParser extends AbstractBlockParser {

    private readonly  block:  ListItem | null = new  ListItem();

    /**
     * Minimum number of columns that the content has to be indented (relative to the containing block) to be part of
     * this list item.
     */
    private  contentIndent:  int;

    private  hadBlankLine:  boolean;

    public  constructor(markerIndent: int, contentIndent: int) {
        super();
this.contentIndent = contentIndent;
        this.block.setMarkerIndent(markerIndent);
        this.block.setContentIndent(contentIndent);
    }

    public  isContainer():  boolean {
        return true;
    }

    public  canContain(childBlock: Block| null):  boolean {
        if (this.hadBlankLine) {
            // We saw a blank line in this list item, that means the list block is loose.
            //
            // spec: if any of its constituent list items directly contain two block-level elements with a blank line
            // between them
            let  parent: Block = this.block.getParent();
            if (parent instanceof ListBlock) {
                ( parent as ListBlock).setTight(false);
            }
        }
        return true;
    }

    public  getBlock():  Block | null {
        return this.block;
    }

    public  tryContinue(state: ParserState| null):  BlockContinue | null {
        if (state.isBlank()) {
            if (this.block.getFirstChild() === null) {
                // Blank line after empty list item
                return BlockContinue.none();
            } else {
                let  activeBlock: Block = state.getActiveBlockParser().getBlock();
                // If the active block is a code block, blank lines in it should not affect if the list is tight.
                this.hadBlankLine = activeBlock instanceof Paragraph || activeBlock instanceof ListItem;
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
