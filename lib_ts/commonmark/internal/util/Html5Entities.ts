export class Html5Entities extends JavaObject {
  private static readonly NAMED_CHARACTER_REFERENCES: java.util.Map<
    string,
    string
  > | null = Html5Entities.readEntities();
  private static readonly ENTITY_PATH: string | null =
    "/org/commonmark/internal/util/entities.txt";

  public static entityToString(input: string | null): string | null {
    if (!input.startsWith("&") || !input.endsWith(";")) {
      return input;
    }

    let value: string = input.substring(1, input.length() - 1);
    if (value.startsWith("#")) {
      value = value.substring(1);
      let base: int = 10;
      if (value.startsWith("x") || value.startsWith("X")) {
        value = value.substring(1);
        base = 16;
      }

      try {
        let codePoint: int = java.lang.Integer.parseInt(value, base);
        if (codePoint === 0) {
          return "\uFFFD";
        }
        return new string(java.lang.Character.toChars(codePoint));
      } catch (e) {
        if (e instanceof java.lang.IllegalArgumentException) {
          return "\uFFFD";
        } else {
          throw e;
        }
      }
    } else {
      let s: string = Html5Entities.NAMED_CHARACTER_REFERENCES.get(value);
      if (s !== null) {
        return s;
      } else {
        return input;
      }
    }
  }

  private static readEntities(): java.util.Map<string, string> | null {
    let entities: java.util.Map<string, string> = new java.util.HashMap();
    let stream: java.io.InputStream = Html5Entities.class.getResourceAsStream(
      Html5Entities.ENTITY_PATH
    );
    let charset: java.nio.charset.Charset =
      java.nio.charset.StandardCharsets.UTF_8;
    try {
      // This holds the final error to throw (if any).
      let error: java.lang.Throwable | undefined;

      const bufferedReader: java.io.BufferedReader = new java.io.BufferedReader(
        new java.io.InputStreamReader(stream, charset)
      );
      try {
        try {
          let line: string;
          while ((line = bufferedReader.readLine()) !== null) {
            if (line.length() === 0) {
              continue;
            }
            let equal: int = line.indexOf("=");
            let key: string = line.substring(0, equal);
            let value: string = line.substring(equal + 1);
            entities.put(key, value);
          }
        } finally {
          error = closeResources([bufferedReader]);
        }
      } catch (e) {
        error = handleResourceError(e, error);
      } finally {
        throwResourceError(error);
      }
    } catch (e) {
      if (e instanceof java.io.IOException) {
        throw new java.lang.IllegalStateException(
          "Failed reading data for HTML named character references",
          e
        );
      } else {
        throw e;
      }
    }
    entities.put("NewLine", "\n");
    return entities;
  }
}
