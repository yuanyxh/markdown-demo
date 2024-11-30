"use strict";

// derived from https://github.com/mathiasbynens/String.fromCodePoint
/*! http://mths.be/fromcodepoint v0.2.1 by @mathias */

let _fromCodePoint: TFromCodePoint;

export default function fromCodePoint(...codes: number[]) {
  return _fromCodePoint(...codes);
}

if (String.fromCodePoint) {
  _fromCodePoint = function (_) {
    try {
      return String.fromCodePoint(_);
    } catch (e) {
      if (e instanceof RangeError) {
        return String.fromCharCode(0xfffd);
      }

      throw e;
    }
  };
} else {
  const stringFromCharCode = String.fromCharCode;
  const floor = Math.floor;

  _fromCodePoint = function (...codes) {
    const MAX_SIZE = 0x4000;
    const codeUnits: number[] = [];

    let highSurrogate: number;
    let lowSurrogate: number;

    let index = -1;
    const length = codes.length;

    if (!length) {
      return "";
    }

    let result = "";
    while (++index < length) {
      let codePoint = Number(codes[index]);

      if (
        !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
        codePoint < 0 || // not a valid Unicode code point
        codePoint > 0x10ffff || // not a valid Unicode code point
        floor(codePoint) !== codePoint // not an integer
      ) {
        return String.fromCharCode(0xfffd);
      }

      if (codePoint <= 0xffff) {
        // BMP code point
        codeUnits.push(codePoint);
      } else {
        // Astral code point; split in surrogate halves
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        codePoint -= 0x10000;
        highSurrogate = (codePoint >> 10) + 0xd800;
        lowSurrogate = (codePoint % 0x400) + 0xdc00;

        codeUnits.push(highSurrogate, lowSurrogate);
      }

      if (index + 1 === length || codeUnits.length > MAX_SIZE) {
        result += stringFromCharCode.apply(null, codeUnits);
        codeUnits.length = 0;
      }
    }

    return result;
  };
}
