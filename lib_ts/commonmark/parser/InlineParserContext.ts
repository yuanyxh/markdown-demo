


import { java } from "jree";



/**
 * Context for inline parsing.
 */
 interface InlineParserContext {

    /**
     * @return custom inline content parsers that have been configured with
     * {@link Parser.Builder#customInlineContentParserFactory(InlineContentParserFactory)}
     */
      getCustomInlineContentParserFactories(): java.util.List<InlineContentParserFactory>;

    /**
     * @return custom delimiter processors that have been configured with
     * {@link Parser.Builder#customDelimiterProcessor(DelimiterProcessor)}
     */
      getCustomDelimiterProcessors(): java.util.List<DelimiterProcessor>;

    /**
     * @return custom link processors that have been configured with {@link Parser.Builder#linkProcessor}.
     */
      getCustomLinkProcessors(): java.util.List<LinkProcessor>;

    /**
     * @return custom link markers that have been configured with {@link Parser.Builder#linkMarker}.
     */
      getCustomLinkMarkers(): java.util.Set<java.lang.Character>;

    /**
     * Look up a {@link LinkReferenceDefinition} for a given label.
     * <p>
     * Note that the passed in label does not need to be normalized; implementations are responsible for doing the
     * normalization before lookup.
     *
     * @param label the link label to look up
     * @return the definition if one exists, {@code null} otherwise
     * @deprecated use {@link #getDefinition} with {@link LinkReferenceDefinition} instead
     */
      getLinkReferenceDefinition(label: java.lang.String| null): LinkReferenceDefinition;

    /**
     * Look up a definition of a type for a given label.
     * <p>
     * Note that the passed in label does not need to be normalized; implementations are responsible for doing the
     * normalization before lookup.
     *
     * @return the definition if one exists, null otherwise
     */
      getDefinition<D>(type: java.lang.Class<D>| null, label: java.lang.String| null):  D;
}
