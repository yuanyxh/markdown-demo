import { BlockParserFactory } from "./BlockParserFactory";
import BlockStart from "./BlockStart";

abstract class AbstractBlockParserFactory implements BlockParserFactory {
  tryStart(state, matchedBlockParser): BlockStart {
    throw new Error("Method not implemented.");
  }
}

export default AbstractBlockParserFactory;
