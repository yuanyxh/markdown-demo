import type { Appendable } from '@helpers/index';
declare class HtmlWriter {
    private static readonly NO_ATTRIBUTES;
    private readonly buffer;
    private lastChar;
    constructor(out: Appendable);
    raw(s: string): void;
    text(text: string): void;
    tag(name: string, attrs?: Map<string, string>, voidElement?: boolean): void;
    line(): void;
    protected append(s: string): void;
}
export default HtmlWriter;
