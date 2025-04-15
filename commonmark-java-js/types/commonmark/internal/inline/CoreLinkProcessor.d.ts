import type { LinkInfo, InlineParserContext, LinkProcessor, Scanner } from '@/parser';
import { LinkResult } from '@/parser';
declare class CoreLinkProcessor implements LinkProcessor {
    process(linkInfo: LinkInfo, scanner: Scanner, context: InlineParserContext): LinkResult | null;
    private static process;
}
export default CoreLinkProcessor;
