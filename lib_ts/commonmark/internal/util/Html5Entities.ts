


import { java, JavaObject, type int, closeResources, handleResourceError, throwResourceError } from "jree";



export  class Html5Entities extends JavaObject {

    private static readonly  NAMED_CHARACTER_REFERENCES:  java.util.Map<java.lang.String, java.lang.String> | null = Html5Entities.readEntities();
    private static readonly  ENTITY_PATH:  java.lang.String | null = "/org/commonmark/internal/util/entities.txt";

    public static  entityToString(input: java.lang.String| null):  java.lang.String | null {
        if (!input.startsWith("&") || !input.endsWith(";")) {
            return input;
        }

        let  value: java.lang.String = input.substring(1, input.length() - 1);
        if (value.startsWith("#")) {
            value = value.substring(1);
            let  base: int = 10;
            if (value.startsWith("x") || value.startsWith("X")) {
                value = value.substring(1);
                base = 16;
            }

            try {
                let  codePoint: int = java.lang.Integer.parseInt(value, base);
                if (codePoint === 0) {
                    return "\uFFFD";
                }
                return new  java.lang.String(java.lang.Character.toChars(codePoint));
            } catch (e) {
if (e instanceof java.lang.IllegalArgumentException) {
                return "\uFFFD";
            } else {
	throw e;
	}
}
        } else {
            let  s: java.lang.String = Html5Entities.NAMED_CHARACTER_REFERENCES.get(value);
            if (s !== null) {
                return s;
            } else {
                return input;
            }
        }
    }

    private static  readEntities():  java.util.Map<java.lang.String, java.lang.String> | null {
        let  entities: java.util.Map<java.lang.String, java.lang.String> = new  java.util.HashMap();
        let  stream: java.io.InputStream = Html5Entities.class.getResourceAsStream(Html5Entities.ENTITY_PATH);
        let  charset: java.nio.charset.Charset = java.nio.charset.StandardCharsets.UTF_8;
        try {
// This holds the final error to throw (if any).
let error: java.lang.Throwable | undefined;

 const bufferedReader: java.io.BufferedReader  = new  java.io.BufferedReader(new  java.io.InputStreamReader(stream, charset))
try {
	try  {
            let  line: java.lang.String;
            while ((line = bufferedReader.readLine()) !== null) {
                if (line.length() === 0) {
                    continue;
                }
                let  equal: int = line.indexOf("=");
                let  key: java.lang.String = line.substring(0, equal);
                let  value: java.lang.String = line.substring(equal + 1);
                entities.put(key, value);
            }
        }
	finally {
	error = closeResources([bufferedReader]);
	}
} catch(e) {
	error = handleResourceError(e, error);
} finally {
	throwResourceError(error);
}
}
 catch (e) {
if (e instanceof java.io.IOException) {
            throw new  java.lang.IllegalStateException("Failed reading data for HTML named character references", e);
        } else {
	throw e;
	}
}
        entities.put("NewLine", "\n");
        return entities;
    }
}
