/**
 * Context for inline parsing.
 */
export interface InlineParserContext {
  /**
   * @return custom inline content parsers that have been configured with
   * {@link Parser.Builder#customInlineContentParserFactory(InlineContentParserFactory)}
   */
  getCustomInlineContentParserFactories(): InlineContentParserFactory[];

  /**
   * @return custom delimiter processors that have been configured with
   * {@link Parser.Builder#customDelimiterProcessor(DelimiterProcessor)}
   */
  getCustomDelimiterProcessors(): DelimiterProcessor[];

  /**
   * @return custom link processors that have been configured with {@link Parser.Builder#linkProcessor}.
   */
  getCustomLinkProcessors(): LinkProcessor[];

  /**
   * @return custom link markers that have been configured with {@link Parser.Builder#linkMarker}.
   */
  getCustomLinkMarkers(): Set<string>;

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
  getLinkReferenceDefinition(label: string): LinkReferenceDefinition;

  /**
   * Look up a definition of a type for a given label.
   * <p>
   * Note that the passed in label does not need to be normalized; implementations are responsible for doing the
   * normalization before lookup.
   *
   * @return the definition if one exists, null otherwise
   */
  getDefinition<D>(type: D, label: string): D;
}
