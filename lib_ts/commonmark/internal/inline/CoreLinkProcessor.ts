import { Image, Link, LinkReferenceDefinition } from "../../node";
import { LinkInfo } from "../../parser/beta/LinkInfo";
import LinkResult from "../../parser/beta/LinkResult";
import Scanner from "../../parser/beta/Scanner";
import { InlineParserContext } from "../../parser/InlineParserContext";
import { LinkProcessor } from "./../../parser/beta/LinkProcessor";

class CoreLinkProcessor implements LinkProcessor {
  public process(
    linkInfo: LinkInfo,
    scanner: Scanner,
    context: InlineParserContext
  ): LinkResult {
    if (linkInfo.destination() !== "") {
      // Inline link
      return CoreLinkProcessor.process(
        linkInfo,
        scanner,
        linkInfo.destination(),
        linkInfo.title()
      );
    }

    const label = linkInfo.label();
    const ref = label !== "" ? label : linkInfo.text();
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
    const marker = linkInfo.marker();

    if (marker !== null && marker.getLiteral() === "!") {
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

export default CoreLinkProcessor;
