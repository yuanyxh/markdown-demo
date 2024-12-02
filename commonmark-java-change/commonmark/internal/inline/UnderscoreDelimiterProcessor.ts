import EmphasisDelimiterProcessor from "./EmphasisDelimiterProcessor";

class UnderscoreDelimiterProcessor extends EmphasisDelimiterProcessor {
  public constructor() {
    super("_");
  }
}

export default UnderscoreDelimiterProcessor;
