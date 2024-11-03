


import { java, JavaObject } from "jree";




/**
 * Parses input text to a tree of nodes.
 * <p>
 * Start with the {@link #builder} method, configure the parser and build it. Example:
 * <pre><code>
 * Parser parser = Parser.builder().build();
 * Node document = parser.parse("input text");
 * </code></pre>
 */
export  class Parser extends JavaObject {

    private readonly  blockParserFactories:  java.util.List<BlockParserFactory> | null;
    private readonly  inlineContentParserFactories:  java.util.List<InlineContentParserFactory> | null;
    private readonly  delimiterProcessors:  java.util.List<DelimiterProcessor> | null;
    private readonly  linkProcessors:  java.util.List<LinkProcessor> | null;
    private readonly  linkMarkers:  java.util.Set<java.lang.Character> | null;
    private readonly  inlineParserFactory:  InlineParserFactory | null;
    private readonly  postProcessors:  java.util.List<PostProcessor> | null;
    private readonly  includeSourceSpans:  IncludeSourceSpans | null;

    private  constructor(builder: Parser.Builder| null) {
        super();
this.blockParserFactories = DocumentParser.calculateBlockParserFactories(builder.blockParserFactories, builder.enabledBlockTypes);
        this.inlineParserFactory = builder.getInlineParserFactory();
        this.postProcessors = builder.postProcessors;
        this.inlineContentParserFactories = builder.inlineContentParserFactories;
        this.delimiterProcessors = builder.delimiterProcessors;
        this.linkProcessors = builder.linkProcessors;
        this.linkMarkers = builder.linkMarkers;
        this.includeSourceSpans = builder.includeSourceSpans;

        // Try to construct an inline parser. Invalid configuration might result in an exception, which we want to
        // detect as soon as possible.
        let  context  = new  InlineParserContextImpl(
                this.inlineContentParserFactories, this.delimiterProcessors, this.linkProcessors, this.linkMarkers, new  Definitions());
        this.inlineParserFactory.create(context);
    }

    /**
     * Create a new builder for configuring a {@link Parser}.
     *
     * @return a builder
     */
    public static  builder():  Parser.Builder | null {
        return new  Parser.Builder();
    }

    /**
     * Parse the specified input text into a tree of nodes.
     * <p>
     * This method is thread-safe (a new parser state is used for each invocation).
     *
     * @param input the text to parse - must not be null
     * @return the root node
     */
    public  parse(input: java.lang.String| null):  Node | null {
        java.util.Objects.requireNonNull(input, "input must not be null");
        let  documentParser: DocumentParser = this.createDocumentParser();
        let  document: Node = documentParser.parse(input);
        return this.postProcess(document);
    }

    /**
     * Parse the specified reader into a tree of nodes. The caller is responsible for closing the reader.
     * <pre><code>
     * Parser parser = Parser.builder().build();
     * try (InputStreamReader reader = new InputStreamReader(new FileInputStream("file.md"), StandardCharsets.UTF_8)) {
     *     Node document = parser.parseReader(reader);
     *     // ...
     * }
     * </code></pre>
     * Note that if you have a file with a byte order mark (BOM), you need to skip it before handing the reader to this
     * library. There's existing classes that do that, e.g. see {@code BOMInputStream} in Commons IO.
     * <p>
     * This method is thread-safe (a new parser state is used for each invocation).
     *
     * @param input the reader to parse - must not be null
     * @return the root node
     * @throws IOException when reading throws an exception
     */
    public  parseReader(input: java.io.Reader| null):  Node | null {
        java.util.Objects.requireNonNull(input, "input must not be null");
        let  documentParser: DocumentParser = this.createDocumentParser();
        let  document: Node = documentParser.parse(input);
        return this.postProcess(document);
    }

    private  createDocumentParser():  DocumentParser | null {
        return new  DocumentParser(this.blockParserFactories, this.inlineParserFactory, this.inlineContentParserFactories,
                this.delimiterProcessors, this.linkProcessors, this.linkMarkers, this.includeSourceSpans);
    }

    private  postProcess(document: Node| null):  Node | null {
        for (let postProcessor of this.postProcessors) {
            document = postProcessor.process(document);
        }
        return document;
    }

