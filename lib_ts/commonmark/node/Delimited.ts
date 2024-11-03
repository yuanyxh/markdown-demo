
import { java } from "jree";



/**
 * A node that uses delimiters in the source form (e.g. <code>*bold*</code>).
 */
 interface Delimited {

    /**
     * @return the opening (beginning) delimiter, e.g. <code>*</code>
     */
      getOpeningDelimiter(): java.lang.String;

    /**
     * @return the closing (ending) delimiter, e.g. <code>*</code>
     */
      getClosingDelimiter(): java.lang.String;
}
