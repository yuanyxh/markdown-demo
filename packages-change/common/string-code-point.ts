function fromCodePoint(codePoint: number) {
  try {
    return String.fromCodePoint(codePoint);
  } catch (e) {
    if (e instanceof RangeError) {
      return String.fromCharCode(0xfffd);
    }

    throw e;
  }
}

export default fromCodePoint;
