import type {
  LinkInfo,
  InlineParserContext,
  LinkProcessor,
  Scanner,
} from "../../parser";

import LinkResult from "../../parser/abstracts/LinkResult";
import { Image, Link, LinkReferenceDefinition } from "../../node";

class CoreLinkProcessor implements LinkProcessor {
  public process(
    linkInfo: LinkInfo,
    scanner: Scanner,
    context: InlineParserContext
  ): LinkResult | null {
    if (linkInfo.getDestination() !== "") {
      // Inline link
      return CoreLinkProcessor.process(
        linkInfo,
        scanner,
        linkInfo.getDestination() || "",
        linkInfo.getTitle() || ""
      );
    }

    const label = linkInfo.getLabel();
    const ref = label ? label : linkInfo.getText() || "";
    const def = context.getDefinition(LinkReferenceDefinition, ref);

    if (def !== null) {
      // Reference link
      return CoreLinkProcessor.process(
        linkInfo,
        scanner,
        def.getDestination(),
        def.getTitle()
      );
    }

    return LinkResult.none();
  }

  private static process(
    linkInfo: LinkInfo,
    scanner: Scanner,
    destination: string,
    title: string
  ): LinkResult {
    const marker = linkInfo.getMarker();

    if (marker !== null && marker.getLiteral() === "!") {
      return LinkResult.wrapTextIn(
        new Image(destination, title),
        scanner.position()
      ).setIncludeMarker();
    }
    return LinkResult.wrapTextIn(
      new Link(destination, title),
      scanner.position()
    );
  }
}

export default CoreLinkProcessor;
