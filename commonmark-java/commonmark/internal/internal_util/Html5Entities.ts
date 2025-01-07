import { fromCodePoint } from "../../../helpers";
import { EntitiesMap } from "./Entities";

class Html5Entities {
  private static readonly NAMED_CHARACTER_REFERENCES = EntitiesMap;

  public static entityToString(input: string): string {
    if (!input.startsWith("&") || !input.endsWith(";")) {
      return input;
    }

    let value = input.substring(1, input.length - 1);
    if (value.startsWith("#")) {
      value = value.substring(1);

      let base = 10;
      if (value.startsWith("x") || value.startsWith("X")) {
        value = value.substring(1);
        base = 16;
      }

      let codePoint = window.parseInt(value, base);
      if (codePoint === 0) {
        return "\uFFFD";
      }

      return fromCodePoint(codePoint);
    } else {
      const s = Html5Entities.NAMED_CHARACTER_REFERENCES.get(value);
      if (s !== undefined) {
        return s;
      } else {
        return input;
      }
    }
  }
}

export default Html5Entities;
