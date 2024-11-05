export class InlineParserContextImpl
  extends JavaObject
  implements InlineParserContext
{
  private readonly inlineContentParserFactories: java.util.List<InlineContentParserFactory> | null;
  private readonly delimiterProcessors: java.util.List<DelimiterProcessor> | null;
  private readonly linkProcessors: java.util.List<LinkProcessor> | null;
  private readonly linkMarkers: java.util.Set<java.lang.Character> | null;
  private readonly definitions: Definitions | null;

  public constructor(
    inlineContentParserFactories: java.util.List<InlineContentParserFactory> | null,
    delimiterProcessors: java.util.List<DelimiterProcessor> | null,
    linkProcessors: java.util.List<LinkProcessor> | null,
    linkMarkers: java.util.Set<java.lang.Character> | null,
    definitions: Definitions | null
  ) {
    super();
    this.inlineContentParserFactories = inlineContentParserFactories;
    this.delimiterProcessors = delimiterProcessors;
    this.linkProcessors = linkProcessors;
    this.linkMarkers = linkMarkers;
    this.definitions = definitions;
  }

  public getCustomInlineContentParserFactories(): java.util.List<InlineContentParserFactory> | null {
    return this.inlineContentParserFactories;
  }

  public getCustomDelimiterProcessors(): java.util.List<DelimiterProcessor> | null {
    return this.delimiterProcessors;
  }

  public getCustomLinkProcessors(): java.util.List<LinkProcessor> | null {
    return this.linkProcessors;
  }

  public getCustomLinkMarkers(): java.util.Set<java.lang.Character> | null {
    return this.linkMarkers;
  }

  public getLinkReferenceDefinition(
    label: string | null
  ): LinkReferenceDefinition | null {
    return this.definitions.getDefinition(LinkReferenceDefinition.class, label);
  }

  public getDefinition<D>(
    type: java.lang.Class<D> | null,
    label: string | null
  ): D | null {
    return this.definitions.getDefinition(type, label);
  }
}
