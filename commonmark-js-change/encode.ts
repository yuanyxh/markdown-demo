// mdurl/encode.js

const encodeCache: {
  [key: string]: string[];
} = {};

// Create a lookup array where anything but characters in `chars` string
// and alphanumeric chars is percent-encoded.
//
function getEncodeCache(exclude: string) {
  let i = 0;
  let ch = "";
  let cache = encodeCache[exclude];

  if (cache) {
    return cache;
  }

  cache = encodeCache[exclude] = [];

  for (i = 0; i < 128; i++) {
    ch = String.fromCharCode(i);

    if (/^[0-9a-z]$/i.test(ch)) {
      // always allow unencoded alphanumeric characters
      cache.push(ch);
    } else {
      cache.push("%" + ("0" + i.toString(16).toUpperCase()).slice(-2));
    }
  }

  for (i = 0; i < exclude.length; i++) {
    cache[exclude.charCodeAt(i)] = exclude[i];
  }

  return cache;
}

// Encode unsafe characters with percent-encoding, skipping already
// encoded sequences.
//
//  - string       - string to encode
//  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
//  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
//
function encode(
  string: string,
  exclude?: string | boolean,
  keepEscaped?: boolean
) {
  let i = 0;
  let l = 0;
  let code = 0;
  let nextCode = 0;
  let cache: string[];
  let result = "";

  if (typeof exclude !== "string") {
    // encode(string, keepEscaped)
    keepEscaped = exclude;
    exclude = encode.defaultChars;
  }

  if (typeof keepEscaped === "undefined") {
    keepEscaped = true;
  }

  cache = getEncodeCache(exclude);

  for (i = 0, l = string.length; i < l; i++) {
    code = string.charCodeAt(i);

    if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
      if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
        result += string.slice(i, i + 3);
        i += 2;

        continue;
      }
    }

    if (code < 128) {
      result += cache[code];

      continue;
    }

    if (code >= 0xd800 && code <= 0xdfff) {
      if (code >= 0xd800 && code <= 0xdbff && i + 1 < l) {
        nextCode = string.charCodeAt(i + 1);

        if (nextCode >= 0xdc00 && nextCode <= 0xdfff) {
          result += window.encodeURIComponent(string[i] + string[i + 1]);
          i++;

          continue;
        }
      }

      result += "%EF%BF%BD";

      continue;
    }

    result += window.encodeURIComponent(string[i]);
  }

  return result;
}

encode.defaultChars = ";/?:@&=+$,-_.!~*'()#";
encode.componentChars = "-_.!~*'()";

export default encode;
