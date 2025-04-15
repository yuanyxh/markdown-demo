declare abstract class ListHolder {
    private static readonly INDENT_DEFAULT;
    private static readonly INDENT_EMPTY;
    private readonly parent;
    private readonly indent;
    protected constructor(parent: ListHolder | null);
    getParent(): ListHolder | null;
    getIndent(): string;
}
export default ListHolder;
