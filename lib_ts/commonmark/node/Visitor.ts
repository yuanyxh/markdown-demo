
import { java } from "jree";



/**
 * Node visitor.
 * <p>
 * Implementations should subclass {@link AbstractVisitor} instead of implementing this directly.
 */
 interface Visitor {

      visit(blockQuote: BlockQuote| null): void;

      visit(bulletList: BulletList| null): void;

      visit(code: Code| null): void;

      visit(document: Document| null): void;

      visit(emphasis: Emphasis| null): void;

      visit(fencedCodeBlock: FencedCodeBlock| null): void;

      visit(hardLineBreak: HardLineBreak| null): void;

      visit(heading: Heading| null): void;

      visit(thematicBreak: ThematicBreak| null): void;

      visit(htmlInline: HtmlInline| null): void;

      visit(htmlBlock: HtmlBlock| null): void;

      visit(image: Image| null): void;

      visit(indentedCodeBlock: IndentedCodeBlock| null): void;

      visit(link: Link| null): void;

      visit(listItem: ListItem| null): void;

      visit(orderedList: OrderedList| null): void;

      visit(paragraph: Paragraph| null): void;

      visit(softLineBreak: SoftLineBreak| null): void;

      visit(strongEmphasis: StrongEmphasis| null): void;

      visit(text: Text| null): void;

      visit(linkReferenceDefinition: LinkReferenceDefinition| null): void;

      visit(customBlock: CustomBlock| null): void;

      visit(customNode: CustomNode| null): void;
}
