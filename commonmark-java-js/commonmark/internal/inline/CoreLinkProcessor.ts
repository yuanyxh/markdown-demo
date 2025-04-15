import type { LinkInfo, InlineParserContext, LinkProcessor, Scanner } from '@/parser';

import { LinkResult } from '@/parser';
import { Image, Link, LinkReferenceDefinition } from '@/node';

class CoreLinkProcessor implements LinkProcessor {
  process(linkInfo: LinkInfo, scanner: Scanner, context: InlineParserContext): LinkResult | null {
    if (linkInfo.getDestination() !== null) {
      // Inline link
      return CoreLinkProcessor.process(
        linkInfo,
        scanner,
        linkInfo.getDestination(),
        linkInfo.getTitle()
      );
    }

    const label = linkInfo.getLabel();
    const ref = label ? label : linkInfo.getText() || '';
    const def = context.getDefinition(LinkReferenceDefinition, ref);

    if (def !== null) {
      // Reference link
      return CoreLinkProcessor.process(linkInfo, scanner, def.getDestination(), def.getTitle());
    }

    return LinkResult.none();
  }

  private static process(
    linkInfo: LinkInfo,
    scanner: Scanner,
    destination: string | null,
    title: string | null
  ): LinkResult {
    const marker = linkInfo.getMarker();

    if (marker !== null && marker.getLiteral() === '!') {
      return LinkResult.wrapTextIn(
        new Image(destination || '', title || void 0),
        scanner.position()
      ).setIncludeMarker();
    }

    return LinkResult.wrapTextIn(new Link(destination || '', title || void 0), scanner.position());
  }
}

export default CoreLinkProcessor;