    /**
     * Builder for configuring a {@link Parser}.
     */
    public static Builder =  class Builder extends JavaObject {
        private readonly  blockParserFactories:  java.util.List<BlockParserFactory> | null = new  java.util.ArrayList();
        private readonly  inlineContentParserFactories:  java.util.List<InlineContentParserFactory> | null = new  java.util.ArrayList();
        private readonly  delimiterProcessors:  java.util.List<DelimiterProcessor> | null = new  java.util.ArrayList();
        private readonly  linkProcessors:  java.util.List<LinkProcessor> | null = new  java.util.ArrayList();
        private readonly  postProcessors:  java.util.List<PostProcessor> | null = new  java.util.ArrayList();
        private readonly  linkMarkers:  java.util.Set<java.lang.Character> | null = new  java.util.HashSet();
        private  enabledBlockTypes:  java.util.Set<java.lang.Class< Block>> | null = DocumentParser.getDefaultBlockParserTypes();
        private  inlineParserFactory:  InlineParserFactory | null;
        private  includeSourceSpans:  IncludeSourceSpans | null = IncludeSourceSpans.NONE;

        /**
         * @return the configured {@link Parser}
         */
        public  build():  Parser | null {
            return new  Parser(this);
        }

        /**
         * @param extensions extensions to use on this parser
         * @return {@code this}
         */
        public  extensions(extensions: java.lang.Iterable< java.security.cert.Extension>| null):  Parser.Builder | null {
            java.util.Objects.requireNonNull(extensions, "extensions must not be null");
            for (let extension of extensions) {
                if (extension instanceof ParserExtension) {
                    let  parserExtension: Builder.ParserExtension =  extension as ParserExtension;
                    parserExtension.extend(this);
                }
            }
            return this;
        }

        /**
         * Describe the list of markdown features the parser will recognize and parse.
         * <p>
         * By default, CommonMark will recognize and parse the following set of "block" elements:
         * <ul>
         * <li>{@link Heading} ({@code #})
         * <li>{@link HtmlBlock} ({@code <html></html>})
         * <li>{@link ThematicBreak} (Horizontal Rule) ({@code ---})
         * <li>{@link FencedCodeBlock} ({@code ```})
         * <li>{@link IndentedCodeBlock}
         * <li>{@link BlockQuote} ({@code >})
         * <li>{@link ListBlock} (Ordered / Unordered List) ({@code 1. / *})
         * </ul>
         * <p>
         * To parse only a subset of the features listed above, pass a list of each feature's associated {@link Block} class.
         * <p>
         * E.g., to only parse headings and lists:
         * <pre>
         *     {@code
         *     Parser.builder().enabledBlockTypes(Set.of(Heading.class, ListBlock.class));
         *     }
         * </pre>
         *
         * @param enabledBlockTypes A list of block nodes the parser will parse.
         *                          If this list is empty, the parser will not recognize any CommonMark core features.
         * @return {@code this}
         */
        public  enabledBlockTypes(enabledBlockTypes: java.util.Set<java.lang.Class< Block>>| null):  Parser.Builder | null {
            java.util.Objects.requireNonNull(enabledBlockTypes, "enabledBlockTypes must not be null");
            DocumentParser.checkEnabledBlockTypes(enabledBlockTypes);
            this.enabledBlockTypes = enabledBlockTypes;
            return this;
        }

        /**
         * Whether to calculate source positions for parsed {@link Node Nodes}, see {@link Node#getSourceSpans()}.
         * <p>
         * By default, source spans are disabled.
         *
         * @param includeSourceSpans which kind of source spans should be included
         * @return {@code this}
         * @since 0.16.0
         */
        public  includeSourceSpans(includeSourceSpans: IncludeSourceSpans| null):  Parser.Builder | null {
            this.includeSourceSpans = includeSourceSpans;
            return this;
        }

        /**
         * Add a custom block parser factory.
         * <p>
         * Note that custom factories are applied <em>before</em> the built-in factories. This is so that
         * extensions can change how some syntax is parsed that would otherwise be handled by built-in factories.
         * "With great power comes great responsibility."
         *
         * @param blockParserFactory a block parser factory implementation
         * @return {@code this}
         */
        public  customBlockParserFactory(blockParserFactory: BlockParserFactory| null):  Parser.Builder | null {
            java.util.Objects.requireNonNull(blockParserFactory, "blockParserFactory must not be null");
            this.blockParserFactories.add(blockParserFactory);
            return this;
        }

        /**
         * Add a factory for a custom inline content parser, for extending inline parsing or overriding built-in parsing.
         * <p>
         * Note that parsers are triggered based on a special character as specified by
         * {@link InlineContentParserFactory#getTriggerCharacters()}. It is possible to register multiple parsers for the same
         * character, or even for some built-in special character such as {@code `}. The custom parsers are tried first
         * in order in which they are registered, and then the built-in ones.
         */
        public  customInlineContentParserFactory(inlineContentParserFactory: InlineContentParserFactory| null):  Parser.Builder | null {
            java.util.Objects.requireNonNull(inlineContentParserFactory, "inlineContentParser must not be null");
            this.inlineContentParserFactories.add(inlineContentParserFactory);
            return this;
        }

        /**
         * Add a custom delimiter processor for inline parsing.
         * <p>
         * Note that multiple delimiter processors with the same characters can be added, as long as they have a
         * different minimum length. In that case, the processor with the shortest matching length is used. Adding more
         * than one delimiter processor with the same character and minimum length is invalid.
         * <p>
         * If you want more control over how parsing is done, you might want to use
         * {@link #customInlineContentParserFactory} instead.
         *
         * @param delimiterProcessor a delimiter processor implementation
         * @return {@code this}
         */
        public  customDelimiterProcessor(delimiterProcessor: DelimiterProcessor| null):  Parser.Builder | null {
            java.util.Objects.requireNonNull(delimiterProcessor, "delimiterProcessor must not be null");
            this.delimiterProcessors.add(delimiterProcessor);
            return this;
        }

        /**
         * Add a custom link/image processor for inline parsing.
         * <p>
         * Multiple link processors can be added, and will be tried in order in which they were added. If no link
         * processor applies, the normal behavior applies. That means these can override built-in link parsing.
         *
         * @param linkProcessor a link processor implementation
         * @return {@code this}
         */
        public  linkProcessor(linkProcessor: LinkProcessor| null):  Parser.Builder | null {
            java.util.Objects.requireNonNull(linkProcessor, "linkProcessor must not be null");
            this.linkProcessors.add(linkProcessor);
            return this;
        }

        /**
         * Add a custom link marker for link processing. A link marker is a character like {@code !} which, if it
         * appears before the {@code [} of a link, changes the meaning of the link.
         * <p>
         * If a link marker followed by a valid link is parsed, the {@link org.commonmark.parser.beta.LinkInfo}
         * that is passed to {@link LinkProcessor} will have its {@link LinkInfo#marker()} set. A link processor should
         * check the {@link Text#getLiteral()} and then do any processing, and will probably want to use {@link LinkResult#includeMarker()}.
         *
         * @param linkMarker a link marker character
         * @return {@code this}
         */
        public  linkMarker(linkMarker: java.lang.Character| null):  Parser.Builder | null {
            java.util.Objects.requireNonNull(linkMarker, "linkMarker must not be null");
            this.linkMarkers.add(linkMarker);
            return this;
        }

        public  postProcessor(postProcessor: PostProcessor| null):  Parser.Builder | null {
            java.util.Objects.requireNonNull(postProcessor, "postProcessor must not be null");
            this.postProcessors.add(postProcessor);
            return this;
        }

        /**
         * Overrides the parser used for inline markdown processing.
         * <p>
         * Provide an implementation of InlineParserFactory which provides a custom inline parser
         * to modify how the following are parsed:
         * bold (**)
         * italic (*)
         * strikethrough (~~)
         * backtick quote (`)
         * link ([title](http://))
         * image (![alt](http://))
         * <p>
         * Note that if this method is not called or the inline parser factory is set to null, then the default
         * implementation will be used.
         *
         * @param inlineParserFactory an inline parser factory implementation
         * @return {@code this}
         */
        public  inlineParserFactory(inlineParserFactory: InlineParserFactory| null):  Parser.Builder | null {
            this.inlineParserFactory = inlineParserFactory;
            return this;
        }

        private  getInlineParserFactory():  InlineParserFactory | null {
            return java.util.Objects.requireNonNullElseGet(this.inlineParserFactory, () => InlineParserImpl.new);
        }
    };

}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace Parser {
	export type Builder = InstanceType<typeof Parser.Builder>;
	export  interface ParserExtension extends java.security.cert.Extension {
          extend(parserBuilder: Parser.Builder| null): void;
    }

}


