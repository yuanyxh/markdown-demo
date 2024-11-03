


import { java } from "jree";



/**
 * Parser for a specific block node.
 * <p>
 * Implementations should subclass {@link AbstractBlockParser} instead of implementing this directly.
 */
 interface BlockParser {

    /**
     * Return true if the block that is parsed is a container (contains other blocks), or false if it's a leaf.
     */
      isContainer(): boolean;

    /**
     * Return true if the block can have lazy continuation lines.
     * <p>
     * Lazy continuation lines are lines that were rejected by this {@link #tryContinue(ParserState)} but didn't match
     * any other block parsers either.
     * <p>
     * If true is returned here, those lines will get added via {@link #addLine(SourceLine)}. For false, the block is
     * closed instead.
     */
      canHaveLazyContinuationLines(): boolean;

      canContain(childBlock: Block| null): boolean;

      getBlock(): Block;

      tryContinue(parserState: ParserState| null): BlockContinue;

    /**
     * Add the part of a line that belongs to this block parser to parse (i.e. without any container block markers).
     * Note that the line will only include a {@link SourceLine#getSourceSpan()} if source spans are enabled for inlines.
     */
      addLine(line: SourceLine| null): void;

    /**
     * Add a source span of the currently parsed block. The default implementation in {@link AbstractBlockParser} adds
     * it to the block. Unless you have some complicated parsing where you need to check source positions, you don't
     * need to override this.
     *
     * @since 0.16.0
     */
      addSourceSpan(sourceSpan: SourceSpan| null): void;

    /**
     * Return definitions parsed by this parser. The definitions returned here can later be accessed during inline
     * parsing via {@link org.commonmark.parser.InlineParserContext#getDefinition}.
     */
      getDefinitions(): java.util.List<DefinitionMap<unknown>>;

      closeBlock(): void;

      parseInlines(inlineParser: InlineParser| null): void;

}
