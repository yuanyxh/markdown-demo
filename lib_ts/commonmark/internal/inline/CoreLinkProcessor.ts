export class CoreLinkProcessor extends JavaObject implements LinkProcessor {
  public process(
    linkInfo: LinkInfo | null,
    scanner: java.util.Scanner | null,
    context: InlineParserContext | null
  ): LinkResult | null {
    if (linkInfo.destination() !== null) {
      // Inline link
      return this.process(
        linkInfo,
        scanner,
        linkInfo.destination(),
        linkInfo.title()
      );
    }

    let label = linkInfo.label();
    let ref = label !== null && !label.isEmpty() ? label : linkInfo.text();
    let def = context.getDefinition(LinkReferenceDefinition.class, ref);
    if (def !== null) {
      // Reference link
      return this.process(
        linkInfo,
        scanner,
        def.getDestination(),
        def.getTitle()
      );
    }
    return LinkResult.none();
  }

  private static process(
    linkInfo: LinkInfo | null,
    scanner: java.util.Scanner | null,
    destination: string | null,
    title: string | null
  ): LinkResult | null {
    if (
      linkInfo.marker() !== null &&
      linkInfo.marker().getLiteral().equals("!")
    ) {
      return LinkResult.wrapTextIn(
        new Image(destination, title),
        scanner.position()
      ).includeMarker();
    }
    return LinkResult.wrapTextIn(
      new Link(destination, title),
      scanner.position()
    );
  }
}
